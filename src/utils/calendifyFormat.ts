import type { AnyEntry } from '@/src/types/entries';
import type { Account } from '@/src/types/accounts';
import { CalendifyExportSchema } from './validators';

interface CalendifyExport {
  version: string;
  exportedAt: string;
  accounts: Account[];
  entries: AnyEntry[];
  settings?: Record<string, unknown>;
}

/**
 * Serialize app data to the raw Calendify backup payload
 */
export function serializeCalendify(
  accounts: Account[],
  entries: AnyEntry[],
  settings?: Record<string, unknown>
): string {
  const data: CalendifyExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    accounts,
    entries,
    settings,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Deserialize the raw Calendify backup payload back to app data
 */
export function deserializeCalendify(json: string): CalendifyExport {
  const parsed = JSON.parse(json);
  const validated = CalendifyExportSchema.parse(parsed);
  return validated as CalendifyExport;
}
