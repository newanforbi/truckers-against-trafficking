import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
};

export function Field({ label, value, onChangeText, placeholder, multiline }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    color: colors.amberSoft,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 52,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 14,
  },
});
