import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { CustomTabBar } from '@/src/components/bottomnav/CustomTabBar';
import { AddEntrySheet } from '@/src/components/sheets/AddEntrySheet';
import { useThemeColors } from '@/src/hooks/useThemeColors';

export default function TabsLayout() {
  const colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetVisible, setSheetVisible] = useState(false);

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/reminders')) return 'reminders';
    if (pathname.includes('/birthdays')) return 'birthdays';
    if (pathname.includes('/settings')) return 'settings';
    return 'index';
  };

  const handleTabPress = useCallback(
    (key: string) => {
      if (key === 'index') {
        router.replace('/(tabs)' as never);
      } else {
        router.replace(`/(tabs)/${key}` as never);
      }
    },
    [router]
  );

  const handleFABPress = useCallback(() => {
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleEntryTypeSelect = useCallback(
    (type: 'reminder' | 'task' | 'event' | 'birthday') => {
      setSheetVisible(false);
      router.push(`/add/${type}` as never);
    },
    [router]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>
      <CustomTabBar
        activeTab={getActiveTab()}
        onTabPress={handleTabPress}
        onFABPress={handleFABPress}
      />
      <AddEntrySheet
        visible={sheetVisible}
        onClose={handleSheetClose}
        onSelect={handleEntryTypeSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
