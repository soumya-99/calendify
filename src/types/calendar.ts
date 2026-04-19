export type DayCellState = 'otherMonth' | 'normal' | 'today' | 'selected' | 'todaySelected';

export interface DayData {
  date: string; // 'YYYY-MM-DD'
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  state: DayCellState;
  entryCount: number;
}

export interface MonthData {
  year: number;
  month: number; // 0-indexed (0 = January)
  weeks: DayData[][];
}
