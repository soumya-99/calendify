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
import type { Reminder, RepeatRule } from '@/src/types/entries';
import * as Calendar from 'expo-calendar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddReminderScreen() {
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
    () => entries.find((entry): entry is Reminder => entry.id === (id ?? '') && entry.type === 'REMINDER'),
    [entries, id]
  );
  const isEditing = !!existingEntry;

  const [title, setTitle] = useState('');
  const [dateObj, setDateObj] = useState(new Date(`${selectedDate}T12:00:00`));
  const [timeObj, setTimeObj] = useState(new Date(`${selectedDate}T09:00:00`));
  const [repeat, setRepeat] = useState<RepeatRule>('NONE');
  const [notes, setNotes] = useState('');
  const [colorTag, setColorTag] = useState(DOT_COLORS.REMINDER);
  const [selectedCalendarId, setSelectedCalendarId] = useState(defaultAccount?.id ?? 'local');
  const [customNotifEnabled, setCustomNotifEnabled] = useState(false);
  const [notifDateObj, setNotifDateObj] = useState(new Date());

  useEffect(() => {
    if (!existingEntry) return;

    setTitle(existingEntry.title);
    setDateObj(new Date(`${existingEntry.date}T12:00:00`));
    setTimeObj(new Date(`${existingEntry.date}T${existingEntry.time}:00`));
    setRepeat(existingEntry.repeat);
    setNotes(existingEntry.notes ?? '');
    setColorTag(existingEntry.colorTag);
    setSelectedCalendarId(existingEntry.accountId);
    if (existingEntry.notificationTime) {
      setCustomNotifEnabled(true);
      setNotifDateObj(new Date(existingEntry.notificationTime));
    }
  }, [existingEntry]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    const dateStr = dateObj.toISOString().split('T')[0];
    const timeStr = timeObj.toTimeString().slice(0, 5);

    if (!isEditing && selectedCalendarId.startsWith('os_')) {
      const osId = selectedCalendarId.replace('os_', '');
      try {
        const start = timeObj;
        const end = new Date(timeObj.getTime() + 15 * 60000);
        await Calendar.createEventAsync(osId, {
          title: `[Reminder] ${title.trim()}`,
          startDate: start,
          endDate: end,
          allDay: false,
          notes,
        });
      } catch (e) {
        console.warn('Failed to sync to Device calendar', e);
      }
    }

    const payload = {
      type: 'REMINDER',
      title: title.trim(),
      date: dateStr,
      time: timeStr,
      repeat,
      notified: existingEntry?.notified ?? false,
      notes: notes.trim() || undefined,
      colorTag,
      accountId: selectedCalendarId,
      notificationTime: customNotifEnabled ? notifDateObj.toISOString() : undefined,
    };

    if (existingEntry) {
      updateEntry(existingEntry.id, payload);
    } else {
      addEntry(payload);
    }

    haptics.success();
    router.back();
  }, [title, dateObj, timeObj, repeat, notes, colorTag, selectedCalendarId, isEditing, existingEntry, updateEntry, addEntry, haptics, router]);

  const repeatOptions: { value: RepeatRule; label: string; icon: string }[] = [
    { value: 'NONE', label: 'Never', icon: '✕' },
    { value: 'DAILY', label: 'Daily', icon: 'D' },
    { value: 'WEEKLY', label: 'Weekly', icon: 'W' },
    { value: 'MONTHLY', label: 'Monthly', icon: 'M' },
    { value: 'YEARLY', label: 'Yearly', icon: 'Y' },
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
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>{isEditing ? 'Edit Reminder' : 'New Reminder'}</Text>
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
        <FormDateTimePicker
          mode="date"
          value={dateObj}
          onChange={setDateObj}
          style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.compact }}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>TIME</Text>
        <FormDateTimePicker
          mode="time"
          value={timeObj}
          onChange={setTimeObj}
          style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.compact }}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>SYNC CALENDAR</Text>
        <CalendarPicker value={selectedCalendarId} onChange={(id) => setSelectedCalendarId(id)} />

        <View style={styles.notifHeader}>
          <Text style={[TypeScale.labelMedium, { color: colors.onSurfaceVariant }]}>PREFERRED NOTIFICATION</Text>
          <Switch
            value={customNotifEnabled}
            onValueChange={setCustomNotifEnabled}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={customNotifEnabled ? colors.onPrimary : colors.surface}
          />
        </View>
        {customNotifEnabled && (
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <FormDateTimePicker
                mode="date"
                value={notifDateObj}
                onChange={(d) => {
                  const newDate = new Date(notifDateObj);
                  newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
                  setNotifDateObj(newDate);
                }}
                style={{ marginLeft: Spacing.base, marginRight: Spacing.small, marginBottom: Spacing.compact }}
              />
            </View>
            <View style={styles.timeField}>
              <FormDateTimePicker
                mode="time"
                value={notifDateObj}
                onChange={(t) => {
                  const newDate = new Date(notifDateObj);
                  newDate.setHours(t.getHours(), t.getMinutes());
                  setNotifDateObj(newDate);
                }}
                style={{ marginRight: Spacing.base, marginLeft: Spacing.small, marginBottom: Spacing.compact }}
              />
            </View>
          </View>
        )}
        <Text style={[TypeScale.bodySmall, styles.helpText, { color: colors.onSurfaceVariant }]}>
          Default 10 min before
        </Text>

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
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.small,
  },
  helpText: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.small,
    marginTop: -4,
  },
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
