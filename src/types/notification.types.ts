import { NotificationChannel, NotificationType } from "@prisma/client";

// ─── Internal Trigger Payloads ────────────────────────────────────────────────

export interface NewListingPayload {
  listing_id: string;
  listing_title: string;
  listing_type: string;
}

export interface AuctionClosingSoonPayload {
  listing_id: string;
  listing_title: string;
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
