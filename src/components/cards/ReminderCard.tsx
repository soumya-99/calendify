import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { ColorDot } from '@/src/components/ui/ColorDot';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { formatTime } from '@/src/utils/dateHelpers';
import { Bell, RefreshCw } from 'lucide-react-native';
import type { Reminder } from '@/src/types/entries';
import { DOT_COLORS } from '@/src/constants/dotColors';

interface ReminderCardProps {
  reminder: Reminder;
  onPress?: () => void;
}

export function ReminderCard({ reminder, onPress }: ReminderCardProps) {
  const colors = useThemeColors();

  return (
    <HapticButton
      onPress={onPress}
      hapticStyle="light"
      style={[
        styles.card,
        {
          backgroundColor: `${colors.surfaceVariant}99`,
        },
      ]}
      accessibilityLabel={`Reminder: ${reminder.title} at ${formatTime(reminder.time)}`}
    >
      <View style={[styles.colorBar, { backgroundColor: DOT_COLORS.REMINDER }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Bell size={14} color={DOT_COLORS.REMINDER} strokeWidth={1.75} />
          <Text style={[TypeScale.bodySmall, styles.timeText, { color: colors.onSurfaceVariant }]}>
            {formatTime(reminder.time)}
          </Text>
          {reminder.repeat !== 'NONE' && (
            <RefreshCw size={12} color={colors.onSurfaceVariant} strokeWidth={1.75} style={styles.repeatIcon} />
          )}
        </View>
        <Text style={[TypeScale.titleMedium, { color: colors.onSurface }]} numberOfLines={1}>
          {reminder.title}
        </Text>
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: ShapeScale.large.borderRadius,
    overflow: 'hidden',
    marginBottom: Spacing.small,
    marginHorizontal: Spacing.base,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.compact,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.micro,
  },
  timeText: {
    marginLeft: Spacing.small,
  },
  repeatIcon: {
    marginLeft: Spacing.small,
  },
});
