import PushNotifications from "node-pushnotifications";

import getSecrets from "./getSecrets";

const createNotificationsService = async (app: "d4j" | "homechef") => {
  let apnsP8,
    bundleId: string = "",
    keyId,
    teamId,
    fcmKey;

  if (app === "d4j") {
    const { APNS_P8, APNS_KEY_ID, APNS_TEAM_ID, D4J_FCM_API_KEY } =
      await getSecrets([
        "APNS_P8",
        "APNS_KEY_ID",
        "APNS_TEAM_ID",
        "D4J_FCM_API_KEY",
      ]);

    apnsP8 = APNS_P8;
    bundleId = "org.ckoakland.diningforjustice";
    keyId = APNS_KEY_ID;
    teamId = APNS_TEAM_ID;
    fcmKey = D4J_FCM_API_KEY;
  }

  if (app === "homechef") {
    const { APNS_P8, APNS_KEY_ID, APNS_TEAM_ID, HC_FCM_API_KEY } =
      await getSecrets([
        "APNS_P8",
        "APNS_KEY_ID",
        "APNS_TEAM_ID",
        "HC_FCM_API_KEY",
      ]);

    apnsP8 = APNS_P8;
    bundleId = "org.ckoakland.ckhomechef";
    keyId = APNS_KEY_ID;
    teamId = APNS_TEAM_ID;
    fcmKey = HC_FCM_API_KEY;
  }

  if (!apnsP8 || !bundleId || !keyId || !teamId || !fcmKey) {
    throw Error("Could not find credentials to send notifications");
  }

  const config: PushNotifications.Settings = {
    apn: {
      token: {
        key: apnsP8,
        keyId: keyId,
        teamId: teamId,
      },
      production: process.env.NODE_ENV === "production",
    },
    fcm: {
      appName: "com.ckhomechefapp",
      serviceAccountKey: require("../../firebase-project-service-account-key.json"),
      credential: null,
    },
    isAlwaysUseFCM: false,
  };

  const NotificationService = new PushNotifications(config);
  const sendNotification = function (
    tokens: string[],
    data: { title: string; body: string }
  ) {
    const payload: PushNotifications.Data = {
      topic: bundleId,
      priority: "high",
      retries: 1,
      expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
      ...data,
    };
    return NotificationService.send(tokens, payload);
  };
  return { send: sendNotification };
};

export default createNotificationsService;
