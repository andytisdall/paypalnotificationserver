import PushNotifications from 'node-pushnotifications';

import getSecrets from './getSecrets';

const createNotificationsService = async () => {
  const { APNS_P8, APNS_KEY_ID, APNS_TEAM_ID, FCM_API_KEY, APNS_BUNDLE_ID } =
    await getSecrets([
      'APNS_P8',
      'APNS_KEY_ID',
      'APNS_TEAM_ID',
      'APNS_BUNDLE_ID',
      'FCM_API_KEY',
    ]);

  if (
    !APNS_P8 ||
    !APNS_BUNDLE_ID ||
    !APNS_KEY_ID ||
    !APNS_TEAM_ID ||
    !FCM_API_KEY
  ) {
    throw Error('Could not find credentials to send notifications');
  }

  const config = {
    apn: {
      token: {
        key: APNS_P8,
        keyId: APNS_KEY_ID,
        teamId: APNS_TEAM_ID,
      },
      production: process.env.NODE_ENV === 'production',
    },
    gcm: {
      id: FCM_API_KEY,
    },
    isAlwaysUseFCM: false,
  };
  const NotificationService = new PushNotifications(config);
  const sendNotification = function (
    tokens: string[],
    data: { title: string; body: string }
  ) {
    const payload = {
      topic: APNS_BUNDLE_ID,
      priority: 'high',
      retries: 1,
      pushType: 'alert',
      expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
      sound: 'bingbong.aiff',
      ...data,
    };
    return NotificationService.send(tokens, payload);
  };
  return { send: sendNotification };
};

export default createNotificationsService;
