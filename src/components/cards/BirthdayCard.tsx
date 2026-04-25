import { Avatar } from '@/src/components/ui/Avatar';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import type { Birthday } from '@/src/types/entries';
import { calculateAge, daysUntilBirthday, formatDateDisplay, formatCountdown } from '@/src/utils/dateHelpers';
import React from 'react';
import { View, Text } from 'react-native';
import { BaseCard } from './BaseCard';

interface BirthdayCardProps {
  birthday: Birthday;
  onPress?: () => void;
}

export function BirthdayCard({ birthday, onPress }: BirthdayCardProps) {
  const colors = useThemeColors();

  const daysUntil = daysUntilBirthday(birthday.date);
  const turningAge = birthday.birthYear ? calculateAge(birthday.birthYear) : null;
  const countdownText = formatCountdown(daysUntil);

  return (
    <BaseCard
      title={birthday.personName ?? birthday.title ?? 'Unknown'}
      onPress={onPress}
      accentColor={DOT_COLORS.BIRTHDAY}
      icon={
        <Avatar
          initials={(birthday.personName ?? birthday.title ?? '?').slice(0, 2)}
          color={DOT_COLORS.BIRTHDAY}
          size={44}
        />
      }
      rightContent={
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {turningAge && (
            <View style={{ backgroundColor: `${DOT_COLORS.BIRTHDAY}15`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={[TypeScale.labelSmall, { color: DOT_COLORS.BIRTHDAY, fontWeight: '600' }]}>
                Turning {turningAge}
              </Text>
            </View>
          )}
          <View style={{ backgroundColor: daysUntil === 0 ? DOT_COLORS.BIRTHDAY : colors.secondaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={[TypeScale.labelSmall, { color: daysUntil === 0 ? '#FFFFFF' : colors.onSecondaryContainer, fontWeight: '700' }]}>
              {countdownText}
            </Text>
          </View>
        </View>
      }
      subtitle={formatDateDisplay(birthday.date)}
    />
  );
}
