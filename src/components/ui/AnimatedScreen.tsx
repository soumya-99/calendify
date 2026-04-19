import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft, useReducedMotion } from 'react-native-reanimated';
import { Durations } from '@/src/theme/motion';

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AnimatedScreen({ children, style }: AnimatedScreenProps) {
  const reducedMotion = useReducedMotion();

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
