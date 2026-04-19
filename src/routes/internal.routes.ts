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

export default InternalRoutes;
