import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
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
import { Springs } from '@/src/theme/motion';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { DOT_COLORS } from '@/src/constants/dotColors';
import type { Task } from '@/src/types/entries';
import { BaseCard } from './BaseCard';

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
    <BaseCard
      title={task.title}
      titleStyle={{
        textDecorationLine: task.completed ? 'line-through' : 'none',
        color: task.completed ? colors.onSurfaceVariant : colors.onSurface,
      }}
      onPress={onPress}
      accentColor={priorityColor}
      icon={
        <HapticButton
          onPress={handleToggle}
          hapticStyle="medium"
          style={{ padding: 4 }}
          accessibilityLabel={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <Animated.View style={checkAnimStyle}>
            {task.completed ? (
              <CheckCircle2 size={24} color={DOT_COLORS.TASK} strokeWidth={2} />
            ) : (
              <Circle size={24} color={colors.outline} strokeWidth={2} />
            )}
          </Animated.View>
        </HapticButton>
      }
      subtitle={
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: priorityColor }} />
            <Text style={[TypeScale.labelSmall, { color: priorityColor, fontWeight: '700', letterSpacing: 0.5 }]}>
              {task.priority} PRIORITY
            </Text>
            {task.dueDate && (
              <>
                <Text style={{ color: colors.outlineVariant }}>•</Text>
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                  Due: {task.dueDate}
                </Text>
              </>
            )}
          </View>
        </View>
      }
      style={{
        opacity: task.completed ? 0.7 : 1,
      }}
    />
  );
}
