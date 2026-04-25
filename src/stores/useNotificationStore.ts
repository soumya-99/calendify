import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '../constants/mmkvKeys';
import type { NotificationPreferences } from '../types/notifications';

interface NotificationStore extends NotificationPreferences {
  setMasterEnabled:    (val: boolean) => void;
  setRemindersEnabled: (val: boolean) => void;
  setEventsEnabled:    (val: boolean) => void;
  setBirthdaysEnabled: (val: boolean) => void;
  setHolidaysEnabled:  (val: boolean) => void;
  setHolidayCountry:   (val: string) => void;
  setAllPrefs:         (prefs: Partial<NotificationPreferences>) => void;
  reset:               () => void;
}

const DEFAULT_PREFS: NotificationPreferences = {
  masterEnabled:    false,  // false until user grants OS permission
  remindersEnabled: true,   // default on — active once master is granted
  eventsEnabled:    true,
  birthdaysEnabled: true,
  holidaysEnabled:  false,
  holidayCountry:   undefined,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFS,
      setMasterEnabled:    (val) => set({ masterEnabled: val }),
      setRemindersEnabled: (val) => set({ remindersEnabled: val }),
      setEventsEnabled:    (val) => set({ eventsEnabled: val }),
      setBirthdaysEnabled: (val) => set({ birthdaysEnabled: val }),
      setHolidaysEnabled:  (val) => set({ holidaysEnabled: val }),
      setHolidayCountry:   (val) => set({ holidayCountry: val }),
      setAllPrefs:         (prefs) => set(prefs),
      reset:               () => set(DEFAULT_PREFS),
    }),
    {
      name:    MMKV_KEYS.NOTIF_PREFS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// Typed selectors
export const selectMasterEnabled    = (s: NotificationStore) => s.masterEnabled;
export const selectRemindersEnabled = (s: NotificationStore) => s.remindersEnabled;
export const selectEventsEnabled    = (s: NotificationStore) => s.eventsEnabled;
export const selectBirthdaysEnabled = (s: NotificationStore) => s.birthdaysEnabled;
