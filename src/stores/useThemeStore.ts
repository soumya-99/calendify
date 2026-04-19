import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '@/src/constants/mmkvKeys';
import type { ThemeMode, ColorSchemeChoice } from '@/src/types/theme';

interface ThemeState {
  themeMode: ThemeMode;
  colorScheme: ColorSchemeChoice;
  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorSchemeChoice) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      colorScheme: 'default',

      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      setColorScheme: (scheme: ColorSchemeChoice) => set({ colorScheme: scheme }),
    }),
    {
      name: MMKV_KEYS.THEME_MODE,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
