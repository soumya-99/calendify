import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { HapticButton } from './HapticButton';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export function EmptyState({ icon, title, subtitle, action, style }: EmptyStateProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
        {icon}
      </View>
      <Text style={[TypeScale.titleMedium, styles.title, { color: colors.onSurface }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[TypeScale.bodyMedium, styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      )}
      {action && (
        <HapticButton
          onPress={action.onPress}
          style={[styles.actionButton, { backgroundColor: colors.primaryContainer }]}
        >
          <Text style={[TypeScale.labelLarge, { color: colors.onPrimaryContainer }]}>
            {action.label}
          </Text>
        </HapticButton>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.section,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.small,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.section,
  },
  actionButton: {
    paddingHorizontal: Spacing.section,
    paddingVertical: Spacing.compact,
    borderRadius: 9999,
  },
});
