# NOTIFICATIONS.md — Calendify Notification System

# 🧠 NOTIFICATIONS_AGENT.md (Gemini Anti-Gravity Mode)

> You are an autonomous senior engineer.
> Your job is to **design, implement, and integrate** a fully local notification system.
> Do not ask for clarification. Make correct assumptions. Execute cleanly.

---

## 🚀 OBJECTIVE

Build a **zero-backend, local notification system** with:

* Per-type controls (REMINDER, EVENT, BIRTHDAY)
* Persistent preferences
* Deterministic scheduling
* Automatic synchronization

System must be **idempotent, resilient, and side-effect safe**.

---

## 🧩 CORE MODEL

### Notification Types

* REMINDER
* EVENT
* BIRTHDAY

---

### Preferences Model

You MUST implement:

* masterEnabled
* remindersEnabled
* eventsEnabled
* birthdaysEnabled

---

### Hard Rules

* If `masterEnabled = false` → NO notifications exist
* Preferences ALWAYS override scheduling
* System must be **source-of-truth driven**, not event-driven chaos

---

## ⚙️ SYSTEM ARCHITECTURE

You will create 3 core layers:

---

### 1. Notification Engine (Stateless Core)

Responsibilities:

* scheduleEntry(entry)
* cancelEntry(entryId)
* cancelByType(type)
* syncAll(entries)

This layer MUST:

* Be deterministic
* Be idempotent
* Never duplicate notifications

---

### 2. State Layer (Persistent)

Responsibilities:

* Store preferences
* Store notificationId mapping

Required storage:

* preferences
* entryId → notificationId map

---

### 3. Integration Layer

Hooks into:

* App lifecycle
* Entry CRUD
* User actions (toggles)

---

## 🔐 PERMISSION FLOW

When enabling notifications:

1. Request OS permission
2. IF granted:

   * Set `masterEnabled = true`
   * Execute full sync
3. IF denied:

   * Keep `masterEnabled = false`
   * Provide fallback (open OS settings)

DO NOT bypass OS permission state.

---

## 🧠 SCHEDULING CONTRACT

### scheduleEntry(entry)

You MUST:

1. Validate:

   * masterEnabled
   * type enabled
   * future time
2. Cancel existing notification
3. Build trigger
4. Schedule notification
5. Persist mapping

Return: notificationId OR null

---

### cancelEntry(entryId)

You MUST:

1. Lookup mapping
2. Cancel notification
3. Remove mapping

---

### cancelByType(type)

You MUST:

1. Filter mapping by type
2. Cancel all
3. Remove from mapping

---

## 🔁 SYNC ENGINE (CRITICAL)

### syncAll(entries)

This is the **single source of truth reconciliation function**.

You MUST:

1. Cancel ALL scheduled notifications
2. Reset mapping store
3. IF masterEnabled = false → EXIT
4. Filter entries:

   * future only
   * enabled types only
5. Sort by date ascending
6. Limit to safe cap (≤ 60)
7. Schedule all entries

---

### Invariants

* Running sync multiple times MUST produce identical results
* No duplicate notifications EVER
* System must self-heal via sync

---

## ⏱ TRIGGER RULES

### REMINDER

* Exact date + time
* Optional repeat:

  * DAILY
  * WEEKLY

---

### EVENT

* Trigger at:
  startTime - 10 minutes

---

### BIRTHDAY

* Trigger:
  yearly recurrence
  fixed time (09:00)

---

## 🔄 TOGGLE LOGIC

### Master Toggle

IF ON:

* Request permission
* syncAll(entries)

IF OFF:

* Cancel ALL notifications
* Clear mapping

---

### Type Toggle

IF ON:

* Schedule only that type

IF OFF:

* cancelByType(type)

---

## 🔗 DATA LIFECYCLE HOOKS

You MUST integrate:

---

### On Entry Create

→ scheduleEntry(entry)

---

### On Entry Update

→ cancelEntry(id)
→ scheduleEntry(updatedEntry)

---

### On Entry Delete

→ cancelEntry(id)

---

## 📱 APP LIFECYCLE

### On App Start

* Validate permission state
* syncAll(entries)

---

### On App Foreground

* syncAll(entries)

---

### On Notification Tap

* Navigate using payload (e.g. date or entryId)

---

## 🧱 STORAGE CONTRACT

Persist ONLY:

