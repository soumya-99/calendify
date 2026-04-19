import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '@/src/constants/mmkvKeys';

interface SettingsState {
  onboardingDone: boolean;
  weekStartsOn: 'monday' | 'sunday';
  setOnboardingDone: (done: boolean) => void;
  setWeekStartsOn: (day: 'monday' | 'sunday') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      weekStartsOn: 'monday',

      setOnboardingDone: (done: boolean) => set({ onboardingDone: done }),
      setWeekStartsOn: (day: 'monday' | 'sunday') => set({ weekStartsOn: day }),
    }),
    {
      name: MMKV_KEYS.SETTINGS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
