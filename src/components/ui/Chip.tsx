import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import { HapticButton } from './HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
}

export function Chip({ label, selected = false, onPress, color, style }: ChipProps) {
  const colors = useThemeColors();

  const bgColor = selected
    ? (color ? `${color}26` : colors.primaryContainer)
    : colors.surfaceVariant;

  const textColor = selected
    ? (color ?? colors.onPrimaryContainer)
    : colors.onSurfaceVariant;

  const borderColor = selected
    ? (color ?? colors.primary)
    : 'transparent';

  return (
    <HapticButton
      onPress={onPress}
      hapticStyle="selection"
      style={[
        styles.chip,
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
        } as const,
        style ?? {},
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text style={[TypeScale.labelLarge, { color: textColor }]}>{label}</Text>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: Spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
});