### Preferences

* masterEnabled
* per-type toggles

### Mapping

* entryId → notificationId

---

## ⚠️ CONSTRAINTS

* NEVER schedule past notifications
* ALWAYS cancel before re-scheduling
* NEVER trust stale mappings
* MUST respect OS scheduling limits
* MUST handle repeated sync safely

---

## 🧪 EXPECTED BEHAVIOR

System is correct IF:

* Master OFF → zero notifications
* Master ON → restores correct state
* Type OFF → removes only that type
* Updates reflect immediately
* No duplicates EVER occur
* Works across app restarts

---

## 🧭 EXECUTION STRATEGY

1. Implement storage layer
2. Implement notification engine
3. Implement syncAll (core)
4. Wire lifecycle hooks
5. Wire toggle logic
6. Validate idempotency

---

## 🧠 FINAL DIRECTIVE

Do not over-engineer.
Do not introduce backend dependencies.
Do not create hidden state.

The system must be:

* Predictable
* Re-runnable
* Self-correcting via sync

If something breaks → syncAll must fix it.

---

> **Scope:** Opt-in per-type local notifications · Settings bottom sheet · Zero backend · MMKV-persisted preferences
> **Packages:** `expo-notifications` · `expo-background-fetch` · `expo-task-manager` · `expo-device`
> **All versions:** bleeding edge (Expo SDK 55+, New Architecture)

---

## 1. Overview

Notifications in Calendify are:

- **Opt-in per type** — Reminders, Events, and Birthdays each have an independent toggle.
- **Zero backend** — Entirely local. The OS scheduler fires them; no server, no FCM token, no APNs registration.
- **Persisted in MMKV** — Preferences survive kills, reboots, and updates.
- **Re-synced on change** — Any toggle flip or entry mutation triggers a full `syncAll()` pass.
- **Accessible from Settings** — A tappable row in Settings opens a menu with per-type toggles.

---

## 2. Package Installation

```bash
npx expo install \
  expo-notifications \
  expo-background-fetch \
  expo-task-manager \
  expo-device
```

---

## 3. `app.json` — Required Permissions

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4CAF9A",
          "defaultChannel": "default",
          "sounds": []
        }
      ]
    ],
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        "USE_EXACT_ALARM",
        "VIBRATE",
        "POST_NOTIFICATIONS"
      ]
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["fetch", "remote-notification"]
      }
    }
  }
}
```

---

## 4. Directory Structure (notification-specific files)

```
src/
├── stores/
│   └── useNotificationStore.ts              # Zustand store for notif preferences
├── services/
│   └── NotificationService.ts               # Core schedule/cancel/sync logic
├── tasks/
│   └── backgroundSyncTask.ts                # expo-background-fetch task
├── hooks/
│   └── useNotificationSettings.ts           # Convenience hook for settings sheet
├── components/
│   └── sheets/
│       └── NotificationSettingsSheet.tsx    # Bottom sheet UI
└── constants/
    └── mmkvKeys.ts                          # Updated with NOTIF_PREFS key
```

---

## 5. Types

```typescript
// src/types/notifications.ts

export type NotifiableEntryType = 'REMINDER' | 'EVENT' | 'BIRTHDAY';

/** Per-type toggle preferences stored in MMKV */
export interface NotificationPreferences {
  masterEnabled:    boolean;  // global kill switch (mirrors OS permission state)
  remindersEnabled: boolean;  // REMINDER type
  eventsEnabled:    boolean;  // EVENT type
  birthdaysEnabled: boolean;  // BIRTHDAY type
}

/** Stored per scheduled notification so we can cancel it later */
export interface NotifIdMapEntry {
  notifId:  string;
  entryId:  string;
  type:     NotifiableEntryType;
}

export type NotifIdMap = Record<string, NotifIdMapEntry>; // keyed by entryId
```

---

## 6. MMKV Keys

```typescript
// src/constants/mmkvKeys.ts
export const MMKV_KEYS = {
  ALL_ENTRIES:   'entries:all',
  ACCOUNTS:      'accounts:all',
  SETTINGS:      'settings:prefs',
  THEME:         'settings:theme',

  // Notification keys
  NOTIF_PREFS:   'notif:preferences',   // NotificationPreferences JSON
  NOTIF_ID_MAP:  'notif:id-map',        // NotifIdMap JSON
} as const;

