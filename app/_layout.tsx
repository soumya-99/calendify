import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { useThemeStore } from '@/src/stores/useThemeStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { create } from 'zustand';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { registerBackgroundSync } from '@/src/tasks/backgroundSyncTask';
import { NotificationService } from '@/src/services/NotificationService';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useNotificationStore } from '@/src/stores/useNotificationStore';

export const useLoaderStore = create<{ isLoading: boolean; show: () => void; hide: () => void }>((set) => ({
  isLoading: false,
  show: () => set({ isLoading: true }),
  hide: () => set({ isLoading: false }),
}));

function GlobalLoader() {
  const isLoading = useLoaderStore((s) => s.isLoading);
  const colors = useThemeColors();
  
  if (!isLoading) return null;
  
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, alignItems: 'center', justifyContent: 'center' }]}
    >
      <View style={{ padding: 24, backgroundColor: colors.surface, borderRadius: 16, alignItems: 'center', elevation: 4 }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.onSurface, fontWeight: '600' }}>Loading...</Text>
      </View>
    </Animated.View>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const colors = useThemeColors();
  const themeMode = useThemeStore((s) => s.themeMode);
  const systemScheme = useColorScheme();
  const accounts = useAccountsStore((s) => s.accounts);
  const addAccount = useAccountsStore((s) => s.addAccount);
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const setOnboardingDone = useSettingsStore((s) => s.setOnboardingDone);
  const router = useRouter();
  const entries = useEventsStore((s) => s.entries);
  const masterEnabled = useNotificationStore((s) => s.masterEnabled);

  // Create default account on first launch
  useEffect(() => {
    if (!onboardingDone && accounts.length === 0) {
      addAccount('local@calendify', 'Local Account', 'local');
      setOnboardingDone(true);
    }
  }, [onboardingDone, accounts.length, addAccount, setOnboardingDone]);

  // Notifications Lifecycle
  useEffect(() => {
    // 1. Sync permission status to store
    NotificationService.getPermissionStatus().then((status) => {
      if (status !== 'granted') {
        useNotificationStore.getState().setMasterEnabled(false);
      }
    });

    // 2. Register background sync
    registerBackgroundSync();

    // 3. Initial sync
    NotificationService.syncAll(entries);

    // 4. Foreground re-sync
    const appSub = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status === 'active') NotificationService.syncAll(entries);
    });

    // 5. Tap listener
    const tapSub = Notifications.addNotificationResponseReceivedListener((res) => {
      const { date } = res.notification.request.content.data as { date?: string };
      if (date) {
        router.push(`/day/${date}`);
      }
    });

    return () => {
      appSub.remove();
      tapSub.remove();
    };
  }, [entries, router]);

  // Master switch / Entries changes re-sync
  useEffect(() => {
    if (masterEnabled) {
      NotificationService.syncAll(entries);
    }
  }, [entries, masterEnabled]);

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="day/[date]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="event/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="add"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GlobalLoader />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return <RootLayoutInner />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
