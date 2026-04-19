import { DOT_COLORS } from '@/src/constants/dotColors';
import type { EntryType } from '@/src/types/entries';

/**
 * Get the dot color associated with an entry type.
 */
export function getDotColor(type: EntryType): string {
  return DOT_COLORS[type];
}
