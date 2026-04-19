import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';

export function WeekDayLabels() {
  const colors = useThemeColors();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <View style={styles.container}>
      {days.map((day, index) => {
        const isWeekend = index >= 5;
        return (
          <View key={day} style={styles.cell}>
            <Text
              style={[
                TypeScale.labelMedium,
                {
                  color: isWeekend ? colors.tertiary : colors.onSurfaceVariant,
                },
              ]}
            >
              {day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.small,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
});
