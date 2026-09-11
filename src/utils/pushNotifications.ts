import PushNotifications from "node-pushnotifications";

import getSecrets from "./getSecrets";
import { NotificationPayload } from "@community-kitchens/apiinterfaces";

const createNotificationsService = async (app: "d4j" | "homechef") => {
  const { APNS_P8, APNS_KEY_ID, APNS_TEAM_ID } = await getSecrets([
    "APNS_P8",
    "APNS_KEY_ID",
    "APNS_TEAM_ID",
  ]);

  const apnsP8 = APNS_P8;
  const keyId = APNS_KEY_ID;
  const teamId = APNS_TEAM_ID;

  let bundleId: string = "",
    appName: string = "",
    serviceAccountKeyName;

  if (app === "d4j") {
    bundleId = "org.ckoakland.diningforjustice";
    appName = "org.ckoakland.diningforjustice";
    serviceAccountKeyName = "dining-for-justice-app";
  }

  if (app === "homechef") {
    bundleId = "org.ckoakland.ckhomechef";
    appName = "com.ckhomechefapp";
    serviceAccountKeyName = "home-chef-app";
  }

  if (!apnsP8 || !bundleId || !keyId || !teamId) {
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
      appName,
      serviceAccountKey: require(
        `../../${serviceAccountKeyName}-service-account-key.json`,
      ),
      credential: null,
    },
    isAlwaysUseFCM: false,
  };

  const NotificationService = new PushNotifications(config);
  const sendNotification = function (
    tokens: string[],
    data: NotificationPayload,
  ) {
    const payload: PushNotifications.Data = {
      topic: bundleId,
      priority: "high",
      retries: 1,
      expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
      ...data.custom,
    };
    return NotificationService.send(tokens, payload);
  };
  return { send: sendNotification };
};

export default createNotificationsService;
