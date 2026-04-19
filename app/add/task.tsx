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
import { ChevronLeft } from 'lucide-react-native';
import type { Priority } from '@/src/types/entries';

const PRIORITY_STYLES: Record<Priority, { color: string; emoji: string }> = {
  LOW: { color: '#43A047', emoji: '🟢' },
  MEDIUM: { color: '#FFB300', emoji: '🟡' },
  HIGH: { color: '#E64A19', emoji: '🔴' },
};

export default function AddTaskScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const addEntry = useEventsStore((s) => s.addEntry);
  const defaultAccount = useAccountsStore((s) => s.getDefaultAccount());
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState(DOT_COLORS.TASK);
  const [selectedCalendarId, setSelectedCalendarId] = useState(defaultAccount?.id ?? 'local');

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    if (selectedCalendarId.startsWith('os_')) {
      const osId = selectedCalendarId.replace('os_', '');
      try {
        const start = new Date(`${date}T09:00:00`);
        const end = new Date(`${date}T10:00:00`);
        await Calendar.createEventAsync(osId, {
          title: `[Task] ${title.trim()}`,
          startDate: isNaN(start.getTime()) ? new Date() : start,
          endDate: isNaN(end.getTime()) ? new Date() : end,
          allDay: true,
          notes: `Priority: ${priority}\n\n${notes}`,
        });
      } catch (e) {
        console.warn('Failed to sync to OS calendar', e);
      }
    }

    addEntry({
      type: 'TASK',
      title: title.trim(),
      date,
      completed: false,
      priority,
      notes: notes.trim() || undefined,
      colorTag,
      accountId: selectedCalendarId,
    });
    haptics.success();
    router.back();
  }, [title, date, priority, notes, colorTag, selectedCalendarId, addEntry, haptics, router]);

  const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

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
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>New Task</Text>
          <HapticButton onPress={handleSave} hapticStyle="heavy" style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Save</Text>
          </HapticButton>
        </View>

        <TextInput
          style={[styles.input, styles.titleInput, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Task title"
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

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>SYNC CALENDAR</Text>
        <CalendarPicker value={selectedCalendarId} onChange={(id) => setSelectedCalendarId(id)} />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>PRIORITY</Text>
        <View style={[styles.segmentRow, { backgroundColor: colors.surfaceVariant }]}>
          {priorities.map((p) => {
            const isActive = priority === p;
            const ps = PRIORITY_STYLES[p];
            return (
              <HapticButton
                key={p}
                onPress={() => setPriority(p)}
                hapticStyle="selection"
                style={[
                  styles.segmentItem,
                  isActive ? { backgroundColor: `${ps.color}20`, borderColor: ps.color, borderWidth: 1.5 } : {},
                ]}
              >
                <Text style={{ fontSize: 12 }}>{ps.emoji}</Text>
                <Text style={[TypeScale.labelSmall, { color: isActive ? ps.color : colors.onSurfaceVariant, fontWeight: isActive ? '700' : '400', marginTop: 2 }]}>
                  {p}
                </Text>
              </HapticButton>
            );
          })}
        </View>

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
    marginHorizontal: Spacing.base,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: Spacing.compact,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  colorRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 10, marginBottom: Spacing.compact,
  },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
});
