import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useSession } from '@/context/SessionContext';
import { EMERGENCY_PHONE, TEXT_TIP, hotlines, officialResources } from '@/data/hotlines';
import { OFFICER_DEMO_KEY } from '@/lib/api';
import { callNumber, openExternal, textNumber } from '@/lib/linking';
import { colors, radius, spacing } from '@/theme';

export default function CallScreen() {
  const { role, apiBase, setApiBase, unlockOfficer, lockOfficer } = useSession();
  const [key, setKey] = useState('');
  const [unlockError, setUnlockError] = useState('');

  return (
    <Screen>
      <Text style={styles.hero}>Make the call</Text>
      <Text style={styles.lede}>
        If it is happening now or someone is in danger, start with 911. Then tell the national hotline so
        victims can get services and the tip is logged.
      </Text>

      <View style={styles.block}>
        <ActionButton
          tone="danger"
          label="Call 911"
          hint="United States emergency line"
          onPress={() => callNumber(EMERGENCY_PHONE)}
        />
      </View>

      <Text style={styles.section}>Hotlines</Text>
      {hotlines.map((line) => (
        <View key={line.id} style={styles.card}>
          <Text style={styles.region}>{line.region}</Text>
          <Text style={styles.cardTitle}>{line.label}</Text>
          <Text style={styles.cardBody}>{line.note}</Text>
          <View style={styles.cardAction}>
            <ActionButton
              tone="amber"
              label={`Call ${line.displayPhone}`}
              onPress={() => callNumber(line.phone)}
            />
          </View>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.region}>United States</Text>
        <Text style={styles.cardTitle}>Text the hotline</Text>
        <Text style={styles.cardBody}>
          Text {TEXT_TIP.display}. Message and data rates may apply. Prefer a call if the situation is urgent.
        </Text>
        <View style={styles.cardAction}>
          <ActionButton label={`Text ${TEXT_TIP.display}`} onPress={() => textNumber(TEXT_TIP.number, TEXT_TIP.keyword)} />
        </View>
      </View>

      <Text style={styles.section}>Officer access</Text>
      <View style={styles.card}>
        <Text style={styles.region}>{role === 'officer' ? 'Desk unlocked' : 'Restricted'}</Text>
        <Text style={styles.cardTitle}>
          {role === 'officer' ? 'You can update case status' : 'Law enforcement desk'}
        </Text>
        <Text style={styles.cardBody}>
          Officers see the same live map and photos, then mark a tip reviewing, forwarded, or closed. Demo
          key: {OFFICER_DEMO_KEY}. Full desktop desk: {apiBase}/desk
        </Text>
        {role === 'officer' ? (
          <View style={styles.cardAction}>
            <ActionButton tone="ghost" label="Open officer desk" onPress={() => openExternal(`${apiBase}/desk`)} />
            <View style={{ height: 8 }} />
            <ActionButton tone="ghost" label="Lock officer tools" onPress={lockOfficer} />
          </View>
        ) : (
          <View style={styles.cardAction}>
            <Field label="Officer key" value={key} onChangeText={setKey} placeholder={OFFICER_DEMO_KEY} />
            {unlockError ? <Text style={styles.cardBody}>{unlockError}</Text> : null}
            <View style={{ height: 8 }} />
            <ActionButton
              tone="amber"
              label="Unlock officer tools"
              onPress={async () => {
                const ok = await unlockOfficer(key);
                setUnlockError(ok ? '' : 'That key is not valid.');
              }}
            />
            <View style={{ height: 8 }} />
            <ActionButton tone="ghost" label="Open officer desk" onPress={() => openExternal(`${apiBase}/desk`)} />
          </View>
        )}
        <View style={styles.cardAction}>
          <Field label="Platform URL" value={apiBase} onChangeText={setApiBase} placeholder="http://localhost:3001" />
        </View>
      </View>

      <Text style={styles.section}>Official resources</Text>
      {officialResources.map((resource) => (
        <View key={resource.id} style={styles.card}>
          <Text style={styles.cardTitle}>{resource.title}</Text>
          <Text style={styles.cardBody}>{resource.detail}</Text>
          <View style={styles.cardAction}>
            <ActionButton tone="ghost" label="Open" onPress={() => openExternal(resource.url)} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  lede: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  block: {
    marginTop: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  region: {
    color: colors.amber,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  cardBody: {
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  cardAction: {
    marginTop: spacing.md,
  },
});
