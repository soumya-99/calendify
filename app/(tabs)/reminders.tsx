import React, { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';

import { useRouter } from 'expo-router';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { ReminderCard } from '@/src/components/cards/ReminderCard';
import { Chip } from '@/src/components/ui/Chip';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { getRelativeDateLabel, getTodayString } from '@/src/utils/dateHelpers';
import { Bell } from 'lucide-react-native';
import type { Reminder } from '@/src/types/entries';

type Filter = 'all' | 'today' | 'upcoming' | 'overdue';

export default function RemindersScreen() {
  const colors = useThemeColors();

  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const entries = useEventsStore((s) => s.entries);
  const reminders = useMemo(
    () => entries.filter((e): e is Reminder => e.type === 'REMINDER'),
    [entries]
  );
  const today = getTodayString();

  const filtered = useMemo(() => {
    switch (filter) {
      case 'today':
        return reminders.filter((r) => r.date === today);
      case 'upcoming':
        return reminders.filter((r) => r.date >= today);
      case 'overdue':
        return reminders.filter((r) => r.date < today && !r.notified);
      default:
        return reminders;
    }
  }, [reminders, filter, today]);

  const grouped = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    for (const r of filtered) {
      const label = getRelativeDateLabel(r.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(r);
    }
    return Object.entries(groups).sort(([, a], [, b]) => {
      return a[0].date.localeCompare(b[0].date);
    });
  }, [filtered]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.base }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TypeScale.headlineMedium, styles.title, { color: colors.onBackground }]}>
          Reminders
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipContent}
        >
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
              color={DOT_COLORS.REMINDER}
            />
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} color={colors.onSurfaceVariant} strokeWidth={1.5} />}
            title="No reminders"
            subtitle="Your reminders will appear here"
          />
        ) : (
          grouped.map(([label, items]) => (
            <View key={label}>
              <SectionHeader title={label} color={DOT_COLORS.REMINDER} />
              {items.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onPress={() => router.push(`/event/${reminder.id}` as never)}
                />
              ))}
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.compact,
  },
  chipRow: {
    maxHeight: 48,
    marginBottom: Spacing.base,
  },
  chipContent: {
    paddingHorizontal: Spacing.base,
  },
  bottomSpacer: {
    height: 20,
  },
});
