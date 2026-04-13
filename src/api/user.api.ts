import axios from "axios";
import { UserFCMTokens } from "../types/notification.types";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002/user";

/**
 * Get FCM tokens for a single user (all their devices)
 */
export const getUserFCMTokens = async (user_id: string): Promise<string[]> => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/user/${user_id}/fcm-tokens`
    );
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch FCM tokens for user ${user_id}:`, error);
    return [];
  }
};

/**
 * Get FCM tokens for ALL active users (for broadcast)
 */
export const getAllUserFCMTokens = async (): Promise<UserFCMTokens[]> => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/users/fcm-tokens`
    );
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch all user FCM tokens:", error);
    return [];
  }
};

/**
 * Get FCM tokens for users engaged in a specific listing (for outbid notifications)
 */
export const getEngagedUserFCMTokens = async (
  listing_id: string,
  exclude_user_id?: string
): Promise<UserFCMTokens[]> => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/listing/${listing_id}/engaged-users`,
      {
        params: { exclude: exclude_user_id },
      }
    );
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch engaged user FCM tokens for listing ${listing_id}:`, error);
    return [];
  }
};
