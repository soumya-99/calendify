import { HapticButton } from '@/src/components/ui/HapticButton';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import { getMonthName } from '@/src/utils/dateHelpers';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onTitlePress?: () => void;
  onJumpToDate?: (dateStr: string, month: number, year: number) => void;
}

export function CalendarHeader({ month, year, onPrev, onNext, onJumpToDate }: CalendarHeaderProps) {
  const colors = useThemeColors();
  const monthName = getMonthName(month);

  const [showModal, setShowModal] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date(year, month, 1));
  const isPickerOpen = useRef(false);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'android' && isPickerOpen.current) {
        try {
          DateTimePickerAndroid.dismiss('date');
        } catch (_) { }
      }
    };
  }, []);

  const handleTitlePress = () => {
    const d = new Date(year, month, 1);
    setPickerDate(d);
    if (Platform.OS === 'android') {
      isPickerOpen.current = true;
      DateTimePickerAndroid.open({
        value: d,
        mode: 'date',
        display: 'calendar',
        onChange: handleAndroidChange,
        onError: () => { isPickerOpen.current = false; },
      });
    } else {
      setShowModal(true);
    }
  };

  const handleAndroidChange = (event: any, selected?: Date) => {
    isPickerOpen.current = false;
    if (event.type === 'set' && selected && onJumpToDate) {
      const y = selected.getFullYear();
      const m = selected.getMonth();
      const d = String(selected.getDate()).padStart(2, '0');
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${d}`;
      onJumpToDate(dateStr, m, y);
    }
  };

  // iOS: inline calendar inside modal, confirm on "Go"
  const handleIOSChange = (_: any, d?: Date) => {
    if (d) setPickerDate(d);
  };

  const handleIOSConfirm = () => {
    setShowModal(false);
    if (onJumpToDate) {
      const y = pickerDate.getFullYear();
      const m = pickerDate.getMonth();
      const d = String(pickerDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${d}`;
      onJumpToDate(dateStr, m, y);
    }
  };

  return (
    <View style={styles.container}>
      <HapticButton
        onPress={onPrev}
        hapticStyle="light"
        style={styles.navButton}
        accessibilityLabel="Previous month"
        accessibilityRole="button"
      >
        <ChevronLeft size={24} color={colors.onSurface} strokeWidth={1.75} />
      </HapticButton>

      <HapticButton
        onPress={handleTitlePress}
        hapticStyle="selection"
        style={styles.titleContainer}
        accessibilityRole="button"
        accessibilityLabel={`${monthName} ${year}, tap to jump to any month`}
      >
        <Text style={[TypeScale.headlineMedium, { color: colors.onBackground }]}>
          {monthName} {year}
        </Text>
        <ChevronDown size={14} color={colors.onSurfaceVariant} strokeWidth={2} style={{ marginLeft: 4, marginTop: 2 }} />
      </HapticButton>

      <HapticButton
        onPress={onNext}
        hapticStyle="light"
        style={styles.navButton}
        accessibilityLabel="Next month"
        accessibilityRole="button"
      >
        <ChevronRight size={24} color={colors.onSurface} strokeWidth={1.75} />
      </HapticButton>

      {/* iOS: inline calendar inside a bottom sheet modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setShowModal(false)} />
          <View style={[styles.iosSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleMedium, { color: colors.onSurface, textAlign: 'center', marginBottom: Spacing.small }]}>
              Jump to Month
            </Text>
            {/* display="inline" renders a full swipeable calendar grid on iOS */}
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="inline"
              onChange={handleIOSChange}
              themeVariant="light"
              accentColor={colors.primary}
              style={styles.inlinePicker}
            />
            <View style={styles.btnRow}>
              <HapticButton
                onPress={() => setShowModal(false)}
                hapticStyle="light"
                style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant }]}
              >
                <Text style={[TypeScale.labelLarge, { color: colors.onSurfaceVariant }]}>Cancel</Text>
              </HapticButton>
              <HapticButton
                onPress={handleIOSConfirm}
                hapticStyle="heavy"
                style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 2 }]}
              >
                <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Go</Text>
              </HapticButton>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.compact,
    marginBottom: Spacing.small,
  },
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  iosSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.base,
    paddingBottom: 44,
    paddingTop: Spacing.compact,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  inlinePicker: {
    alignSelf: 'stretch',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.compact,
    marginTop: Spacing.base,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
});
