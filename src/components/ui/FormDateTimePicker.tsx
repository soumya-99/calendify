import React, { useState } from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HapticButton } from './HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';

export function FormDateTimePicker({ mode, value, onChange, style }: { mode: 'date' | 'time', value: Date, onChange: (d: Date) => void, style?: any }) {
  const colors = useThemeColors();
  const [show, setShow] = useState(Platform.OS === 'ios');

  const formatted = mode === 'date' 
    ? value.toISOString().split('T')[0] 
    : value.toTimeString().slice(0, 5);

  return (
    <>
      {Platform.OS !== 'ios' && (
        <HapticButton
          onPress={() => setShow(true)}
          hapticStyle="selection"
          style={[styles.btn, { backgroundColor: colors.surfaceVariant }, style]}
        >
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>{formatted}</Text>
        </HapticButton>
      )}

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onValueChange={(event, selectedDate) => {
            if (Platform.OS === 'android') setShow(false);
            if (selectedDate) onChange(selectedDate);
          }}
          onDismiss={() => {
            if (Platform.OS === 'android') setShow(false);
          }}
          themeVariant="light"
          style={Platform.OS === 'ios' ? [styles.iosPicker, style] : undefined}
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
