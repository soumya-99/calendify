import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type { CalendarEntry } from '@/src/types/entries';
import { Globe } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HolidayCardProps {
  holiday: CalendarEntry;
}

export function HolidayCard({ holiday }: HolidayCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: `${holiday.colorTag}12`, borderColor: `${holiday.colorTag}30`, borderWidth: 1 },
      ]}
      accessibilityLabel={`${holiday.title}, Public Holiday`}
    >
      <View style={[styles.iconContainer, { backgroundColor: holiday.colorTag }]}>
        <Globe size={18} color="#FFFFFF" strokeWidth={2} />
      </View>
      <View style={styles.content}>
        <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]} numberOfLines={1}>
          {holiday.title}
        </Text>
        <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
          Public Holiday
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.small,
    marginHorizontal: Spacing.base,
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    gap: 2,
  },
});
