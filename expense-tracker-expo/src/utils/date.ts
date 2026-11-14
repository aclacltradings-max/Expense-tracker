/** Helpers for working with `YYYY-MM-DD` strings without timezone surprises. */

/** Today's date as `YYYY-MM-DD` in the user's local timezone. */
export function todayISO(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** `YYYY-MM` key for a `YYYY-MM-DD` (or any parseable) date string. */
export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/** Human label for a `YYYY-MM` key, e.g. "March 2025". */
export function monthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  if (!year || !monthIndex) return month;
  return new Date(year, monthIndex - 1, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

/** Short human label for a `YYYY-MM` key, e.g. "Mar 25". */
export function shortMonthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  if (!year || !monthIndex) return month;
  return new Date(year, monthIndex - 1, 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
}

/** Friendly display for a `YYYY-MM-DD` date, e.g. "12 Mar 2025". */
export function formatDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-').map(Number);
  if (!year || !month || !day) return dateISO;
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** `true` when `dateISO` falls within the inclusive [from, to] range. Empty bounds are ignored. */
export function isWithinRange(dateISO: string, from: string, to: string): boolean {
  if (from && dateISO < from) return false;
  if (to && dateISO > to) return false;
  return true;
}

/** Ascending comparator for `YYYY-MM` keys. */
export function compareMonth(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Convert a `Date` from the native picker into a `YYYY-MM-DD` string. */
export function dateToISO(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Convert a `YYYY-MM-DD` string into a `Date` for the native picker. */
export function isoToDate(dateISO: string): Date {
  const [year, month, day] = dateISO.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}
