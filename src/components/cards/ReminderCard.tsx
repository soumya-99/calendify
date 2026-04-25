import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { formatTime } from '@/src/utils/dateHelpers';
import { Bell, RefreshCw, AlignLeft } from 'lucide-react-native';
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
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
      accessibilityLabel={`Reminder: ${reminder.title} at ${formatTime(reminder.time)}`}
    >
      <View style={[styles.colorBar, { backgroundColor: DOT_COLORS.REMINDER }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleContainer}>
            <Text style={[TypeScale.titleMedium, { color: colors.onSurface }]} numberOfLines={1}>
              {reminder.title}
            </Text>
          </View>
          <View style={[styles.timeBadge, { backgroundColor: `${DOT_COLORS.REMINDER}15` }]}>
            <Text style={[TypeScale.labelSmall, { color: DOT_COLORS.REMINDER }]}>
              {formatTime(reminder.time)}
            </Text>
          </View>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Bell size={13} color={colors.onSurfaceVariant} strokeWidth={2} />
            <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 6 }]}>
              {formatTime(reminder.time)}
            </Text>
            {reminder.repeat !== 'NONE' && (
              <>
                <Text style={[TypeScale.bodySmall, { color: colors.outline, marginHorizontal: 6 }]}>•</Text>
                <RefreshCw size={12} color={colors.onSurfaceVariant} strokeWidth={2} />
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
                  {reminder.repeat.toLowerCase()}
                </Text>
              </>
            )}
          </View>

          {reminder.notes && (
            <View style={styles.metaRow}>
              <AlignLeft size={13} color={colors.onSurfaceVariant} strokeWidth={2} />
              <Text
                style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 6 }]}
                numberOfLines={1}
              >
                {reminder.notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: ShapeScale.large.borderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.small,
    marginHorizontal: Spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  colorBar: {
    width: 6,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  metaContainer: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
