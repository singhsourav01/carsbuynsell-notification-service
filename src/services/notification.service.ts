import { NotificationType } from "@prisma/client";
import NotificationRepository from "../repositories/notification.repository";
import FCMService from "./fcm.service";
import TemplateService from "./template.service";
import { getAllUserFCMTokens, getUserFCMTokens } from "../api/user.api";
import {
  NewListingPayload,
  AuctionClosingSoonPayload,
  BidOutbidPayload,
  SubscriptionSuccessPayload,
  VehicleSubmittedPayload,
  CreateNotificationDTO,
  UserFCMTokens,
} from "../types/notification.types";

class NotificationService {
  private notificationRepository: NotificationRepository;
  private fcmService: FCMService;
  private templateService: TemplateService;

  constructor() {
    this.notificationRepository = new NotificationRepository();
    this.fcmService = new FCMService();
    this.templateService = new TemplateService();
  }

  // ─── Flow 1: New listing created → notify ALL users ─────────────────────────

  handleNewListing = async (payload: NewListingPayload) => {
    const { listing_id, listing_title } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("NEW_LISTING", {
      listing_title,
      listing_type: "NEW_LISTING",
    });

    const dataPayload: Record<string, string> = {
      listing_id,
      type: "NEW_LISTING",
    };

    // Fetch all user FCM tokens from user-service
    const allUsers: UserFCMTokens[] = await getAllUserFCMTokens();
    if (allUsers.length === 0) {
      console.log("No users found for new-listing broadcast");
      return { success: 0, failure: 0 };
    }

    // Collect all tokens for push delivery
    const allTokens: string[] = [];
    const notificationRecords: CreateNotificationDTO[] = [];

    for (const user of allUsers) {
      const validTokens = user.tokens.filter(
        token => token && token !== "not-available"
      );
      console.log(`Sending push to ${allTokens.length} tokens`);
      allTokens.push(...validTokens);

      notificationRecords.push({
        ntf_user_id: user.user_id,
        ntf_type: NotificationType.NEW_LISTING,
        ntf_title: title,
        ntf_body: body,
        ntf_data: { listing_id, listing_title },
        ntf_push_sent: false,
        ntf_push_sent_at: null,
      });
    }

    // Send push notification to all devices
  const pushResult = await this.fcmService.sendToMultipleDevices(
    allTokens,
    title,
    body,
    dataPayload
  );
  const pushSent = pushResult.success > 0;

    notificationRecords.forEach(record => {
      record.ntf_push_sent = pushSent;
      record.ntf_push_sent_at = pushSent ? new Date() : null;
    });

  if (pushResult.staleTokens.length > 0) {
    console.log("Remove stale tokens:", pushResult.staleTokens);
    // call user-service cleanup API here
  }

    // Store in-app notifications
    if (notificationRecords.length > 0) {
      await this.notificationRepository.createMany(notificationRecords);
    }

    // Log broadcast
    await this.notificationRepository.createBroadcastLog({
      bl_type: NotificationType.NEW_LISTING,
      bl_title: title,
      bl_body: body,
      bl_data: { listing_id, listing_title },
      bl_total_sent: pushResult.success,
      bl_total_failed: pushResult.failure,
      bl_triggered_by: "SYSTEM",
    });

    console.log(`New listing notification: ${pushResult.success} sent, ${pushResult.failure} failed`);
    return pushResult;
  };

  // ─── Flow 2: Admin triggers auction closing soon → notify ALL users ─────────

