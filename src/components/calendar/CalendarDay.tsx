import { useHaptics } from '@/src/hooks/useHaptics';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SCREEN_HORIZONTAL_MARGIN } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type { DayCellState } from '@/src/types/calendar';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { DotIndicators } from './DotIndicators';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CalendarDayProps {
  day: number;
  date: string;
  state: DayCellState;
  dotColors: string[];
  onPress: (date: string) => void;
}

export function CalendarDay({ day, date, state, dotColors, onPress }: CalendarDayProps) {
  const colors = useThemeColors();
  const haptics = useHaptics();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const cellSize = (width - SCREEN_HORIZONTAL_MARGIN * 2) / 7;

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withTiming(0.92, { duration: 100 });
    }
  }, [scale, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [scale, reducedMotion]);

  const handlePress = useCallback(() => {
    haptics.selection();
    onPress(date);
  }, [haptics, onPress, date]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getTextColor = () => {
    switch (state) {
      case 'today':
      case 'todaySelected':
        return colors.onPrimary;
      case 'selected':
        return colors.primary;
      case 'otherMonth':
        return `${colors.onSurfaceVariant}40`;
      default:
        return colors.onBackground;
    }
  };

  const getBackgroundStyle = () => {
    const size = Math.min(cellSize - 6, 38);
    switch (state) {
      case 'today':
        return {
          backgroundColor: colors.primary,
          width: size,
          height: size,
          borderRadius: 16,
        };
      case 'todaySelected':
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primaryContainer,
          borderWidth: 2.5,
          width: size,
          height: size,
          borderRadius: 16,
        };
      case 'selected':
        return {
          backgroundColor: colors.primaryContainer,
          width: size,
          height: size,
          borderRadius: 16,
        };
      default:
        return {
          width: size,
          height: size,
          borderRadius: 16,
        };
    }
  };

  const isBold = state === 'today' || state === 'selected' || state === 'todaySelected';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.container,
        {
          width: cellSize,
          borderColor: state === 'otherMonth' ? 'transparent' : `${colors.outlineVariant}30`,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${date}, ${dotColors.length} entries`}
    >
      <View style={[styles.dayCircle, getBackgroundStyle()]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            TypeScale.bodyMedium,
            {
              color: getTextColor(),
              fontWeight: isBold ? '700' : '400',
              fontSize: 13,
              includeFontPadding: false,
              textAlign: 'center',
            },
          ]}
        >
          {day}
        </Text>
      </View>
      <DotIndicators dotColors={dotColors} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  dayCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
