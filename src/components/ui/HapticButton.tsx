import React, { Children, cloneElement, isValidElement, useCallback } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextProps, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useHaptics } from '@/src/hooks/useHaptics';
import { Springs } from '@/src/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HapticButtonProps extends Omit<PressableProps, 'style'> {
  onPress?: () => void;
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection';
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  scaleOnPress?: number;
}

export function HapticButton({
  onPress,
  hapticStyle = 'light',
  style,
  children,
  scaleOnPress = 0.96,
  ...rest
}: HapticButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const handlePressIn = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(scaleOnPress, Springs.quick);
    }
  }, [scale, scaleOnPress, reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (!reducedMotion) {
      scale.value = withSpring(1, { mass: 1, damping: 20, stiffness: 200 });
    }
  }, [scale, reducedMotion]);

  const handlePress = useCallback(() => {
    haptics[hapticStyle]();
    onPress?.();
  }, [haptics, hapticStyle, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const normalizedChildren = Children.map(children, (child) => {
    if (!isValidElement<TextProps>(child) || child.type !== Text) {
      return child;
    }

    return cloneElement(child, {
      numberOfLines: child.props.numberOfLines ?? 1,
      ellipsizeMode: child.props.ellipsizeMode ?? 'tail',
      style: [styles.singleLineText, child.props.style],
    });
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      {...rest}
    >
      {normalizedChildren}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  singleLineText: {
    flexShrink: 1,
  },
});
