import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import type { CalendarEntry } from '@/src/types/entries';
import { Globe } from 'lucide-react-native';
import React from 'react';
import { Text } from 'react-native';
import { BaseCard } from './BaseCard';

interface HolidayCardProps {
  holiday: CalendarEntry;
}

export function HolidayCard({ holiday }: HolidayCardProps) {
  const colors = useThemeColors();

  return (
    <BaseCard
      title={holiday.title}
      accentColor={holiday.colorTag}
      icon={<Globe size={20} color={holiday.colorTag} />}
      subtitle="Public Holiday"
    />
  );
}
