import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import * as Calendar from 'expo-calendar';
import { ChevronDown } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HapticButton } from './HapticButton';

interface CalendarPickerProps {
  value: string;
  onChange: (id: string, isOS: boolean, calDetails?: any) => void;
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const colors = useThemeColors();
  const accounts = useAccountsStore((s) => s.accounts);
  const [deviceCalendars, setDeviceCalendars] = useState<Calendar.Calendar[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        setDeviceCalendars(calendars.filter((c) => c.allowsModifications));
      }
    })();
  }, []);

  const getActiveData = () => {
    if (value.startsWith('os_')) {
      const id = value.replace('os_', '');
      const cal = deviceCalendars.find((c) => c.id === id);
      return { title: cal?.title || 'Device Calendar', color: cal?.color || colors.primary };
    } else {
      const acc = accounts.find((a) => a.id === value);
      return { title: acc?.displayName || 'Local Account', color: acc?.avatarColor || colors.primary };
    }
  };

  const active = getActiveData();

  return (
    <>
      <HapticButton
        onPress={() => setVisible(true)}
        hapticStyle="selection"
        style={[styles.pickerBtn, { backgroundColor: colors.surfaceVariant }]}
      >
        <View style={[styles.dot, { backgroundColor: active.color }]} />
        <Text style={[TypeScale.bodyLarge, { flex: 1, color: colors.onSurface }]}>Sync to: {active.title}</Text>
        <ChevronDown size={20} color={colors.onSurfaceVariant} />
      </HapticButton>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)} />
        <View style={styles.modalContainer} pointerEvents="box-none">
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
              Select Calendar
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1, paddingBottom: Spacing.base }}>
              <Text style={[TypeScale.labelSmall, { color: colors.onSurfaceVariant, paddingHorizontal: 12, marginTop: 12 }]}>LOCAL ACCOUNTS</Text>
              {accounts.map((acc) => (
                <HapticButton
                  key={acc.id}
                  onPress={() => {
                    onChange(acc.id, false);
                    setVisible(false);
                  }}
                  hapticStyle="selection"
                  style={[styles.optionRow, value === acc.id ? { backgroundColor: `${colors.primary}10` } : {}]}
                >
                  <View style={[styles.dot, { backgroundColor: acc.avatarColor }]} />
                  <Text style={[TypeScale.bodyLarge, { flex: 1, color: colors.onSurface }]}>{acc.displayName}</Text>
                </HapticButton>
              ))}

              {deviceCalendars.length > 0 && (
                <>
                  <Text style={[TypeScale.labelSmall, { color: colors.onSurfaceVariant, paddingHorizontal: 12, marginTop: 16 }]}>GOOGLE & APPLE CALENDARS</Text>
                  {deviceCalendars.map((cal) => (
                    <HapticButton
                      key={cal.id}
                      onPress={() => {
                        onChange(`os_${cal.id}`, true, cal);
                        setVisible(false);
                      }}
                      hapticStyle="selection"
                      style={[styles.optionRow, value === `os_${cal.id}` ? { backgroundColor: `${colors.primary}10` } : {}]}
                    >
                      <View style={[styles.dot, { backgroundColor: cal.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[TypeScale.bodyMedium, { color: colors.onSurface }]} numberOfLines={1}>{cal.title}</Text>
                        <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]} numberOfLines={1}>{cal.source.name}</Text>
                      </View>
                    </HapticButton>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.compact,
    borderRadius: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
    paddingTop: Spacing.compact,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.section,
  },
  modalTitle: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.small,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.compact,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
});
