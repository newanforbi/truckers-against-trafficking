import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Tone = 'primary' | 'danger' | 'ghost' | 'amber';

type Props = {
  label: string;
  hint?: string;
  onPress: () => void;
  tone?: Tone;
  disabled?: boolean;
};

const toneStyles: Record<Tone, { backgroundColor: string; color: string; borderColor: string }> = {
  primary: { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
  danger: { backgroundColor: colors.red, color: colors.white, borderColor: colors.red },
  ghost: { backgroundColor: 'transparent', color: colors.amberSoft, borderColor: colors.border },
  amber: { backgroundColor: colors.amber, color: colors.navy, borderColor: colors.amber },
};

export function ActionButton({ label, hint, onPress, tone = 'primary', disabled }: Props) {
  const palette = toneStyles[tone];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View>
        <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
});
