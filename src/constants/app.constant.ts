export const PORT = 3004;

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
  SUPER_ADMIN: "SUPER_ADMIN",
};

export const API_ENDPOINTS = {
  BASE: "/notification",
  INTERNAL: "/internal",

  // Internal routes (no auth)
  INTERNAL_NEW_LISTING: "/new-listing",
  INTERNAL_BID_OUTBID: "/bid-outbid",
  INTERNAL_SUBSCRIPTION_SUCCESS: "/subscription-success",
  INTERNAL_VEHICLE_SUBMITTED: "/vehicle-submitted",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_AUCTION_CLOSING_SOON: "/auction-closing-soon",
  ADMIN_BROADCAST: "/broadcast",
  ADMIN_BROADCAST_LOGS: "/broadcast-logs",

  // User routes
  MY_NOTIFICATIONS: "/my",
  MY_UNREAD_COUNT: "/my/unread-count",
  MARK_READ: "/my/:ntf_id/read",
  MARK_ALL_READ: "/my/read-all",
};

export const API_RESPONSES = {
  NOTIFICATION_SENT: "Notification sent successfully",
  NOTIFICATIONS_FETCHED: "Notifications fetched successfully",
  NOTIFICATION_MARKED_READ: "Notification marked as read",
  ALL_NOTIFICATIONS_MARKED_READ: "All notifications marked as read",
  UNREAD_COUNT_FETCHED: "Unread count fetched successfully",
  BROADCAST_SENT: "Broadcast notification sent successfully",
  BROADCAST_LOGS_FETCHED: "Broadcast logs fetched successfully",
  AUCTION_CLOSING_NOTIFICATION_SENT: "Auction closing soon notification sent",
};

export const API_ERRORS = {
  DATABASE_ERROR: "Database error!",
  YOU_DO_NOT_HAVE_PERMISSION: "You don't have permissions for this action",
  NOTIFICATION_NOT_FOUND: "Notification not found",
  NOTIFICATION_NOT_YOURS: "This notification does not belong to you",
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
