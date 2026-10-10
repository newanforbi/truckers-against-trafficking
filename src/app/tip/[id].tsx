import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { LiveMap } from '@/components/LiveMap';
import { Screen } from '@/components/Screen';
import { useSession } from '@/context/SessionContext';
import { updateReport, type ReportStatus } from '@/lib/api';
import { formatObservedAt } from '@/lib/formatReport';
import { colors, radius, spacing } from '@/theme';

const statuses: ReportStatus[] = ['new', 'reviewing', 'forwarded', 'closed'];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { reports, apiBase, role, officerKey, refresh, reporterId } = useSession();
  const report = useMemo(() => reports.find((item) => item.id === id), [reports, id]);
  const [notes, setNotes] = useState(report?.officerNotes ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setNotes(report?.officerNotes ?? '');
  }, [report?.id, report?.officerNotes]);

  if (!report) {
    return (
      <Screen>
        <Text style={styles.title}>Tip not found</Text>
        <ActionButton label="Back to the live map" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const save = async (status: ReportStatus) => {
    setBusy(true);
    try {
      await updateReport(apiBase, report.id, officerKey, { status, officerNotes: notes });
      await refresh();
      setMessage('Saved to the officer case file.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Live map</Text>
      </Pressable>
      <Text style={styles.kicker}>
        {report.status}
        {report.reporterId === reporterId ? ' · You posted this' : ''}
      </Text>
      <Text style={styles.title}>{report.locationLabel || 'Highway tip'}</Text>
      <Text style={styles.meta}>{formatObservedAt(report.observedAt)}</Text>

      <View style={styles.map}>
        <LiveMap apiBase={apiBase} focusId={report.id} />
      </View>

      {report.photos.map((photo) => (
        <Image key={photo.id} source={{ uri: photo.url }} style={styles.photo} />
      ))}

      <Text style={styles.section}>What the driver saw</Text>
      <Text style={styles.body}>{report.observation || 'No written description.'}</Text>
      <Text style={styles.body}>Vehicles: {report.vehicles || '—'}</Text>
      <Text style={styles.body}>People: {report.people || '—'}</Text>

      {role === 'officer' ? (
        <View style={styles.officer}>
          <Text style={styles.section}>Officer case file</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes for dispatch or the hotline"
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.notes}
          />
          <View style={styles.actions}>
            {statuses.map((status) => (
              <ActionButton
                key={status}
                label={status === report.status ? `Status: ${status}` : `Mark ${status}`}
                tone={status === 'forwarded' ? 'amber' : 'primary'}
                disabled={busy}
                onPress={() => save(status)}
              />
            ))}
          </View>
          {message ? <Text style={styles.meta}>{message}</Text> : null}
        </View>
      ) : (
        <Text style={styles.meta}>
          Officers on the desk can open this photo, the pin, and the write-up. Call 911 if this is still
          happening.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.amberSoft,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  kicker: {
    color: colors.amber,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  map: {
    height: 180,
    marginTop: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
  },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginTop: spacing.lg,
  },
  body: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 21,
    fontSize: 15,
  },
  officer: {
    marginTop: spacing.sm,
  },
  notes: {
    minHeight: 90,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
