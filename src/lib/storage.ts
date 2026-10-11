import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TipDraft } from '@/types';

const DRAFTS_KEY = 'see-snap-report.drafts.v1';
const ACTIVE_KEY = 'see-snap-report.active.v1';

export async function loadDrafts(): Promise<TipDraft[]> {
  const raw = await AsyncStorage.getItem(DRAFTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as TipDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDrafts(drafts: TipDraft[]): Promise<void> {
  await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export async function loadActiveDraft(): Promise<TipDraft | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as TipDraft;
  } catch {
    return null;
  }
}

export async function saveActiveDraft(draft: TipDraft): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(draft));
}
