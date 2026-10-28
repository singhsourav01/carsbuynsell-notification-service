import express from "express";
import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS, API_RESPONSES, API_ERRORS } from "../constants/app.constant";
import NotificationService from "../services/notification.service";

const InternalRoutes = express.Router();
const notificationService = new NotificationService();

/**
 * POST /notification/internal/new-listing
 * Called by user-service when a listing is created/activated
 * No auth required (inter-service call)
 */
InternalRoutes.route(API_ENDPOINTS.INTERNAL_NEW_LISTING).post(
  asyncHandler(async (req: Request, res: Response) => {
    const { listing_id, listing_title } = req.body;

    if (!listing_id || !listing_title) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, API_ERRORS.MISSING_REQUIRED_FIELDS));
    }

    const result = await notificationService.handleNewListing({
      listing_id,
      listing_title,
      listing_type:"NEW_LISTING",
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATION_SENT));
  })
);

const missingFields = (res: Response) =>
  res
    .status(StatusCodes.BAD_REQUEST)
    .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, API_ERRORS.MISSING_REQUIRED_FIELDS));

/**
 * POST /notification/bid-outbid
 * Called by user-service when someone places a higher bid (notifies the previous top bidder)
 */
InternalRoutes.route(API_ENDPOINTS.INTERNAL_BID_OUTBID).post(
  asyncHandler(async (req: Request, res: Response) => {
    const { listing_id, listing_title, outbid_user_id, new_bid_amount, new_bidder_name } = req.body;
    if (!listing_id || !outbid_user_id || new_bid_amount === undefined) return missingFields(res);

    const result = await notificationService.handleBidOutbid({
      listing_id,
      listing_title: listing_title || "a vehicle",
      outbid_user_id,
      new_bid_amount,
      new_bidder_name: new_bidder_name || "Someone",
    });
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATION_SENT));
  })
);

/**
 * POST /notification/subscription-success
 * Called by user-service after a subscription payment is verified
 */
InternalRoutes.route(API_ENDPOINTS.INTERNAL_SUBSCRIPTION_SUCCESS).post(
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id, plan_name, expires_at } = req.body;
    if (!user_id) return missingFields(res);

    const result = await notificationService.handleSubscriptionSuccess({
      user_id,
      plan_name: plan_name || "Premium",
      expires_at: expires_at || "",
    });
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATION_SENT));
  })
);

/**
 * POST /notification/vehicle-submitted
 * Called by user-service when a user submits a vehicle to sell
 */
InternalRoutes.route(API_ENDPOINTS.INTERNAL_VEHICLE_SUBMITTED).post(
  asyncHandler(async (req: Request, res: Response) => {
    const { user_id, vehicle_title } = req.body;
    if (!user_id || !vehicle_title) return missingFields(res);

    const result = await notificationService.handleVehicleSubmitted({ user_id, vehicle_title });
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATION_SENT));
  })
);

export default InternalRoutes;
