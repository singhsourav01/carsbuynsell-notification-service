import { NotificationChannel, NotificationType } from "@prisma/client";

// ─── Internal Trigger Payloads ────────────────────────────────────────────────

export interface NewListingPayload {
  listing_id: string;
  listing_title: string;
  listing_type: string;
}

export interface BidOutbidPayload {
  listing_id: string;
  listing_title: string;
  outbid_user_id: string;
  new_bid_amount: number;
  new_bidder_name: string;
}

export interface SubscriptionSuccessPayload {
  user_id: string;
  plan_name: string;
  expires_at: string;
}

export interface VehicleSubmittedPayload {
  user_id: string;
  vehicle_title: string;
}

export interface AuctionClosingSoonPayload {
  listing_id: string;
  listing_title: string;
}

export interface BroadcastPayload {
  title: string;
  body: string;
  type?: NotificationType;
  data?: Record<string, any>;
}

// ─── Notification Creation ────────────────────────────────────────────────────

export interface CreateNotificationDTO {
  ntf_user_id: string;
  ntf_type: NotificationType;
  ntf_title: string;
  ntf_body: string;
  ntf_data?: any;
  ntf_channel?: NotificationChannel;
  ntf_push_sent?: boolean;
  ntf_push_sent_at?: Date;
}

// ─── User-Service API Response Types ──────────────────────────────────────────

export interface UserFCMTokens {
  user_id: string;
  tokens: string[];
}
