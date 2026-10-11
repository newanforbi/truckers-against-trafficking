import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { authorHandle, formatMiles, milesBetween, timeAgo } from './geo';

describe('geo helpers', () => {
  it('measures Limon to Denver in hundreds of miles', () => {
    const miles = milesBetween(
      { latitude: 39.2639, longitude: -103.6922 },
      { latitude: 39.7392, longitude: -104.9903 },
    );
    assert.ok(miles > 70 && miles < 120);
    assert.equal(formatMiles(0.04), 'here');
  });

  it('formats reddit-style timestamps and handles', () => {
    const now = Date.parse('2026-10-10T18:00:00.000Z');
    assert.equal(timeAgo('2026-10-10T16:00:00.000Z', now), '2h');
    assert.equal(authorHandle('seed-driver-limon'), 'u/limon');
  });
});
