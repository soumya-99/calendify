import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import * as Calendar from 'expo-calendar';
import { CalendarPicker } from '@/src/components/ui/CalendarPicker';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { DOT_COLORS, TAG_COLORS } from '@/src/constants/dotColors';
import { ChevronLeft, RefreshCw } from 'lucide-react-native';
import type { RepeatRule } from '@/src/types/entries';

export default function AddReminderScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const addEntry = useEventsStore((s) => s.addEntry);
  const defaultAccount = useAccountsStore((s) => s.getDefaultAccount());
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState<RepeatRule>('NONE');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState(DOT_COLORS.REMINDER);
  const [selectedCalendarId, setSelectedCalendarId] = useState(defaultAccount?.id ?? 'local');

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    if (selectedCalendarId.startsWith('os_')) {
      const osId = selectedCalendarId.replace('os_', '');
      try {
        const start = new Date(`${date}T${time}:00`);
        const end = new Date(`${date}T${time}:00`);
        end.setMinutes(end.getMinutes() + 15);
        await Calendar.createEventAsync(osId, {
          title: `[Reminder] ${title.trim()}`,
          startDate: isNaN(start.getTime()) ? new Date() : start,
          endDate: isNaN(end.getTime()) ? new Date() : end,
          allDay: false,
          notes,
        });
      } catch (e) {
        console.warn('Failed to sync to OS calendar', e);
      }
    }

    addEntry({
      type: 'REMINDER',
      title: title.trim(),
      date,
      time,
      repeat,
      notified: false,
      notes: notes.trim() || undefined,
      colorTag,
      accountId: selectedCalendarId,
    });
    haptics.success();
    router.back();
  }, [title, date, time, repeat, notes, colorTag, selectedCalendarId, addEntry, haptics, router]);

  const repeatOptions: { value: RepeatRule; label: string; icon: string }[] = [
    { value: 'NONE', label: 'Never', icon: '✕' },
    { value: 'DAILY', label: 'Daily', icon: 'D' },
    { value: 'WEEKLY', label: 'Weekly', icon: 'W' },
    { value: 'MONTHLY', label: 'Monthly', icon: 'M' },
    { value: 'YEARLY', label: 'Yearly', icon: 'Y' },
  ];

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <HapticButton onPress={() => router.back()} hapticStyle="light" style={styles.backButton}>
            <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
          </HapticButton>
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>New Reminder</Text>
          <HapticButton onPress={handleSave} hapticStyle="heavy" style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Save</Text>
          </HapticButton>
        </View>

        <TextInput
          style={[styles.input, styles.titleInput, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Reminder title"
          placeholderTextColor={colors.onSurfaceVariant}
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>DATE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.onSurfaceVariant}
          value={date}
          onChangeText={setDate}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>TIME</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="HH:MM"
          placeholderTextColor={colors.onSurfaceVariant}
          value={time}
          onChangeText={setTime}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>SYNC CALENDAR</Text>
        <CalendarPicker value={selectedCalendarId} onChange={(id) => setSelectedCalendarId(id)} />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>REPEAT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.compact }}>
          <View style={[styles.segmentRow, { backgroundColor: colors.surfaceVariant }]}>
            {repeatOptions.map((opt) => {
              const isActive = repeat === opt.value;
              return (
                <HapticButton
                  key={opt.value}
                  onPress={() => setRepeat(opt.value)}
                  hapticStyle="selection"
                  style={[
                    styles.segmentItem,
                    isActive ? { backgroundColor: colors.primaryContainer } : {},
                  ]}
                >
                  <Text style={[TypeScale.labelSmall, { fontSize: 13, color: isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant, fontWeight: isActive ? '600' : '400' }]}>
                    {opt.label}
                  </Text>
                </HapticButton>
              );
            })}
          </View>
        </ScrollView>

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>COLOR TAG</Text>
        <View style={styles.colorRow}>
          {TAG_COLORS.map((c) => (
            <HapticButton
              key={c}
              onPress={() => setColorTag(c)}
              hapticStyle="selection"
              style={[
                styles.colorCircle,
                { backgroundColor: c },
                colorTag === c ? { borderColor: colors.onBackground, borderWidth: 2.5, transform: [{ scale: 1.15 }] } : {},
              ]}
            />
          ))}
        </View>

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>NOTES</Text>
        <TextInput
          style={[styles.input, styles.notesInput, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Add notes..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.small, paddingVertical: Spacing.small,
  },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 9999 },
  input: {
    borderRadius: 12, paddingHorizontal: Spacing.base,
    paddingVertical: 14, marginHorizontal: Spacing.base, marginBottom: Spacing.compact, fontSize: 16,
  },
  titleInput: { fontSize: 20, paddingVertical: Spacing.base },
  notesInput: { minHeight: 100 },
  fieldLabel: { paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.small },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 6,
  },
  segmentItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  colorRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 10, marginBottom: Spacing.compact,
  },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
});
