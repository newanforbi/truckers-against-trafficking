import { Platform } from 'react-native';

import type { TipDraft } from '@/types';

export const DEFAULT_API_URL = 'http://localhost:3001';
export const OFFICER_DEMO_KEY = 'WATCH';

export type ReportStatus = 'new' | 'reviewing' | 'forwarded' | 'closed';

export type PlatformPhoto = {
  id: string;
  url: string;
};

export type PlatformComment = {
  id: string;
  createdAt: string;
  author: string;
  body: string;
};

export type PlatformReport = {
  id: string;
  createdAt: string;
  observedAt: string;
  title: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  vehicles: string;
  people: string;
  observation: string;
  status: ReportStatus;
  officerNotes: string;
  reporterId: string;
  score: number;
  comments: PlatformComment[];
  photos: PlatformPhoto[];
};

export function photoUrl(apiBase: string, url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function fetchReports(apiBase: string): Promise<PlatformReport[]> {
  const response = await fetch(`${apiBase}/api/reports`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { reports: PlatformReport[] };
  return payload.reports ?? [];
}

export async function fetchReport(apiBase: string, id: string): Promise<PlatformReport> {
  const response = await fetch(`${apiBase}/api/reports/${id}`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { report: PlatformReport };
  return payload.report;
}

async function appendPhoto(form: FormData, uri: string, index: number): Promise<void> {
  const name = `photo-${index}.jpg`;
  if (uri.startsWith('blob:') || uri.startsWith('data:') || uri.startsWith('http')) {
    const blob = await (await fetch(uri)).blob();
    form.append('photos', blob, name);
    return;
  }
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('photos', blob, name);
    return;
  }
  form.append(
    'photos',
    {
      uri,
      name,
      type: 'image/jpeg',
    } as unknown as Blob,
  );
}

export async function submitReport(
  apiBase: string,
  draft: TipDraft,
  reporterId: string,
): Promise<PlatformReport> {
  if (draft.latitude == null || draft.longitude == null) {
    throw new Error('Drop a pin or capture GPS so officers can find this on the map.');
  }
  const form = new FormData();
  form.append('title', draft.title);
  form.append('locationLabel', draft.locationLabel);
  form.append('latitude', String(draft.latitude));
  form.append('longitude', String(draft.longitude));
  form.append('vehicles', draft.vehicles);
  form.append('people', draft.people);
  form.append('observation', draft.observation);
  form.append('observedAt', draft.observedAt);
  form.append('reporterId', reporterId);
  for (const [index, uri] of draft.photos.entries()) {
    await appendPhoto(form, uri, index);
  }
  const response = await fetch(`${apiBase}/api/reports`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { report: PlatformReport };
  return payload.report;
}

export async function voteReport(apiBase: string, id: string, delta: 1 | -1): Promise<PlatformReport> {
  const response = await fetch(`${apiBase}/api/reports/${id}/vote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { report: PlatformReport };
  return payload.report;
}

export async function commentOnReport(
  apiBase: string,
  id: string,
  author: string,
  body: string,
): Promise<PlatformReport> {
  const response = await fetch(`${apiBase}/api/reports/${id}/comments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ author, body }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { report: PlatformReport };
  return payload.report;
}

export async function updateReport(
  apiBase: string,
  id: string,
  officerKey: string,
  input: { status?: ReportStatus; officerNotes?: string },
): Promise<PlatformReport> {
  const response = await fetch(`${apiBase}/api/reports/${id}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      'x-officer-key': officerKey,
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const payload = (await response.json()) as { report: PlatformReport };
  return payload.report;
}
