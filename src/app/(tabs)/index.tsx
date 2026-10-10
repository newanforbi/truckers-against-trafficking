import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { SafetyBanner } from '@/components/SafetyBanner';
import { Screen } from '@/components/Screen';
import { EMERGENCY_PHONE, TEXT_TIP, hotlines } from '@/data/hotlines';
import { callNumber, textNumber } from '@/lib/linking';
import { colors, radius, spacing } from '@/theme';

const steps = [
  {
    href: '/learn' as const,
    kicker: 'See it',
    title: 'Know the red flags',
    body: 'Learn what trafficking can look like at a truck stop, rest area, or on the highway.',
  },
  {
    href: '/report' as const,
    kicker: 'Snap it',
    title: 'Capture what is safe',
    body: 'If you can do it without being seen, note vehicles, plates, and the exact place.',
  },
  {
    href: '/report' as const,
    kicker: 'Report it',
    title: 'Make the call',
    body: 'Read a structured tip to 911 or the hotline. Say you suspect human trafficking.',
  },
];

export default function HomeScreen() {
  const usHotline = hotlines[0];

  return (
    <Screen>
      <Text style={styles.eyebrow}>Highway field toolkit</Text>
      <Text style={styles.hero}>See it. Snap it. Report it.</Text>
      <Text style={styles.lede}>
        Truckers are the eyes and ears of the highway. This app helps you recognize red flags, collect
        actionable details, and reach the right number — on iOS and Android.
      </Text>

      <View style={styles.block}>
        <SafetyBanner />
      </View>

      <View style={styles.actions}>
        <ActionButton
          tone="danger"
          label="Call 911"
          hint="Immediate danger or a crime in progress"
          onPress={() => callNumber(EMERGENCY_PHONE)}
        />
        <ActionButton
          tone="amber"
          label={`Call ${usHotline.displayPhone}`}
          hint={usHotline.label}
          onPress={() => callNumber(usHotline.phone)}
        />
        <ActionButton
          tone="ghost"
          label={`Text ${TEXT_TIP.display}`}
          hint="National Human Trafficking Hotline"
          onPress={() => textNumber(TEXT_TIP.number, TEXT_TIP.keyword)}
        />
      </View>

      <Text style={styles.section}>How it works</Text>
      {steps.map((step) => (
        <Link key={step.kicker} href={step.href} asChild>
          <Pressable style={styles.card}>
            <Text style={styles.cardKicker}>{step.kicker}</Text>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardBody}>{step.body}</Text>
          </Pressable>
        </Link>
      ))}

      <Text style={styles.disclaimer}>
        This is an independent reporting toolkit inspired by Truckers Against Trafficking’s public campaign.
        It is not the official TAT app. Official training and TAT’s own app are linked on the Call tab.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.amber,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  hero: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 8,
    lineHeight: 40,
  },
  lede: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  block: {
    marginTop: spacing.lg,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
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
  cardKicker: {
    color: colors.amber,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  disclaimer: {
    marginTop: spacing.lg,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
