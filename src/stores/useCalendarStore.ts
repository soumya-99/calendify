import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '@/src/constants/mmkvKeys';
import { getTodayString } from '@/src/utils/dateHelpers';

interface CalendarState {
  selectedDate: string;
  currentMonth: number;
  currentYear: number;
  setSelectedDate: (date: string) => void;
  setMonth: (month: number, year: number) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

const today = new Date();

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      selectedDate: getTodayString(),
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),

      setSelectedDate: (date: string) => set({ selectedDate: date }),

      setMonth: (month: number, year: number) =>
        set({ currentMonth: month, currentYear: year }),

      goToPrevMonth: () => {
        const { currentMonth, currentYear } = get();
        if (currentMonth === 0) {
          set({ currentMonth: 11, currentYear: currentYear - 1 });
        } else {
          set({ currentMonth: currentMonth - 1 });
        }
      },

      goToNextMonth: () => {
        const { currentMonth, currentYear } = get();
        if (currentMonth === 11) {
          set({ currentMonth: 0, currentYear: currentYear + 1 });
        } else {
          set({ currentMonth: currentMonth + 1 });
        }
      },

      goToToday: () => {
        const now = new Date();
        set({
          selectedDate: getTodayString(),
          currentMonth: now.getMonth(),
          currentYear: now.getFullYear(),
        });
      },
    }),
    {
      name: MMKV_KEYS.SELECTED_DATE,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ selectedDate: state.selectedDate }),
    }
  )
);
