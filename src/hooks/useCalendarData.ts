import { useMemo } from 'react';
import { useEventsStore } from '@/src/stores/useEventsStore';
import { useCalendarStore } from '@/src/stores/useCalendarStore';
import { getMonthGrid, isInMonth, isToday } from '@/src/utils/dateHelpers';
import { getDotColor } from '@/src/utils/colorDotMap';
import type { DayData, DayCellState } from '@/src/types/calendar';
import type { AnyEntry } from '@/src/types/entries';

interface CalendarData {
  weeks: DayData[][];
  selectedDateEntries: AnyEntry[];
  entryCounts: Record<string, number>;
  dotColorsByDate: Record<string, string[]>;
}

/**
 * Derives calendar grid data, entry counts per date, and dot colors
 * for the currently displayed month.
 */
export function useCalendarData(): CalendarData {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const currentYear = useCalendarStore((s) => s.currentYear);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const entries = useEventsStore((s) => s.entries);

  const entryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.date] = (counts[entry.date] ?? 0) + 1;
    }
    return counts;
  }, [entries]);

  const dotColorsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const entry of entries) {
      if (!map[entry.date]) map[entry.date] = [];
      const color = getDotColor(entry.type);
      if (!map[entry.date].includes(color)) {
        map[entry.date].push(color);
      }
    }
    return map;
  }, [entries]);

  const weeks = useMemo(() => {
    const grid = getMonthGrid(currentYear, currentMonth);
    return grid.map((week) =>
      week.map((dateStr): DayData => {
        const day = parseInt(dateStr.split('-')[2], 10);
        const isCurrentMonth = isInMonth(dateStr, currentYear, currentMonth);
        const isTodayDate = isToday(dateStr);
        const isSelected = dateStr === selectedDate;

        let state: DayCellState = 'normal';
        if (!isCurrentMonth) state = 'otherMonth';
        else if (isTodayDate && isSelected) state = 'todaySelected';
        else if (isTodayDate) state = 'today';
        else if (isSelected) state = 'selected';

        return {
          date: dateStr,
          day,
          isCurrentMonth,
          isToday: isTodayDate,
          isSelected,
          state,
          entryCount: entryCounts[dateStr] ?? 0,
        };
      })
    );
  }, [currentYear, currentMonth, selectedDate, entryCounts]);

  const selectedDateEntries = useMemo(() => {
    return entries.filter((e) => e.date === selectedDate);
  }, [entries, selectedDate]);

  return { weeks, selectedDateEntries, entryCounts, dotColorsByDate };
}
