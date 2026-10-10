import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlatformReport } from '@/lib/api';
import { formatObservedAt } from '@/lib/formatReport';
import { colors, radius, spacing } from '@/theme';

const statusLabel: Record<PlatformReport['status'], string> = {
  new: 'New tip',
  reviewing: 'Under review',
  forwarded: 'Sent to law enforcement',
  closed: 'Closed',
};

type Props = {
  report: PlatformReport;
  mine?: boolean;
  onPress: () => void;
};

export function ReportCard({ report, mine, onPress }: Props) {
  const photo = report.photos[0];
  return (
    <Pressable onPress={onPress} style={styles.card}>
      {photo ? <Image source={{ uri: photo.url }} style={styles.photo} /> : <View style={styles.photo} />}
      <View style={styles.body}>
        <Text style={styles.kicker}>
          {statusLabel[report.status]}
          {mine ? ' · Your tip' : ''}
        </Text>
        <Text style={styles.title}>{report.locationLabel || 'Highway tip'}</Text>
        <Text style={styles.detail} numberOfLines={2}>
          {report.observation || report.vehicles || 'Photo attached'}
        </Text>
        <Text style={styles.meta}>{formatObservedAt(report.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 140,
    backgroundColor: colors.bgElevated,
  },
  body: {
    padding: spacing.md,
  },
  kicker: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  detail: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 8,
    fontSize: 12,
  },
});
