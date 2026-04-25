import { MMKV_KEYS } from '@/src/constants/mmkvKeys';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { NotificationService } from '@/src/services/NotificationService';
import type {
  AnyEntry,
  Birthday,
  CalendarEvent,
  EntryType,
  Reminder,
  Task,
} from '@/src/types/entries';
import { nowISO } from '@/src/utils/dateHelpers';
import { generateId } from '@/src/utils/generateId';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface EventsState {
  entries: AnyEntry[];

  // CRUD
  addEntry: (entry: Record<string, unknown>) => Promise<string>;
  updateEntry: (id: string, updates: Record<string, unknown>) => void;
  deleteEntry: (id: string) => void;

  // Bulk operations
  addEntries: (entries: Record<string, unknown>[]) => Promise<void>;
  importEntries: (entries: AnyEntry[], replace?: boolean) => void;
  clearAll: () => void;
  clearByType: (type: EntryType) => void;

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
      clearByType: (type) => set((state) => ({
        entries: state.entries.filter((e) => e.type !== type)
      })),

      addEntry: async (entry: Record<string, unknown>) => {
        const id = generateId();
        const now = nowISO();
        const newEntry = { ...entry, id, createdAt: now, updatedAt: now } as unknown as AnyEntry;
        set((state) => ({ entries: [...state.entries, newEntry] as AnyEntry[] }));
        await NotificationService.scheduleEntry(newEntry);
        return id;
      },

      addEntries: async (entriesToImport: Record<string, unknown>[]) => {
        const now = nowISO();
        const newEntries = entriesToImport.map(e => ({
          ...e,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        })) as unknown as AnyEntry[];
        
        set((state) => ({ entries: [...state.entries, ...newEntries] as AnyEntry[] }));
        await NotificationService.syncAll(get().entries);
      },

      updateEntry: async (id: string, updates: Record<string, unknown>) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? ({ ...e, ...updates, updatedAt: nowISO() } as AnyEntry) : e
          ),
        }));
        const updated = get().entries.find((e) => e.id === id);
        if (updated) await NotificationService.scheduleEntry(updated);
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
        NotificationService.cancelEntry(id);
      },

      importEntries: async (entries: AnyEntry[], replace = false) => {
        if (replace) {
          set({ entries });
        } else {
          set((state) => {
            const mergedEntries = new Map(state.entries.map((entry) => [entry.id, entry]));

            for (const entry of entries) {
              mergedEntries.set(entry.id, entry);
            }

            return {
              entries: Array.from(mergedEntries.values()),
            };
          });
        }
        await NotificationService.syncAll(get().entries);
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
