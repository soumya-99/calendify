import React from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { TypeScale } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { ShapeScale } from '@/src/theme/motion';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { Bell, CalendarPlus, CheckSquare, Cake, ChevronRight } from 'lucide-react-native';
import { DOT_COLORS } from '@/src/constants/dotColors';

interface AddEntrySheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'reminder' | 'task' | 'event' | 'birthday') => void;
}

export function AddEntrySheet({ visible, onClose, onSelect }: AddEntrySheetProps) {
  const colors = useThemeColors();

  const options = [
    { type: 'event' as const, icon: CalendarPlus, label: 'Event', subtitle: 'Schedule a meeting or appointment', color: DOT_COLORS.EVENT },
    { type: 'reminder' as const, icon: Bell, label: 'Reminder', subtitle: 'Set a time-based alert', color: DOT_COLORS.REMINDER },
    { type: 'task' as const, icon: CheckSquare, label: 'Task', subtitle: 'Track a to-do with priority', color: DOT_COLORS.TASK },
    { type: 'birthday' as const, icon: Cake, label: 'Birthday', subtitle: 'Remember someone special', color: DOT_COLORS.BIRTHDAY },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.backdropInner} />
      </Pressable>
      <View style={styles.sheetContainer}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[TypeScale.titleLarge, styles.sheetTitle, { color: colors.onSurface }]}>
            Create New
          </Text>
          <View style={styles.optionsList}>
            {options.map((opt, index) => {
              const Icon = opt.icon;
              return (
                <HapticButton
                  key={opt.type}
                  hapticStyle="medium"
                  onPress={() => onSelect(opt.type)}
                  style={[
                    styles.optionRow,
                    index < options.length - 1 ? {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: `${colors.outlineVariant}60`,
                    } : {},
                  ]}
                  accessibilityLabel={`Add ${opt.label}`}
                  accessibilityRole="button"
                >
                  <View style={[styles.iconCircle, { backgroundColor: `${opt.color}18` }]}>
                    <Icon size={22} color={opt.color} strokeWidth={1.75} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>
                      {opt.label}
                    </Text>
                    <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                      {opt.subtitle}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.onSurfaceVariant} strokeWidth={1.5} />
                </HapticButton>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
    paddingTop: Spacing.compact,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.section,
  },
  sheetTitle: {
    paddingHorizontal: Spacing.small,
    marginBottom: Spacing.base,
  },
  optionsList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.small,
    gap: Spacing.compact,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
