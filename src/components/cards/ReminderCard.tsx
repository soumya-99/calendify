import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { formatTime } from '@/src/utils/dateHelpers';
import { Bell, RefreshCw } from 'lucide-react-native';
import type { Reminder } from '@/src/types/entries';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { BaseCard } from './BaseCard';

interface ReminderCardProps {
  reminder: Reminder;
  onPress?: () => void;
}

export function ReminderCard({ reminder, onPress }: ReminderCardProps) {
  const colors = useThemeColors();

  return (
    <BaseCard
      title={reminder.title}
      onPress={onPress}
      accentColor={DOT_COLORS.REMINDER}
      icon={<Bell size={22} color={DOT_COLORS.REMINDER} />}
      rightContent={
        <View style={{ backgroundColor: `${DOT_COLORS.REMINDER}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={[TypeScale.labelMedium, { color: DOT_COLORS.REMINDER, fontWeight: '700' }]}>
            {formatTime(reminder.time)}
          </Text>
        </View>
      }
      subtitle={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          {reminder.repeat !== 'NONE' && (
            <>
              <RefreshCw size={12} color={colors.onSurfaceVariant} />
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                {reminder.repeat.toLowerCase()}
              </Text>
              <Text style={{ color: colors.outlineVariant }}>•</Text>
            </>
          )}
          <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
            {reminder.notes || 'No extra notes'}
          </Text>
        </View>
      }
    />
  );
}
