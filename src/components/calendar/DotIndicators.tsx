import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorDot } from '@/src/components/ui/ColorDot';
import { TypeScale } from '@/src/theme/typography';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface DotIndicatorsProps {
  dotColors: string[];
  max?: number;
}

export function DotIndicators({ dotColors, max = 3 }: DotIndicatorsProps) {
  const colors = useThemeColors();

  if (dotColors.length === 0) return null;

  const visibleDots = dotColors.slice(0, max);
  const overflow = dotColors.length - max;

  return (
    <View style={styles.container}>
      {visibleDots.map((color, i) => (
        <ColorDot key={`${color}-${i}`} color={color} size={6} style={styles.dot} />
      ))}
      {overflow > 0 && (
        <Text style={[TypeScale.labelSmall, { color: colors.onSurfaceVariant }]}>
          +{overflow}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 3,
    height: 10,
  },
  dot: {
    // gap handles spacing
  },
});
