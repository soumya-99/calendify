import type { EntryType } from '@/src/types/entries';

export const ENTRY_TYPES: Record<EntryType, EntryType> = {
  REMINDER: 'REMINDER',
  TASK: 'TASK',
  EVENT: 'EVENT',
  BIRTHDAY: 'BIRTHDAY',
  HOLIDAY: 'HOLIDAY',
} as const;

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  REMINDER: 'Reminder',
  TASK: 'Task',
  EVENT: 'Event',
  BIRTHDAY: 'Birthday',
  HOLIDAY: 'Holiday',
};
