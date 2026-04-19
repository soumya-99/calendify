import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '@/src/constants/mmkvKeys';
import type {
  AnyEntry,
  Reminder,
  Task,
  CalendarEvent,
  Birthday,
  EntryType,
} from '@/src/types/entries';
import { generateId } from '@/src/utils/generateId';
import { nowISO } from '@/src/utils/dateHelpers';

interface EventsState {
  entries: AnyEntry[];

  // CRUD
  addEntry: (entry: Record<string, unknown>) => string;
  updateEntry: (id: string, updates: Record<string, unknown>) => void;
  deleteEntry: (id: string) => void;

  // Bulk operations
  importEntries: (entries: AnyEntry[], replace?: boolean) => void;
  clearAll: () => void;

  // Selectors
  getEntriesByDate: (date: string) => AnyEntry[];
  getEntriesByType: (type: EntryType) => AnyEntry[];
  getEntriesByAccount: (accountId: string) => AnyEntry[];
  getReminders: () => Reminder[];
  getTasks: () => Task[];
  getEvents: () => CalendarEvent[];
  getBirthdays: () => Birthday[];
  getEntryById: (id: string) => AnyEntry | undefined;

  // Task specific
  toggleTaskComplete: (id: string) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      clearAll: () => set({ entries: [] }),

      addEntry: (entry: Record<string, unknown>) => {
        const id = generateId();
        const now = nowISO();
        const newEntry = { ...entry, id, createdAt: now, updatedAt: now } as unknown as AnyEntry;
        set((state) => ({ entries: [...state.entries, newEntry] as AnyEntry[] }));
        return id;
      },

      updateEntry: (id: string, updates: Record<string, unknown>) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? ({ ...e, ...updates, updatedAt: nowISO() } as AnyEntry) : e
          ),
        }));
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },

      importEntries: (entries, replace = false) => {
        if (replace) {
          set({ entries });
        } else {
          set((state) => ({
            entries: [...state.entries, ...entries],
          }));
        }
      },

      getEntriesByDate: (date) => {
        return get().entries.filter((e) => e.date === date);
      },

      getEntriesByType: (type) => {
        return get().entries.filter((e) => e.type === type);
      },

      getEntriesByAccount: (accountId) => {
        return get().entries.filter((e) => e.accountId === accountId);
      },

      getReminders: () => {
        return get().entries.filter((e): e is Reminder => e.type === 'REMINDER');
      },

      getTasks: () => {
        return get().entries.filter((e): e is Task => e.type === 'TASK');
      },

      getEvents: () => {
        return get().entries.filter((e): e is CalendarEvent => e.type === 'EVENT');
      },

      getBirthdays: () => {
        return get().entries.filter((e): e is Birthday => e.type === 'BIRTHDAY');
      },

      getEntryById: (id) => {
        return get().entries.find((e) => e.id === id);
      },

      toggleTaskComplete: (id: string) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id && e.type === 'TASK'
              ? ({ ...e, completed: !(e as Task).completed, updatedAt: nowISO() } as AnyEntry)
              : e
          ),
        }));
      },
    }),
    {
      name: MMKV_KEYS.ENTRIES,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);
