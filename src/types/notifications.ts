export type NotifiableEntryType = 'REMINDER' | 'EVENT' | 'BIRTHDAY';

/** Per-type toggle preferences stored in MMKV */
export interface NotificationPreferences {
  masterEnabled:    boolean;  // global kill switch (mirrors OS permission state)
  remindersEnabled: boolean;  // REMINDER type
  eventsEnabled:    boolean;  // EVENT type
  birthdaysEnabled: boolean;  // BIRTHDAY type
}

/** Stored per scheduled notification so we can cancel it later */
export interface NotifIdMapEntry {
  notifId:  string;
  entryId:  string;
  type:     NotifiableEntryType;
}

export type NotifIdMap = Record<string, NotifIdMapEntry>; // keyed by entryId
