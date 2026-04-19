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
import type { CalendarEvent, RepeatRule } from '@/src/types/entries';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddEventScreen() {
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
    () => entries.find((entry): entry is CalendarEvent => entry.id === (id ?? '') && entry.type === 'EVENT'),
    [entries, id]
  );
  const isEditing = !!existingEntry;

  const [title, setTitle] = useState('');
  const [dateObj, setDateObj] = useState(new Date(`${selectedDate}T12:00:00`));
  const [startObj, setStartObj] = useState(new Date(`${selectedDate}T09:00:00`));
  const [endObj, setEndObj] = useState(new Date(`${selectedDate}T10:00:00`));
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [repeat, setRepeat] = useState<RepeatRule>('NONE');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState(DOT_COLORS.EVENT);
  const [selectedCalendarId, setSelectedCalendarId] = useState(defaultAccount?.id ?? 'local');

  useEffect(() => {
    if (!existingEntry) return;

    setTitle(existingEntry.title);
    setDateObj(new Date(`${existingEntry.date}T12:00:00`));
    setStartObj(new Date(`${existingEntry.date}T${existingEntry.startTime}:00`));
    setEndObj(new Date(`${existingEntry.date}T${existingEntry.endTime}:00`));
    setLocation(existingEntry.location ?? '');
    setAllDay(existingEntry.allDay);
    setRepeat(existingEntry.repeat);
    setNotes(existingEntry.notes ?? '');
    setColorTag(existingEntry.colorTag);
    setSelectedCalendarId(existingEntry.accountId);
  }, [existingEntry]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const dateStr = dateObj.toISOString().split('T')[0];
    const startTimeStr = startObj.toTimeString().slice(0, 5);
    const endTimeStr = endObj.toTimeString().slice(0, 5);

    if (!isEditing && selectedCalendarId.startsWith('os_')) {
      const osId = selectedCalendarId.replace('os_', '');
      try {
        await Calendar.createEventAsync(osId, {
          title: title.trim(),
          startDate: isNaN(startObj.getTime()) ? new Date() : startObj,
          endDate: isNaN(endObj.getTime()) ? new Date() : endObj,
          allDay,
          location,
          notes,
        });
      } catch (e) {
        console.warn('Failed to sync to Device calendar', e);
      }
    }

    const payload = {
      type: 'EVENT',
      title: title.trim(),
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      location: location.trim() || undefined,
      allDay,
      repeat,
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
  }, [title, dateObj, startObj, endObj, location, allDay, repeat, notes, colorTag, selectedCalendarId, isEditing, existingEntry, updateEntry, addEntry, haptics, router]);

  const repeatOptions: { value: RepeatRule; label: string }[] = [
    { value: 'NONE', label: 'Never' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

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
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>{isEditing ? 'Edit Event' : 'New Event'}</Text>
          <HapticButton onPress={handleSave} hapticStyle="heavy" style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Save</Text>
          </HapticButton>
        </View>

        <TextInput
          style={[styles.input, styles.titleInput, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Event title"
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

        {/* All Day Toggle */}
        <View style={[styles.switchRow, { backgroundColor: colors.surfaceVariant, marginHorizontal: Spacing.base, borderRadius: 12, paddingHorizontal: Spacing.base, paddingVertical: 12, marginBottom: Spacing.compact }]}>
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>All Day</Text>
          <Switch
            value={allDay}
            onValueChange={(val) => {
              setAllDay(val);
              haptics.selection();
            }}
            trackColor={{ false: `${colors.outline}40`, true: colors.primaryContainer }}
            thumbColor={allDay ? colors.primary : colors.outline}
          />
        </View>

        {!allDay && (
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>START</Text>
              <FormDateTimePicker
                mode="time"
                value={startObj}
                onChange={setStartObj}
                style={{ marginLeft: Spacing.base, marginRight: Spacing.small }}
              />
            </View>
            <View style={styles.timeField}>
              <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>END</Text>
              <FormDateTimePicker
                mode="time"
                value={endObj}
                onChange={setEndObj}
                style={{ marginRight: Spacing.base, marginLeft: Spacing.small }}
              />
            </View>
          </View>
        )}

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>LOCATION</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Add location"
          placeholderTextColor={colors.onSurfaceVariant}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>SYNC CALENDAR</Text>
        <CalendarPicker value={selectedCalendarId} onChange={(id) => setSelectedCalendarId(id)} />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>REPEAT</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.repeatScroll}
          contentContainerStyle={styles.repeatScrollContent}
        >
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
                  <Text style={[TypeScale.labelMedium, { color: isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant, fontWeight: '400' }]} numberOfLines={1}>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeRow: { flexDirection: 'row' },
  timeField: { flex: 1 },
  repeatScroll: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.compact,
    flexGrow: 0,
  },
  repeatScrollContent: {
    paddingRight: Spacing.base,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 12,
    alignItems: 'center',
    padding: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  segmentItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  colorRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 10, marginBottom: Spacing.compact,
  },
  colorCircle: { width: 30, height: 30, borderRadius: 15 },
});
