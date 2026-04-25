import { CalendarGrid } from '@/src/components/calendar/CalendarGrid';
import { BirthdayCard } from '@/src/components/cards/BirthdayCard';
import { EventCard } from '@/src/components/cards/EventCard';
import { HolidayCard } from '@/src/components/cards/HolidayCard';
import { ReminderCard } from '@/src/components/cards/ReminderCard';
import { TaskCard } from '@/src/components/cards/TaskCard';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { Divider } from '@/src/components/ui/Divider';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { useCalendarData } from '@/src/hooks/useCalendarData';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type {
  Birthday,
  CalendarEvent,
  Reminder,
  Task,
} from '@/src/types/entries';
import { formatDateDisplay, getDayName } from '@/src/utils/dateHelpers';
import { useRouter } from 'expo-router';
import { CalendarDays, Eye } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const today = new Date();
const TODAY_MONTH = today.getMonth();
const TODAY_YEAR = today.getFullYear();
const TODAY_DAY = String(today.getDate());

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const currentYear = useCalendarStore((s) => s.currentYear);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const { selectedDateEntries } = useCalendarData();

  const isCurrentMonth = currentMonth === TODAY_MONTH && currentYear === TODAY_YEAR;

  const fabScale = useSharedValue(isCurrentMonth ? 0.8 : 1);
  const fabOpacity = useSharedValue(isCurrentMonth ? 0 : 1);
  const fabTranslateY = useSharedValue(isCurrentMonth ? 20 : 0);

  useEffect(() => {
    const config = {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    };

    if (isCurrentMonth) {
      fabScale.value = withTiming(0.8, config);
      fabOpacity.value = withTiming(0, config);
      fabTranslateY.value = withTiming(20, config);
    } else {
      fabScale.value = withTiming(1, config);
      fabOpacity.value = withTiming(1, config);
      fabTranslateY.value = withTiming(0, config);
    }
  }, [isCurrentMonth]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { translateY: fabTranslateY.value }
    ],
    opacity: fabOpacity.value,
    pointerEvents: fabOpacity.value > 0.1 ? 'auto' : 'none',
  }));

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
  const holidays = useMemo(
    () => selectedDateEntries.filter((e) => e.type === 'HOLIDAY'),
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

        {holidays.length > 0 && (
          <>
            <SectionHeader title="Holidays" color={DOT_COLORS.HOLIDAY} />
            {holidays.map((holiday) => (
              <HolidayCard
                key={holiday.id}
                holiday={holiday}
              />
            ))}
          </>
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

      {/* Today FAB — only visible when not in current month */}
      <Animated.View style={[styles.fab, { bottom: insets.bottom }, fabStyle]}>
        <HapticButton
          onPress={goToToday}
          hapticStyle="medium"
          style={[styles.fabButton, { backgroundColor: colors.primary }]}
          accessibilityLabel="Jump to today"
        >
          <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>{TODAY_DAY}</Text>
          <CalendarDays size={14} color={colors.onPrimary} strokeWidth={2} style={{ marginLeft: 4 }} />
        </HapticButton>
      </Animated.View>
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
  fab: {
    position: 'absolute',
    right: Spacing.base,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
});
