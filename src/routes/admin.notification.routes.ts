import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import AdminNotificationController from "../controllers/admin.notification.controller";
import { authAdmin } from "../middlewares/auth.middleware";

const AdminNotificationRoutes = express.Router();
const adminController = new AdminNotificationController();

// POST /notification/admin/auction-closing-soon
AdminNotificationRoutes.route(API_ENDPOINTS.ADMIN_AUCTION_CLOSING_SOON).post(
  authAdmin(),
  adminController.auctionClosingSoon
);

export default AdminNotificationRoutes;
