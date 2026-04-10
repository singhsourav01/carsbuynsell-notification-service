import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import { CreateNotificationDTO } from "../types/notification.types";
import { NotificationType } from "@prisma/client";

class NotificationRepository {
  /**
   * Create a single notification record
   */
  create = async (data: CreateNotificationDTO) => {
    return queryHandler(() =>
      prisma.notifications.create({
        data: {
          ntf_user_id: data.ntf_user_id,
          ntf_type: data.ntf_type,
          ntf_title: data.ntf_title,
          ntf_body: data.ntf_body,
          ntf_data: data.ntf_data || undefined,
          ntf_channel: data.ntf_channel || "BOTH",
          ntf_push_sent: data.ntf_push_sent || false,
          ntf_push_sent_at: data.ntf_push_sent_at || null,
        },
      })
    );
  };

  /**
   * Create many notification records (for broadcast)
   */
  createMany = async (records: CreateNotificationDTO[]) => {
    return queryHandler(() =>
      prisma.notifications.createMany({
        data: records.map((r) => ({
          ntf_user_id: r.ntf_user_id,
          ntf_type: r.ntf_type,
          ntf_title: r.ntf_title,
          ntf_body: r.ntf_body,
          ntf_data: r.ntf_data || undefined,
          ntf_channel: r.ntf_channel || "BOTH",
          ntf_push_sent: r.ntf_push_sent || false,
          ntf_push_sent_at: r.ntf_push_sent_at || null,
        })),
      })
    );
  };

  /**
   * Get paginated notifications for a user (newest first)
   */
  findByUserId = async (user_id: string, page: number, take: number) => {
    const skip = (page - 1) * take;
    const [notifications, count] = await queryHandler(() =>
      prisma.$transaction([
        prisma.notifications.findMany({
          where: { ntf_user_id: user_id },
          take,
          skip,
          orderBy: { ntf_created_at: "desc" },
        }),
        prisma.notifications.count({
          where: { ntf_user_id: user_id },
        }),
      ])
    );
    return { notifications, count, page, take };
  };

  /**
   * Get unread count for a user
   */
  getUnreadCount = async (user_id: string) => {
    return queryHandler(() =>
      prisma.notifications.count({
        where: { ntf_user_id: user_id, ntf_is_read: false },
      })
    );
  };

  /**
   * Find a notification by ID
   */
  findById = async (ntf_id: string) => {
    return queryHandler(() =>
      prisma.notifications.findUnique({
        where: { ntf_id },
      })
    );
  };

  /**
   * Mark a single notification as read
   */
  markAsRead = async (ntf_id: string) => {
    return queryHandler(() =>
      prisma.notifications.update({
        where: { ntf_id },
        data: {
          ntf_is_read: true,
          ntf_read_at: new Date(),
        },
      })
    );
  };

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead = async (user_id: string) => {
    return queryHandler(() =>
      prisma.notifications.updateMany({
        where: { ntf_user_id: user_id, ntf_is_read: false },
        data: {
          ntf_is_read: true,
          ntf_read_at: new Date(),
        },
      })
    );
  };

  /**
   * Create a broadcast log entry
   */
  createBroadcastLog = async (data: {
    bl_type: NotificationType;
    bl_title: string;
    bl_body: string;
    bl_data?: any;
    bl_total_sent: number;
    bl_total_failed: number;
    bl_triggered_by: string;
  }) => {
    return queryHandler(() =>
      prisma.broadcast_logs.create({
        data: {
          bl_type: data.bl_type,
          bl_title: data.bl_title,
          bl_body: data.bl_body,
          bl_data: data.bl_data || undefined,
          bl_total_sent: data.bl_total_sent,
          bl_total_failed: data.bl_total_failed,
          bl_triggered_by: data.bl_triggered_by,
        },
      })
    );
  };

  /**
   * Get paginated broadcast logs
   */
  getBroadcastLogs = async (page: number, take: number) => {
    const skip = (page - 1) * take;
    const [logs, count] = await queryHandler(() =>
      prisma.$transaction([
        prisma.broadcast_logs.findMany({
          take,
          skip,
          orderBy: { bl_created_at: "desc" },
        }),
        prisma.broadcast_logs.count(),
      ])
    );
    return { logs, count, page, take };
  };
}

export default NotificationRepository;
