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

  static async scheduleEntry(entry: AnyEntry, persistMap = true): Promise<string | null> {
    const prefs = useNotificationStore.getState();

    if (!prefs.masterEnabled) return null;
    if (entry.type === 'REMINDER' && !prefs.remindersEnabled) return null;
    if (entry.type === 'EVENT' && !prefs.eventsEnabled) return null;
    if (entry.type === 'BIRTHDAY' && !prefs.birthdaysEnabled) return null;
    if (entry.type === 'TASK') return null;

    const trigger = this.buildTrigger(entry);
    if (!trigger) return null;

    await this.cancelEntry(entry.id);

    const content: Notifications.NotificationContentInput = {
      title: this.buildTitle(entry),
      body: this.buildBody(entry),
      data: { entryId: entry.id, entryType: entry.type, date: entry.date },
      sound: true,
      color: COLOR_MAP[entry.type] ?? '#4CAF9A',
    };

    const notifId = await Notifications.scheduleNotificationAsync({ content, trigger });

    if (persistMap) {
      const map = this.getIdMap();
      map[entry.id] = { notifId, entryId: entry.id, type: entry.type as NotifiableEntryType };
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
    }

    return notifId;
  }

  static async cancelEntry(entryId: string): Promise<void> {
    const map = this.getIdMap();
    const mapEntry = map[entryId];
    if (mapEntry?.notifId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(mapEntry.notifId);
      } catch {
        // ignore
      }
      delete map[entryId];
      storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
    }
  }

  static async cancelByType(type: NotifiableEntryType): Promise<void> {
    const map = this.getIdMap();
    const toCancel = Object.values(map).filter((e) => e.type === type);
    await Promise.all(
      toCancel.map((e) => Notifications.cancelScheduledNotificationAsync(e.notifId).catch(() => { }))
    );
    toCancel.forEach((e) => delete map[e.entryId]);
    storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
  }

  static async syncAll(entries: AnyEntry[]): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    storage.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify({}));

    const prefs = useNotificationStore.getState();
    if (!prefs.masterEnabled) return;

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
      .slice(0, 60);

    const newMap: NotifIdMap = {};
    const CHUNK = 10;
    for (let i = 0; i < eligible.length; i += CHUNK) {
      const chunk = eligible.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map(async (e) => {
          const notifId = await this.scheduleEntry(e, false);
          return { entryId: e.id, notifId, type: e.type as NotifiableEntryType };
        })
      );

      results.forEach((res) => {
        if (res.notifId) {
          newMap[res.entryId] = {
            notifId: res.notifId,
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
      await Promise.all(toAdd.map((e) => this.scheduleEntry(e)));
    } else {
      await this.cancelByType(type);
    }
  }

  private static buildTrigger(entry: AnyEntry): Notifications.NotificationTriggerInput | null {
    const channelId = CHANNEL_MAP[entry.type];

    if (entry.type === 'REMINDER') {
      const r = entry as Reminder;
      const [h, m] = r.time.split(':').map(Number);
      const fireAt = new Date(r.date);
      fireAt.setHours(h, m, 0, 0);
      if (fireAt <= new Date()) return null;

      if (r.repeat === 'DAILY') {
        return {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          channelId,
          hour: h,
          minute: m,
        };
      }
      if (r.repeat === 'WEEKLY') {
        return {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId,
          weekday: fireAt.getDay() + 1,
          hour: h,
          minute: m,
        };
      }
      return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId,
        date: fireAt,
      };
    }

    if (entry.type === 'EVENT') {
      const e = entry as CalendarEvent;
      const [h, m] = e.startTime.split(':').map(Number);
      const fireAt = new Date(e.date);
      fireAt.setHours(h, m, 0, 0);
      fireAt.setMinutes(fireAt.getMinutes() - 10);
      if (fireAt <= new Date()) return null;
      return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId,
        date: fireAt,
      };
    }

    if (entry.type === 'BIRTHDAY') {
      const d = new Date(entry.date);
      return {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        channelId,
        day: d.getDate(),
        month: d.getMonth(),
        hour: 9,
        minute: 0,
      };
    }

    return null;
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
