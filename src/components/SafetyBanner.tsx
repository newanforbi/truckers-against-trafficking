import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function SafetyBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.kicker}>If someone is in immediate danger</Text>
      <Text style={styles.title}>Call 911 first. Do not approach.</Text>
      <Text style={styles.body}>
        Stay safe, keep your distance, and let law enforcement recover victims. A photo is only useful if you
        can take it without putting anyone at risk.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.redDeep,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.red,
  },
  kicker: {
    color: colors.amberSoft,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  body: {
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },
});
