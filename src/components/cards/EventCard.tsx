import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { formatTime } from '@/src/utils/dateHelpers';
import { MapPin, Calendar as EventIcon } from 'lucide-react-native';
import type { CalendarEvent } from '@/src/types/entries';
import { BaseCard } from './BaseCard';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useThemeColors();

  return (
    <BaseCard
      title={event.title}
      onPress={onPress}
      accentColor={event.colorTag}
      icon={<EventIcon size={22} color={event.colorTag} />}
      subtitle={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
          {event.location && (
            <>
              <Text style={{ color: colors.outlineVariant }}>•</Text>
              <MapPin size={12} color={colors.onSurfaceVariant} />
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
                {event.location}
              </Text>
            </>
          )}
        </View>
      }
    />
  );
}
