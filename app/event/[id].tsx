import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { Divider } from '@/src/components/ui/Divider';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { formatDateDisplay, formatTime } from '@/src/utils/dateHelpers';
import {
  ChevronLeft,
  Trash2,
  Clock,
  MapPin,
  RefreshCw,
  CalendarDays,
  User,
} from 'lucide-react-native';
import type { CalendarEvent, Reminder, Task, Birthday } from '@/src/types/entries';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();

  const entries = useEventsStore((s) => s.entries);
  const entry = useMemo(() => entries.find((e) => e.id === (id ?? '')), [entries, id]);
  const deleteEntry = useEventsStore((s) => s.deleteEntry);

  const handleDelete = useCallback(() => {
    if (!entry) return;
    Alert.alert('Delete', `Delete "${entry.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.warning();
          deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  }, [entry, deleteEntry, haptics, router]);

  if (!entry) {
    return (
      <AnimatedScreen style={{ backgroundColor: colors.background }}>
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurfaceVariant }]}>
            Entry not found
          </Text>
        </View>
      </AnimatedScreen>
    );
  }

  const dotColor = DOT_COLORS[entry.type] ?? colors.primary;

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <HapticButton
            onPress={() => router.back()}
            hapticStyle="light"
            style={styles.navButton}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
          </HapticButton>
          <HapticButton
            onPress={handleDelete}
            hapticStyle="medium"
            style={styles.navButton}
            accessibilityLabel="Delete entry"
          >
            <Trash2 size={20} color={colors.error} strokeWidth={1.75} />
          </HapticButton>
        </View>

        {/* Type badge */}
        <View style={styles.typeBadgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${dotColor}26` }]}>
            <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
            <Text style={[TypeScale.labelLarge, { color: dotColor }]}>{entry.type}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[TypeScale.headlineMedium, styles.titleText, { color: colors.onBackground }]}>
          {entry.title}
        </Text>

        {/* Date */}
        <View style={styles.infoRow}>
          <CalendarDays size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
          <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
            {formatDateDisplay(entry.date)}
          </Text>
        </View>

        {/* Time info */}
        {entry.type === 'EVENT' && (
          <View style={styles.infoRow}>
            <Clock size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
            <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
              {formatTime((entry as CalendarEvent).startTime)} – {formatTime((entry as CalendarEvent).endTime)}
            </Text>
          </View>
        )}

        {entry.type === 'REMINDER' && (
          <View style={styles.infoRow}>
            <Clock size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
            <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
              {formatTime((entry as Reminder).time)}
            </Text>
          </View>
        )}

        {/* Location */}
        {entry.type === 'EVENT' && (entry as CalendarEvent).location && (
          <View style={styles.infoRow}>
            <MapPin size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
            <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
              {(entry as CalendarEvent).location}
            </Text>
          </View>
        )}

        {/* Repeat */}
        {(entry.type === 'EVENT' || entry.type === 'REMINDER') && (
          <View style={styles.infoRow}>
            <RefreshCw size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
            <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
              {(entry as CalendarEvent | Reminder).repeat}
            </Text>
          </View>
        )}

        {/* Birthday */}
        {entry.type === 'BIRTHDAY' && (
          <View style={styles.infoRow}>
            <User size={20} color={colors.onSurfaceVariant} strokeWidth={1.75} />
            <Text style={[TypeScale.bodyLarge, styles.infoText, { color: colors.onSurface }]}>
              {(entry as Birthday).personName}
              {(entry as Birthday).birthYear && ` (born ${(entry as Birthday).birthYear})`}
            </Text>
          </View>
        )}

        {/* Notes */}
        {entry.notes && (
          <>
            <Divider style={styles.noteDivider} />
            <View style={[styles.notesBox, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[TypeScale.bodyMedium, { color: colors.onSurface }]}>{entry.notes}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.small,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  typeBadgeRow: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.small,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.compact,
    paddingVertical: Spacing.small,
    borderRadius: 9999,
    gap: Spacing.small,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  titleText: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.section,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.small,
    gap: Spacing.compact,
  },
  infoText: {
    flex: 1,
  },
  noteDivider: {
    marginVertical: Spacing.section,
  },
  notesBox: {
    marginHorizontal: Spacing.base,
    padding: Spacing.base,
    borderRadius: ShapeScale.medium.borderRadius,
  },
});
