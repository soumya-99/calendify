import { Divider } from '@/src/components/ui/Divider';
import { useNotificationSettings } from '@/src/hooks/useNotificationSettings';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ShapeScale } from '@/src/theme/motion';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import { Bell, Cake, CalendarPlus, Info } from 'lucide-react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

export interface NotificationSettingsSheetRef {
  open: () => void;
  close: () => void;
}

const NotificationSettingsSheet = forwardRef<NotificationSettingsSheetRef>((_, ref) => {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);

  const {
    masterEnabled,
    remindersEnabled,
    eventsEnabled,
    birthdaysEnabled,
    handleMasterToggle,
    handleRemindersToggle,
    handleEventsToggle,
    handleBirthdaysToggle,
  } = useNotificationSettings();

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const close = () => setVisible(false);

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
            Notifications
          </Text>

          <View style={[styles.masterRow, { backgroundColor: masterEnabled ? `${colors.primary}10` : colors.surfaceVariant }]}>
            <View style={styles.masterInfo}>
              <Text style={[TypeScale.titleMedium, { color: masterEnabled ? colors.primary : colors.onSurface }]}>
                Allow Notifications
              </Text>
              <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                Global switch for all alerts
              </Text>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: colors.outline, true: colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : (masterEnabled ? colors.onPrimary : colors.surface)}
            />
          </View>

          <View style={[styles.optionsList, { backgroundColor: colors.background, opacity: masterEnabled ? 1 : 0.5 }]} pointerEvents={masterEnabled ? 'auto' : 'none'}>
            <View style={styles.optionRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FFB30020' }]}>
                <Bell size={20} color="#FFB300" strokeWidth={2} />
              </View>
              <View style={styles.optionText}>
                <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>Reminders</Text>
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Alerts for your to-dos</Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={handleRemindersToggle}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : (remindersEnabled ? colors.onPrimary : colors.surface)}
              />
            </View>

            <Divider inset />

            <View style={styles.optionRow}>
              <View style={[styles.iconBox, { backgroundColor: '#1E88E520' }]}>
                <CalendarPlus size={20} color="#1E88E5" strokeWidth={2} />
              </View>
              <View style={styles.optionText}>
                <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>Events</Text>
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Desired time of notification</Text>
              </View>
              <Switch
                value={eventsEnabled}
                onValueChange={handleEventsToggle}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : (eventsEnabled ? colors.onPrimary : colors.surface)}
              />
            </View>

            <Divider inset />

            <View style={styles.optionRow}>
              <View style={[styles.iconBox, { backgroundColor: '#E64A1920' }]}>
                <Cake size={20} color="#E64A19" strokeWidth={2} />
              </View>
              <View style={styles.optionText}>
                <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>Birthdays</Text>
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Morning of the special day</Text>
              </View>
              <Switch
                value={birthdaysEnabled}
                onValueChange={handleBirthdaysToggle}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : (birthdaysEnabled ? colors.onPrimary : colors.surface)}
              />
            </View>
          </View>

          {!masterEnabled && (
            <View style={styles.infoBox}>
              <Info size={16} color={colors.onSurfaceVariant} />
              <Text style={[TypeScale.bodySmall, styles.infoText, { color: colors.onSurfaceVariant }]}>
                Enable the master switch to configure alerts
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
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

export default NotificationSettingsSheet;
