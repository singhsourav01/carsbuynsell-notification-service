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
}

export default NotificationRepository;
