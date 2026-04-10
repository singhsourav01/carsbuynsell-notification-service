import { NotificationType } from "@prisma/client";
import NotificationRepository from "../repositories/notification.repository";
import FCMService from "./fcm.service";
import TemplateService from "./template.service";
import {
  getAllUserFCMTokens,
  getUserFCMTokens,
} from "../api/user.api";
import {
  NewListingPayload,
  BidOutbidPayload,
  SubscriptionSuccessPayload,
  VehicleSubmittedPayload,
  AuctionClosingSoonPayload,
  BroadcastPayload,
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

  // ─── Internal Triggers ────────────────────────────────────────────────────────

  /**
   * Flow 1: New listing created → notify ALL users
   */
  handleNewListing = async (payload: NewListingPayload) => {
    const { listing_id, listing_title, listing_type } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("NEW_LISTING", {
      listing_title,
      listing_type,
    });

    const dataPayload: Record<string, string> = {
      listing_id,
      type: "NEW_LISTING",
    };

    // Fetch all user FCM tokens
    const allUsers: UserFCMTokens[] = await getAllUserFCMTokens();
    if (allUsers.length === 0) {
      console.log("No users found for new-listing broadcast");
      return { success: 0, failure: 0 };
    }

    // Collect all tokens for push delivery
    const allTokens: string[] = [];
    const notificationRecords: CreateNotificationDTO[] = [];

    for (const user of allUsers) {
      allTokens.push(...user.tokens);
      notificationRecords.push({
        ntf_user_id: user.user_id,
        ntf_type: NotificationType.NEW_LISTING,
        ntf_title: title,
        ntf_body: body,
        ntf_data: { listing_id, listing_title, listing_type },
        ntf_push_sent: true,
        ntf_push_sent_at: new Date(),
      });
    }

    // Send push (fire-and-forget, don't block DB writes)
    const pushResult = await this.fcmService.sendToMultipleDevices(
      allTokens, title, body, dataPayload
    );

    // Store in-app notifications
    if (notificationRecords.length > 0) {
      await this.notificationRepository.createMany(notificationRecords);
    }

    // Log broadcast
    await this.notificationRepository.createBroadcastLog({
      bl_type: NotificationType.NEW_LISTING,
      bl_title: title,
      bl_body: body,
      bl_data: { listing_id, listing_title, listing_type },
      bl_total_sent: pushResult.success,
      bl_total_failed: pushResult.failure,
      bl_triggered_by: "SYSTEM",
    });

    console.log(`New listing notification: ${pushResult.success} sent, ${pushResult.failure} failed`);
    return pushResult;
  };

  /**
   * Flow 2: Someone placed a higher bid → notify the outbid user
   */
  handleBidOutbid = async (payload: BidOutbidPayload) => {
    const { listing_id, listing_title, outbid_user_id, new_bid_amount, new_bidder_name } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("BID_OUTBID", {
      listing_title,
      new_bid_amount,
      new_bidder_name,
    });

    const dataPayload: Record<string, string> = {
      listing_id,
      type: "BID_OUTBID",
      new_bid_amount: String(new_bid_amount),
    };

    // Fetch FCM tokens for the outbid user
    const tokens = await getUserFCMTokens(outbid_user_id);

    // Send push
    let pushResult = { success: 0, failure: 0 };
    if (tokens.length > 0) {
      pushResult = await this.fcmService.sendToMultipleDevices(
        tokens, title, body, dataPayload
      );
    }

    // Store in-app notification
    await this.notificationRepository.create({
      ntf_user_id: outbid_user_id,
      ntf_type: NotificationType.BID_OUTBID,
      ntf_title: title,
      ntf_body: body,
      ntf_data: { listing_id, listing_title, new_bid_amount, new_bidder_name },
      ntf_push_sent: pushResult.success > 0,
      ntf_push_sent_at: pushResult.success > 0 ? new Date() : undefined,
    });

    console.log(`Outbid notification to user ${outbid_user_id}: ${pushResult.success} sent`);
    return pushResult;
  };

  /**
   * Flow 3: Subscription purchased → notify the user
   */
  handleSubscriptionSuccess = async (payload: SubscriptionSuccessPayload) => {
    const { user_id, plan_name, expires_at } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("SUBSCRIPTION_SUCCESS", {
      plan_name,
      expires_at,
    });

    const dataPayload: Record<string, string> = {
      type: "SUBSCRIPTION_SUCCESS",
    };

    const tokens = await getUserFCMTokens(user_id);

    let pushResult = { success: 0, failure: 0 };
    if (tokens.length > 0) {
      pushResult = await this.fcmService.sendToMultipleDevices(
        tokens, title, body, dataPayload
      );
    }

    await this.notificationRepository.create({
      ntf_user_id: user_id,
      ntf_type: NotificationType.SUBSCRIPTION_SUCCESS,
      ntf_title: title,
      ntf_body: body,
      ntf_data: { plan_name, expires_at },
      ntf_push_sent: pushResult.success > 0,
      ntf_push_sent_at: pushResult.success > 0 ? new Date() : undefined,
    });

    console.log(`Subscription notification to user ${user_id}: ${pushResult.success} sent`);
    return pushResult;
  };

  /**
   * Flow 4: Vehicle submitted → notify the user
   */
  handleVehicleSubmitted = async (payload: VehicleSubmittedPayload) => {
    const { user_id, vehicle_title } = payload;

    const { title, body } = this.templateService.getRenderedTemplate("VEHICLE_SUBMITTED", {
      vehicle_title,
    });

    const dataPayload: Record<string, string> = {
      type: "VEHICLE_SUBMITTED",
    };

    const tokens = await getUserFCMTokens(user_id);

    let pushResult = { success: 0, failure: 0 };
    if (tokens.length > 0) {
      pushResult = await this.fcmService.sendToMultipleDevices(
        tokens, title, body, dataPayload
      );
    }

    await this.notificationRepository.create({
      ntf_user_id: user_id,
      ntf_type: NotificationType.VEHICLE_SUBMITTED,
      ntf_title: title,
      ntf_body: body,
      ntf_data: { vehicle_title },
      ntf_push_sent: pushResult.success > 0,
      ntf_push_sent_at: pushResult.success > 0 ? new Date() : undefined,
    });

    console.log(`Vehicle submitted notification to user ${user_id}: ${pushResult.success} sent`);
    return pushResult;
  };

  // ─── Admin Actions ────────────────────────────────────────────────────────────

  /**
   * Flow 5: Admin triggers auction closing soon → notify ALL users
   */
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

    const allUsers: UserFCMTokens[] = await getAllUserFCMTokens();
    const allTokens: string[] = [];
    const notificationRecords: CreateNotificationDTO[] = [];

    for (const user of allUsers) {
      allTokens.push(...user.tokens);
      notificationRecords.push({
        ntf_user_id: user.user_id,
        ntf_type: NotificationType.AUCTION_CLOSING_SOON,
        ntf_title: title,
        ntf_body: body,
        ntf_data: { listing_id, listing_title },
        ntf_push_sent: true,
        ntf_push_sent_at: new Date(),
      });
    }

    const pushResult = await this.fcmService.sendToMultipleDevices(
      allTokens, title, body, dataPayload
    );

    if (notificationRecords.length > 0) {
      await this.notificationRepository.createMany(notificationRecords);
    }

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

  /**
   * Admin sends custom broadcast notification to ALL users
   */
  handleBroadcast = async (payload: BroadcastPayload, triggered_by: string) => {
    const { title, body, type, data } = payload;
    const notificationType = type || NotificationType.GENERAL;

    const dataPayload: Record<string, string> = {
      type: notificationType,
      ...(data ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ) : {}),
    };

    const allUsers: UserFCMTokens[] = await getAllUserFCMTokens();
    const allTokens: string[] = [];
    const notificationRecords: CreateNotificationDTO[] = [];

    for (const user of allUsers) {
      allTokens.push(...user.tokens);
      notificationRecords.push({
        ntf_user_id: user.user_id,
        ntf_type: notificationType,
        ntf_title: title,
        ntf_body: body,
        ntf_data: data || {},
        ntf_push_sent: true,
        ntf_push_sent_at: new Date(),
      });
    }

    const pushResult = await this.fcmService.sendToMultipleDevices(
      allTokens, title, body, dataPayload
    );

    if (notificationRecords.length > 0) {
      await this.notificationRepository.createMany(notificationRecords);
    }

    await this.notificationRepository.createBroadcastLog({
      bl_type: notificationType,
      bl_title: title,
      bl_body: body,
      bl_data: data,
      bl_total_sent: pushResult.success,
      bl_total_failed: pushResult.failure,
      bl_triggered_by: triggered_by,
    });

    console.log(`Broadcast notification: ${pushResult.success} sent, ${pushResult.failure} failed`);
    return pushResult;
  };

  // ─── User-Facing Queries ──────────────────────────────────────────────────────

  getMyNotifications = async (user_id: string, page: number, take: number) => {
    return this.notificationRepository.findByUserId(user_id, page, take);
  };

  getUnreadCount = async (user_id: string) => {
    const count = await this.notificationRepository.getUnreadCount(user_id);
    return { unread_count: count };
  };

  markAsRead = async (ntf_id: string, user_id: string) => {
    const notification = await this.notificationRepository.findById(ntf_id);
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    if (notification.ntf_user_id !== user_id) {
      throw new Error("NOTIFICATION_NOT_YOURS");
    }
    return this.notificationRepository.markAsRead(ntf_id);
  };

  markAllAsRead = async (user_id: string) => {
    return this.notificationRepository.markAllAsRead(user_id);
  };

  getBroadcastLogs = async (page: number, take: number) => {
    return this.notificationRepository.getBroadcastLogs(page, take);
  };
}

export default NotificationService;
