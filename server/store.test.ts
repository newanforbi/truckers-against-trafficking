import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { ReportStore } from './store';

function tempStore(): ReportStore {
  return new ReportStore(mkdtempSync(join(tmpdir(), 'ssr-')));
}

describe('ReportStore', () => {
  it('creates a report and lists newest first', () => {
    const store = tempStore();
    const first = store.create({
      locationLabel: 'Limon TA',
      latitude: 39.2639,
      longitude: -103.6922,
      vehicles: 'White Sprinter',
      people: '',
      observation: 'Brief drop-off',
      reporterId: 'driver-1',
      photos: [],
    });
    const second = store.create({
      locationLabel: 'Iowa 80',
      latitude: 41.6611,
      longitude: -90.9151,
      vehicles: '',
      people: '',
      observation: 'Van among trucks',
      reporterId: 'driver-2',
      photos: [{ id: 'p1', filename: 'seed.png' }],
    });

    const list = store.list();
    assert.equal(list[0]?.id, second.id);
    assert.equal(list[1]?.id, first.id);
    assert.equal(store.get(first.id)?.status, 'new');
    assert.equal(first.title, 'Brief drop-off');
    assert.equal(first.score, 1);
  });

  it('counts votes and comments on a post', () => {
    const store = tempStore();
    const report = store.create({
      title: 'Camry watching the fuel island',
      locationLabel: "Love's Dallas",
      latitude: 32.73,
      longitude: -96.91,
      vehicles: '',
      people: '',
      observation: 'Man never got out of the car.',
      reporterId: 'driver-1',
      photos: [],
    });
    assert.equal(store.vote(report.id, 1).score, 2);
    assert.equal(store.addComment(report.id, 'driver-2', 'Call it in from the lot.').body, 'Call it in from the lot.');
    assert.equal(store.get(report.id)?.comments.length, 1);
  });

  it('rejects a report with no map pin', () => {
    const store = tempStore();
    assert.throws(() =>
      store.create({
        locationLabel: 'Somewhere',
        latitude: Number.NaN,
        longitude: -90,
        vehicles: '',
        people: '',
        observation: 'Saw something',
        reporterId: 'driver-1',
        photos: [],
      }),
    );
  });

  it('lets an officer update status and notes', () => {
    const store = tempStore();
    const report = store.create({
      locationLabel: 'I-40 lot',
      latitude: 35.46,
      longitude: -97.51,
      vehicles: '',
      people: '',
      observation: 'CB chatter about a commercial company',
      reporterId: 'driver-9',
      photos: [],
    });

    const updated = store.update(report.id, {
      status: 'forwarded',
      officerNotes: 'Sent to county SO and hotline.',
    });
    assert.equal(updated.status, 'forwarded');
    assert.match(updated.officerNotes, /county SO/);
  });
});
