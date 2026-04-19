import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale, Springs } from '@/src/theme/motion';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { DOT_COLORS } from '@/src/constants/dotColors';
import type { Task } from '@/src/types/entries';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: '#E64A19',
  MEDIUM: '#FFB300',
  LOW: '#43A047',
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  const colors = useThemeColors();
  const haptics = useHaptics();
  const toggleTaskComplete = useEventsStore((s) => s.toggleTaskComplete);
  const reducedMotion = useReducedMotion();
  const checkScale = useSharedValue(1);

  const handleToggle = useCallback(() => {
    haptics.success();
    if (!reducedMotion) {
      checkScale.value = withSpring(1.3, Springs.bouncy);
      setTimeout(() => {
        checkScale.value = withSpring(1, Springs.standard);
      }, 200);
    }
    toggleTaskComplete(task.id);
  }, [haptics, toggleTaskComplete, task.id, checkScale, reducedMotion]);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const priorityColor = PRIORITY_COLORS[task.priority] ?? colors.onSurfaceVariant;

  return (
    <HapticButton
      onPress={onPress}
      hapticStyle="light"
      style={[
        styles.card,
        {
          backgroundColor: `${colors.surfaceVariant}99`,
        },
      ]}
      accessibilityLabel={`Task: ${task.title}, priority ${task.priority}, ${task.completed ? 'completed' : 'not completed'}`}
    >
      <View style={[styles.colorBar, { backgroundColor: priorityColor }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <HapticButton
            onPress={handleToggle}
            hapticStyle="medium"
            style={styles.checkButton}
            accessibilityLabel={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <Animated.View style={checkAnimStyle}>
              {task.completed ? (
                <CheckCircle2 size={22} color={DOT_COLORS.TASK} strokeWidth={1.75} />
              ) : (
                <Circle size={22} color={colors.outline} strokeWidth={1.75} />
              )}
            </Animated.View>
          </HapticButton>
          <View style={styles.textContainer}>
            <Text
              style={[
                TypeScale.titleMedium,
                {
                  color: task.completed ? colors.onSurfaceVariant : colors.onSurface,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            {task.dueDate && (
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                Due: {task.dueDate}
              </Text>
            )}
          </View>
        </View>
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: ShapeScale.large.borderRadius,
    overflow: 'hidden',
    marginBottom: Spacing.small,
    marginHorizontal: Spacing.base,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.compact,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkButton: {
    marginRight: Spacing.compact,
    padding: Spacing.micro,
  },
  textContainer: {
    flex: 1,
  },
});
