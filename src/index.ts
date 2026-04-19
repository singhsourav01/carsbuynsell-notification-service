import { ApiError, errorHandler } from "common-microservices-utils";
import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  API_ENDPOINTS,
  API_ERRORS,
  PORT,
  STRINGS,
} from "./constants/app.constant";

// Routes
import AdminNotificationRoutes from "./routes/admin.notification.routes";
import InternalRoutes from "./routes/internal.routes";

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

// ─── Admin Routes (auction-closing-soon, requires admin auth) ─────────────────
app.use(API_ENDPOINTS.BASE, AdminNotificationRoutes);

// ─── Internal Routes (new-listing, no auth — called by user-service) ──────────
app.use(API_ENDPOINTS.BASE, InternalRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return errorHandler(err, req, res, next);
});

app.listen(port, () => {
  console.log(`${STRINGS.SERVER_LISTENING_ON_PORT} ${port}`);
});
