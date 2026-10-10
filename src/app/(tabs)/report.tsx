import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Field } from '@/components/Field';
import { PhotoStrip } from '@/components/PhotoStrip';
import { SafetyBanner } from '@/components/SafetyBanner';
import { Screen } from '@/components/Screen';
import { useReport } from '@/context/ReportContext';
import { EMERGENCY_PHONE, TEXT_TIP, hotlines } from '@/data/hotlines';
import { formatCoordinates, formatObservedAt, formatTip, hasActionableTip, tipSummary } from '@/lib/formatReport';
import { callNumber, shareText, textNumber } from '@/lib/linking';
import { colors, radius, spacing } from '@/theme';

export default function ReportScreen() {
  const { draft, drafts, update, addFromCamera, addFromLibrary, removePhoto, captureLocation, saveDraft, loadDraft, newDraft } =
    useReport();
  const [copied, setCopied] = useState(false);
  const tip = formatTip(draft);
  const coords = formatCoordinates(draft.latitude, draft.longitude);
  const usHotline = hotlines[0];

  const copyTip = async () => {
    await Clipboard.setStringAsync(tip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Screen>
      <Text style={styles.hero}>Build a tip</Text>
      <Text style={styles.lede}>
        Law enforcement needs actionable facts: place, time, vehicles, and people. Then make the call.
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

      <View style={styles.block}>
        <ActionButton
          label={coords ? `Location captured · ${coords}` : 'Use current location'}
          hint="Adds GPS. You can still type the mile marker or truck-stop name."
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

      <Text style={styles.section}>Read this to the operator</Text>
      <View style={styles.preview}>
        <Text style={styles.previewText}>{tip}</Text>
      </View>

      <View style={styles.actions}>
        <ActionButton
          tone="danger"
          label="Call 911 with this tip"
          hint="Emergency or still in progress"
          onPress={() => callNumber(EMERGENCY_PHONE)}
          disabled={!hasActionableTip(draft)}
        />
        <ActionButton
          tone="amber"
          label={`Call hotline ${usHotline.displayPhone}`}
          onPress={() => callNumber(usHotline.phone)}
        />
        <ActionButton
          label={`Text tip to ${TEXT_TIP.display}`}
          onPress={() => textNumber(TEXT_TIP.number, tip)}
        />
        <ActionButton
          tone="ghost"
          label={copied ? 'Copied to clipboard' : 'Copy tip'}
          onPress={copyTip}
        />
        <ActionButton tone="ghost" label="Share tip" onPress={() => shareText(tip)} />
        <ActionButton tone="ghost" label="Save draft on this device" onPress={saveDraft} />
        <ActionButton tone="ghost" label="Start a new tip" onPress={newDraft} />
      </View>

      {drafts.length > 0 ? (
        <View>
          <Text style={styles.section}>Saved on this phone</Text>
          {drafts.map((item) => (
            <Pressable key={item.id} onPress={() => loadDraft(item.id)} style={styles.draft}>
              <Text style={styles.draftTitle}>{tipSummary(item)}</Text>
              <Text style={styles.draftMeta}>{formatObservedAt(item.updatedAt)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
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
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  preview: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewText: {
    color: colors.text,
    lineHeight: 22,
    fontSize: 15,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  draft: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  draftTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  draftMeta: {
    color: colors.textMuted,
    marginTop: 4,
  },
});