export type MMKVKey = typeof MMKV_KEYS[keyof typeof MMKV_KEYS];
```

---

## 7. Zustand Store — `useNotificationStore.ts`

```typescript
// src/stores/useNotificationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import type { NotificationPreferences } from '../types/notifications';

const notifMMKV = new MMKV({ id: 'notif-store' });

// Zustand ↔ MMKV storage adapter
const mmkvStorage = {
  getItem:    (key: string) => notifMMKV.getString(key) ?? null,
  setItem:    (key: string, value: string) => notifMMKV.set(key, value),
  removeItem: (key: string) => notifMMKV.delete(key),
};

interface NotificationStore extends NotificationPreferences {
  setMasterEnabled:    (val: boolean) => void;
  setRemindersEnabled: (val: boolean) => void;
  setEventsEnabled:    (val: boolean) => void;
  setBirthdaysEnabled: (val: boolean) => void;
  setAllPrefs:         (prefs: Partial<NotificationPreferences>) => void;
  reset:               () => void;
}

const DEFAULT_PREFS: NotificationPreferences = {
  masterEnabled:    false,  // false until user grants OS permission
  remindersEnabled: true,   // default on — active once master is granted
  eventsEnabled:    true,
  birthdaysEnabled: true,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setMasterEnabled:    (val) => set({ masterEnabled: val }),
      setRemindersEnabled: (val) => set({ remindersEnabled: val }),
      setEventsEnabled:    (val) => set({ eventsEnabled: val }),
      setBirthdaysEnabled: (val) => set({ birthdaysEnabled: val }),
      setAllPrefs:         (prefs) => set(prefs),
      reset:               () => set(DEFAULT_PREFS),
    }),
    {
      name:    MMKV_KEYS.NOTIF_PREFS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// Typed selectors — prevents whole-store re-renders
export const selectMasterEnabled    = (s: NotificationStore) => s.masterEnabled;
export const selectRemindersEnabled = (s: NotificationStore) => s.remindersEnabled;
export const selectEventsEnabled    = (s: NotificationStore) => s.eventsEnabled;
export const selectBirthdaysEnabled = (s: NotificationStore) => s.birthdaysEnabled;
```

---

## 8. Core Service — `NotificationService.ts`

```typescript
// src/services/NotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import { useNotificationStore } from '../stores/useNotificationStore';
import type { CalendarEntry, Reminder, Event, Birthday } from '../types/entries';
import type { NotifIdMap } from '../types/notifications';

// How notifications appear while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

const mmkv = new MMKV({ id: 'notif-store' });

// ─── Android notification channels ────────────────────────────────────────
async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Reminders',
    description: 'Your scheduled reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 150, 300],
    lightColor: '#FFB300',
    sound: 'default',
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync('events', {
    name: 'Events',
    description: 'Upcoming event alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250],
    lightColor: '#1E88E5',
    sound: 'default',
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync('birthdays', {
    name: 'Birthdays',
    description: 'Birthday reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200, 100, 200],
    lightColor: '#E64A19',
    sound: 'default',
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export class NotificationService {

  // ─── Permission ──────────────────────────────────────────────────────────
  static async requestPermissions(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (!Device.isDevice) return 'denied';

    await ensureChannels();

    const { status: current } = await Notifications.getPermissionsAsync();
    if (current === 'granted') {
      useNotificationStore.getState().setMasterEnabled(true);
      return 'granted';
    }

    const { status: requested } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert:         true,
        allowBadge:         false,
        allowSound:         true,
        allowCriticalAlerts: false,
      },
    });

    useNotificationStore.getState().setMasterEnabled(requested === 'granted');
    return requested;
  }

  static async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (!Device.isDevice) return 'denied';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  /** Sends user to OS Settings → Notifications → Calendify */
  static openOSSettings(): void {
    Linking.openSettings();
  }

  // ─── Schedule single entry (respects per-type prefs) ────────────────────
  static async scheduleEntry(entry: CalendarEntry): Promise<string | null> {
    const prefs = useNotificationStore.getState();

    if (!prefs.masterEnabled)                               return null;
    if (entry.type === 'REMINDER' && !prefs.remindersEnabled) return null;
    if (entry.type === 'EVENT'    && !prefs.eventsEnabled)    return null;
    if (entry.type === 'BIRTHDAY' && !prefs.birthdaysEnabled) return null;

    const trigger = this.buildTrigger(entry);
    if (!trigger) return null;

    await this.cancelEntry(entry.id); // idempotent — cancel existing first

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: this.buildTitle(entry),
        body:  this.buildBody(entry),
        data:  { entryId: entry.id, entryType: entry.type, date: entry.date },
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: this.resolveChannel(entry.type),
          color:     this.resolveColor(entry.type),
          priority:  Notifications.AndroidNotificationPriority.HIGH,
        }),
        ...(Platform.OS === 'ios' && {
          interruptionLevel: entry.type === 'REMINDER'
            ? ('timeSensitive' as const)
            : ('active' as const),
        }),
      },
      trigger,
    });

    const map = this.getIdMap();
    map[entry.id] = { notifId, entryId: entry.id, type: entry.type as any };
    mmkv.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));

    return notifId;
  }

  // ─── Cancel single entry ─────────────────────────────────────────────────
  static async cancelEntry(entryId: string): Promise<void> {
    const map = this.getIdMap();
    const entry = map[entryId];
    if (entry?.notifId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(entry.notifId);
      } catch {
        // Already fired or missing — safe to swallow
      }
      delete map[entryId];
      mmkv.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
    }
  }

  // ─── Cancel all of a specific type ───────────────────────────────────────
  static async cancelByType(type: 'REMINDER' | 'EVENT' | 'BIRTHDAY'): Promise<void> {
    const map = this.getIdMap();
    const toCancel = Object.values(map).filter((e) => e.type === type);
    await Promise.all(
      toCancel.map((e) =>
        Notifications.cancelScheduledNotificationAsync(e.notifId).catch(() => {})
      )
    );
    toCancel.forEach((e) => delete map[e.entryId]);
    mmkv.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify(map));
  }

  // ─── Full re-sync (app launch, foreground resume, pref change) ───────────
  /**
   * Cancels ALL scheduled notifications then reschedules based on
   * current per-type preferences. iOS cap = 64; we cap at 60.
   */
  static async syncAll(entries: CalendarEntry[]): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    mmkv.set(MMKV_KEYS.NOTIF_ID_MAP, JSON.stringify({}));

    const prefs = useNotificationStore.getState();
    if (!prefs.masterEnabled) return;

    const eligible = entries
      .filter((e) => {
        if (!this.isFuture(e)) return false;
        if (e.type === 'REMINDER' && !prefs.remindersEnabled) return false;
        if (e.type === 'EVENT'    && !prefs.eventsEnabled)    return false;
        if (e.type === 'BIRTHDAY' && !prefs.birthdaysEnabled) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 60);

    // Batch in chunks of 10 to avoid overwhelming the scheduler
    const CHUNK = 10;
    for (let i = 0; i < eligible.length; i += CHUNK) {
      await Promise.all(eligible.slice(i, i + CHUNK).map((e) => this.scheduleEntry(e)));
    }
  }

  // ─── Called when a per-type toggle is flipped ────────────────────────────
  static async onTypeToggle(
    type: 'REMINDER' | 'EVENT' | 'BIRTHDAY',
    enabled: boolean,
    entries: CalendarEntry[]
  ): Promise<void> {
    if (enabled) {
      const toAdd = entries
        .filter((e) => e.type === type && this.isFuture(e))
        .slice(0, 20);
      await Promise.all(toAdd.map((e) => this.scheduleEntry(e)));
    } else {
      await this.cancelByType(type);
    }
  }

  // ─── Trigger builder ─────────────────────────────────────────────────────
  private static buildTrigger(
    entry: CalendarEntry
  ): Notifications.NotificationTriggerInput | null {
    if (entry.type === 'REMINDER') {
      const r = entry as Reminder;
      const [h, m] = r.time.split(':').map(Number);
      const fireAt = new Date(r.date);
      fireAt.setHours(h, m, 0, 0);
      if (fireAt <= new Date()) return null;

      if (r.repeat === 'DAILY') {
        return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: h, minute: m };
      }
      if (r.repeat === 'WEEKLY') {
        return {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: fireAt.getDay() + 1, // 1 = Sunday … 7 = Saturday
          hour: h,
          minute: m,
        };
      }
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt };
    }

    if (entry.type === 'EVENT') {
      const e = entry as Event;
      const [h, m] = e.startTime.split(':').map(Number);
      const fireAt = new Date(e.date);
      fireAt.setHours(h, m, 0, 0);
      fireAt.setMinutes(fireAt.getMinutes() - 10); // 10-min early warning
      if (fireAt <= new Date()) return null;
      return { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt };
    }

    if (entry.type === 'BIRTHDAY') {
      const d = new Date(entry.date);
      return {
        type:    Notifications.SchedulableTriggerInputTypes.YEARLY,
        month:   d.getMonth() + 1,
        day:     d.getDate(),
        hour:    9,
        minute:  0,
      };
    }

    return null;
  }

  // ─── Content helpers ─────────────────────────────────────────────────────
  private static buildTitle(entry: CalendarEntry): string {
    const map: Record<string, string> = {
      REMINDER: '⏰  Reminder',
      EVENT:    '📅  Upcoming event',
      BIRTHDAY: '🎂  Birthday today',
    };
    return `${map[entry.type] ?? ''} — ${entry.title}`;
  }

  private static buildBody(entry: CalendarEntry): string {
    if (entry.type === 'EVENT') {
      const e = entry as Event;
      return [e.startTime, e.location].filter(Boolean).join(' · ');
    }
    if (entry.type === 'BIRTHDAY') {
      const b = entry as Birthday;
      const age = b.birthYear
        ? ` turns ${new Date().getFullYear() - b.birthYear}`
        : '';
      return `${b.personName}${age} today. Don't forget to wish them! 🎉`;
    }
    return (entry as Reminder).notes ?? 'Time to check this reminder.';
  }

  private static resolveChannel(type: string): string {
    return { REMINDER: 'reminders', EVENT: 'events', BIRTHDAY: 'birthdays' }[type] ?? 'default';
  }

  private static resolveColor(type: string): string {
    return { REMINDER: '#FFB300', EVENT: '#1E88E5', BIRTHDAY: '#E64A19' }[type] ?? '#4CAF9A';
  }

  private static isFuture(entry: CalendarEntry): boolean {
    return new Date(entry.date) >= new Date(new Date().setHours(0, 0, 0, 0));
  }

  private static getIdMap(): NotifIdMap {
    try {
      const raw = mmkv.getString(MMKV_KEYS.NOTIF_ID_MAP);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
```

---

## 9. Background Sync Task — `backgroundSyncTask.ts`

```typescript
// src/tasks/backgroundSyncTask.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { MMKV } from 'react-native-mmkv';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import { NotificationService } from '../services/NotificationService';
import type { CalendarEntry } from '../types/entries';

export const BACKGROUND_SYNC_TASK = 'CALENDIFY_NOTIF_SYNC';

// Must be at module level — runs even when app is fully killed (Android)
// or during OS-controlled background fetch windows (iOS ~15-60 min).
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const mmkv = new MMKV({ id: 'entries-store' });
    const raw = mmkv.getString(MMKV_KEYS.ALL_ENTRIES);
    if (!raw) return BackgroundFetch.BackgroundFetchResult.NoData;

    const entries: CalendarEntry[] = JSON.parse(raw);
    await NotificationService.syncAll(entries);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error('[CALENDIFY] Background sync failed:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) return;

  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (already) return;

  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 15 * 60, // iOS ignores < 15 min; Android respects it
    stopOnTerminate: false,   // Android: survive app kill
    startOnBoot:     true,    // Android: re-register after reboot
  });
}

