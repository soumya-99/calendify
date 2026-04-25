import { useLoaderStore } from '@/app/_layout';
import NotificationSettingsSheet, {
  type NotificationSettingsSheetRef,
} from '@/src/components/sheets/NotificationSettingsSheet';
import { AnimatedScreen } from '@/src/components/ui/AnimatedScreen';
import { Avatar } from '@/src/components/ui/Avatar';
import { Divider } from '@/src/components/ui/Divider';
import { HapticButton } from '@/src/components/ui/HapticButton';
import { SectionHeader } from '@/src/components/ui/SectionHeader';
import { SettingsRow } from '@/src/components/ui/SettingsRow';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAccountsStore } from '@/src/stores/useAccountsStore';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useNotificationStore } from '@/src/stores/useNotificationStore';
import { useThemeStore } from '@/src/stores/useThemeStore';
import { Spacing } from '@/src/theme/spacing';
import { TypeScale } from '@/src/theme/typography';
import type { Account } from '@/src/types/accounts';
import type { ColorSchemeChoice, ThemeMode } from '@/src/types/theme';
import {
  CALENDIFY_BACKUP_FILENAME,
  createEncryptedBackup,
  isCalendifyBackupFile,
  parseEncryptedBackup,
} from '@/src/utils/encryptedBackup';
import * as Calendar from 'expo-calendar';
import Constants from 'expo-constants';
import * as Contacts from 'expo-contacts';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Cake,
  CalendarPlus,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Download,
  Info,
  Moon,
  Palette,
  Plus,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Users,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_COLORS = {
  theme: '#5C6BC0',
  palette: '#AB47BC',
  exportCalendify: '#26A69A',
  importCalendify: '#42A5F5',
  exportIcs: '#66BB6A',
  importIcs: '#FFA726',
  version: '#78909C',
  privacy: '#EF5350',
};

const COLOR_SCHEME_OPTIONS: { value: ColorSchemeChoice; label: string; swatch: string }[] = [
  { value: 'default', label: 'Teal', swatch: '#4CAF9A' },
  { value: 'blue', label: 'Blue', swatch: '#1A73E8' },
  { value: 'red', label: 'Red', swatch: '#D93025' },
  { value: 'yellow', label: 'Yellow', swatch: '#F9AB00' },
  { value: 'orange', label: 'Orange', swatch: '#FA7B17' },
  { value: 'purple', label: 'Purple', swatch: '#A142F4' },
  { value: 'green', label: 'Green', swatch: '#34A853' },
];

// Make the background a much lighter, less dull version of the color
const getLightBackground = (colorHex: string) => `${colorHex}15`;

