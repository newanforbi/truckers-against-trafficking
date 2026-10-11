import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import type { ReportStore } from './store';
import type { StoredReport } from './types';

const SEEDS: Array<Omit<StoredReport, 'id' | 'photos'> & { photo: string }> = [
  {
    seedKey: 'limon-ta',
    createdAt: '2026-10-10T16:40:00.000Z',
    observedAt: '2026-10-10T16:35:00.000Z',
    title: 'Van dropping women at trucks, looping back every 15 min',
    locationLabel: 'TA Travel Center, I-70 exit 359, Limon, CO',
    latitude: 39.2639,
    longitude: -103.6922,
    vehicles: 'White Sprinter van, CO plate',
    people: 'Woman mid-20s, black hoodie; man remaining in the van',
    observation: 'Same van dropped her at a parked truck and came back about 15 minutes later. Happening on the back row.',
    status: 'new',
    officerNotes: '',
    reporterId: 'seed-driver-limon',
    score: 47,
    comments: [
      {
        id: 'c-limon-1',
        createdAt: '2026-10-10T16:48:00.000Z',
        author: 'seed-driver-iowa80',
        body: 'That 15-minute loop is the pattern. I would call it in from the lot, not walk up.',
      },
    ],
    photo: 'seed-limon.png',
  },
  {
    seedKey: 'iowa-80',
    createdAt: '2026-10-10T15:10:00.000Z',
    observedAt: '2026-10-10T15:02:00.000Z',
    title: 'RV out of place on the truck lot, two people going truck to truck',
    locationLabel: 'Iowa 80, I-80 exit 284, Walcott, IA',
    latitude: 41.6611,
    longitude: -90.9151,
    vehicles: 'Gray RV parked among trucks',
    people: 'Two women walking truck to truck',
    observation: 'RV sat on the truck side, not the car lot. They did not appear free to leave on their own.',
    status: 'reviewing',
    officerNotes: 'Matching a prior lot walk-through from last week.',
    reporterId: 'seed-driver-iowa80',
    score: 112,
    comments: [
      {
        id: 'c-iowa-1',
        createdAt: '2026-10-10T15:22:00.000Z',
        author: 'seed-driver-ontario',
        body: 'Saw the same RV last Tuesday near the showers. Posted a photo on my tip.',
      },
    ],
    photo: 'seed-iowa.png',
  },
  {
    seedKey: 'ontario-petro',
    createdAt: '2026-10-10T13:22:00.000Z',
    observedAt: '2026-10-10T13:18:00.000Z',
    title: 'Someone else held his ID and spoke for him at the counter',
    locationLabel: 'Ontario Mills Petro, I-10, Ontario, CA',
    latitude: 34.068,
    longitude: -117.558,
    vehicles: 'Black crew-cab pickup',
    people: 'Young man, no ID when asked for a shower code',
    observation: 'Older man kept the wallet and answered every question. Kid looked scared and did not know what city they were in.',
    status: 'forwarded',
    officerNotes: 'Forwarded to local PD and the national hotline.',
    reporterId: 'seed-driver-ontario',
    score: 86,
    comments: [],
    photo: 'seed-ontario.png',
  },
  {
    seedKey: 'knoxville-pilot',
    createdAt: '2026-10-10T12:05:00.000Z',
    observedAt: '2026-10-10T11:58:00.000Z',
    title: 'CB talking “commercial company,” lights flashing on the back row',
    locationLabel: 'Pilot, I-40 exit 369, Knoxville, TN',
    latitude: 35.9606,
    longitude: -83.9207,
    vehicles: 'Dark SUV circling the lot',
    people: 'Driver flashing park lights every few minutes',
    observation: 'Classic buyer signal on the CB. SUV kept circling and never parked to sleep.',
    status: 'new',
    officerNotes: '',
    reporterId: 'seed-driver-knox',
    score: 33,
    comments: [
      {
        id: 'c-knox-1',
        createdAt: '2026-10-10T12:15:00.000Z',
        author: 'seed-driver-limon',
        body: 'If you are still on that lot, stay in the truck and call. Do not walk over there.',
      },
    ],
    photo: 'seed-knox.png',
  },
  {
    seedKey: 'dallas-loves',
    createdAt: '2026-10-10T10:41:00.000Z',
    observedAt: '2026-10-10T10:30:00.000Z',
    title: 'Woman asking trucks for a ride, man watching from the car lot',
    locationLabel: "Love's, I-20 exit 460, Dallas, TX",
    latitude: 32.7357,
    longitude: -96.9103,
    vehicles: 'Silver Camry, no plates visible from my stall',
    people: 'Woman early 20s; man in the Camry never got out',
    observation: 'She hit three trucks in ten minutes. He stayed in the car and watched the whole time.',
    status: 'reviewing',
    officerNotes: '',
    reporterId: 'seed-driver-dallas',
    score: 59,
    comments: [],
    photo: 'seed-dallas.png',
  },
  {
    seedKey: 'oak-grove-ta',
    createdAt: '2026-10-09T23:18:00.000Z',
    observedAt: '2026-10-09T23:05:00.000Z',
    title: 'Long time in the showers, same escort waiting outside both times',
    locationLabel: 'TA, I-65 exit 28, Oak Grove, KY',
    latitude: 36.665,
    longitude: -87.419,
    vehicles: 'White work van',
    people: 'Young woman; older woman waiting by the door',
    observation: 'Escort would not let her take the backpack inside. Second trip looked the same.',
    status: 'new',
    officerNotes: '',
    reporterId: 'seed-driver-oak',
    score: 21,
    comments: [],
    photo: 'seed-oak.png',
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
      id: `seed-${rest.seedKey}`,
      photos: [{ id: randomUUID(), filename: photo }],
    };
  });
  store.upsertSeeds(reports);
}
