import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { HapticButton } from './HapticButton';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SettingsRow({ icon, label, value, onPress, style }: SettingsRowProps) {
  const colors = useThemeColors();

  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          {icon}
        </View>
        <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>{label}</Text>
      </View>
      <View style={styles.right}>
        {value && (
          <Text style={[TypeScale.bodyMedium, { color: colors.onSurfaceVariant }]}>{value}</Text>
        )}
        {onPress && (
          <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <HapticButton
        onPress={onPress}
        hapticStyle="light"
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </HapticButton>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact,
    minHeight: 56,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.compact,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
