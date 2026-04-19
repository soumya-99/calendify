import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ColorDotProps {
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function ColorDot({ color, size = 6, style }: ColorDotProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
