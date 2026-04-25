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
    if (!Device.isDevice) return 'denied';

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
    if (!Device.isDevice) return 'denied';
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

    if (!prefs.masterEnabled) return null;
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

  static async syncAll(entries: AnyEntry[]): Promise<void> {
    const prefs = useNotificationStore.getState();
    if (!prefs.masterEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify({}));
      return;
    }

    // Instead of full cancelAll which causes flashes/jitter, we can be more surgical
    // but for simplicity and reliability in bulk operations, we still use it sparingly.
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 50);

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
    const nowBuffer = Date.now() + 10000;

    // 1. Custom Preferred Time
    if (entry.notificationTime) {
      const customTime = new Date(entry.notificationTime).getTime();
      if (customTime > nowBuffer) {
        triggers.push({
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(customTime),
          channelId,
        });
      }
    }

    // 2. Default Time (10 mins before)
    let eventTime: Date | null = null;
    if (entry.type === 'EVENT') {
      const e = entry as CalendarEvent;
      eventTime = new Date(e.date);
      const [h, m] = e.startTime.split(':').map(Number);
      eventTime.setHours(h, m, 0, 0);
    } else if (entry.type === 'REMINDER') {
      const r = entry as Reminder;
      eventTime = new Date(r.date);
      const [h, m] = r.time.split(':').map(Number);
      eventTime.setHours(h, m, 0, 0);

      // Next occurrence for repeats
      if (eventTime.getTime() < Date.now()) {
        if (r.repeat === 'DAILY') {
          const today = new Date();
          today.setHours(h, m, 0, 0);
          eventTime = today.getTime() > Date.now() ? today : new Date(today.getTime() + 86400000);
        } else if (r.repeat === 'WEEKLY') {
          while (eventTime.getTime() < Date.now()) {
            eventTime.setDate(eventTime.getDate() + 7);
          }
        }
      }
    } else if (entry.type === 'BIRTHDAY') {
      const b = entry as Birthday;
      eventTime = new Date(b.date);
      eventTime.setHours(9, 0, 0, 0);
      const currentYear = new Date().getFullYear();
      eventTime.setFullYear(currentYear);
      if (eventTime.getTime() < Date.now()) {
        eventTime.setFullYear(currentYear + 1);
      }
    }

    if (eventTime) {
      const defaultTime = eventTime.getTime() - 10 * 60 * 1000;
      if (defaultTime > nowBuffer) {
        triggers.push({
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(defaultTime),
          channelId,
        });
      }
    }

    // De-duplicate by timestamp
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
      BIRTHDAY: '🎂 Birthday today',
    };
    return `${map[entry.type] ?? ''} — ${entry.title}`;
  }

  private static buildBody(entry: AnyEntry): string {
    if (entry.type === 'EVENT') {
      const e = entry as CalendarEvent;
      return [e.startTime, e.location].filter(Boolean).join(' · ');
    }
    if (entry.type === 'BIRTHDAY') {
      const b = entry as Birthday;
      const age = b.birthYear ? ` turns ${new Date().getFullYear() - b.birthYear}` : '';
      return `${b.personName}${age} today. Don't forget to wish them! 🎉`;
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
