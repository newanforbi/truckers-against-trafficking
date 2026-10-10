import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ReportProvider } from '@/context/ReportContext';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <ReportProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </ReportProvider>
  );
}
