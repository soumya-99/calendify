import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { CalendarPicker } from '@/src/components/ui/CalendarPicker';
import { FormDateTimePicker } from '@/src/components/ui/FormDateTimePicker';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { KeyboardAwareFormScrollView } from '@/src/components/ui/KeyboardAwareFormScrollView';
import { DOT_COLORS, TAG_COLORS } from '@/src/constants/dotColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type { Priority, Task } from '@/src/types/entries';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIORITY_STYLES: Record<Priority, { color: string; emoji: string }> = {
  LOW: { color: '#43A047', emoji: '🟢' },
  MEDIUM: { color: '#FFB300', emoji: '🟡' },
  HIGH: { color: '#E64A19', emoji: '🔴' },
};

export default function AddTaskScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const addEntry = useEventsStore((s) => s.addEntry);
  const updateEntry = useEventsStore((s) => s.updateEntry);
  const entries = useEventsStore((s) => s.entries);
  const defaultAccount = useAccountsStore((s) => s.getDefaultAccount());
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const existingEntry = useMemo(
    () => entries.find((entry): entry is Task => entry.id === (id ?? '') && entry.type === 'TASK'),
    [entries, id]
  );
  const isEditing = !!existingEntry;

  const [title, setTitle] = useState('');
  const [dateObj, setDateObj] = useState(new Date(`${selectedDate}T12:00:00`));
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState(DOT_COLORS.TASK);
  const [selectedCalendarId, setSelectedCalendarId] = useState(defaultAccount?.id ?? 'local');

  useEffect(() => {
    if (!existingEntry) return;

    setTitle(existingEntry.title);
    setDateObj(new Date(`${existingEntry.date}T12:00:00`));
    setPriority(existingEntry.priority);
    setNotes(existingEntry.notes ?? '');
    setColorTag(existingEntry.colorTag);
    setSelectedCalendarId(existingEntry.accountId);
  }, [existingEntry]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const dateStr = dateObj.toISOString().split('T')[0];

    if (!isEditing && selectedCalendarId.startsWith('os_')) {
      const osId = selectedCalendarId.replace('os_', '');
      try {
        await Calendar.createEventAsync(osId, {
          title: `[Task] ${title.trim()}`,
          startDate: dateObj,
          endDate: dateObj,
          allDay: true,
          notes: `Priority: ${priority}\n\n${notes}`,
        });
      } catch (e) {
        console.warn('Failed to sync to Device calendar', e);
      }
    }

    const payload = {
      type: 'TASK',
      title: title.trim(),
      date: dateStr,
      completed: existingEntry?.completed ?? false,
      priority,
      notes: notes.trim() || undefined,
      colorTag,
      accountId: selectedCalendarId,
    };

    if (existingEntry) {
      updateEntry(existingEntry.id, payload);
    } else {
      addEntry(payload);
    }

    haptics.success();
    router.back();
  }, [title, dateObj, priority, notes, colorTag, selectedCalendarId, isEditing, existingEntry, updateEntry, addEntry, haptics, router]);

  const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <KeyboardAwareFormScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <HapticButton onPress={() => router.back()} hapticStyle="light" style={styles.backButton}>
            <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
          </HapticButton>
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
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
        <FormDateTimePicker
          mode="date"
          value={dateObj}
          onChange={setDateObj}
          style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.compact }}
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
                <Text style={[TypeScale.labelMedium, { color: isActive ? ps.color : colors.onSurfaceVariant, fontWeight: '400', marginTop: 2 }]} numberOfLines={1}>
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
      </KeyboardAwareFormScrollView>
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
    alignItems: 'center',
    padding: 4,
    gap: 4,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.compact,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  colorRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 10, marginBottom: Spacing.compact,
  },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
});
