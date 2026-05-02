import { useThemeColors } from '@/src/hooks/useThemeColors';
import type { Holiday } from '@/src/types/entries';
import { Globe } from 'lucide-react-native';
import React from 'react';
import { BaseCard } from './BaseCard';

interface HolidayCardProps {
  holiday: Holiday;
  onPress?: () => void;
}

export function HolidayCard({ holiday, onPress }: HolidayCardProps) {
  const colors = useThemeColors();

  return (
    <BaseCard
      title={holiday.title}
      accentColor={holiday.colorTag}
      icon={<Globe size={20} color={holiday.colorTag} />}
      subtitle="Public Holiday"
      onPress={onPress}
    />
  );
}
