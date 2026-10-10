import { createElement, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type Props = {
  apiBase: string;
  focusId?: string;
  pickMode?: boolean;
  onPick?: (coords: { latitude: number; longitude: number }) => void;
  onOpenReport?: (id: string) => void;
};

export function LiveMap({ apiBase, focusId, pickMode, onPick, onOpenReport }: Props) {
  const params = new URLSearchParams();
  if (focusId) {
    params.set('focus', focusId);
  }
  if (pickMode) {
    params.set('mode', 'pick');
  }
  const uri = `${apiBase}/embed${params.toString() ? `?${params.toString()}` : ''}`;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; id?: string; latitude?: number; longitude?: number };
      if (data?.type === 'open-report' && data.id) {
        onOpenReport?.(data.id);
      }
      if (data?.type === 'map-pick' && data.latitude != null && data.longitude != null) {
        onPick?.({ latitude: data.latitude, longitude: data.longitude });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onOpenReport, onPick]);

  if (Platform.OS !== 'web') {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={styles.wrap}>
      {createElement('iframe', {
        title: 'Live report map',
        src: uri,
        style: { border: 'none', width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#08111F',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#08111F',
  },
});
