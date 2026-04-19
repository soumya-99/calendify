import type { CalendarEvent } from '@/src/types/entries';
import { generateId } from './generateId';
import { nowISO } from './dateHelpers';

/**
 * Minimal hand-rolled ICS generator for VEVENT blocks (RFC 5545).
 */

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function dateTimeToIcs(date: string, time: string): string {
  // date = 'YYYY-MM-DD', time = 'HH:mm'
  const d = date.replace(/-/g, '');
  const t = time.replace(':', '') + '00';
  return `${d}T${t}`;
}

/**
 * Export events as .ics format
 */
export function eventsToIcs(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendify//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@calendify`);
    lines.push(`DTSTART:${dateTimeToIcs(event.date, event.startTime)}`);
    lines.push(`DTEND:${dateTimeToIcs(event.date, event.endTime)}`);
    lines.push(`SUMMARY:${escapeIcs(event.title)}`);
    if (event.location) {
      lines.push(`LOCATION:${escapeIcs(event.location)}`);
    }
    if (event.notes) {
      lines.push(`DESCRIPTION:${escapeIcs(event.notes)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Parse .ics content into CalendarEvent objects.
 * Minimal parser — handles VEVENT blocks only.
 */
export function icsToEvents(icsContent: string, accountId: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const blocks = icsContent.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const lines = block.split(/\r?\n/);

    let title = '';
    let dateStr = '';
    let startTime = '00:00';
    let endTime = '01:00';
    let location: string | undefined;
    let notes: string | undefined;

    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        title = line.substring(8).replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
      } else if (line.startsWith('DTSTART')) {
        const val = line.split(':').pop() ?? '';
        // format: 20250315T100000 or 20250315
        const dateMatch = val.match(/^(\d{4})(\d{2})(\d{2})/);
        if (dateMatch) {
          dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        }
        const timeMatch = val.match(/T(\d{2})(\d{2})/);
        if (timeMatch) {
          startTime = `${timeMatch[1]}:${timeMatch[2]}`;
        }
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':').pop() ?? '';
        const timeMatch = val.match(/T(\d{2})(\d{2})/);
        if (timeMatch) {
          endTime = `${timeMatch[1]}:${timeMatch[2]}`;
        }
      } else if (line.startsWith('LOCATION:')) {
        location = line.substring(9).replace(/\\n/g, '\n').replace(/\\,/g, ',');
      } else if (line.startsWith('DESCRIPTION:')) {
        notes = line.substring(12).replace(/\\n/g, '\n').replace(/\\,/g, ',');
      }
    }

    if (title && dateStr) {
      const now = nowISO();
      events.push({
        id: generateId(),
        type: 'EVENT',
        title,
        date: dateStr,
        startTime,
        endTime,
        location,
        notes,
        repeat: 'NONE',
        allDay: false,
        accountId,
        colorTag: '#1E88E5',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return events;
}
