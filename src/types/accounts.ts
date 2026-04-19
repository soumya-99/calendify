export type AccountProvider = 'local' | 'google_manual' | 'outlook_manual';

export interface Account {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  isDefault: boolean;
  provider: AccountProvider;
}
