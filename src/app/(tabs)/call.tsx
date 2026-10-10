import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Screen } from '@/components/Screen';
import { EMERGENCY_PHONE, TEXT_TIP, hotlines, officialResources } from '@/data/hotlines';
import { callNumber, openExternal, textNumber } from '@/lib/linking';
import { colors, radius, spacing } from '@/theme';

export default function CallScreen() {
  return (
    <Screen>
      <Text style={styles.hero}>Make the call</Text>
      <Text style={styles.lede}>
        If it is happening now or someone is in danger, start with 911. Then tell the national hotline so
        victims can get services and the tip is logged.
      </Text>

      <View style={styles.block}>
        <ActionButton
          tone="danger"
          label="Call 911"
          hint="United States emergency line"
          onPress={() => callNumber(EMERGENCY_PHONE)}
        />
      </View>

      <Text style={styles.section}>Hotlines</Text>
      {hotlines.map((line) => (
        <View key={line.id} style={styles.card}>
          <Text style={styles.region}>{line.region}</Text>
          <Text style={styles.cardTitle}>{line.label}</Text>
          <Text style={styles.cardBody}>{line.note}</Text>
          <View style={styles.cardAction}>
            <ActionButton
              tone="amber"
              label={`Call ${line.displayPhone}`}
              onPress={() => callNumber(line.phone)}
            />
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.region}>United States</Text>
        <Text style={styles.cardTitle}>Text the hotline</Text>
        <Text style={styles.cardBody}>
          Text {TEXT_TIP.display}. Message and data rates may apply. Prefer a call if the situation is urgent.
        </Text>
        <View style={styles.cardAction}>
          <ActionButton label={`Text ${TEXT_TIP.display}`} onPress={() => textNumber(TEXT_TIP.number, TEXT_TIP.keyword)} />
        </View>
      </View>

      <Text style={styles.section}>Official resources</Text>
      {officialResources.map((resource) => (
        <View key={resource.id} style={styles.card}>
          <Text style={styles.cardTitle}>{resource.title}</Text>
          <Text style={styles.cardBody}>{resource.detail}</Text>
          <View style={styles.cardAction}>
            <ActionButton tone="ghost" label="Open" onPress={() => openExternal(resource.url)} />
          </View>
        </View>
      ))}
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
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  region: {
    color: colors.amber,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  cardBody: {
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  cardAction: {
    marginTop: spacing.md,
  },
});
