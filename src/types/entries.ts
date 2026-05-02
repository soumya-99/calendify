export type EntryType = 'REMINDER' | 'TASK' | 'EVENT' | 'BIRTHDAY' | 'HOLIDAY';

export type RepeatRule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CalendarEntry {
  id: string;
  type: EntryType;
  title: string;
  date: string; // ISO 8601 date: 'YYYY-MM-DD'
  accountId: string;
  colorTag: string; // hex color for dot indicator
  notes?: string;
  notificationTime?: string; // ISO 8601 timestamp for custom notification
  osId?: string; // ID from external source (Device Calendar/Contacts)
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface Reminder extends CalendarEntry {
  type: 'REMINDER';
  time: string; // 'HH:mm'
  repeat: RepeatRule;
  notified: boolean;
}

export interface Task extends CalendarEntry {
  type: 'TASK';
  time?: string;
  dueDate?: string;
  completed: boolean;
  priority: Priority;
}

export interface CalendarEvent extends CalendarEntry {
  type: 'EVENT';
  startTime: string;
  endTime: string;
  location?: string;
  repeat: RepeatRule;
  allDay: boolean;
  attendees?: string[];
}

export interface Birthday extends CalendarEntry {
  type: 'BIRTHDAY';
  personName: string;
  birthYear?: number;
  contactId?: string;
}

export interface Holiday extends CalendarEntry {
  type: 'HOLIDAY';
  allDay: boolean;
  country?: string;
}

export type AnyEntry = Reminder | Task | CalendarEvent | Birthday | Holiday;