export async function unregisterBackgroundSync(): Promise<void> {
  const already = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (already) await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
}
```

---

## 10. Hook — `useNotificationSettings.ts`

```typescript
// src/hooks/useNotificationSettings.ts
import { useCallback } from 'react';
import { useEventsStore } from '../stores/useEventsStore';
import {
  useNotificationStore,
  selectMasterEnabled,
  selectRemindersEnabled,
  selectEventsEnabled,
  selectBirthdaysEnabled,
} from '../stores/useNotificationStore';
import { NotificationService } from '../services/NotificationService';
import { useHaptics } from './useHaptics';

export function useNotificationSettings() {
  const { impact } = useHaptics();
  const entries = useEventsStore((s) => s.entries);

  const masterEnabled    = useNotificationStore(selectMasterEnabled);
  const remindersEnabled = useNotificationStore(selectRemindersEnabled);
  const eventsEnabled    = useNotificationStore(selectEventsEnabled);
  const birthdaysEnabled = useNotificationStore(selectBirthdaysEnabled);

  const {
    setMasterEnabled,
    setRemindersEnabled,
    setEventsEnabled,
    setBirthdaysEnabled,
  } = useNotificationStore();

  const handleMasterToggle = useCallback(async (val: boolean) => {
    impact('medium');
    if (val) {
      const status = await NotificationService.requestPermissions();
      if (status === 'denied') {
        // User previously denied — open OS settings
        NotificationService.openOSSettings();
        return;
      }
      // 'granted' path: setMasterEnabled(true) handled inside requestPermissions()
      await NotificationService.syncAll(entries);
    } else {
      setMasterEnabled(false);
      await NotificationService.syncAll([]); // empty = cancel all
    }
  }, [entries, impact, setMasterEnabled]);

  const handleRemindersToggle = useCallback(async (val: boolean) => {
    impact('light');
    setRemindersEnabled(val);
    await NotificationService.onTypeToggle('REMINDER', val, entries);
  }, [entries, impact, setRemindersEnabled]);

  const handleEventsToggle = useCallback(async (val: boolean) => {
    impact('light');
    setEventsEnabled(val);
    await NotificationService.onTypeToggle('EVENT', val, entries);
  }, [entries, impact, setEventsEnabled]);

  const handleBirthdaysToggle = useCallback(async (val: boolean) => {
    impact('light');
    setBirthdaysEnabled(val);
    await NotificationService.onTypeToggle('BIRTHDAY', val, entries);
  }, [entries, impact, setBirthdaysEnabled]);

  return {
    masterEnabled,
    remindersEnabled,
    eventsEnabled,
    birthdaysEnabled,
    handleMasterToggle,
    handleRemindersToggle,
    handleEventsToggle,
    handleBirthdaysToggle,
  };
}
```

---

## 12. Settings Screen Integration

```tsx
// app/(tabs)/settings.tsx — add notification row + mount the sheet

