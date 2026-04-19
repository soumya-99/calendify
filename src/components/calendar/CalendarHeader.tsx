import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getMonthName } from '@/src/utils/dateHelpers';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress?: () => void;
}

export function CalendarHeader({ month, year, onPrev, onNext, onTitlePress }: CalendarHeaderProps) {
  const colors = useThemeColors();
  const monthName = getMonthName(month);

  return (
    <View style={styles.container}>
      <HapticButton
        onPress={onPrev}
        hapticStyle="light"
        style={styles.navButton}
        accessibilityLabel="Previous month"
        accessibilityRole="button"
      >
        <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
      </HapticButton>

      <HapticButton
        onPress={onTitlePress}
        hapticStyle="selection"
        style={styles.titleContainer}
        accessibilityRole="button"
        accessibilityLabel={`${monthName} ${year}`}
      >
        <Text style={[TypeScale.headlineMedium, { color: colors.onBackground }]}>
          {monthName} {year}
        </Text>
      </HapticButton>

      <HapticButton
        onPress={onNext}
        hapticStyle="light"
        style={styles.navButton}
        accessibilityLabel="Next month"
        accessibilityRole="button"
      >
        <ChevronRight size={24} color={colors.onSurface} strokeWidth={1.75} />
      </HapticButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact,
    marginBottom: Spacing.small,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
