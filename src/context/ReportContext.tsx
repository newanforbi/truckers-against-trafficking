import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { createEmptyDraft } from '@/lib/formatReport';
import { loadActiveDraft, loadDrafts, saveActiveDraft, saveDrafts } from '@/lib/storage';
import type { TipDraft } from '@/types';

type ReportContextValue = {
  draft: TipDraft;
  drafts: TipDraft[];
  ready: boolean;
  update: (partial: Partial<TipDraft>) => void;
  addFromCamera: () => Promise<void>;
  addFromLibrary: () => Promise<void>;
  removePhoto: (uri: string) => void;
  captureLocation: () => Promise<void>;
  saveDraft: () => Promise<void>;
  loadDraft: (id: string) => void;
  newDraft: () => void;
};

const ReportContext = createContext<ReportContextValue | null>(null);

function withUpdate(draft: TipDraft, partial: Partial<TipDraft>): TipDraft {
  return {
    ...draft,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<TipDraft>(() => createEmptyDraft());
  const [drafts, setDrafts] = useState<TipDraft[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedDrafts, active] = await Promise.all([loadDrafts(), loadActiveDraft()]);
      if (cancelled) {
        return;
      }
      setDrafts(storedDrafts);
      if (active) {
        setDraft(active);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    saveActiveDraft(draft).catch(() => undefined);
  }, [draft, ready]);

  const update = (partial: Partial<TipDraft>) => {
    setDraft((current) => withUpdate(current, partial));
  };

  const attachPhoto = (uri: string) => {
    setDraft((current) => {
      if (current.photos.includes(uri)) {
        return current;
      }
      return withUpdate(current, { photos: [...current.photos, uri] });
    });
  };

  const addFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera permission needed', 'Allow camera access, or add a photo from your library instead.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      attachPhoto(result.assets[0].uri);
    }
  };

  const addFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow library access to attach a picture to this tip.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });
    if (!result.canceled) {
      result.assets.forEach((asset) => {
        if (asset.uri) {
          attachPhoto(asset.uri);
        }
      });
    }
  };

  const removePhoto = (uri: string) => {
    setDraft((current) => withUpdate(current, { photos: current.photos.filter((photo) => photo !== uri) }));
  };

  const captureLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Location permission needed', 'You can still type the mile marker, exit, or truck-stop name.');
      return;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    let label = draft.locationLabel;
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const place = places[0];
      if (place) {
        label = [place.name, place.street, place.city, place.region]
          .filter(Boolean)
          .join(', ');
      }
    } catch {
      // Keep any text the user already typed.
    }
    update({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      locationLabel: label,
    });
  };

  const saveDraft = async () => {
    const snapshot = { ...draft, updatedAt: new Date().toISOString() };
    setDraft(snapshot);
    setDrafts((current) => {
      const next = [snapshot, ...current.filter((item) => item.id !== snapshot.id)].slice(0, 20);
      saveDrafts(next).catch(() => undefined);
      return next;
    });
  };

  const loadDraft = (id: string) => {
    const found = drafts.find((item) => item.id === id);
    if (found) {
      setDraft(found);
    }
  };

  const newDraft = () => {
    setDraft(createEmptyDraft());
  };

  const value = useMemo(
    () => ({
      draft,
      drafts,
      ready,
      update,
      addFromCamera,
      addFromLibrary,
      removePhoto,
      captureLocation,
      saveDraft,
      loadDraft,
      newDraft,
    }),
    [draft, drafts, ready],
  );

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport() {
  const value = useContext(ReportContext);
  if (!value) {
    throw new Error('useReport must be used inside ReportProvider');
  }
  return value;
}
