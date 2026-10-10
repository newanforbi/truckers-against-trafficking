import type { TipDraft } from '../types';

export function createEmptyDraft(now = new Date()): TipDraft {
  const iso = now.toISOString();
  return {
    id: `tip-${now.getTime()}`,
    updatedAt: iso,
    observedAt: iso,
    locationLabel: '',
    latitude: null,
    longitude: null,
    vehicles: '',
    people: '',
    observation: '',
    photos: [],
  };
}

export function formatObservedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCoordinates(
  latitude: number | null,
  longitude: number | null,
): string {
  if (latitude == null || longitude == null) {
    return '';
  }
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function hasActionableTip(draft: TipDraft): boolean {
  const location = draft.locationLabel.trim() || formatCoordinates(draft.latitude, draft.longitude);
  const facts = [draft.vehicles, draft.people, draft.observation].some((value) => value.trim().length > 0);
  return Boolean(location || facts || draft.photos.length > 0);
}

export function formatTip(draft: TipDraft): string {
  const lines = [
    'I am reporting suspected human trafficking, not prostitution.',
    '',
    `When: ${formatObservedAt(draft.observedAt)}`,
  ];

  const coords = formatCoordinates(draft.latitude, draft.longitude);
  const location = draft.locationLabel.trim();
  if (location || coords) {
    lines.push(`Where: ${[location, coords].filter(Boolean).join(' — ')}`);
  } else {
    lines.push('Where: (not captured)');
  }

  lines.push(`Vehicles: ${draft.vehicles.trim() || '(not provided)'}`);
  lines.push(`People: ${draft.people.trim() || '(not provided)'}`);
  lines.push(`What I saw: ${draft.observation.trim() || '(not provided)'}`);

  if (draft.photos.length > 0) {
    lines.push(
      `Photos on this device: ${draft.photos.length}. I can describe or send them if asked.`,
    );
  }

  return lines.join('\n');
}

export function tipSummary(draft: TipDraft): string {
  const location = draft.locationLabel.trim() || formatCoordinates(draft.latitude, draft.longitude);
  const observation = draft.observation.trim();
  if (observation) {
    return observation.length > 90 ? `${observation.slice(0, 87)}…` : observation;
  }
  if (location) {
    return location;
  }
  if (draft.vehicles.trim()) {
    return draft.vehicles.trim();
  }
  return 'Draft tip — add what you saw';
}