const AccordionItem = ({
  calendars,
  onPress,
}: {
  calendars: Calendar.Calendar[];
  onPress: (cal: Calendar.Calendar) => void;
}) => {
  const colors = useThemeColors();
  const haptics = useHaptics();
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);

  const toggle = () => {
    haptics.selection();
    setExpanded(!expanded);
    progress.value = withTiming(!expanded ? 1 : 0, { duration: 250, easing: Easing.inOut(Easing.ease) });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
  }));

  const heightStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(progress.value, [0, 1], [0, calendars.length * 70]),
    opacity: progress.value,
  }));

  if (calendars.length === 1) {
    const cal = calendars[0];
    return (
      <HapticButton onPress={() => onPress(cal)} style={styles.calendarRow}>
        <View style={[styles.calDot, { backgroundColor: cal.color || '#8E8E93' }]} />
        <View style={styles.accountInfo}>
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>{cal.title}</Text>
          <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>{cal.source.name}</Text>
        </View>
        <ChevronDown size={18} color={colors.onSurfaceVariant} strokeWidth={1.5} style={{ transform: [{ rotate: '-90deg' }] }} />
      </HapticButton>
    );
  }

  return (
    <View>
      <HapticButton onPress={toggle} style={styles.calendarRow}>
        <View style={[styles.calDot, { backgroundColor: '#8E8E93' }]} />
        <View style={styles.accountInfo}>
          <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>Device Calendars</Text>
          <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>{calendars.length} calendars found</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={colors.onSurfaceVariant} strokeWidth={1.5} />
        </Animated.View>
      </HapticButton>
      <Animated.View style={[{ overflow: 'hidden' }, heightStyle]}>
        {calendars.map((cal) => (
          <View key={cal.id}>
            <Divider inset />
            <HapticButton onPress={() => onPress(cal)} style={styles.calendarRow}>
              <View style={[styles.calDot, { backgroundColor: cal.color || colors.primary }]} />
              <View style={styles.accountInfo}>
                <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>{cal.title}</Text>
                <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>{cal.source.name}</Text>
              </View>
              <ChevronDown size={18} color={colors.onSurfaceVariant} strokeWidth={1.5} style={{ transform: [{ rotate: '-90deg' }] }} />
            </HapticButton>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};


export default function SettingsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const notifSheetRef = useRef<NotificationSettingsSheetRef>(null);

  const themeMode = useThemeStore((s) => s.themeMode);
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const setColorScheme = useThemeStore((s) => s.setColorScheme);

  const accounts = useAccountsStore((s) => s.accounts);
  const addAccount = useAccountsStore((s) => s.addAccount);
  const deleteAccount = useAccountsStore((s) => s.deleteAccount);
  const importAccounts = useAccountsStore((s) => s.importAccounts);
  const setDefault = useAccountsStore((s) => s.setDefault);
  const entries = useEventsStore((s) => s.entries);
  const addEntry = useEventsStore((s) => s.addEntry);
  const clearAll = useEventsStore((s) => s.clearAll);
  const clearByType = useEventsStore((s) => s.clearByType);
  const importEntries = useEventsStore((s) => s.importEntries);
  const addEntries = useEventsStore((s) => s.addEntries);

  const { masterEnabled, remindersEnabled, eventsEnabled, birthdaysEnabled } = useNotificationStore();

  const activeNotifsCount = [remindersEnabled, eventsEnabled, birthdaysEnabled].filter(Boolean).length;
  const notifSummaryText = !masterEnabled
    ? 'Off'
    : activeNotifsCount === 3
      ? 'All on'
      : activeNotifsCount === 0
        ? 'All off'
        : `${activeNotifsCount} of 3 on`;


  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [addAccountVisible, setAddAccountVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  // Calendar action bottom sheet state
  const [calActionSheet, setCalActionSheet] = useState<{ visible: boolean; cal: Calendar.Calendar | null }>({
    visible: false,
    cal: null,
  });

  const openCalActionSheet = (cal: Calendar.Calendar) => {
    setCalActionSheet({ visible: true, cal });
  };
  const closeCalActionSheet = () => setCalActionSheet({ visible: false, cal: null });

  const [clearDataSheetVisible, setClearDataSheetVisible] = useState(false);
  const openClearDataSheet = () => setClearDataSheetVisible(true);
  const closeClearDataSheet = () => setClearDataSheetVisible(false);

  const [deviceCalendars, setDeviceCalendars] = useState<Calendar.Calendar[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        // Only get primary user calendars that can be modified
        const userCalendars = calendars.filter((c) => c.allowsModifications);
        setDeviceCalendars(userCalendars);
      }
    })();
  }, []);

  const uniqueCalendars = useMemo(() => {
    const seen = new Set<string>();
    return deviceCalendars.filter((cal) => {
      // Dedup by source name (email)
      const key = cal.source.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [deviceCalendars]);

  const themeLabels: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  const colorLabels: Record<ColorSchemeChoice, string> = {
    default: 'Teal',
    blue: 'Blue',
    red: 'Red',
    yellow: 'Yellow',
    orange: 'Orange',
    purple: 'Purple',
    green: 'Green',
  };

  const handleAddAccount = useCallback(() => {
    if (newEmail.trim() && newName.trim()) {
      addAccount(newEmail.trim(), newName.trim());
      haptics.success();
      setNewEmail('');
      setNewName('');
      setAddAccountVisible(false);
    }
  }, [newEmail, newName, addAccount, haptics]);

  const handleDeleteAccount = useCallback(
    (account: Account) => {
      if (account.isDefault) {
        Alert.alert('Default Account', 'Set another account as default before deleting this one.');
        return;
      }

      Alert.alert('Delete Account', `Delete "${account.email}"? Entries will remain.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            deleteAccount(account.id);
          },
        },
      ]);
    },
    [deleteAccount, haptics]
  );

  const handleSyncCalendar = useCallback(async (cal: Calendar.Calendar) => {
    try {
      Alert.alert('Sync Local to Calendar', `Do you want to save all your local events to ${cal.title}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sync',
          onPress: async () => {
            haptics.light();
            let syncCount = 0;
            for (const entry of entries) {
              if (entry.type === 'EVENT') {
                const startDate = new Date(`${entry.date}T${entry.startTime}:00`);
                const endDate = new Date(`${entry.date}T${entry.endTime}:00`);
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue;

                await Calendar.createEventAsync(cal.id, {
                  title: entry.title,
                  startDate,
                  endDate,
                  allDay: entry.allDay,
                  location: entry.location,
                  notes: entry.notes,
                });
                syncCount++;
              }
            }
            haptics.success();
            Alert.alert('Sync Complete', `Successfully synced ${syncCount} events to ${cal.title}.`);
          }
        }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to sync with calendar.');
    }
  }, [entries, haptics]);

  const handleImportFromCalendar = useCallback(async (cal: Calendar.Calendar) => {
    try {
      Alert.alert('Import from Device', `Fetch and save events from ${cal.title} into local records?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            useLoaderStore.getState().show?.();
            haptics.light();
            const start = new Date();
            start.setMonth(start.getMonth() - 2);
            const end = new Date();
            end.setFullYear(end.getFullYear() + 1);
            const osEvents = await Calendar.getEventsAsync([cal.id], start, end);
            
            const toImport = osEvents.map(ev => {
              const evDate = new Date(ev.startDate);
              const evEnd = new Date(ev.endDate);
              return {
                type: 'EVENT',
                title: ev.title || 'Untitled Event',
                date: evDate.toISOString().split('T')[0],
                startTime: evDate.toTimeString().slice(0, 5),
                endTime: evEnd.toTimeString().slice(0, 5),
                location: ev.location,
                allDay: ev.allDay,
                notes: ev.notes,
                colorTag: '#4285F4',
                accountId: 'local',
              };
            });

            if (toImport.length > 0) {
              await addEntries(toImport);
            }

            useLoaderStore.getState().hide?.();
            haptics.success();
            Alert.alert('Import Complete', `Successfully imported ${toImport.length} events from ${cal.title}.`);
          }
        }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to import from Device calendar');
    }
  }, [addEntries, haptics]);

  const handleImportBirthdays = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Contacts access is required to import birthdays.');
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.Birthday],
      });
      const contactsWithBirthdays = data.filter((c) => c.birthday);
      if (contactsWithBirthdays.length === 0) {
        Alert.alert('No Birthdays Found', 'None of your contacts have a birthday saved.');
        return;
      }
      Alert.alert(
        'Import Birthdays',
        `Found ${contactsWithBirthdays.length} contacts with birthdays. Import them?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            onPress: async () => {
              const defaultAccount = accounts.find((a) => a.isDefault);
              const toImport = contactsWithBirthdays.map(contact => {
                const bday = contact.birthday!;
                if (!bday.month || !bday.day) return null;
                const year = bday.year ?? new Date().getFullYear();
                const month = String(bday.month).padStart(2, '0');
                const day = String(bday.day).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                return {
                  type: 'BIRTHDAY',
                  title: contact.name || 'Unknown',
                  personName: contact.name || 'Unknown',
                  date: dateStr,
                  accountId: defaultAccount?.id ?? 'local',
                };
              }).filter((b): b is any => b !== null);

              if (toImport.length > 0) {
                await addEntries(toImport);
              }

              haptics.success();
              Alert.alert('Done', `Imported ${toImport.length} birthdays to your default account.`);
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to access contacts.');
    }
  }, [accounts, addEntries, haptics]);

  const handleExportData = useCallback(async () => {
    Alert.alert('Export Data', 'Do you want to export your current accounts and entries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          try {
            const encryptedBackup = createEncryptedBackup(accounts, entries);
            const file = new FileSystem.File(FileSystem.Paths.document, CALENDIFY_BACKUP_FILENAME);
            file.write(encryptedBackup);
            await Sharing.shareAsync(file.uri);
            haptics.success();
          } catch {
            Alert.alert('Error', 'Failed to export data.');
          }
        }
      }
    ]);
  }, [accounts, entries, haptics]);

  const handleImportData = useCallback(async () => {
    Alert.alert('Import Data', 'This will merge imported data into your current records. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Import',
        onPress: async () => {
          try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
            if (result.canceled) return;

            const asset = result.assets[0];
            const fileName = asset.name ?? asset.uri.split('/').pop() ?? '';

            if (!isCalendifyBackupFile(fileName)) {
              Alert.alert('Invalid File', 'Please select an encrypted .calendify backup file.');
              return;
            }

            const fileUri = asset.uri;
            const file = new FileSystem.File(fileUri);
            const content = await file.text();
            const parsed = parseEncryptedBackup(content);

            importEntries(parsed.entries);
            importAccounts(parsed.accounts);
            haptics.success();
            Alert.alert('Success', 'Data imported successfully.');
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Invalid file or failed to import.');
          }
        }
      }
    ]);
  }, [importEntries, importAccounts, haptics]);

  const handleClearData = useCallback(() => {
    openClearDataSheet();
  }, []);

  const SettingsIcon = ({ icon: Icon, color }: { icon: typeof Sun; color: string }) => (
    <View style={[styles.iconBg, { backgroundColor: getLightBackground(color) }]}>
      <Icon size={18} color={color} strokeWidth={1.75} />
    </View>
  );

  return (
    <AnimatedScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.base }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TypeScale.headlineMedium, styles.title, { color: colors.onBackground }]}>
          Settings
        </Text>

        {/* DEVICE CALENDARS */}
        {uniqueCalendars.length > 0 && (
          <>
            <SectionHeader title="DEVICE CALENDARS" />
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <AccordionItem calendars={uniqueCalendars} onPress={openCalActionSheet} />
            </View>
          </>
        )}

        {/* CONTACTS */}
        <SectionHeader title="CONTACTS" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon={<SettingsIcon icon={Users} color="#F06292" />}
            label="Import Birthdays"
            value="From Contacts"
            onPress={handleImportBirthdays}
          />
        </View>

        {/* ACCOUNTS */}
        <SectionHeader title="LOCAL ACCOUNTS" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {accounts.map((account, idx) => (
            <View key={account.id}>
              {idx > 0 && <Divider inset />}
              <HapticButton
                onPress={() => setDefault(account.id)}
                hapticStyle="selection"
                style={styles.accountRow}
              >
                <Avatar
                  initials={account.displayName.slice(0, 1)}
                  color={account.avatarColor}
                  size={40}
                />
                <View style={styles.accountInfo}>
                  <Text style={[TypeScale.bodyLarge, { color: colors.onSurface }]}>
                    {account.displayName}
                  </Text>
                  <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>
                    {account.email}
                  </Text>
                </View>
                {account.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}18` }]}>
                    <Text style={[TypeScale.labelSmall, { color: colors.primary }]}>Default</Text>
                  </View>
                )}
                {accounts.length > 1 && !account.isDefault && (
                  <HapticButton
                    onPress={(event) => {
                      event?.stopPropagation();
                      handleDeleteAccount(account);
                    }}
                    hapticStyle="medium"
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color={colors.error} strokeWidth={1.75} />
                  </HapticButton>
                )}
              </HapticButton>
            </View>
          ))}
          <HapticButton
            onPress={() => setAddAccountVisible(true)}
            hapticStyle="medium"
            style={styles.addAccountRow}
          >
            <View style={[styles.iconBg, { backgroundColor: getLightBackground(colors.primary) }]}>
              <Plus size={18} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[TypeScale.labelLarge, { color: colors.primary, flex: 1 }]} numberOfLines={1}>
              Add account
            </Text>
          </HapticButton>
        </View>

        {/* APPEARANCE */}
        <SectionHeader title="APPEARANCE" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon={<SettingsIcon icon={Smartphone} color={ICON_COLORS.theme} />}
            label="Theme"
            value={themeLabels[themeMode]}
            onPress={() => setThemePickerVisible(true)}
          />
          <Divider inset />
          <SettingsRow
            icon={<SettingsIcon icon={Palette} color={ICON_COLORS.palette} />}
            label="Color Scheme"
            value={colorLabels[colorScheme]}
            onPress={() => setColorPickerVisible(true)}
          />
        </View>

        {/* NOTIFICATIONS */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon={<SettingsIcon icon={Bell} color={colors.primary} />}
            label="Notification Preferences"
            value={notifSummaryText}
            onPress={() => notifSheetRef.current?.open()}
          />
        </View>

        <SectionHeader title="DATA MANAGEMENT" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon={<SettingsIcon icon={Upload} color={ICON_COLORS.exportCalendify} />}
            label="Export Data"
            value="Backup"
            onPress={handleExportData}
          />
          <Divider inset />
          <SettingsRow
            icon={<SettingsIcon icon={Download} color={ICON_COLORS.importCalendify} />}
            label="Import Data"
            value="Restore"
            onPress={handleImportData}
          />
          <Divider inset />
          <SettingsRow
            icon={<SettingsIcon icon={Trash2} color={colors.error} />}
            label="Clear Data"
            value="Delete"
            onPress={handleClearData}
          />
        </View>

        {/* ABOUT */}
        <SectionHeader title="ABOUT" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon={<SettingsIcon icon={Info} color={ICON_COLORS.version} />}
            label="Version"
            value={Constants.expoConfig?.version || '1.0.0'}
          />
          <Divider inset />
          <SettingsRow
            icon={<SettingsIcon icon={Shield} color={ICON_COLORS.privacy} />}
            label="Privacy"
            value="Data stored locally"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Theme Picker Modal */}
      <Modal visible={themePickerVisible} transparent animationType="fade" onRequestClose={() => setThemePickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setThemePickerVisible(false)}>
          <View />
        </Pressable>
        <View style={styles.modalContainer}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
              Theme
            </Text>
            {([['system', Smartphone, 'Follow system'], ['light', Sun, 'Light'], ['dark', Moon, 'Dark']] as const).map(([mode, TheIcon, modeLabel]) => (
              <HapticButton
                key={mode}
                onPress={() => {
                  setThemeMode(mode as ThemeMode);
                  setThemePickerVisible(false);
                  haptics.selection();
                }}
                hapticStyle="selection"
                style={[
                  styles.optionRow,
                  themeMode === mode ? { backgroundColor: `${colors.primary}10` } : {},
                ]}
              >
                <View style={[styles.iconBg, { backgroundColor: getLightBackground(ICON_COLORS.theme) }]}>
                  <TheIcon size={18} color={ICON_COLORS.theme} strokeWidth={1.75} />
                </View>
                <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, flex: 1 }]}>
                  {modeLabel}
                </Text>
                {themeMode === mode && (
                  <CheckCircle2 size={20} color={colors.primary} strokeWidth={1.75} />
                )}
              </HapticButton>
            ))}
          </View>
        </View>
      </Modal>

      {/* Color Scheme Picker Modal */}
      <Modal visible={colorPickerVisible} transparent animationType="fade" onRequestClose={() => setColorPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setColorPickerVisible(false)}>
          <View />
        </Pressable>
        <View style={styles.modalContainer}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
              Color Scheme
            </Text>
            {COLOR_SCHEME_OPTIONS.map(({ value, label, swatch }) => (
              <HapticButton
                key={value}
                onPress={() => {
                  setColorScheme(value);
                  setColorPickerVisible(false);
                  haptics.selection();
                }}
                hapticStyle="selection"
                style={[
                  styles.optionRow,
                  colorScheme === value ? { backgroundColor: `${colors.primary}10` } : {},
                ]}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: swatch },
                  ]}
                />
                <Text style={[TypeScale.bodyLarge, { color: colors.onSurface, flex: 1 }]}>
                  {label}
                </Text>
                {colorScheme === value && (
                  <CheckCircle2 size={20} color={colors.primary} strokeWidth={1.75} />
                )}
              </HapticButton>
            ))}
          </View>
        </View>
      </Modal>

      {/* Add Account Modal */}
      <Modal visible={addAccountVisible} transparent animationType="fade" onRequestClose={() => setAddAccountVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAddAccountVisible(false)}>
          <View />
        </Pressable>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            enableOnAndroid
            extraHeight={Spacing.hero}
            extraScrollHeight={Spacing.section}
            keyboardOpeningTime={0}
          >
            <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
              <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
              <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
                Add Account
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
                placeholder="Email"
                placeholderTextColor={colors.onSurfaceVariant}
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.onSurface }]}
                placeholder="Display Name"
                placeholderTextColor={colors.onSurfaceVariant}
                value={newName}
                onChangeText={setNewName}
              />
              <HapticButton
                onPress={handleAddAccount}
                hapticStyle="heavy"
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[TypeScale.labelLarge, { color: colors.onPrimary }]}>Add Account</Text>
              </HapticButton>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Calendar Action Bottom Sheet */}
      <Modal
        visible={calActionSheet.visible}
        transparent
        animationType="fade"
        onRequestClose={closeCalActionSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeCalActionSheet}>
          <View />
        </Pressable>
        <View style={styles.modalContainer}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
              {calActionSheet.cal?.title ?? 'Calendar'}
            </Text>
            <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, paddingHorizontal: Spacing.small, marginBottom: Spacing.base }]}>
              {calActionSheet.cal?.source.name}
            </Text>
            <View style={[styles.optionsList, { backgroundColor: colors.background }]}>
              {/* Export */}
              <HapticButton
                hapticStyle="medium"
                onPress={() => {
                  closeCalActionSheet();
                  if (calActionSheet.cal) handleSyncCalendar(calActionSheet.cal);
                }}
                style={[styles.calActionRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: `${colors.outlineVariant}60` }]}
              >
                <View style={[styles.calActionIcon, { backgroundColor: `${ICON_COLORS.exportCalendify}18` }]}>
                  <ArrowUpFromLine size={22} color={ICON_COLORS.exportCalendify} strokeWidth={1.75} />
                </View>
                <View style={styles.calActionText}>
                  <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>Export to Calendar</Text>
                  <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Push your local events to this calendar</Text>
                </View>
                <ChevronDown size={18} color={colors.onSurfaceVariant} strokeWidth={1.5} style={{ transform: [{ rotate: '-90deg' }] }} />
              </HapticButton>
              {/* Import */}
              <HapticButton
                hapticStyle="medium"
                onPress={() => {
                  closeCalActionSheet();
                  if (calActionSheet.cal) handleImportFromCalendar(calActionSheet.cal);
                }}
                style={styles.calActionRow}
              >
                <View style={[styles.calActionIcon, { backgroundColor: `${ICON_COLORS.importCalendify}18` }]}>
                  <ArrowDownToLine size={22} color={ICON_COLORS.importCalendify} strokeWidth={1.75} />
                </View>
                <View style={styles.calActionText}>
                  <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>Import from Calendar</Text>
                  <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Fetch events from this calendar</Text>
                </View>
                <ChevronDown size={18} color={colors.onSurfaceVariant} strokeWidth={1.5} style={{ transform: [{ rotate: '-90deg' }] }} />
              </HapticButton>
            </View>
          </View>
        </View>
      </Modal>
      {/* Clear Data Bottom Sheet */}
      <Modal
        visible={clearDataSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={closeClearDataSheet}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeClearDataSheet}>
          <View />
        </Pressable>
        <View style={styles.modalContainer}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
            <Text style={[TypeScale.titleLarge, styles.modalTitle, { color: colors.onSurface }]}>
              Clear Data
            </Text>
            <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant, paddingHorizontal: Spacing.small, marginBottom: Spacing.base }]}>
              Select data type to remove permanently
            </Text>
            <View style={[styles.optionsList, { backgroundColor: colors.background }]}>
              {[
                { label: 'Reminders', subtitle: 'Remove all pending notifications', icon: Bell, type: 'REMINDER', color: '#FF5252' },
                { label: 'Events', subtitle: 'Clear all scheduled appointments', icon: CalendarPlus, type: 'EVENT', color: '#42A5F5' },
                { label: 'Birthdays', subtitle: 'Wipe all saved special dates', icon: Cake, type: 'BIRTHDAY', color: '#EC407A' },
                { label: 'Tasks', subtitle: 'Remove all to-do items', icon: CheckSquare, type: 'TASK', color: '#66BB6A' },
              ].map((opt, idx, arr) => (
                <HapticButton
                  key={opt.type}
                  hapticStyle="medium"
                  onPress={() => {
                    Alert.alert(opt.label, `Are you sure you want to delete all ${opt.type.toLowerCase()}s?`, [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          clearByType(opt.type as any);
                          haptics.heavy();
                          closeClearDataSheet();
                          Alert.alert('Deleted', `${opt.label} cleared successfully.`);
                        }
                      }
                    ]);
                  }}
                  style={[styles.calActionRow, idx < arr.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: `${colors.outlineVariant}60` } : {}]}
                >
                  <View style={[styles.calActionIcon, { backgroundColor: `${opt.color}18` }]}>
                    <opt.icon size={22} color={opt.color} strokeWidth={1.75} />
                  </View>
                  <View style={styles.calActionText}>
                    <Text style={[TypeScale.titleSmall, { color: colors.onSurface }]}>{opt.label}</Text>
                    <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>{opt.subtitle}</Text>
                  </View>
                </HapticButton>
              ))}
              <Divider />
              <HapticButton
                hapticStyle="heavy"
                onPress={() => {
                  Alert.alert('Delete All Data', 'This will wipe all locally stored entries. This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete All',
                      style: 'destructive',
                      onPress: () => {
                        clearAll();
                        haptics.heavy();
                        closeClearDataSheet();
                        Alert.alert('Deleted', 'All application data has been cleared.');
                      }
                    }
                  ]);
                }}
                style={styles.calActionRow}
              >
                <View style={[styles.calActionIcon, { backgroundColor: `${colors.error}18` }]}>
                  <Trash2 size={22} color={colors.error} strokeWidth={1.75} />
                </View>
                <View style={styles.calActionText}>
                  <Text style={[TypeScale.titleSmall, { color: colors.error }]}>Delete All Data</Text>
                  <Text style={[TypeScale.bodySmall, { color: colors.onSurfaceVariant }]}>Factory reset application database</Text>
                </View>
              </HapticButton>
            </View>
          </View>
        </View>
      </Modal>
      <NotificationSettingsSheet ref={notifSheetRef} />
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  title: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.section,
  },
  card: {
    borderRadius: 16,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  accountInfo: { flex: 1 },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  deleteBtn: { padding: Spacing.small },
  addAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    gap: 12,
  },
  bottomSpacer: { height: 40 },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
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
    gap: 12,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    marginBottom: Spacing.compact,
    fontSize: 16,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: Spacing.small,
  },
  calDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionsList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.small,
    gap: Spacing.compact,
  },
  calActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calActionText: {
    flex: 1,
    gap: 2,
  },
});
