export const NOTIFICATION_TEMPLATES = {
  NEW_LISTING: {
    title: "🚗 New Listing Alert!",
    body: "A new listing '{{listing_title}}' has been added! Hurry up & grab your chance to place a bid.",
  },
  AUCTION_CLOSING_SOON: {
    title: "⏰ Auction Closing Soon!",
    body: "The auction for '{{listing_title}}' is about to close! Hurry up and place your final bid!!",
  },
} as const;

export const NOTIFICATION_ERRORS = {
  MISSING_LISTING_ID: "listing_id is required",
  MISSING_LISTING_TITLE: "listing_title is required",
  MISSING_LISTING_TYPE: "listing_type is required",
};
