import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ColorDot } from './ColorDot';

interface SectionHeaderProps {
  title: string;
  color?: string;
  style?: ViewStyle;
}

export function SectionHeader({ title, color, style }: SectionHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, style]}>
      {color && <ColorDot color={color} size={8} style={styles.dot} />}
      <Text style={[TypeScale.titleSmall, { color: colors.onSurfaceVariant }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.base,
  },
  dot: {
    marginRight: Spacing.small,
  },
});
