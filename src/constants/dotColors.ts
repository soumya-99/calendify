import type { EntryType } from '@/src/types/entries';

export const DOT_COLORS: Record<EntryType, string> = {
  REMINDER: '#FFB300', // Amber
  TASK: '#43A047',     // Emerald
  EVENT: '#1E88E5',    // Sapphire
  BIRTHDAY: '#E64A19', // Coral
};

export const HOLIDAY_DOT_COLOR = '#8E24AA'; // Lavender

export const TAG_COLORS = [
  '#FFB300',
  '#43A047',
  '#1E88E5',
  '#E64A19',
  '#8E24AA',
  '#00897B',
  '#F4511E',
  '#3949AB',
] as const;

export const ACCOUNT_AVATAR_COLORS = [
  '#E53935',
  '#D81B60',
  '#8E24AA',
  '#5E35B1',
  '#3949AB',
  '#1E88E5',
  '#00897B',
  '#43A047',
  '#F4511E',
  '#6D4C41',
] as const;

export const TAB_ACTIVE_COLORS = {
  home: '#4CAF9A',
  reminders: '#F4A261',
  tasks: '#52B788',
  birthdays: '#E76F51',
  settings: '#9B72CF',
} as const;
