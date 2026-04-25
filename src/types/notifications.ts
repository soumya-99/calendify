export type NotifiableEntryType = 'REMINDER' | 'EVENT' | 'BIRTHDAY';

/** Per-type toggle preferences stored in MMKV */
export interface NotificationPreferences {
  masterEnabled:    boolean;  // global kill switch (mirrors OS permission state)
  remindersEnabled: boolean;  // REMINDER type
  eventsEnabled:    boolean;  // EVENT type
  birthdaysEnabled: boolean;  // BIRTHDAY type
  holidaysEnabled: boolean;   // HOLIDAY type
  holidayCountry?: string;    // Selected country code (e.g. 'IN')
}

/** Stored per scheduled notification so we can cancel it later */
export interface NotifIdMapEntry {
  notifIds: string[];
  entryId:  string;
  type:     NotifiableEntryType;
}

export type NotifIdMap = Record<string, NotifIdMapEntry>; // keyed by entryId
