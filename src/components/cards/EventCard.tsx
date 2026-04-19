import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { formatTime } from '@/src/utils/dateHelpers';
import { MapPin, Clock } from 'lucide-react-native';
import type { CalendarEvent } from '@/src/types/entries';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useThemeColors();

  return (
    <HapticButton
      onPress={onPress}
      hapticStyle="light"
      style={[
        styles.card,
        { backgroundColor: colors.surface },
      ]}
      accessibilityLabel={`${event.title}, ${formatTime(event.startTime)} to ${formatTime(event.endTime)}`}
    >
      <View style={[styles.colorBar, { backgroundColor: event.colorTag }]} />
      <View style={styles.content}>
        <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={13} color={colors.onSurfaceVariant} strokeWidth={1.5} />
          <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </Text>
        </View>
        {event.location && (
          <View style={styles.metaRow}>
            <MapPin size={13} color={colors.onSurfaceVariant} strokeWidth={1.5} />
            <Text
              style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, marginLeft: 4 }]}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        )}
      </View>
    </HapticButton>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.small,
    marginHorizontal: Spacing.base,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
