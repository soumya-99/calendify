import { nanoid } from 'nanoid/non-secure';

export function generateId(size = 21): string {
  return nanoid(size);
}
