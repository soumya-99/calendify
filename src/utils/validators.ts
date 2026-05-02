import { z } from 'zod';

const RepeatRuleSchema = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);
const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const BaseEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountId: z.string().min(1),
  colorTag: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ReminderSchema = BaseEntrySchema.extend({
  type: z.literal('REMINDER'),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  repeat: RepeatRuleSchema,
  notified: z.boolean(),
});

export const TaskSchema = BaseEntrySchema.extend({
  type: z.literal('TASK'),
  time: z.string().optional(),
  dueDate: z.string().optional(),
  completed: z.boolean(),
  priority: PrioritySchema,
});

export const EventSchema = BaseEntrySchema.extend({
  type: z.literal('EVENT'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().optional(),
  repeat: RepeatRuleSchema,
  allDay: z.boolean(),
  attendees: z.array(z.string()).optional(),
});

export const BirthdaySchema = BaseEntrySchema.extend({
  type: z.literal('BIRTHDAY'),
  personName: z.string().min(1),
  birthYear: z.number().optional(),
  contactId: z.string().optional(),
});

export const HolidaySchema = BaseEntrySchema.extend({
  type: z.literal('HOLIDAY'),
  allDay: z.boolean(),
  country: z.string().optional(),
});

export const AnyEntrySchema = z.union([
  ReminderSchema,
  TaskSchema,
  EventSchema,
  BirthdaySchema,
  HolidaySchema,
]);

export const AccountSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  displayName: z.string().min(1),
  avatarColor: z.string(),
  isDefault: z.boolean(),
  provider: z.enum(['local', 'google_manual', 'outlook_manual']),
});

export const CalendifyExportSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  accounts: z.array(AccountSchema),
  entries: z.array(AnyEntrySchema),
  settings: z.record(z.string(), z.unknown()).optional(),
});
