import admin, { initializeFirebase } from "../configs/firebase.config";

class FCMService {
  constructor() {
    initializeFirebase();
  }

  /**
   * Validate FCM token format
   * FCM tokens are long alphanumeric strings, typically 150+ chars
   */
  private isValidFCMToken = (token: string): boolean => {
    if (!token || typeof token !== "string") return false;
    // FCM tokens contain alphanumeric, underscores, hyphens, and colons
    // and are typically 150+ characters long
    return token.length > 50 && /^[a-zA-Z0-9_\-:]+$/.test(token);
  };

  /**
   * Send a raw Firebase message via admin.messaging().send()
   */
  sendMessage = async (message: admin.messaging.Message): Promise<string> => {
    return await admin.messaging().send(message);
  };

  /**
   * Send push to a single device
   */
  sendToDevice = async (
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> => {
    // Skip invalid tokens
    if (!this.isValidFCMToken(fcmToken)) {
      console.warn(`Invalid FCM token format: ${fcmToken.substring(0, 20)}...`);
      return false;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          channelId: "carsbuynsell_notifications",
          sound: "default",
        },
      },
      apns: {
        payload: { aps: { sound: "default", badge: 1 } },
      },
    };

    try {
      await this.sendMessage(message);
      return true;
    } catch (error: any) {
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        console.warn(`Stale FCM token detected and should be removed: ${fcmToken.substring(0, 20)}...`);
        // TODO: Call user-service to remove stale FCM token
      } else {
        console.error("FCM send error:", error.message);
      }
      return false;
    }
  };

  /**
   * Send push to multiple devices (batch, max 500 per call)
   */
  sendToMultipleDevices = async (
    fcmTokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ success: number; failure: number; staleTokens: string[] }> => {
    if (fcmTokens.length === 0) return { success: 0, failure: 0, staleTokens: [] };

    // Filter out obviously invalid tokens
    const validTokens = fcmTokens.filter((token) => this.isValidFCMToken(token));
    const invalidTokenCount = fcmTokens.length - validTokens.length;

    if (invalidTokenCount > 0) {
      console.warn(
        `Filtered out ${invalidTokenCount} invalid FCM tokens. Valid tokens: ${validTokens.length}`
      );
    }

    if (validTokens.length === 0) {
      return { success: 0, failure: fcmTokens.length, staleTokens: [] };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens: validTokens,
      notification: { title, body },
      data: data || {},
      android: {
        priority: "high",
        notification: {
          channelId: "carsbuynsell_notifications",
          sound: "default",
        },
      },
    };

    let totalSuccess = 0;
    let totalFailure = 0;
    const staleTokens: string[] = [];

    // Batch in chunks of 500 (FCM limit)
    for (let i = 0; i < validTokens.length; i += 500) {
      const chunk = validTokens.slice(i, i + 500);
      const chunkMessage = { ...message, tokens: chunk };

      try {
        const response = await admin.messaging().sendEachForMulticast(chunkMessage);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Track stale tokens for removal from user-service
        response.responses.forEach((resp, idx) => {
          if (resp.error) {
            const code = resp.error.code;
            if (
              code === "messaging/invalid-registration-token" ||
              code === "messaging/registration-token-not-registered"
            ) {
              const staleToken = chunk[idx];
              staleTokens.push(staleToken);
              console.warn(
                `Stale FCM token: ${staleToken.substring(0, 30)}... (should be removed from user-service)`
              );
            }
          }
        });
      } catch (error: any) {
        console.error("FCM multicast batch error:", error.message);
        totalFailure += chunk.length;
      }
    }

    return { success: totalSuccess, failure: totalFailure + invalidTokenCount, staleTokens };
  };
}

export default FCMService;