import { useRef } from 'react';
import { Bell } from 'lucide-react-native';
import NotificationSettingsSheet, {
  type NotificationSettingsSheetRef,
} from '../../src/components/sheets/NotificationSettingsSheet';
import { useNotificationStore } from '../../src/stores/useNotificationStore';
import { SettingsRow } from '../../src/components/ui/SettingsRow';

export default function SettingsScreen() {
  const sheetRef = useRef<NotificationSettingsSheetRef>(null);
  const { masterEnabled, remindersEnabled, eventsEnabled, birthdaysEnabled } =
    useNotificationStore();

  // Summary text shown as the row value
  const activeCount = [remindersEnabled, eventsEnabled, birthdaysEnabled]
    .filter(Boolean).length;
  const summaryText = !masterEnabled
    ? 'Off'
    : activeCount === 3
    ? 'All on'
    : activeCount === 0
    ? 'All off'
    : `${activeCount} of 3 on`;

  return (
    <>
      {/* ... other sections (Accounts, Appearance, Data) ... */}

      {/* NOTIFICATIONS section */}
      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>

      <SettingsRow
        icon={<Bell size={20} color={colors.primary} strokeWidth={1.75} />}
        label="Notification preferences"
        value={summaryText}
        onPress={() => sheetRef.current?.open()}
        showChevron
      />

      {/* Sheet is portalled to root so it overlays the tab bar */}
      <NotificationSettingsSheet ref={sheetRef} />
    </>
  );
}
```

---

## 13. Root Layout Wiring — `app/_layout.tsx`

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { registerBackgroundSync } from '../src/tasks/backgroundSyncTask';
import { NotificationService } from '../src/services/NotificationService';
import { useEventsStore } from '../src/stores/useEventsStore';
import { useNotificationStore } from '../src/stores/useNotificationStore';

export default function RootLayout() {
  const router        = useRouter();
  const entries       = useEventsStore((s) => s.entries);
  const masterEnabled = useNotificationStore((s) => s.masterEnabled);

  useEffect(() => {
    // 1. Sync OS permission state → store (handles external revocation)
    NotificationService.getPermissionStatus().then((status) => {
      if (status !== 'granted') {
        useNotificationStore.getState().setMasterEnabled(false);
      }
    });

    // 2. Register background sync task
    registerBackgroundSync();

    // 3. Full sync on launch
    NotificationService.syncAll(entries);

    // 4. Re-sync when app comes back to foreground
    const appSub = AppState.addEventListener('change', (s: AppStateStatus) => {
      if (s === 'active') NotificationService.syncAll(entries);
    });

    // 5. Notification tap → navigate to day view
    const tapSub = Notifications.addNotificationResponseReceivedListener((res) => {
      const { date } = res.notification.request.content.data as { date?: string };
      if (date) router.push(`/day/${date}`);
    });

    return () => {
      appSub.remove();
      tapSub.remove();
    };
  }, []);

  // Re-sync whenever entries or master toggle changes
  useEffect(() => {
    if (masterEnabled) NotificationService.syncAll(entries);
  }, [entries, masterEnabled]);

  return (/* ... Stack/Tabs navigator ... */);
}
```

