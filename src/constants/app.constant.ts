export const PORT = 3004;

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const API_ENDPOINTS = {
  BASE: "/notification",

  // Internal routes (no auth — called by user-service)
  INTERNAL_NEW_LISTING: "/new-listing",

  // Admin routes
  ADMIN_AUCTION_CLOSING_SOON: "/auction-closing-soon",
};

export const API_RESPONSES = {
  NOTIFICATION_SENT: "Notification sent successfully",
  AUCTION_CLOSING_NOTIFICATION_SENT: "Auction closing soon notification sent",
};

export const API_ERRORS = {
  DATABASE_ERROR: "Database error!",
  YOU_DO_NOT_HAVE_PERMISSION: "You don't have permissions for this action",
  SEND_PROPER_JSON: "Please send proper json data",
  MISSING_REQUIRED_FIELDS: "Missing required fields",
  FAILED_TO_FETCH_FCM_TOKENS: "Failed to fetch FCM tokens from user-service",
};

export const STRINGS = {
  SERVER_LISTENING_ON_PORT: "Server is listening on port",
  USER: "user",
};

export const EUREKA = {
  ID: "notification-service",
  CORE_SERVICE_REGISTERED: "Notification service registered",
  EUREKA_HOST: "eureka host ",
  STARTED: "started",
  DEBUG: "debug",
  SERVICE_PATH: "/eureka/apps/",
  DATA_CENTER_CLASS: "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
  DATA_CENTER_NAME: "MyOwn",
};

export const AUTH_SERVICE =
  process.env.AUTH_SERVICE_URL || "http://13.127.188.130:3001/auth/.well-known/jwks.json";
