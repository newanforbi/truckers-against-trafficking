import { type Href, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiveMap } from '@/components/LiveMap';
import { ReportCard } from '@/components/ReportCard';
import { useSession } from '@/context/SessionContext';
import { colors, spacing } from '@/theme';

export default function LiveScreen() {
  const router = useRouter();
  const { reports, error, apiBase, reporterId, role } = useSession();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>{role === 'officer' ? 'Officer feed' : 'Live highway tips'}</Text>
        <Text style={styles.title}>See it. Snap it. Report it.</Text>
        <Text style={styles.lede}>
          Photos and pins go to the platform. Officers open the same map. If someone is in danger, call 911
          first.
        </Text>
        {error ? <Text style={styles.error}>{error}. Start the platform with npm run server.</Text> : null}
      </View>
      <View style={styles.map}>
        <LiveMap apiBase={apiBase} onOpenReport={(id) => router.push(`/tip/${id}` as Href)} />
      </View>
      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        <Text style={styles.feedTitle}>{reports.length} tips on the map</Text>
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            mine={report.reporterId === reporterId}
            onPress={() => router.push(`/tip/${report.id}` as Href)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  kicker: {
    color: colors.amber,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  lede: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: colors.red,
    marginTop: 8,
    fontSize: 13,
  },
  map: {
    height: 220,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    padding: spacing.md,
  },
  feedTitle: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.sm,
    fontSize: 16,
  },
});
