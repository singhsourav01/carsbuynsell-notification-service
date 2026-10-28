export const NOTIFICATION_TEMPLATES = {
  NEW_LISTING: {
    title: "🚗 New Listing Alert!",
    body: "A new listing '{{listing_title}}' has been added! Hurry up & grab your chance to place a bid.",
  },
  AUCTION_CLOSING_SOON: {
    title: "⏰ Auction Closing Soon!",
    body: "The auction for '{{listing_title}}' is about to close! Hurry up and place your final bid!!",
  },
  BID_OUTBID: {
    title: "⚠️ You've been outbid!",
    body: "{{new_bidder_name}} bid ₹{{new_bid_amount}} on '{{listing_title}}'. Place a higher bid to stay in the lead.",
  },
  SUBSCRIPTION_SUCCESS: {
    title: "✅ Subscription active",
    body: "Your {{plan_name}} subscription is active until {{expires_at}}. You can now bid and buy.",
  },
  VEHICLE_SUBMITTED: {
    title: "🚗 Vehicle submitted",
    body: "We received your vehicle '{{vehicle_title}}'. Our team will review it shortly.",
  },
} as const;

/** Must match the channel the app creates (lib/push-notifications.ts). */
export const ANDROID_CHANNEL_ID = "carsbuynsell_notifications";

export const NOTIFICATION_ERRORS = {
  MISSING_LISTING_ID: "listing_id is required",
  MISSING_LISTING_TITLE: "listing_title is required",
  MISSING_LISTING_TYPE: "listing_type is required",
};
