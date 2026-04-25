import dayjs from 'dayjs';

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * Format a date string for display
 */
export function formatDateDisplay(dateStr: string): string {
  return dayjs(dateStr).format('MMMM D, YYYY');
}

/**
 * Get the day name (e.g. "Wednesday")
 */
export function getDayName(dateStr: string): string {
  return dayjs(dateStr).format('dddd');
}

/**
 * Get month name from month index (0-indexed)
 */
export function getMonthName(month: number): string {
  return dayjs().month(month).format('MMMM');
}

/**
 * Get short weekday labels starting from Monday
 */
export function getWeekDayLabels(short = true): string[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (short) return days;
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

/**
 * Generate the calendar grid for a given month/year.
 * Returns an array of weeks, where each week contains 7 day strings (YYYY-MM-DD).
 * Weeks start on Monday.
 */
export function getMonthGrid(year: number, month: number): string[][] {
  const firstDay = dayjs().year(year).month(month).startOf('month');
  const lastDay = firstDay.endOf('month');

  // dayjs().day() returns 0=Sun,1=Mon...6=Sat
  // We want Monday = 0, so we remap:
  let startDow = firstDay.day() - 1;
  if (startDow < 0) startDow = 6; // Sunday → index 6

  const totalDaysInMonth = lastDay.date();

  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  // Fill leading days from previous month
  for (let i = 0; i < startDow; i++) {
    const prevDay = firstDay.subtract(startDow - i, 'day');
    currentWeek.push(prevDay.format('YYYY-MM-DD'));
  }

  // Fill current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const date = firstDay.date(d);
    currentWeek.push(date.format('YYYY-MM-DD'));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing days from next month
  if (currentWeek.length > 0) {
    let nextDayNum = 1;
    const nextMonth = firstDay.add(1, 'month');
    while (currentWeek.length < 7) {
      currentWeek.push(nextMonth.date(nextDayNum).format('YYYY-MM-DD'));
      nextDayNum++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Check if a date string belongs to a given month
 */
export function isInMonth(dateStr: string, year: number, month: number): boolean {
  const d = dayjs(dateStr);
  return d.year() === year && d.month() === month;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

/**
 * Get relative date label
 */
export function getRelativeDateLabel(dateStr: string): string {
  const today = dayjs().startOf('day');
  const target = dayjs(dateStr).startOf('day');
  const diff = target.diff(today, 'day');

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 7) return `In ${diff} days`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return dayjs(dateStr).format('MMM D, YYYY');
}

/**
 * Calculate age from birth year
 */
export function calculateAge(birthYear: number): number {
  return dayjs().year() - birthYear;
}

/**
 * Get days until next occurrence of a birthday
 */
export function daysUntilBirthday(dateStr: string): number {
  const today = dayjs().startOf('day');
  let next = dayjs(dateStr).year(today.year());
  if (next.isBefore(today)) {
    next = next.add(1, 'year');
  }
  return next.diff(today, 'day');
}

/**
 * Format time string for display
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get ISO timestamp for now
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Formats a number of days into a human-readable countdown string.
 * When days are less than 1 month (30 days), shows only days.
 * Otherwise, shows months and days.
 */
export function formatCountdown(days: number): string {
  if (days === 0) return 'Today! 🎂';
  if (days === 1) return 'Tomorrow!';
  if (days < 30) return `${days} days`;

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;

  const mText = `${months} ${months === 1 ? 'month' : 'months'}`;
  const dText = remainingDays > 0 ? `, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}` : '';

  return `${mText}${dText}`;
}
