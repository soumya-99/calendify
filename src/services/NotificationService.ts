import { storage } from '@/src/hooks/useMMKV';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PermissionResponse, PermissionStatus } from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import { useNotificationStore } from '../stores/useNotificationStore';
import type { AnyEntry, Birthday, CalendarEntry, CalendarEvent, Reminder } from '../types/entries';
import type { NotifIdMap, NotifiableEntryType } from '../types/notifications';

// How notifications appear while the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    description: 'Your scheduled reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 150, 300],
    lightColor: '#FFB300',
  });

  await Notifications.setNotificationChannelAsync('events', {
    name: 'Events',
    description: 'Upcoming event alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
    lightColor: '#1E88E5',
  });

  await Notifications.setNotificationChannelAsync('birthdays', {
    name: 'Birthdays',
    description: 'Birthday reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#E64A19',
  });
}

const CHANNEL_MAP: Record<string, string> = {
  REMINDER: 'reminders',
  EVENT: 'events',
  BIRTHDAY: 'birthdays',
};

const COLOR_MAP: Record<string, string> = {
  REMINDER: '#FFB300',
  EVENT: '#1E88E5',
  BIRTHDAY: '#E64A19',
};

export class NotificationService {
  static async requestPermissions(): Promise<'granted' | 'denied' | 'undetermined'> {
    // Allow emulators for Android, but keep restriction for iOS if needed (though usually okay to try)
    if (Platform.OS === 'ios' && !Device.isDevice) return 'denied';

    await ensureChannels();

    const currentPerms = await Notifications.getPermissionsAsync() as PermissionResponse;
    const currentStatus = currentPerms.status;

    if (currentStatus === PermissionStatus.GRANTED) {
      useNotificationStore.getState().setMasterEnabled(true);
      return 'granted';
    }

    const requestedPerms = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    }) as PermissionResponse;

    const requestedStatus = requestedPerms.status;
    useNotificationStore.getState().setMasterEnabled(requestedStatus === PermissionStatus.GRANTED);

    return requestedStatus === PermissionStatus.GRANTED
      ? 'granted'
      : requestedStatus === PermissionStatus.UNDETERMINED
        ? 'undetermined'
        : 'denied';
  }

  static async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    const perms = await Notifications.getPermissionsAsync() as PermissionResponse;
    return perms.status as 'granted' | 'denied' | 'undetermined';
  }

  static openOSSettings(): void {
    Linking.openSettings();
  }

  static async scheduleEntry(entry: AnyEntry, persistMap = true): Promise<string[] | null> {
    const prefs = useNotificationStore.getState();

    // Always clean up existing notifications for this entry first
    await this.cancelEntry(entry.id);

    // If master is not enabled, we still check permissions because it might have been granted in OS
    if (!prefs.masterEnabled) {
      const status = await this.getPermissionStatus();
      if (status === 'granted') {
        prefs.setMasterEnabled(true);
      } else {
        return null;
      }
    }
    if (entry.type === 'REMINDER' && !prefs.remindersEnabled) return null;
    if (entry.type === 'EVENT' && !prefs.eventsEnabled) return null;
    if (entry.type === 'BIRTHDAY' && !prefs.birthdaysEnabled) return null;
    if (entry.type === 'TASK') return null;

    const triggers = this.buildTriggers(entry);
    if (triggers.length === 0) return null;

    const content: Notifications.NotificationContentInput = {
      title: this.buildTitle(entry),
      body: this.buildBody(entry),
      data: { entryId: entry.id, entryType: entry.type, date: entry.date },
      sound: true,
      color: COLOR_MAP[entry.type] ?? '#4CAF9A',
    };

    const notifIds: string[] = [];
    for (const trigger of triggers) {
      try {
        const id = await Notifications.scheduleNotificationAsync({ content, trigger });
        notifIds.push(id);
      } catch (err) {
        // Silently fail for individual trigger failures (e.g. past dates)
      }
    }

    if (persistMap && notifIds.length > 0) {
      const map = this.getIdMap();
      map[entry.id] = { notifIds, entryId: entry.id, type: entry.type as NotifiableEntryType };
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
    }

    return notifIds;
  }

  static async cancelEntry(entryId: string): Promise<void> {
    const map = this.getIdMap();
    const mapEntry = map[entryId];
    if (mapEntry?.notifIds) {
      try {
        await Promise.all(
          mapEntry.notifIds.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => { }))
        );
      } catch (e) { }
      delete map[entryId];
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
    }
  }

  static async cancelByType(type: NotifiableEntryType): Promise<void> {
    const map = this.getIdMap();
    const toCancel = Object.values(map).filter((e) => e.type === type);
    await Promise.all(
      toCancel.flatMap(e => e.notifIds.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => { })))
    );
    toCancel.forEach((e) => delete map[e.entryId]);
    storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
  }

  private static isSyncing = false;
  private static syncTimeout: NodeJS.Timeout | null = null;

  static async syncAll(entries: AnyEntry[]): Promise<void> {
    const prefs = useNotificationStore.getState();
    if (!prefs.masterEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify({}));
      return;
    }

    // Debounce to prevent rapid multiple calls (e.g. from multiple useEffects)
    if (this.syncTimeout) clearTimeout(this.syncTimeout);

    this.syncTimeout = setTimeout(async () => {
      if (this.isSyncing) return;
      this.isSyncing = true;

      try {
        // Clear all to ensure a fresh slate
        await Notifications.cancelAllScheduledNotificationsAsync();

        const eligible = entries
          .filter((e) => {
            if (!this.isFuture(e)) return false;
            if (e.type === 'REMINDER' && !prefs.remindersEnabled) return false;
            if (e.type === 'EVENT' && !prefs.eventsEnabled) return false;
            if (e.type === 'BIRTHDAY' && !prefs.birthdaysEnabled) return false;
            if (e.type === 'TASK') return false;
            return true;
          })
          .sort((a, b) => {
            const da = new Date(a.date).getTime();
            const db = new Date(b.date).getTime();
            if (da !== db) return da - db;

            // Same day, sort by time if possible
            const getTimeVal = (e: AnyEntry) => {
              if (e.type === 'EVENT') return (e as CalendarEvent).startTime;
              if (e.type === 'REMINDER') return (e as Reminder).time;
              return '00:00';
            };
            return getTimeVal(a).localeCompare(getTimeVal(b));
          })
          .slice(0, 60); // Increased limit slightly

        const newMap: NotifIdMap = {};
        const CHUNK = 5;
        for (let i = 0; i < eligible.length; i += CHUNK) {
          const chunk = eligible.slice(i, i + CHUNK);
          const results = await Promise.all(
            chunk.map(async (e) => {
              // Schedule without persisting each time to avoid MMKV overhead
              const ids = await this.scheduleEntry(e, false);
              return { entryId: e.id, notifIds: ids, type: e.type as NotifiableEntryType };
            })
          );

          results.forEach((res) => {
            if (res.notifIds && res.notifIds.length > 0) {
              newMap[res.entryId] = {
                notifIds: res.notifIds,
                entryId: res.entryId,
                type: res.type,
              };
            }
          });
        }

        storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(newMap));
      } catch (err) {
        console.error('syncAll error:', err);
      } finally {
        this.isSyncing = false;
      }
    }, 100); // 100ms debounce
  }

  static async onTypeToggle(
    type: NotifiableEntryType,
    enabled: boolean,
    entries: AnyEntry[]
  ): Promise<void> {
    if (enabled) {
      const toAdd = entries.filter((e) => e.type === type && this.isFuture(e)).slice(0, 20);
      for (const e of toAdd) {
        await this.scheduleEntry(e);
      }
    } else {
      await this.cancelByType(type);
    }
  }

  private static buildTriggers(entry: AnyEntry): Notifications.NotificationTriggerInput[] {
    const triggers: Notifications.NotificationTriggerInput[] = [];
    const channelId = CHANNEL_MAP[entry.type];
    const now = Date.now();
    const nowBuffer = now + 10000;

    if (entry.type === 'BIRTHDAY') {
      const b = entry as Birthday;
      const bday = new Date(b.date);
      bday.setHours(0, 0, 0, 0);

      // Get upcoming birthday (this year or next)
      let birthdayDate = new Date(bday);
      birthdayDate.setFullYear(new Date().getFullYear());
      if (birthdayDate.getTime() < now) {
        birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
      }

      const birthdayTime = birthdayDate.getTime();
      const triggersTimes = [
        birthdayTime - 24 * 60 * 60 * 1000, // 24h before
        birthdayTime - 12 * 60 * 60 * 1000  // 12h before
      ];

      for (const time of triggersTimes) {
        if (time > nowBuffer) {
          triggers.push({
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(time),
            channelId,
          });
        }
      }
      return triggers;
    }

    // Handle Events and Reminders
    let eventTime: Date | null = null;
    if (entry.type === 'EVENT') {
      const e = entry as CalendarEvent;
      eventTime = new Date(e.date);
      if (e.allDay) {
        eventTime.setHours(0, 0, 0, 0);
      } else {
        const [h, m] = e.startTime.split(':').map(Number);
        eventTime.setHours(h, m, 0, 0);
      }
    } else if (entry.type === 'REMINDER') {
      const r = entry as Reminder;
      eventTime = new Date(r.date);
      const [h, m] = r.time.split(':').map(Number);
      eventTime.setHours(h, m, 0, 0);

      // Handle repeating reminders for next trigger
      if (eventTime.getTime() < now) {
        if (r.repeat === 'DAILY') {
          eventTime.setDate(new Date().getDate());
          if (eventTime.getTime() < now) eventTime.setDate(eventTime.getDate() + 1);
        } else if (r.repeat === 'WEEKLY') {
          while (eventTime.getTime() < now) {
            eventTime.setDate(eventTime.getDate() + 7);
          }
        }
      }
    }

    if (eventTime) {
      const et = eventTime.getTime();
      const tenMinMark = et - 10 * 60 * 1000;

      if (entry.notificationTime) {
        const customTime = new Date(entry.notificationTime).getTime();

        if (customTime > nowBuffer) {
          triggers.push({
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(customTime),
            channelId,
          });
        }

        // Add 10-min mark only if customTime is EARLIER than 10-min mark (i.e. > 10 mins before)
        // If customTime is within 10 mins (later than tenMinMark), we only show customTime.
        if (customTime < tenMinMark && tenMinMark > nowBuffer) {
          triggers.push({
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(tenMinMark),
            channelId,
          });
        }
      } else {
        // No custom time, just show 10-min mark
        if (tenMinMark > nowBuffer) {
          triggers.push({
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(tenMinMark),
            channelId,
          });
        }
      }
    }

    // De-duplicate by timestamp (safety check)
    const unique: Notifications.NotificationTriggerInput[] = [];
    const seen = new Set<number>();
    for (const t of triggers) {
      if (t && typeof t === 'object' && 'date' in t) {
        const dt = t as Notifications.DateTriggerInput;
        const time = dt.date instanceof Date ? dt.date.getTime() : (dt.date as number);
        if (time && !seen.has(time)) {
          seen.add(time);
          unique.push(t);
        }
      }
    }

    return unique;
  }

  private static buildTitle(entry: AnyEntry): string {
    const map: Record<string, string> = {
      REMINDER: '⏰ Reminder',
      EVENT: '📅 Upcoming event',
      BIRTHDAY: '🎂 Upcoming Birthday',
    };
    return `${map[entry.type] ?? ''} — ${entry.title}`;
  }

  private static buildBody(entry: AnyEntry): string {
    if (entry.type === 'EVENT') {
      const e = entry as CalendarEvent;
      const timeText = e.allDay ? 'All Day' : e.startTime;
      return [timeText, e.location].filter(Boolean).join(' · ');
    }
    if (entry.type === 'BIRTHDAY') {
      const b = entry as Birthday;
      const age = b.birthYear ? ` turns ${new Date().getFullYear() - b.birthYear}` : '';
      return `${b.personName}${age} is having a birthday soon! Don't forget to wish them! 🎉`;
    }
    return (entry as Reminder).notes ?? 'Time to check this reminder.';
  }

  private static isFuture(entry: CalendarEntry): boolean {
    const d = new Date(entry.date);
    d.setHours(23, 59, 59, 999);
    return d >= new Date();
  }

  private static getIdMap(): NotifIdMap {
    try {
      const raw = storage.getString(MMKV_KEYS.NOTIF_ID_MAP);
      return raw ? (JSON.parse(raw) as NotifIdMap) : {};
    } catch {
      return {};
    }
  }
}
