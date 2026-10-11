import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { AlertStore, nearbyRecipients } from './subscribers';

describe('nearbyRecipients', () => {
  it('alerts drivers inside the radius and skips the author', () => {
    const targets = nearbyRecipients(
      [
        {
          reporterId: 'author',
          latitude: 39.26,
          longitude: -103.69,
          radiusMiles: 50,
          enabled: true,
          pushToken: null,
          updatedAt: '2026-10-10T00:00:00.000Z',
        },
        {
          reporterId: 'nearby',
          latitude: 39.3,
          longitude: -103.7,
          radiusMiles: 50,
          enabled: true,
          pushToken: null,
          updatedAt: '2026-10-10T00:00:00.000Z',
        },
        {
          reporterId: 'far',
          latitude: 41.66,
          longitude: -90.91,
          radiusMiles: 50,
          enabled: true,
          pushToken: null,
          updatedAt: '2026-10-10T00:00:00.000Z',
        },
        {
          reporterId: 'muted',
          latitude: 39.27,
          longitude: -103.69,
          radiusMiles: 50,
          enabled: false,
          pushToken: null,
          updatedAt: '2026-10-10T00:00:00.000Z',
        },
      ],
      {
        id: 'r1',
        title: 'Van looping the TA',
        locationLabel: 'Limon TA',
        latitude: 39.2639,
        longitude: -103.6922,
        reporterId: 'author',
      },
    );

    assert.equal(targets.length, 1);
    assert.equal(targets[0]?.subscriber.reporterId, 'nearby');
    assert.ok((targets[0]?.miles ?? 99) < 10);
  });
});

describe('AlertStore', () => {
  it('registers a device and writes a nearby inbox alert', () => {
    const store = new AlertStore(mkdtempSync(join(tmpdir(), 'alerts-')));
    store.register({
      reporterId: 'driver-a',
      latitude: 39.26,
      longitude: -103.69,
      radiusMiles: 80,
    });
    const created = store.notifyNearby({
      id: 'report-1',
      title: 'Van looping the TA',
      locationLabel: 'TA Travel Center, Limon, CO',
      latitude: 39.27,
      longitude: -103.7,
      reporterId: 'driver-b',
    });
    assert.equal(created.length, 1);
    assert.equal(store.listUnread('driver-a').length, 1);
    assert.match(store.listUnread('driver-a')[0]?.body ?? '', /Limon/);

    const updated = store.register({ reporterId: 'driver-a', enabled: false });
    assert.equal(updated.latitude, 39.26);
    assert.equal(updated.enabled, false);
    assert.equal(
      store.notifyNearby({
        id: 'report-2',
        title: 'Second van',
        locationLabel: 'TA Travel Center, Limon, CO',
        latitude: 39.27,
        longitude: -103.7,
        reporterId: 'driver-b',
      }).length,
      0,
    );

    const unread = store.listUnread('driver-a')[0];
    assert.ok(unread);
    store.markRead(unread.id, 'driver-a');
    assert.equal(store.listUnread('driver-a').length, 0);
  });
});
