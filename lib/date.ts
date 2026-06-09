/* Date helpers shared by the calendar + date-range picker. */

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** The dataset's "today" — everything in the demo is themed around late 2021. */
export const DATASET_TODAY = new Date(2021, 11, 31);

export type DateRange = { start: Date; end: Date };

/** A 6/5-week grid (Sunday-start) of cells for a given month. */
export function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const rows = Math.ceil((first + days) / 7);
  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = 0; i < first; i++) {
    const day = prevDays - first + 1 + i;
    cells.push({ day, current: false, date: new Date(year, month - 1, day) });
  }
  for (let d = 1; d <= days; d++) cells.push({ day: d, current: true, date: new Date(year, month, d) });
  let next = 1;
  while (cells.length < rows * 7) {
    cells.push({ day: next, current: false, date: new Date(year, month + 1, next) });
    next++;
  }
  return cells;
}

export function formatMDY(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getFullYear()}`;
}

export function formatShort(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

export function formatLong(d: Date) {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function diffDays(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

/** Inclusive list of days between start and end. */
export function eachDay(start: Date, end: Date) {
  const out: Date[] = [];
  const n = Math.max(0, diffDays(start, end));
  for (let i = 0; i <= n; i++) out.push(addDays(start, i));
  return out;
}
