import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { milesBetween } from '../src/lib/geo';

export type Subscriber = {
  reporterId: string;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  enabled: boolean;
  pushToken: string | null;
  updatedAt: string;
};

export type AlertItem = {
  id: string;
  reporterId: string;
  reportId: string | null;
  title: string;
  body: string;
  miles: number | null;
  createdAt: string;
  read: boolean;
};

type DatabaseFile = {
  subscribers: Subscriber[];
  alerts: AlertItem[];
};

export type NearbyReport = {
  id: string;
  title: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  reporterId: string;
};

export function nearbyRecipients(
  subscribers: Subscriber[],
  report: NearbyReport,
): Array<{ subscriber: Subscriber; miles: number }> {
  return subscribers
    .filter((subscriber) => subscriber.enabled && subscriber.reporterId !== report.reporterId)
    .map((subscriber) => ({
      subscriber,
      miles: milesBetween(subscriber, report),
    }))
    .filter((item) => item.miles <= item.subscriber.radiusMiles);
}

export class AlertStore {
  private readonly filePath: string;
  private data: DatabaseFile;

  constructor(dataDir: string) {
    mkdirSync(dataDir, { recursive: true });
    this.filePath = join(dataDir, 'alerts.json');
    this.data = this.read();
  }

  register(input: {
    reporterId: string;
    latitude?: number;
    longitude?: number;
    radiusMiles?: number;
    enabled?: boolean;
    pushToken?: string | null;
  }): Subscriber {
    if (!input.reporterId.trim()) {
      throw new Error('reporterId is required');
    }
    const existing = this.data.subscribers.find((item) => item.reporterId === input.reporterId);
    const latitude = Number.isFinite(input.latitude) ? Number(input.latitude) : existing?.latitude;
    const longitude = Number.isFinite(input.longitude) ? Number(input.longitude) : existing?.longitude;
    if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('A location is required for nearby alerts');
    }
    const radiusMiles = Math.min(500, Math.max(5, Number(input.radiusMiles ?? existing?.radiusMiles ?? 100)));
    const subscriber: Subscriber = {
      reporterId: input.reporterId.trim(),
      latitude,
      longitude,
      radiusMiles,
      enabled: input.enabled ?? existing?.enabled ?? true,
      pushToken: input.pushToken ?? existing?.pushToken ?? null,
      updatedAt: new Date().toISOString(),
    };
    this.data.subscribers = [
      subscriber,
      ...this.data.subscribers.filter((item) => item.reporterId !== subscriber.reporterId),
    ];
    this.write();
    return subscriber;
  }

  getSubscriber(reporterId: string): Subscriber | null {
    return this.data.subscribers.find((item) => item.reporterId === reporterId) ?? null;
  }

  listUnread(reporterId: string): AlertItem[] {
    return this.data.alerts
      .filter((item) => item.reporterId === reporterId && !item.read)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  listAlerts(reporterId: string): AlertItem[] {
    return this.data.alerts
      .filter((item) => item.reporterId === reporterId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 40);
  }

  markRead(id: string, reporterId: string): AlertItem | null {
    const alert = this.data.alerts.find((item) => item.id === id && item.reporterId === reporterId);
    if (!alert) {
      return null;
    }
    alert.read = true;
    this.write();
    return alert;
  }

  createAlert(input: Omit<AlertItem, 'id' | 'createdAt' | 'read'>): AlertItem {
    const alert: AlertItem = {
      ...input,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.alerts.unshift(alert);
    this.data.alerts = this.data.alerts.slice(0, 400);
    this.write();
    return alert;
  }

  notifyNearby(report: NearbyReport): AlertItem[] {
    const targets = nearbyRecipients(this.data.subscribers, report);
    return targets.map(({ subscriber, miles }) =>
      this.createAlert({
        reporterId: subscriber.reporterId,
        reportId: report.id,
        title: 'Nearby truck-stop report',
        body: `${report.title} · ${report.locationLabel} · ${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`,
        miles,
      }),
    );
  }

  private read(): DatabaseFile {
    try {
      const parsed = JSON.parse(readFileSync(this.filePath, 'utf8')) as DatabaseFile;
      return {
        subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      };
    } catch {
      return { subscribers: [], alerts: [] };
    }
  }

  private write(): void {
    writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
