import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { doNotDo, redFlags, tellTheOperator } from '@/data/redFlags';
import { colors, radius, spacing } from '@/theme';

export default function LearnScreen() {
  return (
    <Screen>
      <Text style={styles.hero}>See it</Text>
      <Text style={styles.lede}>
        These indicators come from public Truckers Against Trafficking materials and U.S. DOT highway
        guidance. One sign is not proof. A pattern plus your gut is enough to call.
      </Text>

      <Text style={styles.section}>Red flags on the road</Text>
      {redFlags.map((flag) => (
        <View key={flag.id} style={styles.card}>
          <Text style={styles.cardTitle}>{flag.title}</Text>
          <Text style={styles.cardBody}>{flag.detail}</Text>
          <Text style={styles.source}>{flag.source}</Text>
        </View>
      ))}

      <Text style={styles.section}>Do not do this</Text>
      {doNotDo.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text style={styles.bulletMark}>—</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.section}>What to tell the operator</Text>
      {tellTheOperator.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.footnote}>
        Forced commercial sex is trafficking. Labor trafficking also happens in construction, agriculture,
        restaurants, and other work. If you are unsure, still make the call and let trained advocates sort it
        out.
      </Text>
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
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardBody: {
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 21,
  },
  source: {
    color: colors.amberSoft,
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  bullet: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.sm,
  },
  bulletMark: {
    color: colors.amber,
    fontWeight: '800',
    width: 16,
  },
  bulletText: {
    flex: 1,
    color: colors.text,
    lineHeight: 21,
    fontSize: 15,
  },
  footnote: {
    marginTop: spacing.lg,
    color: colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
});