---

## 14. `useEventsStore` — Auto-schedule on Mutation

```typescript
// src/stores/useEventsStore.ts — wire NotificationService into mutations

import { NotificationService } from '../services/NotificationService';

// Inside the Zustand store definition:

addEntry: (entry) => {
  set((s) => ({ entries: [...s.entries, entry] }));
  NotificationService.scheduleEntry(entry); // schedule immediately
},

updateEntry: (id, patch) => {
  set((s) => ({
    entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  }));
  // Re-read from state after update, then reschedule
  const updated = useEventsStore.getState().entries.find((e) => e.id === id);
  if (updated) NotificationService.scheduleEntry(updated);
},

deleteEntry: (id) => {
  set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
  NotificationService.cancelEntry(id);
},
```

---

## 15. Platform Behaviour Reference

| Behaviour | iOS | Android |
|---|---|---|
| Max scheduled notifications | **64** (we cap at 60) | No hard cap |
| Background fetch frequency | OS-controlled (~15–60 min) | Respects `minimumInterval: 15 * 60` |
| After app killed | Background fetch still runs | `stopOnTerminate: false` |
| After device reboot | Background fetch re-registers | `startOnBoot: true` |
| Permission prompt | Once only (denied = must go to Settings) | Re-askable on Android 12+ |
| Exact alarms | `DATE` trigger is exact | Requires `SCHEDULE_EXACT_ALARM` |
| Yearly triggers (birthdays) | ✅ `UNCalendarNotificationTrigger` | ✅ `AlarmManager` yearly repeat |
| Notification channels | N/A | Defined per type in `ensureChannels()` |
| Time-sensitive (iOS 15+) | ✅ `interruptionLevel: 'timeSensitive'` | `AndroidImportance.MAX` on reminders |

