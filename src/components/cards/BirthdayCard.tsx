import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { Avatar } from '@/src/components/ui/Avatar';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { daysUntilBirthday, calculateAge } from '@/src/utils/dateHelpers';
import type { Birthday } from '@/src/types/entries';

interface BirthdayCardProps {
  birthday: Birthday;
  onPress?: () => void;
}

export function BirthdayCard({ birthday, onPress }: BirthdayCardProps) {
  const colors = useThemeColors();

  const daysUntil = daysUntilBirthday(birthday.date);
  const ageText = birthday.birthYear
    ? `Age: ${calculateAge(birthday.birthYear)}`
    : undefined;

  const countdownText =
    daysUntil === 0
      ? 'Today! 🎂'
      : daysUntil === 1
      ? 'Tomorrow!'
      : `In ${daysUntil} days`;

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
      accessibilityLabel={`Birthday: ${birthday.personName ?? birthday.title}, ${countdownText}`}
    >
      <View style={[styles.colorBar, { backgroundColor: DOT_COLORS.BIRTHDAY }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Avatar
            initials={(birthday.personName ?? birthday.title ?? '?').slice(0, 2)}
            color={DOT_COLORS.BIRTHDAY}
            size={36}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={[TypeScale.titleMedium, { color: colors.onSurface }]} numberOfLines={1}>
              {birthday.personName ?? birthday.title}
            </Text>
            {ageText && (
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                {ageText}
              </Text>
            )}
          </View>
          <View style={[styles.chip, { backgroundColor: colors.tertiaryContainer }]}>
            <Text style={[TypeScale.labelSmall, { color: colors.onTertiaryContainer }]}>
              {countdownText}
            </Text>
          </View>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: Spacing.compact,
  },
  textContainer: {
    flex: 1,
  },
  chip: {
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.micro,
    borderRadius: 9999,
  },
});
