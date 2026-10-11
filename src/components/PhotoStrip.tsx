import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = {
  photos: string[];
  onAddCamera: () => void;
  onAddLibrary: () => void;
  onRemove: (uri: string) => void;
};

export function PhotoStrip({ photos, onAddCamera, onAddLibrary, onRemove }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Snap it</Text>
      <Text style={styles.help}>Only if you can do it safely. Vehicles, plates, and lot context help most.</Text>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={onAddCamera} style={styles.add}>
          <Text style={styles.addTitle}>Camera</Text>
          <Text style={styles.addHint}>Take a photo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onAddLibrary} style={styles.add}>
          <Text style={styles.addTitle}>Library</Text>
          <Text style={styles.addHint}>Attach existing</Text>
        </Pressable>
      </View>
      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
          {photos.map((uri) => (
            <View key={uri} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <Pressable accessibilityRole="button" onPress={() => onRemove(uri)} style={styles.remove}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  label: {
    color: colors.amberSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  help: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  add: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  addTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  addHint: {
    color: colors.textMuted,
    marginTop: 4,
  },
  photos: {
    gap: spacing.sm,
  },
  photoWrap: {
    width: 132,
  },
  photo: {
    width: 132,
    height: 132,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
  },
  remove: {
    marginTop: 6,
  },
  removeText: {
    color: colors.amberSoft,
    fontWeight: '600',
  },
});
