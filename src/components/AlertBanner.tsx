import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAlerts } from '@/context/AlertContext';
import { colors } from '@/theme';

export function AlertBanner() {
  const router = useRouter();
  const { banner, dismissBanner, openAlert } = useAlerts();
  if (!banner) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open nearby alert"
        onPress={() => {
          void openAlert(banner);
          if (banner.reportId) {
            router.push(`/tip/${banner.reportId}` as Href);
          }
        }}
        style={styles.body}
      >
        <Ionicons name="notifications" size={18} color={colors.navy} />
        <View style={styles.text}>
          <Text style={styles.title}>{banner.title}</Text>
          <Text style={styles.detail} numberOfLines={2}>
            {banner.body}
          </Text>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss alert" onPress={dismissBanner} style={styles.close}>
        <Ionicons name="close" size={18} color={colors.navy} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.amber,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 8,
    gap: 6,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    flex: 1,
  },
  title: {
    color: colors.navy,
    fontWeight: '800',
    fontSize: 13,
  },
  detail: {
    color: colors.navy,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.82,
  },
  close: {
    padding: 8,
  },
});
