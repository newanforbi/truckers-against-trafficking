import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

import type { AlertItem, Subscriber } from './subscribers';

const expo = new Expo();

export async function sendExpoPush(subscriber: Subscriber, alert: AlertItem): Promise<void> {
  const token = subscriber.pushToken;
  if (!token || !Expo.isExpoPushToken(token)) {
    return;
  }
  const message: ExpoPushMessage = {
    to: token,
    sound: 'default',
    title: alert.title,
    body: alert.body,
    data: { reportId: alert.reportId, alertId: alert.id },
  };
  try {
    await expo.sendPushNotificationsAsync([message]);
  } catch {
    // Inbox still delivered the alert.
  }
}
