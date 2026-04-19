import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { ChevronLeft } from 'lucide-react-native';

export default function AddBirthdayScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const haptics = useHaptics();
  const addEntry = useEventsStore((s) => s.addEntry);
  const defaultAccount = useAccountsStore((s) => s.getDefaultAccount());
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const [personName, setPersonName] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [birthYear, setBirthYear] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = useCallback(() => {
    if (!personName.trim()) return;
    addEntry({
      type: 'BIRTHDAY',
      title: `${personName.trim()}'s Birthday`,
      personName: personName.trim(),
      date,
      birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
      notes: notes.trim() || undefined,
      colorTag: DOT_COLORS.BIRTHDAY,
      accountId: defaultAccount?.id ?? 'local',
    });
    haptics.success();
    router.back();
  }, [personName, date, birthYear, notes, defaultAccount, addEntry, haptics, router]);

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
          <Text style={[TypeScale.titleLarge, { color: colors.onBackground }]}>New Birthday</Text>
          <HapticButton onPress={handleSave} hapticStyle="heavy" style={styles.saveButton}>
            <Text style={[TypeScale.labelLarge, { color: colors.primary }]}>Save</Text>
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
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.onSurfaceVariant}
          value={date}
          onChangeText={setDate}
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
  saveButton: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.small },
  input: {
    borderRadius: ShapeScale.small.borderRadius, paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact, marginHorizontal: Spacing.base, marginBottom: Spacing.compact, fontSize: 16,
  },
  titleInput: { fontSize: 20, paddingVertical: Spacing.base },
  notesInput: { minHeight: 100 },
  fieldLabel: { paddingHorizontal: Spacing.base, marginTop: Spacing.base, marginBottom: Spacing.small },
});
