import * as Clipboard from 'expo-clipboard';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Field } from '@/components/Field';
import { LiveMap } from '@/components/LiveMap';
import { PhotoStrip } from '@/components/PhotoStrip';
import { SafetyBanner } from '@/components/SafetyBanner';
import { Screen } from '@/components/Screen';
import { useReport } from '@/context/ReportContext';
import { useSession } from '@/context/SessionContext';
import { EMERGENCY_PHONE, TEXT_TIP, hotlines } from '@/data/hotlines';
import { submitReport } from '@/lib/api';
import { formatCoordinates, formatObservedAt, formatTip, hasActionableTip } from '@/lib/formatReport';
import { callNumber, shareText, textNumber } from '@/lib/linking';
import { colors, radius, spacing } from '@/theme';

export default function ReportScreen() {
  const router = useRouter();
  const { draft, update, addFromCamera, addFromLibrary, removePhoto, captureLocation, newDraft } = useReport();
  const { apiBase, reporterId, refresh } = useSession();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const tip = formatTip(draft);
  const coords = formatCoordinates(draft.latitude, draft.longitude);
  const usHotline = hotlines[0];

  const copyTip = async () => {
    await Clipboard.setStringAsync(tip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postToPlatform = async () => {
    setBusy(true);
    setError('');
    try {
      const created = await submitReport(apiBase, draft, reporterId);
      await refresh();
      newDraft();
      router.push(`/tip/${created.id}` as Href);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not post this tip');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.hero}>Snap and post</Text>
      <Text style={styles.lede}>
        Take a picture if you can do it safely, drop a pin, and post it to the officer map. Still call 911 if
        it is happening now.
      </Text>

      <View style={styles.block}>
        <SafetyBanner />
      </View>

      <View style={styles.block}>
        <PhotoStrip
          photos={draft.photos}
          onAddCamera={addFromCamera}
          onAddLibrary={addFromLibrary}
          onRemove={removePhoto}
        />
      </View>

      <Text style={styles.section}>Pin it on the map</Text>
      <Text style={styles.meta}>Use GPS or tap the map to drop a pin officers can open.</Text>
      <View style={styles.map}>
        <LiveMap
          apiBase={apiBase}
          pickMode
          onPick={({ latitude, longitude }) => update({ latitude, longitude })}
        />
      </View>
      <View style={styles.block}>
        <ActionButton
          label={coords ? `GPS captured · ${coords}` : 'Use current GPS'}
          hint="Adds your phone location. You can still type the truck-stop name."
          onPress={captureLocation}
        />
      </View>

      <View style={styles.fields}>
        <Field
          label="Where"
          value={draft.locationLabel}
          onChangeText={(locationLabel) => update({ locationLabel })}
          placeholder="I-80 WB, mile 142, TA stall 37"
        />
        <Text style={styles.meta}>Observed {formatObservedAt(draft.observedAt)}</Text>
        <Field
          label="Vehicles"
          value={draft.vehicles}
          onChangeText={(vehicles) => update({ vehicles })}
          placeholder="White Sprinter, plate, USDOT, truck number"
          multiline
        />
        <Field
          label="People"
          value={draft.people}
          onChangeText={(people) => update({ people })}
          placeholder="Height, clothing, who appeared in control"
          multiline
        />
        <Field
          label="What you saw"
          value={draft.observation}
          onChangeText={(observation) => update({ observation })}
          placeholder="Dropped at a truck and picked up about 15 minutes later"
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <ActionButton
          tone="amber"
          label={busy ? 'Posting to the platform…' : 'Post tip to the officer map'}
          hint="Photo, pin, and write-up become a live case"
          onPress={postToPlatform}
          disabled={busy || !hasActionableTip(draft)}
        />
        <ActionButton
          tone="danger"
          label="Call 911"
          hint="Immediate danger or a crime in progress"
          onPress={() => callNumber(EMERGENCY_PHONE)}
        />
        <ActionButton
          tone="ghost"
          label={`Call hotline ${usHotline.displayPhone}`}
          onPress={() => callNumber(usHotline.phone)}
        />
        <ActionButton label={`Text tip to ${TEXT_TIP.display}`} onPress={() => textNumber(TEXT_TIP.number, tip)} />
        <ActionButton tone="ghost" label={copied ? 'Copied to clipboard' : 'Copy tip'} onPress={copyTip} />
        <ActionButton tone="ghost" label="Share tip" onPress={() => shareText(tip)} />
        <ActionButton tone="ghost" label="Start a new tip" onPress={newDraft} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  lede: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  block: {
    marginTop: spacing.lg,
  },
  fields: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  section: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  map: {
    height: 200,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
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