---

## 16. Implementation Checklist

- [ ] `app.json` permissions + `expo-notifications` plugin added
- [ ] `useNotificationStore` created with MMKV persistence via Zustand `persist`
- [ ] `NotificationService` implemented: `requestPermissions`, `scheduleEntry`, `cancelEntry`, `cancelByType`, `syncAll`, `onTypeToggle`
- [ ] Android channels created: `reminders`, `events`, `birthdays`
- [ ] `backgroundSyncTask.ts` registered with `stopOnTerminate: false` + `startOnBoot: true`
- [ ] `useNotificationSettings` hook wires store ↔ service ↔ haptics
- [ ] `NotificationSettingsSheet` renders correctly in light + dark mode
- [ ] Settings screen has `NOTIFICATIONS` section row opening the sheet
- [ ] Summary text on settings row reflects live pref state
- [ ] Root layout: `registerBackgroundSync` + `syncAll` on mount
- [ ] Root layout: re-sync on `AppState → active`
- [ ] Root layout: notification taps navigate to `/day/[date]`
- [ ] OS permission revocation forces `masterEnabled = false`
- [ ] `useEventsStore` mutations call `scheduleEntry` / `cancelEntry` inline
- [ ] **Test:** toggle Reminders off → no reminder notifications fire
- [ ] **Test:** toggle master off → all notifications cancelled
- [ ] **Test:** toggle master off → on → previous per-type prefs restored
- [ ] **Test:** birthday fires at 9 AM on the correct date yearly
- [ ] **Test:** event fires 10 min before start time
- [ ] **Test:** app killed → notification still fires (Android)
- [ ] **Test:** device reboot → notification still fires (Android)

---

*Last updated: Calendify v1.0.5 — NOTIFICATIONS.md*