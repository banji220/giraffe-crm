/**
 * Phone formatting + normalization.
 *
 * Storage format: E.164 ("+1XXXXXXXXXX") — what Supabase Auth and Twilio want.
 * Display format: "(XXX) XXX-XXXX" — what humans want.
 *
 * US-only for now. Internationalization is a problem for future-Tyler.
 */

/** Strip everything except digits. */
export function digitsOnly(input: string): string {
  return (input || '').replace(/\D+/g, '')
}

/** Convert any US phone input to E.164 (+1XXXXXXXXXX). Returns null if invalid. */
export function toE164(input: string): string | null {
  const digits = digitsOnly(input)
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/** Pretty-print as you type: "(714) 555-1234". Accepts partial input. */
export function formatAsYouType(input: string): string {
  const d = digitsOnly(input).slice(0, 10)
  if (d.length === 0) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/** Pretty-print a stored E.164 number for display. */
export function formatE164ForDisplay(e164: string): string {
  if (!e164) return ''
  const d = e164.replace(/^\+1/, '')
  if (d.length !== 10) return e164
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

/** Last 4 digits — for the session chip. */
export function last4(e164: string): string {
  const d = digitsOnly(e164)
  return d.slice(-4)
}
