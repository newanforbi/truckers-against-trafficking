import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useReport } from '@/context/ReportContext';
import { useSession } from '@/context/SessionContext';
import { submitReport } from '@/lib/api';
import { hasActionableTip } from '@/lib/formatReport';
import { colors, radius, spacing } from '@/theme';

export default function ComposeScreen() {
  const router = useRouter();
  const { camera } = useLocalSearchParams<{ camera?: string }>();
  const { draft, update, addFromCamera, addFromLibrary, removePhoto, applyHere, newDraft } = useReport();
  const { apiBase, reporterId, refresh, here } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const openedCamera = useRef(false);

  useEffect(() => {
    if (here) {
      applyHere(here);
    }
  }, [here, applyHere]);

  useEffect(() => {
    if (camera === '1' && !openedCamera.current) {
      openedCamera.current = true;
      addFromCamera().catch(() => undefined);
    }
  }, [camera, addFromCamera]);

  const post = async () => {
    setBusy(true);
    setError('');
    try {
      const created = await submitReport(apiBase, draft, reporterId);
      await refresh();
      newDraft();
      if (here) {
        applyHere(here);
      }
      router.replace(`/tip/${created.id}` as Href);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not post');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.kicker}>{draft.locationLabel || here?.label || 'Finding your stop…'}</Text>
      <Text style={styles.hero}>New post</Text>

      <View style={styles.photos}>
        {draft.photos.length === 0 ? (
          <View style={styles.photoRow}>
            <Pressable style={styles.snap} onPress={addFromCamera}>
              <Text style={styles.snapTitle}>Camera</Text>
              <Text style={styles.snapHint}>Snap what you see</Text>
            </Pressable>
            <Pressable style={styles.snap} onPress={addFromLibrary}>
              <Text style={styles.snapTitle}>Library</Text>
              <Text style={styles.snapHint}>Attach a photo</Text>
            </Pressable>
          </View>
        ) : (
          draft.photos.map((uri) => (
            <View key={uri} style={styles.previewWrap}>
              <Image source={{ uri }} style={styles.preview} />
              <Pressable onPress={() => removePhoto(uri)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.fields}>
        <Field
          label="Title"
          value={draft.title}
          onChangeText={(title) => update({ title })}
          placeholder="Van looping the back row every 15 minutes"
        />
        <Field
          label="Truck stop"
          value={draft.locationLabel}
          onChangeText={(locationLabel) => update({ locationLabel })}
          placeholder="TA, I-70 exit 359"
        />
        <Field
          label="What happened"
          value={draft.observation}
          onChangeText={(observation) => update({ observation })}
          placeholder="Optional details, vehicles, plates"
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <ActionButton
          tone="amber"
          label={busy ? 'Posting…' : 'Post to r/truckstops'}
          onPress={post}
          disabled={busy || !hasActionableTip(draft)}
        />
        <ActionButton tone="ghost" label="Add another photo" onPress={addFromCamera} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.amber,
    fontWeight: '700',
    fontSize: 13,
  },
  hero: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  photos: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  snap: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 88,
    justifyContent: 'center',
  },
  snapTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  snapHint: {
    color: colors.textMuted,
    marginTop: 4,
  },
  previewWrap: {
    gap: 6,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  remove: {
    color: colors.amberSoft,
    fontWeight: '700',
  },
  fields: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  error: {
    color: colors.red,
    marginTop: spacing.md,
  },
});
