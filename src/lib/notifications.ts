import { Platform } from 'react-native';

import type { NearbyAlert } from '@/lib/api';

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    const Notifications = await import('expo-notifications');
    const Constants = await import('expo-constants');
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      return null;
    }
    const projectId = Constants.default.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) {
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export async function requestWebNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof Notification === 'undefined') {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission === 'denied') {
    return false;
  }
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showLocalNotification(alert: NearbyAlert): void {
  if (Platform.OS === 'web' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(alert.title, { body: alert.body });
    } catch {
      // Banner still shows in-app.
    }
    return;
  }
  if (Platform.OS !== 'web') {
    import('expo-notifications')
      .then((Notifications) =>
        Notifications.scheduleNotificationAsync({
          content: { title: alert.title, body: alert.body, data: { reportId: alert.reportId } },
          trigger: null,
        }),
      )
      .catch(() => undefined);
  }
}
