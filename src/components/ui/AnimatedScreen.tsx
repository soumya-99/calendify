import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function AnimatedScreen({ children, style, edges = ['top', 'left', 'right'] }: AnimatedScreenProps) {
  const reducedMotion = useReducedMotion();

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
