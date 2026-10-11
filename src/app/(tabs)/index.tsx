import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedPost } from '@/components/FeedPost';
import { useAlerts } from '@/context/AlertContext';
import { useSession } from '@/context/SessionContext';
import { voteReport } from '@/lib/api';
import { milesBetween } from '@/lib/geo';
import { colors } from '@/theme';

type Sort = 'hot' | 'new' | 'near';

export default function FeedScreen() {
  const router = useRouter();
  const { reports, error, apiBase, here, refresh } = useSession();
  const { unreadCount } = useAlerts();
  const [sort, setSort] = useState<Sort>('hot');

  const posts = useMemo(() => {
    const next = [...reports];
    if (sort === 'new') {
      next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === 'near' && here) {
      next.sort((a, b) => milesBetween(here, a) - milesBetween(here, b));
    } else {
      next.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
    }
    return next;
  }, [reports, sort, here]);

  const vote = async (id: string, delta: 1 | -1) => {
    try {
      await voteReport(apiBase, id, delta);
      await refresh();
    } catch {
      // Keep the feed usable if a vote fails.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <View style={styles.topText}>
          <Text style={styles.sub}>r/truckstops</Text>
          <Text style={styles.near}>{here ? here.label : 'Location off · all stops'}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `${unreadCount} nearby alerts` : 'Nearby alerts'}
          onPress={() => router.push('/call')}
          style={styles.bell}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/call')}
          style={styles.sos}
        >
          <Text style={styles.sosText}>911</Text>
        </Pressable>
      </View>

      <View style={styles.sorts}>
        {(['hot', 'new', 'near'] as Sort[]).map((value) => (
          <Pressable key={value} onPress={() => setSort(value)} style={[styles.chip, sort === value && styles.chipOn]}>
            <Text style={[styles.chipText, sort === value && styles.chipTextOn]}>{value}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>Feed offline. Start the server and pull again.</Text> : null}

      <ScrollView contentContainerStyle={styles.list}>
        {posts.map((report) => (
          <FeedPost
            key={report.id}
            report={report}
            here={here}
            onPress={() => router.push(`/tip/${report.id}` as Href)}
            onUpvote={() => vote(report.id, 1)}
            onDownvote={() => vote(report.id, -1)}
          />
        ))}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Snap a photo and post"
        onPress={() => router.push('/report?camera=1' as Href)}
        style={styles.fab}
      >
        <Ionicons name="camera" size={22} color={colors.navy} />
        <Text style={styles.fabText}>Post</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 10,
  },
  topText: {
    flex: 1,
  },
  sub: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 20,
  },
  near: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  bell: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  sos: {
    backgroundColor: colors.red,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sosText: {
    color: colors.white,
    fontWeight: '800',
  },
  sorts: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipOn: {
    backgroundColor: colors.card,
    borderColor: colors.amber,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: 13,
  },
  chipTextOn: {
    color: colors.amber,
  },
  error: {
    color: colors.red,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 96,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 18,
    backgroundColor: colors.amber,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabText: {
    color: colors.navy,
    fontWeight: '800',
    fontSize: 16,
  },
});
