import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CalendarHeader } from './CalendarHeader';
import { WeekDayLabels } from './WeekDayLabels';
import { CalendarDay } from './CalendarDay';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { useCalendarData } from '@/src/hooks/useCalendarData';
import { Spacing } from '@/src/theme/spacing';
import { Springs } from '@/src/theme/motion';

export function CalendarGrid() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const currentYear = useCalendarStore((s) => s.currentYear);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const goToPrevMonth = useCalendarStore((s) => s.goToPrevMonth);
  const goToNextMonth = useCalendarStore((s) => s.goToNextMonth);
  const goToToday = useCalendarStore((s) => s.goToToday);

  const { weeks, dotColorsByDate } = useCalendarData();

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const goNextJS = useCallback(() => {
    goToNextMonth();
  }, [goToNextMonth]);

  const goPrevJS = useCallback(() => {
    goToPrevMonth();
  }, [goToPrevMonth]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((event) => {
      if (!reducedMotion) {
        translateX.value = event.translationX * 0.3;
        opacity.value = 1 - Math.abs(event.translationX) / 800;
      }
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 50) {
        if (event.translationX > 0) {
          runOnJS(goPrevJS)();
        } else {
          runOnJS(goNextJS)();
        }
      }
      translateX.value = withSpring(0, Springs.standard);
      opacity.value = withSpring(1, Springs.standard);
    });

  const animatedGridStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <CalendarHeader
        month={currentMonth}
        year={currentYear}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onTitlePress={goToToday}
      />
      <WeekDayLabels />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.grid, animatedGridStyle]}>
          {weeks.map((week, wIdx) => (
            <View key={`week-${wIdx}`} style={styles.weekRow}>
              {week.map((dayData) => (
                <CalendarDay
                  key={dayData.date}
                  day={dayData.day}
                  date={dayData.date}
                  state={dayData.state}
                  dotColors={dotColorsByDate[dayData.date] ?? []}
                  onPress={handleDayPress}
                />
              ))}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.small,
  },
  grid: {
    paddingHorizontal: Spacing.base,
  },
  weekRow: {
    flexDirection: 'row',
  },
});
