import axios from "axios";
import { UserFCMTokens } from "../types/notification.types";

const USER_SERVICE_URL = "https://admin.carsbuynsell.com/api/user";

/**
 * Get FCM tokens for ALL active users (for broadcast)
 * Calls: GET {USER_SERVICE_URL}/internal/users/fcm-tokens
 */
export const getAllUserFCMTokens = async (): Promise<UserFCMTokens[]> => {
  try {
    const { data } = await axios.get(`${USER_SERVICE_URL}/internal/users/fcm-tokens`);
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch all user FCM tokens:", error);
    return [];
  }
};

/**
 * Get FCM tokens for one user (for personal notifications, e.g. outbid)
 * Calls: GET {USER_SERVICE_URL}/internal/user/:user_id/fcm-tokens
 */
export const getUserFCMTokens = async (user_id: string): Promise<string[]> => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/internal/user/${encodeURIComponent(user_id)}/fcm-tokens`
    );
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch FCM tokens for user ${user_id}:`, error);
    return [];
  }
};

/**
 * Remove tokens Firebase reported as stale, so they aren't retried on every send
 * Calls: POST {USER_SERVICE_URL}/internal/fcm-tokens/remove
 */
export const removeStaleFCMTokens = async (tokens: string[]): Promise<void> => {
  if (tokens.length === 0) return;
  try {
    const { data } = await axios.post(`${USER_SERVICE_URL}/internal/fcm-tokens/remove`, { tokens });
    console.log(`Removed ${data?.data?.removed ?? 0} stale FCM token(s)`);
  } catch (error: any) {
    console.error("Failed to remove stale FCM tokens:", error?.message);
  }
};
