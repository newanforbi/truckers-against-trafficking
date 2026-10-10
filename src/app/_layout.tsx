import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ReactNode } from 'react';

import { ReportProvider } from '@/context/ReportContext';
import { SessionProvider } from '@/context/SessionContext';
import { colors } from '@/theme';

function PhoneShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  if (Platform.OS !== 'web' || width <= 520) {
    return children;
  }

  return (
    <View style={styles.stage}>
      <View style={[styles.phone, { height: Math.min(844, height - 24) }]}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <ReportProvider>
        <StatusBar style="light" />
        <PhoneShell>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          />
        </PhoneShell>
      </ReportProvider>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#050910',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phone: {
    width: 390,
    maxWidth: '100%',
    backgroundColor: colors.bg,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 8,
    borderColor: '#1C3154',
  },
});
