import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_API_URL, OFFICER_DEMO_KEY, fetchReports, type PlatformReport } from '@/lib/api';
import type { Coords } from '@/lib/geo';

const REPORTER_KEY = 'see-snap-report.reporter-id';
const ROLE_KEY = 'see-snap-report.role';
const API_KEY = 'see-snap-report.api-base';

type Role = 'driver' | 'officer';

export type Here = Coords & { label: string };

type SessionValue = {
  ready: boolean;
  role: Role;
  reporterId: string;
  apiBase: string;
  officerKey: string;
  reports: PlatformReport[];
  error: string | null;
  here: Here | null;
  setApiBase: (value: string) => void;
  unlockOfficer: (key: string) => Promise<boolean>;
  lockOfficer: () => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

function createReporterId(): string {
  return `driver-${Math.random().toString(36).slice(2, 10)}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<Role>('driver');
  const [reporterId, setReporterId] = useState('');
  const [apiBase, setApiBaseState] = useState(DEFAULT_API_URL);
  const [officerKey, setOfficerKey] = useState('');
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [here, setHere] = useState<Here | null>(null);

  const refresh = async () => {
    try {
      const next = await fetchReports(apiBase);
      setReports(next);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Platform is offline');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedId, storedRole, storedApi] = await Promise.all([
        AsyncStorage.getItem(REPORTER_KEY),
        AsyncStorage.getItem(ROLE_KEY),
        AsyncStorage.getItem(API_KEY),
      ]);
      if (cancelled) {
        return;
      }
      const id = storedId ?? createReporterId();
      if (!storedId) {
        await AsyncStorage.setItem(REPORTER_KEY, id);
      }
      setReporterId(id);
      if (storedRole === 'officer') {
        setRole('officer');
        setOfficerKey(OFFICER_DEMO_KEY);
      }
      if (storedApi) {
        setApiBaseState(storedApi);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        let label = 'your location';
        try {
          const places = await Location.reverseGeocodeAsync({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          const place = places[0];
          if (place) {
            label = [place.name, place.city, place.region].filter(Boolean).join(', ');
          }
        } catch {
          label = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
        }
        if (!cancelled) {
          setHere({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            label,
          });
        }
      } catch {
        // Feed still works without GPS.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    refresh().catch(() => undefined);
    const timer = setInterval(() => {
      refresh().catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [ready, apiBase]);

  const setApiBase = (value: string) => {
    const next = value.trim().replace(/\/$/, '') || DEFAULT_API_URL;
    setApiBaseState(next);
    AsyncStorage.setItem(API_KEY, next).catch(() => undefined);
  };

  const unlockOfficer = async (key: string) => {
    const trimmed = key.trim();
    if (trimmed !== OFFICER_DEMO_KEY) {
      return false;
    }
    setOfficerKey(trimmed);
    setRole('officer');
    await AsyncStorage.setItem(ROLE_KEY, 'officer');
    return true;
  };

  const lockOfficer = () => {
    setRole('driver');
    setOfficerKey('');
    AsyncStorage.setItem(ROLE_KEY, 'driver').catch(() => undefined);
  };

  const value = useMemo(
    () => ({
      ready,
      role,
      reporterId,
      apiBase,
      officerKey,
      reports,
      error,
      here,
      setApiBase,
      unlockOfficer,
      lockOfficer,
      refresh,
    }),
    [ready, role, reporterId, apiBase, officerKey, reports, error, here],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return value;
}
