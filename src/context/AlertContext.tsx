import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useSession } from '@/context/SessionContext';
import {
  fetchAlerts,
  markAlertRead,
  registerDevice,
  sendTestAlert,
  type NearbyAlert,
} from '@/lib/api';
import { getExpoPushToken, requestWebNotificationPermission, showLocalNotification } from '@/lib/notifications';

const ENABLED_KEY = 'see-snap-report.alerts-enabled';
const RADIUS_KEY = 'see-snap-report.alerts-radius';

export const ALERT_RADII = [25, 50, 100, 250] as const;

type AlertValue = {
  enabled: boolean;
  radiusMiles: number;
  inbox: NearbyAlert[];
  unreadCount: number;
  banner: NearbyAlert | null;
  setEnabled: (value: boolean) => void;
  setRadiusMiles: (value: number) => void;
  dismissBanner: () => void;
  openAlert: (alert: NearbyAlert) => Promise<void>;
  sendTest: () => Promise<NearbyAlert>;
};

const AlertContext = createContext<AlertValue | null>(null);

function applyAlert(list: NearbyAlert[], alert: NearbyAlert): NearbyAlert[] {
  return [alert, ...list.filter((item) => item.id !== alert.id)].slice(0, 40);
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const { ready, reporterId, apiBase, here } = useSession();
  const [enabled, setEnabledState] = useState(true);
  const [radiusMiles, setRadiusState] = useState(100);
  const [inbox, setInbox] = useState<NearbyAlert[]>([]);
  const [banner, setBanner] = useState<NearbyAlert | null>(null);
  const hydrated = useRef(false);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedEnabled, storedRadius] = await Promise.all([
        AsyncStorage.getItem(ENABLED_KEY),
        AsyncStorage.getItem(RADIUS_KEY),
      ]);
      if (cancelled) {
        return;
      }
      if (storedEnabled === '0') {
        setEnabledState(false);
      }
      const radius = Number(storedRadius);
      if (ALERT_RADII.includes(radius as (typeof ALERT_RADII)[number])) {
        setRadiusState(radius);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !reporterId) {
      return;
    }
    (async () => {
      const pushToken = enabled ? await getExpoPushToken() : null;
      try {
        await registerDevice(apiBase, {
          reporterId,
          latitude: here?.latitude,
          longitude: here?.longitude,
          radiusMiles,
          enabled,
          pushToken,
        });
      } catch {
        // First register needs GPS. Test alerts still work without it.
      }
    })();
  }, [ready, reporterId, apiBase, here?.latitude, here?.longitude, enabled, radiusMiles]);

  useEffect(() => {
    if (!ready || !reporterId) {
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await fetchAlerts(apiBase, reporterId);
        if (cancelled) {
          return;
        }
        setInbox(next.alerts);
        const newest = next.unread[0];
        if (!hydrated.current) {
          next.alerts.forEach((item) => seenIds.current.add(item.id));
          hydrated.current = true;
          if (newest) {
            setBanner(newest);
          }
          return;
        }
        if (newest && !seenIds.current.has(newest.id)) {
          seenIds.current.add(newest.id);
          setBanner(newest);
          showLocalNotification(newest);
        }
      } catch {
        // Inbox still works after the next poll.
      }
    };
    poll().catch(() => undefined);
    const timer = setInterval(() => {
      poll().catch(() => undefined);
    }, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [ready, reporterId, apiBase]);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    AsyncStorage.setItem(ENABLED_KEY, value ? '1' : '0').catch(() => undefined);
    if (value) {
      requestWebNotificationPermission().catch(() => undefined);
    }
  };

  const setRadiusMiles = (value: number) => {
    setRadiusState(value);
    AsyncStorage.setItem(RADIUS_KEY, String(value)).catch(() => undefined);
  };

  const dismissBanner = () => {
    const current = banner;
    setBanner(null);
    if (!current || current.read) {
      return;
    }
    markAlertRead(apiBase, current.id, reporterId)
      .then((updated) => {
        setInbox((list) => applyAlert(list, updated));
      })
      .catch(() => undefined);
  };

  const openAlert = async (alert: NearbyAlert) => {
    setBanner((current) => (current?.id === alert.id ? null : current));
    try {
      const updated = await markAlertRead(apiBase, alert.id, reporterId);
      setInbox((list) => applyAlert(list, updated));
    } catch {
      setInbox((list) => applyAlert(list, { ...alert, read: true }));
    }
  };

  const sendTest = async () => {
    await requestWebNotificationPermission();
    const alert = await sendTestAlert(apiBase, reporterId);
    seenIds.current.add(alert.id);
    setInbox((list) => applyAlert(list, alert));
    setBanner(alert);
    showLocalNotification(alert);
    return alert;
  };

  const unreadCount = inbox.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      enabled,
      radiusMiles,
      inbox,
      unreadCount,
      banner,
      setEnabled,
      setRadiusMiles,
      dismissBanner,
      openAlert,
      sendTest,
    }),
    [enabled, radiusMiles, inbox, unreadCount, banner, apiBase, reporterId],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  const value = useContext(AlertContext);
  if (!value) {
    throw new Error('useAlerts must be used inside AlertProvider');
  }
  return value;
}
