import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/hooks/useMMKV';
import { MMKV_KEYS } from '@/src/constants/mmkvKeys';
import type { Account } from '@/src/types/accounts';
import { ACCOUNT_AVATAR_COLORS } from '@/src/constants/dotColors';
import { generateId } from '@/src/utils/generateId';

interface AccountsState {
  accounts: Account[];
  addAccount: (email: string, displayName: string, provider?: Account['provider']) => string;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  setDefault: (id: string) => void;
  getDefaultAccount: () => Account | undefined;
  importAccounts: (accounts: Account[], replace?: boolean) => void;
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],

      addAccount: (email, displayName, provider = 'local') => {
        const id = generateId();
        const existingCount = get().accounts.length;
        const avatarColor = ACCOUNT_AVATAR_COLORS[existingCount % ACCOUNT_AVATAR_COLORS.length];
        const isDefault = existingCount === 0;
        const account: Account = {
          id,
          email,
          displayName,
          avatarColor,
          isDefault,
          provider,
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
        return id;
      },

      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteAccount: (id) => {
        set((state) => {
          const accountToDelete = state.accounts.find((a) => a.id === id);

          if (!accountToDelete || accountToDelete.isDefault) {
            return state;
          }

          return {
            accounts: state.accounts.filter((a) => a.id !== id),
          };
        });
      },

      setDefault: (id) => {
        set((state) => ({
          accounts: state.accounts.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      getDefaultAccount: () => {
        return get().accounts.find((a) => a.isDefault);
      },

      importAccounts: (accounts, replace = false) => {
        if (replace) {
          set({ accounts });
        } else {
          set((state) => {
            const mergedAccounts = new Map(state.accounts.map((account) => [account.id, account]));

            for (const account of accounts) {
              mergedAccounts.set(account.id, account);
            }

            return {
              accounts: Array.from(mergedAccounts.values()),
            };
          });
        }
      },
    }),
    {
      name: MMKV_KEYS.ACCOUNTS,
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ accounts: state.accounts }),
    }
  )
);
