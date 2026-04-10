import admin, { initializeFirebase } from "../configs/firebase.config";

class FCMService {
  constructor() {
    initializeFirebase();
  }

  /**
   * Send push to a single device
   */
  sendToDevice = async (
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> => {
    try {
      await admin.messaging().send({
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
      });
      return true;
    } catch (error: any) {
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        console.warn(`Stale FCM token detected: ${fcmToken.substring(0, 20)}...`);
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
  ): Promise<{ success: number; failure: number }> => {
    if (fcmTokens.length === 0) return { success: 0, failure: 0 };

    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
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

    // Batch in chunks of 500 (FCM limit)
    for (let i = 0; i < fcmTokens.length; i += 500) {
      const chunk = fcmTokens.slice(i, i + 500);
      const chunkMessage = { ...message, tokens: chunk };

      try {
        const response = await admin.messaging().sendEachForMulticast(chunkMessage);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Log stale tokens
        response.responses.forEach((resp, idx) => {
          if (resp.error) {
            const code = resp.error.code;
            if (
              code === "messaging/invalid-registration-token" ||
              code === "messaging/registration-token-not-registered"
            ) {
              console.warn(`Stale FCM token at index ${i + idx}`);
            }
          }
        });
      } catch (error: any) {
        console.error("FCM multicast batch error:", error.message);
        totalFailure += chunk.length;
      }
    }

    return { success: totalSuccess, failure: totalFailure };
  };
}

export default FCMService;
