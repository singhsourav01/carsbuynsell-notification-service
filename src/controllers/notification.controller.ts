import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES, API_ERRORS } from "../constants/app.constant";
import NotificationService from "../services/notification.service";

interface AuthRequest extends Request {
  user?: any;
}

class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * GET /notification/my?page=1&page_size=20
   */
  getMyNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { user_id } = req.user;
    const page = Number(req.query.page || "1");
    const take = Number(req.query.page_size || "20");

    const result = await this.notificationService.getMyNotifications(user_id, page, take);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATIONS_FETCHED));
  });

  /**
   * GET /notification/my/unread-count
   */
  getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { user_id } = req.user;
    const result = await this.notificationService.getUnreadCount(user_id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.UNREAD_COUNT_FETCHED));
  });

  /**
   * PATCH /notification/my/:ntf_id/read
   */
  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { user_id } = req.user;
    const { ntf_id } = req.params;

    try {
      const result = await this.notificationService.markAsRead(ntf_id, user_id);
      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.NOTIFICATION_MARKED_READ));
    } catch (err: any) {
      if (err.message === "NOTIFICATION_NOT_FOUND") {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(new ApiResponse(StatusCodes.NOT_FOUND, null, API_ERRORS.NOTIFICATION_NOT_FOUND));
      }
      if (err.message === "NOTIFICATION_NOT_YOURS") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(new ApiResponse(StatusCodes.FORBIDDEN, null, API_ERRORS.NOTIFICATION_NOT_YOURS));
      }
      throw err;
    }
  });

  /**
   * PATCH /notification/my/read-all
   */
  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { user_id } = req.user;
    const result = await this.notificationService.markAllAsRead(user_id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, API_RESPONSES.ALL_NOTIFICATIONS_MARKED_READ));
  });
}

export default NotificationController;


// Sourav singh