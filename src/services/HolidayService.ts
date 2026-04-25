import * as Localization from 'expo-localization';
import { useEventsStore } from '../stores/useEventsStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import type { EntryType } from '../types/entries';

const ICAL_URLS: Record<string, string> = {
  IN: 'https://calendar.google.com/calendar/ical/en.indian%23holiday%40group.v.calendar.google.com/public/basic.ics',
  US: 'https://calendar.google.com/calendar/ical/en.usa%23holiday%40group.v.calendar.google.com/public/basic.ics',
  GB: 'https://calendar.google.com/calendar/ical/en.uk%23holiday%40group.v.calendar.google.com/public/basic.ics',
};

export class HolidayService {
  static async syncHolidays(): Promise<void> {
    const { holidaysEnabled, holidayCountry, setHolidayCountry } = useNotificationStore.getState();
    
    if (!holidaysEnabled) {
      useEventsStore.getState().clearByType('HOLIDAY');
      return;
    }

    let country = holidayCountry;
    if (!country) {
      country = Localization.getLocales()[0]?.regionCode ?? 'IN';
      setHolidayCountry(country);
    }

    const url = ICAL_URLS[country];
    if (!url) {
      console.warn(`No holiday iCal URL for country: ${country}`);
      return;
    }

    try {
      const response = await fetch(url);
      const icsData = await response.text();
      const holidays = this.parseICS(icsData, country);
      
      if (holidays.length > 0) {
        await useEventsStore.getState().addEntries(holidays);
      }
    } catch (error) {
      console.error('Failed to sync holidays:', error);
    }
  }

  private static parseICS(data: string, country: string): any[] {
    const events: any[] = [];
    const vevents = data.split('BEGIN:VEVENT');
    // Skip the first part (header)
    for (let i = 1; i < vevents.length; i++) {
      const vevent = vevents[i];
      
      const summaryMatch = vevent.match(/SUMMARY:(.*)/);
      const dtstartMatch = vevent.match(/DTSTART;VALUE=DATE:(\d{8})/);
      const uidMatch = vevent.match(/UID:(.*)/);

      if (summaryMatch && dtstartMatch) {
        const title = summaryMatch[1].trim().replace(/\\,/g, ',');
        const rawDate = dtstartMatch[1]; // YYYYMMDD
        const uid = uidMatch ? uidMatch[1].trim() : `holiday_${rawDate}_${title}`;
        
        const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
        
        // Filter for current and next year to keep store light
        const year = parseInt(rawDate.slice(0, 4), 10);
        const currentYear = new Date().getFullYear();
        if (year < currentYear || year > currentYear + 1) continue;

        events.push({
          type: 'HOLIDAY' as EntryType,
          title,
          date,
          allDay: true,
          colorTag: '#8E24AA', // Lavender for holidays
          notes: `Public Holiday (${country})`,
          accountId: 'local',
          osId: uid,
        });
      }
    }
    return events;
  }
}
