import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/theme/spacing';

interface DividerProps {
  inset?: boolean;
  style?: ViewStyle;
}

export function Divider({ inset = false, style }: DividerProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: colors.outlineVariant,
          marginLeft: inset ? Spacing.base : 0,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 0.5,
    width: '100%',
  },
});
