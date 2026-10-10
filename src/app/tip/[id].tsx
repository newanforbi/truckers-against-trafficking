import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Screen } from '@/components/Screen';
import { useSession } from '@/context/SessionContext';
import { commentOnReport, updateReport, voteReport, type ReportStatus } from '@/lib/api';
import { authorHandle, stopName, timeAgo } from '@/lib/geo';
import { colors, radius, spacing } from '@/theme';

const statuses: ReportStatus[] = ['new', 'reviewing', 'forwarded', 'closed'];

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { reports, apiBase, role, officerKey, refresh, reporterId } = useSession();
  const report = useMemo(() => reports.find((item) => item.id === id), [reports, id]);
  const [notes, setNotes] = useState(report?.officerNotes ?? '');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setNotes(report?.officerNotes ?? '');
  }, [report?.id, report?.officerNotes]);

  if (!report) {
    return (
      <Screen>
        <Text style={styles.title}>Post not found</Text>
        <ActionButton label="Back to the feed" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const vote = async (delta: 1 | -1) => {
    await voteReport(apiBase, report.id, delta);
    await refresh();
  };

  const sendComment = async () => {
    setBusy(true);
    try {
      await commentOnReport(apiBase, report.id, reporterId, comment);
      setComment('');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not comment');
    } finally {
      setBusy(false);
    }
  };

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
        <Text style={styles.back}>← r/truckstops</Text>
      </Pressable>
      <Text style={styles.meta}>
        {stopName(report.locationLabel)} · {authorHandle(report.reporterId)} · {timeAgo(report.createdAt)}
      </Text>
      <Text style={styles.title}>{report.title || report.observation}</Text>
      <Text style={styles.location}>{report.locationLabel}</Text>

      <View style={styles.votes}>
        <Pressable onPress={() => vote(1)}>
          <Text style={styles.arrow}>▲</Text>
        </Pressable>
        <Text style={styles.score}>{report.score}</Text>
        <Pressable onPress={() => vote(-1)}>
          <Text style={styles.arrowDown}>▼</Text>
        </Pressable>
      </View>

      {report.photos.map((photo) => (
        <Image key={photo.id} source={{ uri: photo.url }} style={styles.photo} />
      ))}

      {report.observation ? <Text style={styles.body}>{report.observation}</Text> : null}
      {report.vehicles ? <Text style={styles.body}>Vehicles: {report.vehicles}</Text> : null}
      {report.people ? <Text style={styles.body}>People: {report.people}</Text> : null}

      <Text style={styles.section}>{report.comments.length} comments</Text>
      {report.comments.map((item) => (
        <View key={item.id} style={styles.comment}>
          <Text style={styles.meta}>
            {authorHandle(item.author)} · {timeAgo(item.createdAt)}
          </Text>
          <Text style={styles.commentBody}>{item.body}</Text>
        </View>
      ))}
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <ActionButton label={busy ? 'Posting…' : 'Reply'} onPress={sendComment} disabled={busy || !comment.trim()} />

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
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.amberSoft,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    lineHeight: 30,
  },
  location: {
    color: colors.amberSoft,
    marginTop: 6,
    fontWeight: '600',
  },
  votes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.md,
  },
  arrow: {
    color: colors.amber,
    fontWeight: '800',
    fontSize: 16,
  },
  arrowDown: {
    color: colors.textMuted,
    fontWeight: '800',
    fontSize: 16,
  },
  score: {
    color: colors.text,
    fontWeight: '800',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
  },
  body: {
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 21,
    fontSize: 15,
  },
  section: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  comment: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 10,
  },
  commentBody: {
    color: colors.text,
    marginTop: 4,
    lineHeight: 20,
  },
  input: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    padding: spacing.md,
    minHeight: 48,
  },
  officer: {
    marginTop: spacing.lg,
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
