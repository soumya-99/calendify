import { Avatar } from '@/src/components/ui/Avatar';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ShapeScale } from '@/src/theme/motion';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type { Birthday } from '@/src/types/entries';
import { calculateAge, daysUntilBirthday, formatDateDisplay, formatCountdown } from '@/src/utils/dateHelpers';
import { Gift } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      accessibilityLabel={`Birthday: ${birthday.personName ?? birthday.title}, ${countdownText}`}
    >
      <View style={[styles.colorBar, { backgroundColor: DOT_COLORS.BIRTHDAY }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Avatar
            initials={(birthday.personName ?? birthday.title ?? '?').slice(0, 2)}
            color={DOT_COLORS.BIRTHDAY}
            size={44}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={[TypeScale.titleMedium, { color: colors.onSurface }]} numberOfLines={1}>
              {birthday.personName ?? birthday.title}
            </Text>
            <View style={styles.metaRow}>
              <Gift size={12} color={colors.onSurfaceVariant} style={{ marginRight: 4 }} />
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                {formatDateDisplay(birthday.date)}
              </Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            {turningAge && (
              <View style={[styles.ageBadge, { backgroundColor: `${DOT_COLORS.BIRTHDAY}15` }]}>
                <Text style={[TypeScale.labelSmall, { color: DOT_COLORS.BIRTHDAY }]}>
                  Turning {turningAge}
                </Text>
              </View>
            )}
            <View style={[styles.chip, { backgroundColor: daysUntil === 0 ? DOT_COLORS.BIRTHDAY : colors.secondaryContainer }]}>
              <Text style={[TypeScale.labelSmall, { color: daysUntil === 0 ? '#FFFFFF' : colors.onSecondaryContainer }]}>
                {countdownText}
              </Text>
            </View>
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
    width: 6,
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
    marginRight: Spacing.base,
  },
  textContainer: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: Spacing.small,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
