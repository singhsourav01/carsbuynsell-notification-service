export const NOTIFICATION_TEMPLATES = {
  NEW_LISTING: {
    title: "🚗 New Listing Alert!",
    body: "A new {{listing_type}} listing '{{listing_title}}' has been added! Hurry up & grab your chance to place a bid.",
  },
  BID_OUTBID: {
    title: "⚠️ You've Been Outbid!",
    body: "Someone placed a higher bid of ₹{{new_bid_amount}} on '{{listing_title}}'. Place a higher bid now to stay in the race!",
  },
  SUBSCRIPTION_SUCCESS: {
    title: "🎉 Subscription Activated!",
    body: "Thank you for purchasing the {{plan_name}} subscription! Your subscription is now active and valid until {{expires_at}}. Enjoy premium access!",
  },
  VEHICLE_SUBMITTED: {
    title: "📋 Vehicle Details Submitted!",
    body: "Your vehicle details for '{{vehicle_title}}' have been submitted successfully. Please wait, our admin will connect with you within 24 hours.",
  },
  AUCTION_CLOSING_SOON: {
    title: "⏰ Auction Closing Soon!",
    body: "The auction for '{{listing_title}}' is about to close! Hurry up and place your final bid!!",
  },
} as const;

export const NOTIFICATION_ERRORS = {
  NOTIFICATION_NOT_FOUND: "Notification not found",
  NOTIFICATION_NOT_YOURS: "This notification does not belong to you",
  MISSING_LISTING_ID: "listing_id is required",
  MISSING_LISTING_TITLE: "listing_title is required",
  MISSING_LISTING_TYPE: "listing_type is required",
  MISSING_USER_ID: "user_id is required",
  MISSING_OUTBID_USER_ID: "outbid_user_id is required",
  MISSING_BID_AMOUNT: "new_bid_amount is required",
  MISSING_PLAN_NAME: "plan_name is required",
  MISSING_EXPIRES_AT: "expires_at is required",
  MISSING_VEHICLE_TITLE: "vehicle_title is required",
  MISSING_TITLE: "title is required",
  MISSING_BODY: "body is required",
};
