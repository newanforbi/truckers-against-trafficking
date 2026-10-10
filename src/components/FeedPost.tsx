import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlatformReport } from '@/lib/api';
import { authorHandle, formatMiles, milesBetween, stopName, timeAgo, type Coords } from '@/lib/geo';
import { colors, radius } from '@/theme';

type Props = {
  report: PlatformReport;
  here: Coords | null;
  onPress: () => void;
  onUpvote: () => void;
  onDownvote: () => void;
};

export function FeedPost({ report, here, onPress, onUpvote, onDownvote }: Props) {
  const photo = report.photos[0];
  const distance = here ? formatMiles(milesBetween(here, report)) : null;

  return (
    <View style={styles.row}>
      <View style={styles.votes}>
        <Pressable hitSlop={8} onPress={onUpvote} accessibilityRole="button">
          <Text style={styles.arrow}>▲</Text>
        </Pressable>
        <Text style={styles.score}>{report.score}</Text>
        <Pressable hitSlop={8} onPress={onDownvote} accessibilityRole="button">
          <Text style={styles.arrowDown}>▼</Text>
        </Pressable>
      </View>
      <Pressable style={styles.body} onPress={onPress}>
        <Text style={styles.meta}>
          {stopName(report.locationLabel)}
          {' · '}
          {authorHandle(report.reporterId)}
          {' · '}
          {timeAgo(report.createdAt)}
          {distance ? ` · ${distance}` : ''}
        </Text>
        <Text style={styles.title}>{report.title || report.observation}</Text>
        {photo ? <Image source={{ uri: photo.url }} style={styles.photo} /> : null}
        <Text style={styles.footer}>{report.comments.length} comments</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingRight: 12,
    backgroundColor: colors.bg,
  },
  votes: {
    width: 44,
    alignItems: 'center',
    paddingTop: 2,
  },
  arrow: {
    color: colors.amber,
    fontSize: 14,
    fontWeight: '800',
  },
  arrowDown: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  score: {
    color: colors.text,
    fontWeight: '800',
    marginVertical: 4,
    fontSize: 13,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 21,
  },
  photo: {
    marginTop: 8,
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
});
