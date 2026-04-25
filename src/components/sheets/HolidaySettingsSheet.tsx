import { Divider } from '@/src/components/ui/Divider';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { HolidayService } from '@/src/services/HolidayService';
import { useNotificationStore } from '@/src/stores/useNotificationStore';
import { ShapeScale } from '@/src/theme/motion';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import * as Localization from 'expo-localization';
import { Check, Globe, Info } from 'lucide-react-native';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export interface HolidaySettingsSheetRef {
  open: () => void;
  close: () => void;
}

const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳', desc: 'Public holidays and observances' },
  { code: 'US', name: 'United States', flag: '🇺🇸', desc: 'Federal holidays' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', desc: 'Bank holidays and public events' },
];

const HolidaySettingsSheet = forwardRef<HolidaySettingsSheetRef>((_, ref) => {
  const colors = useThemeColors();
  const haptics = useHaptics();
  const [visible, setVisible] = useState(false);

  const {
    holidaysEnabled,
    holidayCountry,
    setHolidaysEnabled,
    setHolidayCountry,
  } = useNotificationStore();

  const detectedCountry = useMemo(() => Localization.getLocales()[0]?.regionCode ?? 'IN', []);

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const close = () => setVisible(false);

  const handleToggle = useCallback(async (val: boolean) => {
    haptics.selection();
    setHolidaysEnabled(val);
    setTimeout(() => HolidayService.syncHolidays(), 0);
  }, [haptics, setHolidaysEnabled]);

  const selectCountry = useCallback((code: string) => {
    haptics.light();
    setHolidayCountry(code);
    if (holidaysEnabled) {
      setTimeout(() => HolidayService.syncHolidays(), 0);
    }
  }, [haptics, setHolidayCountry, holidaysEnabled]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <View />
      </Pressable>
      <View style={styles.container}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />

          <Text style={[TypeScale.titleLarge, styles.title, { color: colors.onSurface }]}>
            Regional Holidays
          </Text>

          <View style={[styles.masterRow, { backgroundColor: holidaysEnabled ? `${colors.primary}10` : colors.surfaceVariant }]}>
            <View style={styles.masterInfo}>
              <Text style={[TypeScale.titleMedium, { color: holidaysEnabled ? colors.primary : colors.onSurface }]}>
                Enable Holidays
              </Text>
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                Detected region: {detectedCountry}
              </Text>
            </View>
            <Switch
              value={holidaysEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : (holidaysEnabled ? colors.onPrimary : colors.surface)}
            />
          </View>

          <View style={[styles.optionsList, { backgroundColor: colors.background, opacity: holidaysEnabled ? 1 : 0.5 }]} pointerEvents={holidaysEnabled ? 'auto' : 'none'}>
            {COUNTRIES.map((country, index) => {
              const isSelected = holidayCountry === country.code || (!holidayCountry && country.code === detectedCountry);
              return (
                <React.Fragment key={country.code}>
                  {index > 0 && <Divider inset />}
                  <HapticButton
                    onPress={() => selectCountry(country.code)}
                    style={styles.optionRow}
                  >
                    <View style={[styles.flagBox, { backgroundColor: isSelected ? `${colors.primary}15` : colors.surfaceVariant }]}>
                      <Text style={styles.flag}>{country.flag}</Text>
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>{country.name}</Text>
                      <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>{country.desc}</Text>
                    </View>
                    {isSelected && (
                      <Check size={20} color={colors.primary} strokeWidth={2.5} />
                    )}
                  </HapticButton>
                </React.Fragment>
              );
            })}
          </View>

          {!holidaysEnabled && (
            <View style={styles.infoBox}>
              <Info size={16} color={colors.onSurfaceVariant} />
              <Text style={[TypeScale.bodySmall, styles.infoText, { color: colors.onSurfaceVariant }]}>
                Turn on the switch to see holidays in calendar
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  container: {
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
  title: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.small,
    textAlign: 'center',
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: ShapeScale.large.borderRadius,
    marginBottom: Spacing.base,
  },
  masterInfo: {
    flex: 1,
  },
  optionsList: {
    borderRadius: ShapeScale.large.borderRadius,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
  },
  flagBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  flag: {
    fontSize: 20,
  },
  optionText: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  infoText: {
    marginLeft: Spacing.small,
  },
});

export default HolidaySettingsSheet;
