import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ReactNode } from 'react';

import { AlertBanner } from '@/components/AlertBanner';
import { AlertProvider } from '@/context/AlertContext';
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
      <AlertProvider>
        <ReportProvider>
          <StatusBar style="light" />
          <PhoneShell>
            <View style={styles.shell}>
              <AlertBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                }}
              />
            </View>
          </PhoneShell>
        </ReportProvider>
      </AlertProvider>
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
  shell: {
    flex: 1,
  },
});
