import { StyleSheet, View, Text, TextInput } from 'react-native';

import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { KeyboardAwareFormScrollView } from '@/src/components/ui/KeyboardAwareFormScrollView';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useHaptics } from '@/src/hooks/useHaptics';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { DOT_COLORS } from '@/src/constants/dotColors';
import { FormDateTimePicker } from '@/src/components/ui/FormDateTimePicker';
import type { Birthday } from '@/src/types/entries';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

export default function AddBirthdayScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const colors = useThemeColors();

  const router = useRouter();
  const haptics = useHaptics();
  const addEntry = useEventsStore((s) => s.addEntry);
  const updateEntry = useEventsStore((s) => s.updateEntry);
  const entries = useEventsStore((s) => s.entries);
  const defaultAccount = useAccountsStore((s) => s.getDefaultAccount());
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const existingEntry = useMemo(
    () => entries.find((entry): entry is Birthday => entry.id === (id ?? '') && entry.type === 'BIRTHDAY'),
    [entries, id]
  );
  const isEditing = !!existingEntry;

  const [personName, setPersonName] = useState('');
  const [dateObj, setDateObj] = useState(new Date(`${selectedDate}T12:00:00`));
  const [birthYear, setBirthYear] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!existingEntry) return;

    setPersonName(existingEntry.personName);
    setDateObj(new Date(`${existingEntry.date}T12:00:00`));
    setBirthYear(existingEntry.birthYear ? String(existingEntry.birthYear) : '');
    setNotes(existingEntry.notes ?? '');
  }, [existingEntry]);

  const handleSave = useCallback(() => {
    if (!personName.trim()) return;

    const date = dateObj.toISOString().split('T')[0];
    const payload = {
      type: 'BIRTHDAY',
      title: `${personName.trim()}'s Birthday`,
      personName: personName.trim(),
      date,
      birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
      notes: notes.trim() || undefined,
      colorTag: DOT_COLORS.BIRTHDAY,
      accountId: existingEntry?.accountId ?? defaultAccount?.id ?? 'local',
    };

    if (existingEntry) {
      updateEntry(existingEntry.id, payload);
    } else {
      addEntry(payload);
    }

    haptics.success();
    router.back();
  }, [personName, dateObj, birthYear, notes, existingEntry, defaultAccount, updateEntry, addEntry, haptics, router]);

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <KeyboardAwareFormScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <HapticButton onPress={() => router.back()} hapticStyle="light" style={styles.backButton}>
            <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
          </HapticButton>
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>{isEditing ? 'Edit Birthday' : 'New Birthday'}</Text>
          <HapticButton onPress={handleSave} hapticStyle="heavy" style={[styles.saveButton, { backgroundColor: colors.primary }]}>
            <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Save</Text>
          </HapticButton>
        </View>

        <TextInput
          style={[styles.input, styles.titleInput, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="Person's name"
          placeholderTextColor={colors.onSurfaceVariant}
          value={personName}
          onChangeText={setPersonName}
          autoFocus
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
          BIRTHDAY DATE
        </Text>
        <FormDateTimePicker
          mode="date"
          value={dateObj}
          onChange={setDateObj}
          style={{ marginHorizontal: Spacing.base, marginBottom: Spacing.compact }}
        />

        <Text style={[TypeScale.labelMedium, styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
          BIRTH YEAR (optional)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="e.g. 1995"
          placeholderTextColor={colors.onSurfaceVariant}
          value={birthYear}
          onChangeText={setBirthYear}
          keyboardType="numeric"
        />

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
  saveButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 9999 },
  input: {
    borderRadius: ShapeScale.small.borderRadius, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact, marginHorizontal: Spacing.base, marginBottom: Spacing.compact, fontSize: 16,
  },
  titleInput: { fontSize: 20, paddingVertical: Spacing.base },
  notesInput: { minHeight: 100 },
  fieldLabel: { paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.small },
});
