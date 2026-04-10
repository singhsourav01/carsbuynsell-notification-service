import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import NotificationController from "../controllers/notification.controller";
import { authUser, auth } from "../middlewares/auth.middleware";

const NotificationRoutes = express.Router();
const notificationController = new NotificationController();

// GET /notification/my?page=1&page_size=20
NotificationRoutes.route(API_ENDPOINTS.MY_NOTIFICATIONS).get(
  authUser(),
  notificationController.getMyNotifications
);

// GET /notification/my/unread-count
NotificationRoutes.route(API_ENDPOINTS.MY_UNREAD_COUNT).get(
  authUser(),
  notificationController.getUnreadCount
);

// PATCH /notification/my/read-all (must come before /:ntf_id/read)
NotificationRoutes.route(API_ENDPOINTS.MARK_ALL_READ).patch(
  authUser(),
  notificationController.markAllAsRead
);

// PATCH /notification/my/:ntf_id/read
NotificationRoutes.route(API_ENDPOINTS.MARK_READ).patch(
  authUser(),
  notificationController.markAsRead
);

export default NotificationRoutes;
