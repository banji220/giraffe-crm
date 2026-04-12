/**
 * SMS URL builder for v1.
 * Opens the phone's native SMS app with the message pre-filled.
 * Twilio replaces this in v2 with actual programmatic sending.
 */

/**
 * Build an sms: URL that works on both iOS and Android.
 * iOS uses &body= while Android uses ?body= — the `sms:` scheme
 * with `?&body=` works cross-platform in most modern browsers.
 */
export function buildSmsUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '')
  const encoded = encodeURIComponent(message)
  return `sms:${cleaned}?&body=${encoded}`
}

/**
 * Build a tel: URL for one-tap calling.
 */
export function buildCallUrl(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '')
  return `tel:${cleaned}`
}

/**
 * Default follow-up SMS templates.
 * The app picks the right one based on the lead state.
 */
export const SMS_TEMPLATES = {
  quoteFollowUp: (name: string, price: string) =>
    `Hi ${name}! Just following up on the window cleaning quote for ${price}. Would you like to go ahead and get those scheduled? - Tyler, Holy Giraffe`,

  appointmentReminder: (name: string, date: string) =>
    `Hi ${name}! This is Tyler from Holy Giraffe. Just confirming your window cleaning appointment for ${date}. See you then!`,

  reviewRequest: (name: string) =>
    `Hi ${name}! Thank you for choosing Holy Giraffe for your window cleaning! If you have a moment, we'd really appreciate a quick Google review. It helps us a lot! Thank you!`,
} as const
