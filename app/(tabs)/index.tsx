import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import { EventCard } from '@/src/components/cards/EventCard';
import { ReminderCard } from '@/src/components/cards/ReminderCard';
import { TaskCard } from '@/src/components/cards/TaskCard';
import { BirthdayCard } from '@/src/components/cards/BirthdayCard';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Divider } from '@/src/components/ui/Divider';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { useCalendarData } from '@/src/hooks/useCalendarData';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { getDayName, formatDateDisplay } from '@/src/utils/dateHelpers';
import { CalendarDays, Eye } from 'lucide-react-native';
import type {
  CalendarEvent,
  Reminder,
  Task,
  Birthday,
} from '@/src/types/entries';

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const { selectedDateEntries } = useCalendarData();

  const events = useMemo(
    () => selectedDateEntries.filter((e): e is CalendarEvent => e.type === 'EVENT'),
    [selectedDateEntries]
  );
  const reminders = useMemo(
    () => selectedDateEntries.filter((e): e is Reminder => e.type === 'REMINDER'),
    [selectedDateEntries]
  );
  const tasks = useMemo(
    () => selectedDateEntries.filter((e): e is Task => e.type === 'TASK'),
    [selectedDateEntries]
  );
  const birthdays = useMemo(
    () => selectedDateEntries.filter((e): e is Birthday => e.type === 'BIRTHDAY'),
    [selectedDateEntries]
  );

  const hasEntries = selectedDateEntries.length > 0;

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <CalendarGrid />

        <Divider style={styles.divider} />

        {/* Selected Date Header */}
        <View style={styles.dateHeader}>
          <View>
            <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>
              {getDayName(selectedDate)}
            </Text>
            <Text style={[TypeScale.bodyMedium, { color: colors.onSurfaceVariant }]}>
              {formatDateDisplay(selectedDate)}
            </Text>
          </View>
          <HapticButton
            onPress={() => router.push(`/day/${selectedDate}` as never)}
            hapticStyle="light"
            style={styles.eyeButton}
            accessibilityLabel={`View all entries for ${formatDateDisplay(selectedDate)}`}
          >
            <Eye size={24} color={colors.primary} strokeWidth={1.75} />
          </HapticButton>
        </View>

        {!hasEntries && (
          <EmptyState
            icon={<CalendarDays size={36} color={colors.onSurfaceVariant} strokeWidth={1.5} />}
            title="No entries"
            subtitle="Tap + to add a reminder, task, event, or birthday"
            style={styles.emptyState}
          />
        )}

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
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onPress={() => router.push(`/event/${reminder.id}` as never)}
              />
            ))}
          </>
        )}

        {tasks.length > 0 && (
          <>
            <SectionHeader title="Tasks" color={DOT_COLORS.TASK} />
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/event/${task.id}` as never)}
              />
            ))}
          </>
        )}

        {birthdays.length > 0 && (
          <>
            <SectionHeader title="Birthdays" color={DOT_COLORS.BIRTHDAY} />
            {birthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                onPress={() => router.push(`/event/${birthday.id}` as never)}
              />
            ))}
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
  divider: {
    marginTop: Spacing.compact,
    marginBottom: Spacing.small,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact,
  },
  eyeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: Spacing.hero,
  },
  bottomSpacer: {
    height: 20,
  },
});
