import React, { useState, useRef, useEffect } from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { HapticButton } from './HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';

export function FormDateTimePicker({ mode, value, onChange, style }: { mode: 'date' | 'time' | 'datetime', value: Date, onChange: (d: Date) => void, style?: any }) {
  const colors = useThemeColors();
  const [show, setShow] = useState(Platform.OS === 'ios');
  const isPickerOpen = useRef(false);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android' && isPickerOpen.current) {
        try {
          // 'datetime' mode on Android usually maps to 'date' or 'time' internally depending on picker choice,
          // but we dismiss the base mode passed in.
          DateTimePickerAndroid.dismiss(mode === 'datetime' ? 'date' : mode);
        } catch (_) {}
      }
    };
  }, [mode]);

  const openAndroidPicker = () => {
    isPickerOpen.current = true;
    DateTimePickerAndroid.open({
      value,
      onChange: (event, selectedDate) => {
        isPickerOpen.current = false;
        if (event.type === 'set' && selectedDate) {
          onChange(selectedDate);
        }
      },
      mode: mode === 'datetime' ? 'date' : mode,
      display: 'default',
    });
  };

  const formatted = mode === 'date' 
    ? value.toISOString().split('T')[0] 
    : mode === 'time'
      ? value.toTimeString().slice(0, 5)
      : value.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

  return (
    <>
      {Platform.OS !== 'ios' && (
        <HapticButton
          onPress={openAndroidPicker}
          hapticStyle="selection"
          style={[styles.btn, { backgroundColor: colors.surfaceVariant }, style]}
        >
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>{formatted}</Text>
        </HapticButton>
      )}

      {Platform.OS === 'ios' && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) onChange(selectedDate);
          }}
          themeVariant="light"
          style={[styles.iosPicker, style]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderRadius: 12,
  },
  iosPicker: {
    alignSelf: 'flex-start',
    marginLeft: Spacing.base,
    marginBottom: Spacing.compact,
  }
});
