import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEmptyDraft,
  formatCoordinates,
  formatTip,
  hasActionableTip,
  tipSummary,
} from './formatReport';

describe('createEmptyDraft', () => {
  it('starts with no photos or coordinates', () => {
    const draft = createEmptyDraft(new Date('2026-10-10T18:00:00.000Z'));
    assert.equal(draft.photos.length, 0);
    assert.equal(draft.latitude, null);
    assert.equal(hasActionableTip(draft), false);
  });
});

describe('formatCoordinates', () => {
  it('returns an empty string when a value is missing', () => {
    assert.equal(formatCoordinates(39.7392, null), '');
  });

  it('formats five decimal places', () => {
    assert.equal(formatCoordinates(39.73921, -104.9903), '39.73921, -104.99030');
  });
});

describe('formatTip', () => {
  it('asks the operator to treat the call as trafficking', () => {
    const draft = createEmptyDraft(new Date('2026-10-10T18:00:00.000Z'));
    draft.locationLabel = 'I-70 eastbound, mile 243, Limon TA';
    draft.vehicles = 'White Sprinter van, CO plate ABC-1234';
    draft.people = 'Woman, mid-20s, black hoodie, man watching from van';
    draft.observation = 'Dropped at a truck and picked up about 15 minutes later.';
    draft.photos = ['file://one.jpg'];

    const tip = formatTip(draft);
    assert.match(tip, /suspected human trafficking, not prostitution/i);
    assert.match(tip, /Limon TA/);
    assert.match(tip, /Sprinter/);
    assert.match(tip, /Photos on this device: 1/);
    assert.equal(hasActionableTip(draft), true);
    assert.match(tipSummary(draft), /Dropped at a truck/);
  });
});
