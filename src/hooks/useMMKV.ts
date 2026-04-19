import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'calendify-storage' });

/**
 * Zustand-compatible storage adapter backed by MMKV v4.
 * All reads/writes are synchronous.
 *
 * v4 changes from v3:
 *  - `new MMKV()` → `createMMKV()`
 *  - `.delete(key)` → `.remove(key)`
 */
export const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};
