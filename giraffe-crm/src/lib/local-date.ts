/**
 * Local-date helpers.
 *
 * NEVER use .toISOString().slice(0, 10) to get a date key — that gives
 * the UTC date, which shifts +1 day after 5pm Pacific.
 * Always use toLocalDateKey() instead.
 */

/** Returns "YYYY-MM-DD" in the browser's LOCAL timezone. */
export function toLocalDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Returns today's date key in local timezone. */
export function todayLocalKey(): string {
  return toLocalDateKey(new Date())
}
