import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { EventCard } from '@/src/components/cards/EventCard';
import { ReminderCard } from '@/src/components/cards/ReminderCard';
import { TaskCard } from '@/src/components/cards/TaskCard';
import { BirthdayCard } from '@/src/components/cards/BirthdayCard';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { getDayName, formatDateDisplay } from '@/src/utils/dateHelpers';
import { ChevronLeft, CalendarDays } from 'lucide-react-native';
import type {
  CalendarEvent,
  Reminder,
  Task,
  Birthday,
} from '@/src/types/entries';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const colors = useThemeColors();

  const router = useRouter();

  const allEntries = useEventsStore((s) => s.entries);
  const entries = useMemo(
    () => allEntries.filter((e) => e.date === (date ?? '')),
    [allEntries, date]
  );

  const events = useMemo(
    () => entries.filter((e): e is CalendarEvent => e.type === 'EVENT'),
    [entries]
  );
  const reminders = useMemo(
    () => entries.filter((e): e is Reminder => e.type === 'REMINDER'),
    [entries]
  );
  const tasks = useMemo(
    () => entries.filter((e): e is Task => e.type === 'TASK'),
    [entries]
  );
  const birthdays = useMemo(
    () => entries.filter((e): e is Birthday => e.type === 'BIRTHDAY'),
    [entries]
  );

  if (!date) return null;

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <HapticButton
            onPress={() => router.back()}
            hapticStyle="light"
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
          </HapticButton>
        </View>

        <View style={styles.dateDisplay}>
          <Text style={[TypeScale.displaySmall, { color: colors.onBackground }]}>
            {getDayName(date)}, {date.split('-')[2]}
          </Text>
          <Text style={[TypeScale.titleMedium, { color: colors.onSurfaceVariant }]}>
            {formatDateDisplay(date)}
          </Text>
        </View>

        {entries.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={36} color={colors.onSurfaceVariant} strokeWidth={1.5} />}
            title="No entries for this day"
            subtitle="Tap + to add something"
          />
        ) : (
          <>
            {events.length > 0 && (
              <>
                <SectionHeader title="Events" color={DOT_COLORS.EVENT} />
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={() => router.push(`/event/${event.id}` as never)}
                  />
                ))}
              </>
            )}
            {reminders.length > 0 && (
              <>
                <SectionHeader title="Reminders" color={DOT_COLORS.REMINDER} />
                {reminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onPress={() => router.push(`/event/${r.id}` as never)}
                  />
                ))}
              </>
            )}
            {tasks.length > 0 && (
              <>
                <SectionHeader title="Tasks" color={DOT_COLORS.TASK} />
                {tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onPress={() => router.push(`/event/${t.id}` as never)}
                  />
                ))}
              </>
            )}
            {birthdays.length > 0 && (
              <>
                <SectionHeader title="Birthdays" color={DOT_COLORS.BIRTHDAY} />
                {birthdays.map((b) => (
                  <BirthdayCard
                    key={b.id}
                    birthday={b}
                    onPress={() => router.push(`/event/${b.id}` as never)}
                  />
                ))}
              </>
            )}
          </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.small,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  dateDisplay: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.section,
  },
  bottomSpacer: {
    height: 40,
  },
});
