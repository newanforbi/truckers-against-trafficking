import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { ReportStore } from './store';
import type { StoredReport } from './types';

const SEEDS: Array<Omit<StoredReport, 'id' | 'photos'> & { photo: string }> = [
  {
    createdAt: '2026-10-10T16:40:00.000Z',
    observedAt: '2026-10-10T16:35:00.000Z',
    locationLabel: 'TA Travel Center, I-70 exit 359, Limon, CO',
    latitude: 39.2639,
    longitude: -103.6922,
    vehicles: 'White Sprinter van, CO plate',
    people: 'Woman mid-20s, black hoodie; man remaining in the van',
    observation: 'Van dropped her at a truck and came back about 15 minutes later.',
    status: 'new',
    officerNotes: '',
    reporterId: 'seed-driver-limon',
    photo: 'seed-limon.png',
  },
  {
    createdAt: '2026-10-10T15:10:00.000Z',
    observedAt: '2026-10-10T15:02:00.000Z',
    locationLabel: 'Iowa 80, I-80 exit 284, Walcott, IA',
    latitude: 41.6611,
    longitude: -90.9151,
    vehicles: 'Gray RV parked among trucks',
    people: 'Two women walking truck to truck',
    observation: 'RV looks out of place on the truck lot. They did not appear free to leave.',
    status: 'reviewing',
    officerNotes: 'Matching a prior lot walk-through from last week.',
    reporterId: 'seed-driver-iowa80',
    photo: 'seed-iowa.png',
  },
  {
    createdAt: '2026-10-10T13:22:00.000Z',
    observedAt: '2026-10-10T13:18:00.000Z',
    locationLabel: 'Ontario Mills Petro, I-10, Ontario, CA',
    latitude: 34.068,
    longitude: -117.558,
    vehicles: 'Black crew-cab pickup',
    people: 'Young man, no ID when asked for a shower code',
    observation: 'Someone else held his phone and spoke for him at the counter.',
    status: 'forwarded',
    officerNotes: 'Forwarded to local PD and the national hotline.',
    reporterId: 'seed-driver-ontario',
    photo: 'seed-ontario.png',
  },
];

export function seedIfEmpty(store: ReportStore, uploadsDir: string, assetPath: string): void {
  mkdirSync(uploadsDir, { recursive: true });
  const reports = SEEDS.map((item) => {
    const dest = join(uploadsDir, item.photo);
    if (!existsSync(dest) && existsSync(assetPath)) {
      copyFileSync(assetPath, dest);
    }
    const { photo, ...rest } = item;
    return {
      ...rest,
      id: randomUUID(),
      photos: [{ id: randomUUID(), filename: photo }],
    };
  });
  store.seed(reports);
}