  handleAuctionClosingSoon = async (
    payload: AuctionClosingSoonPayload,
    triggered_by: string
  ) => {
    const { listing_id, listing_title } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("AUCTION_CLOSING_SOON", {
      listing_title,
    });

    const dataPayload: Record<string, string> = {
      listing_id,
      type: "AUCTION_CLOSING_SOON",
    };

    // Fetch all user FCM tokens from user-service
    const allUsers: UserFCMTokens[] = await getAllUserFCMTokens();
    const allTokens: string[] = [];
    const notificationRecords: CreateNotificationDTO[] = [];

    for (const user of allUsers) {
          const validTokens = user.tokens.filter(
        token => token && token !== "not-available"
      );

      allTokens.push(...validTokens);
      notificationRecords.push({
        ntf_user_id: user.user_id,
        ntf_type: NotificationType.AUCTION_CLOSING_SOON,
        ntf_title: title,
        ntf_body: body,
        ntf_data: { listing_id, listing_title },
        ntf_push_sent: false,
        ntf_push_sent_at: null,
      });
    }

    
    // Send push notification to all devices
    const pushResult = await this.fcmService.sendToMultipleDevices(
      allTokens,
      title,
      body,
      dataPayload
    );
    const pushSent = pushResult.success > 0;
      notificationRecords.forEach(n => {
        n.ntf_push_sent = pushSent;
        n.ntf_push_sent_at = pushSent ? new Date() : null;
      });

    if (pushResult.staleTokens.length > 0) {
      console.log("Remove stale tokens:", pushResult.staleTokens);
      // call user-service cleanup API here
    }

    // Store in-app notifications
    if (notificationRecords.length > 0) {
      await this.notificationRepository.createMany(notificationRecords);
    }

    // Log broadcast
    await this.notificationRepository.createBroadcastLog({
      bl_type: NotificationType.AUCTION_CLOSING_SOON,
      bl_title: title,
      bl_body: body,
      bl_data: { listing_id, listing_title },
      bl_total_sent: pushResult.success,
      bl_total_failed: pushResult.failure,
      bl_triggered_by: triggered_by,
    });

    console.log(`Auction closing notification: ${pushResult.success} sent, ${pushResult.failure} failed`);
    return pushResult;
  };

  // ─── Personal notifications (one user) ──────────────────────────────────────
  // Push only: these types aren't in the NotificationType DB enum, so no
  // in-app record is stored (that would need a migration).

  private sendToUser = async (
    user_id: string,
    template: "BID_OUTBID" | "SUBSCRIPTION_SUCCESS" | "VEHICLE_SUBMITTED",
    templateData: Record<string, any>,
    dataPayload: Record<string, string>
  ) => {
    const { title, body } = this.templateService.getRenderedTemplate(template, templateData);
    const tokens = (await getUserFCMTokens(user_id)).filter(
      token => token && token !== "not-available"
    );
    if (tokens.length === 0) {
      console.log(`${template}: user ${user_id} has no registered device`);
      return { success: 0, failure: 0, staleTokens: [] as string[] };
    }

    const pushResult = await this.fcmService.sendToMultipleDevices(tokens, title, body, {
      ...dataPayload,
      type: template,
    });
    console.log(`${template} notification to ${user_id}: ${pushResult.success} sent, ${pushResult.failure} failed`);
    return pushResult;
  };

  // ─── Flow 3: User was outbid → notify that user ─────────────────────────────

  handleBidOutbid = async (payload: BidOutbidPayload) => {
    const { listing_id, listing_title, outbid_user_id, new_bid_amount, new_bidder_name } = payload;
    return this.sendToUser(
      outbid_user_id,
      "BID_OUTBID",
      {
        listing_title,
        new_bidder_name,
        new_bid_amount: Number(new_bid_amount).toLocaleString("en-IN"),
      },
      { listing_id }
    );
  };

  // ─── Flow 4: Subscription activated → notify that user ──────────────────────

  handleSubscriptionSuccess = async (payload: SubscriptionSuccessPayload) => {
    const { user_id, plan_name, expires_at } = payload;
    return this.sendToUser(user_id, "SUBSCRIPTION_SUCCESS", { plan_name, expires_at }, {});
  };

  // ─── Flow 5: User submitted a vehicle to sell → notify that user ────────────

  handleVehicleSubmitted = async (payload: VehicleSubmittedPayload) => {
    const { user_id, vehicle_title } = payload;
    return this.sendToUser(user_id, "VEHICLE_SUBMITTED", { vehicle_title }, {});
  };
}

export default NotificationService;
