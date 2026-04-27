/**
 * Google Calendar helpers
 *
 * Two functions:
 * 1. connectGoogleCalendar() — starts the OAuth flow
 * 2. createCalendarEvent() — creates an event after capture
 */

import { createClient } from '@/lib/supabase/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// ── Start OAuth flow ─────────────────────────────────────────────────
// Redirects user to Google consent screen. After approval,
// Google sends them to /auth/callback/google with a code.

export async function connectGoogleCalendar(): Promise<void> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Not logged in')
  }

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/google-auth?action=authorize`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  )

  const data = await res.json()

  if (data.error) {
    throw new Error(data.error)
  }

  // Redirect to Google
  window.location.href = data.url
}

// ── Check if Google Calendar is connected ────────────────────────────

export async function isCalendarConnected(): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_google_tokens')
    .select('id')
    .limit(1)
    .single()

  return !!data
}

// ── Update/replace a calendar event (delete old + create new) ────────

interface UpdateCalendarEventInput {
  houseId: string
  oldEventId: string | null
  contactName: string
  phone: string
  address: string
  price: number
  date: string          // ISO string
  type: 'job' | 'follow_up'
}

export async function updateCalendarEvent(input: UpdateCalendarEventInput): Promise<{ eventId: string } | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const connected = await isCalendarConnected()
  if (!connected) return null

  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/update-calendar-event`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          house_id: input.houseId,
          old_event_id: input.oldEventId,
          contact_name: input.contactName,
          phone: input.phone,
          address: input.address,
          price: input.price,
          date: input.date,
          type: input.type,
        }),
      }
    )

    const data = await res.json()
    if (data.error) {
      console.error('Calendar update failed:', data.error)
      return null
    }
    return { eventId: data.event_id }
  } catch (err) {
    console.error('Calendar update error:', err)
    return null
  }
}

// ── Create a calendar event ──────────────────────────────────────────
// Called automatically after the capture flow saves a date.

interface CalendarEventInput {
  houseId: string
  contactName: string
  phone: string
  address: string
  price: number
  date: string          // ISO string
  type: 'job' | 'follow_up'
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<{ eventId: string } | null> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  // Check if calendar is connected before trying
  const connected = await isCalendarConnected()
  if (!connected) return null

  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/create-calendar-event`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          house_id: input.houseId,
          contact_name: input.contactName,
          phone: input.phone,
          address: input.address,
          price: input.price,
          date: input.date,
          type: input.type,
          title: input.type === 'job'
            ? `🧹 Window Cleaning — ${input.contactName || 'Customer'}`
            : `📞 Follow Up — ${input.contactName || 'Lead'}`,
        }),
      }
    )

    const data = await res.json()

    if (data.error) {
      console.error('Calendar event failed:', data.error)
      return null
    }

    return { eventId: data.event_id }
  } catch (err) {
    // Don't block the capture flow if calendar fails
    console.error('Calendar event error:', err)
    return null
  }
}
