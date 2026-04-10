import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES, API_ERRORS } from "../constants/app.constant";
import { NOTIFICATION_ERRORS } from "../constants/notification.constant";
import NotificationService from "../services/notification.service";

interface AuthRequest extends Request {
  user?: any;
}

class AdminNotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * POST /notification/admin/auction-closing-soon
   */
  auctionClosingSoon = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { listing_id, listing_title } = req.body;
    const triggered_by = req.user?.user_id || "ADMIN";

    if (!listing_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, NOTIFICATION_ERRORS.MISSING_LISTING_ID));
    }
    if (!listing_title) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, NOTIFICATION_ERRORS.MISSING_LISTING_TITLE));
    }

    const result = await this.notificationService.handleAuctionClosingSoon(
      { listing_id, listing_title },
      triggered_by
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.AUCTION_CLOSING_NOTIFICATION_SENT));
  });

  /**
   * POST /notification/admin/broadcast
   */
  broadcast = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, body, type, data } = req.body;
    const triggered_by = req.user?.user_id || "ADMIN";

    if (!title) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, NOTIFICATION_ERRORS.MISSING_TITLE));
    }
    if (!body) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, NOTIFICATION_ERRORS.MISSING_BODY));
    }

    const result = await this.notificationService.handleBroadcast(
      { title, body, type, data },
      triggered_by
    );

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.BROADCAST_SENT));
  });

  /**
   * GET /notification/admin/broadcast-logs?page=1&page_size=10
   */
  getBroadcastLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page || "1");
    const take = Number(req.query.page_size || "10");

    const result = await this.notificationService.getBroadcastLogs(page, take);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.BROADCAST_LOGS_FETCHED));
  });
}

export default AdminNotificationController;
