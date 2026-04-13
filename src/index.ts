import { ApiError, errorHandler } from "common-microservices-utils";
import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  API_ENDPOINTS,
  API_ERRORS,
  EUREKA,
  PORT,
  STRINGS,
} from "./constants/app.constant";

// Routes
import NotificationRoutes from "./routes/notification.routes";
import AdminNotificationRoutes from "./routes/admin.notification.routes";
import InternalRoutes from "./routes/internal.routes";

import { registerWithEureka } from "./utils/eureka.helper";

config();

const app = express();
const port = parseInt(process.env.PORT || "") || PORT;

app.use(
  express.json(),
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.SEND_PROPER_JSON);
    }
    return next();
  }
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── User-Facing Routes ──────────────────────────────────────────────────────
app.use(API_ENDPOINTS.BASE, NotificationRoutes);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
app.use(API_ENDPOINTS.BASE, AdminNotificationRoutes);

// ─── Internal Routes (inter-service, no auth) ────────────────────────────────
app.use(API_ENDPOINTS.BASE, InternalRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return errorHandler(err, req, res, next);
});

app.listen(port, () => {
  console.log(`${STRINGS.SERVER_LISTENING_ON_PORT} ${port}`);
});
