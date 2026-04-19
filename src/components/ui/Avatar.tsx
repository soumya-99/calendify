import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ initials, color, size = 40, style }: AvatarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Avatar: ${initials}`}
    >
      <Text style={[styles.text, { fontSize: size * 0.4, color: '#FFFFFF' }]}>
        {initials.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
