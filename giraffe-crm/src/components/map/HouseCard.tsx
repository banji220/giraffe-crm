'use client'

/**
 * HouseCard — the ONE screen for every house.
 *
 * This component replaces KnockSheet and the missing "customer detail" screen.
 * It is adaptive: the same component handles unknocked houses, cold leads,
 * active quotes, scheduled jobs, and long-time customers. No tabs. No modes.
 *
 * Layout (top → bottom):
 *   1. Address header
 *   2. Money Line — the single most important number (potential, anchor, or LTV)
 *   3. Next Best Action — ONE computed button, always the highest-ROI thing to do
 *   4. Quick actions — Call / Text / Navigate (only when phone or coords exist)
 *   5. Knock grid — 9 outcomes (only when this house has NO knock history yet)
 *   6. Timeline — every event at this address, newest first, one unified feed
 *   7. Advanced — mark avoid, remove pin (buried)
 *
 * The component self-fetches its timeline. It receives basic SheetHouse props
 * and handlers identical to the old KnockSheet, so MapView.tsx only changes
 * its import.
 */

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KnockOutcome, HouseState, LeadState, JobStatus } from '@/types/database'
import type { SheetHouse } from '@/components/map/KnockSheet'

interface HouseCardProps {
  house: SheetHouse
  onClose: () => void
  onKnock: (outcome: KnockOutcome, followUpAt?: string) => Promise<void>
  onOpenQuote: (outcome: KnockOutcome) => void
  onMarkAvoid: () => void
  onDeleteHouse: () => void
}

// ────────────────────────────────────────────────────────────────────
// Timeline event — the unified type. Knocks, leads, and jobs all flatten
// into this shape so we can render one feed.
// ────────────────────────────────────────────────────────────────────
interface TimelineEvent {
  id: string
  kind: 'knock' | 'quote' | 'job' | 'customer'
  at: string                  // ISO timestamp for sorting
  dot: string                 // color for the dot
  title: string               // bold line
  subtitle?: string           // quiet line
  amount?: number | null      // renders as "$329" right-aligned
}

// Fast knock outcomes (shown in top row for unknocked houses)
const FAST_OUTCOMES: { outcome: KnockOutcome; label: string; color: string; letter: string }[] = [
  { outcome: 'not_home',       label: 'Not Home',       letter: 'NH', color: 'bg-[#5858CE]' },
  { outcome: 'hard_no',        label: 'Hard No',        letter: 'X',  color: 'bg-[#DD1111]' },
  { outcome: 'not_interested', label: 'Not Int.',       letter: 'NI', color: 'bg-[#EBA313]' },
  { outcome: 'have_a_guy',     label: 'Has Guy',        letter: 'HG', color: 'bg-[#D8269D]' },
]

const EXPANDED_OUTCOMES: { outcome: KnockOutcome; label: string; color: string; letter: string; needsQuote: boolean }[] = [
  { outcome: 'tenant',          label: 'Tenant',      letter: 'T',  color: 'bg-[#2496D0]', needsQuote: false },
  { outcome: 'come_back',       label: 'Come Back',   letter: 'CB', color: 'bg-[#91CE16]', needsQuote: false },
  { outcome: 'quoted',          label: 'Quoted',      letter: 'Q',  color: 'bg-[#A12EDA]', needsQuote: true  },
  { outcome: 'appointment_set', label: 'Appt Set',    letter: 'AP', color: 'bg-[#1ABB85]', needsQuote: true  },
  { outcome: 'closed_on_spot',  label: 'Closed!',     letter: '$',  color: 'bg-[#14B714]', needsQuote: true  },
]

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 30) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

function outcomeLabel(o: KnockOutcome): string {
  const map: Record<KnockOutcome, string> = {
    not_home: 'Not home',
    not_interested: 'Not interested',
    hard_no: 'Hard no',
    have_a_guy: 'Has a guy',
    tenant: 'Tenant',
    come_back: 'Come back',
    quoted: 'Quoted',
    appointment_set: 'Appointment set',
    closed_on_spot: 'Closed on spot',
  }
  return map[o] ?? o
}

const OUTCOME_COLOR: Record<KnockOutcome, string> = {
  hard_no: '#DD1111',
  not_interested: '#EBA313',
  come_back: '#91CE16',
  closed_on_spot: '#14B714',
  appointment_set: '#1ABB85',
  tenant: '#2496D0',
  not_home: '#5858CE',
  quoted: '#A12EDA',
  have_a_guy: '#D8269D',
}

function fmtMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return `$${Math.round(n).toLocaleString()}`
}

export default function HouseCard({
  house, onClose, onKnock, onOpenQuote, onMarkAvoid, onDeleteHouse,
}: HouseCardProps) {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(false)
  const [showComeBackPicker, setShowComeBackPicker] = useState(false)
  const [comeBackDate, setComeBackDate] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showAllOutcomes, setShowAllOutcomes] = useState(false)

  // Hydrated data
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [houseNotes, setHouseNotes] = useState<string>('')
  const [notesDraft, setNotesDraft] = useState<string>('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [openLead, setOpenLead] = useState<{
    id: string
    state: LeadState
    full_name: string | null
    phone: string | null
    email: string | null
    notes: string | null
    final_price: number | null
    anchor_price: number | null
    window_count: number | null
  } | null>(null)
  const [customer, setCustomer] = useState<{
    id: string
    full_name: string
    phone: string | null
    lifetime_value: number
    total_jobs: number
    last_job_at: string | null
  } | null>(null)
  const [nextJob, setNextJob] = useState<{
    id: string
    scheduled_at: string
    price: number
    status: JobStatus
  } | null>(null)

  // ─── Load everything about this house ──────────────────────────────
  useEffect(() => {
    let cancelled = false
    const hydrate = async () => {
      const [knocksRes, leadsRes, jobsRes, customersRes, houseRes] = await Promise.all([
        supabase.from('knocks').select('id, outcome, note, follow_up_at, created_at').eq('house_id', house.id).order('created_at', { ascending: false }),
        supabase.from('leads').select('id, state, full_name, phone, email, notes, final_price, anchor_price, window_count, created_at, updated_at').eq('house_id', house.id).order('created_at', { ascending: false }),
        supabase.from('jobs').select('id, scheduled_at, completed_at, status, price, paid_amount, created_at').eq('house_id', house.id).order('scheduled_at', { ascending: false }),
        supabase.from('customers').select('id, full_name, phone, lifetime_value, total_jobs, last_job_at, created_at').eq('house_id', house.id).limit(1),
        supabase.from('houses').select('notes').eq('id', house.id).single(),
      ])

      if (cancelled) return

      const persistedNotes = (houseRes.data as any)?.notes ?? ''
      setHouseNotes(persistedNotes)
      setNotesDraft(persistedNotes)

      // Open lead = newest lead in active states
      const activeLead = leadsRes.data?.find(l => ['new', 'quoted', 'won'].includes(l.state as string)) ?? null
      if (activeLead) {
        setOpenLead({
          id: activeLead.id,
          state: activeLead.state as LeadState,
          full_name: activeLead.full_name,
          phone: activeLead.phone,
          email: (activeLead as any).email ?? null,
          notes: (activeLead as any).notes ?? null,
          final_price: activeLead.final_price,
          anchor_price: activeLead.anchor_price,
          window_count: activeLead.window_count,
        })
      }

      if (customersRes.data && customersRes.data.length > 0) {
        const c = customersRes.data[0]
        setCustomer({
          id: c.id, full_name: c.full_name, phone: c.phone,
          lifetime_value: c.lifetime_value, total_jobs: c.total_jobs,
          last_job_at: c.last_job_at,
        })
      }

      // Next scheduled job (status = scheduled, soonest first)
      const upcoming = jobsRes.data?.filter(j => j.status === 'scheduled').sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )[0]
      if (upcoming) {
        setNextJob({ id: upcoming.id, scheduled_at: upcoming.scheduled_at, price: upcoming.price, status: upcoming.status as JobStatus })
      }

      // Build unified timeline
      const feed: TimelineEvent[] = []

      knocksRes.data?.forEach(k => {
        feed.push({
          id: `k-${k.id}`,
          kind: 'knock',
          at: k.created_at,
          dot: OUTCOME_COLOR[k.outcome as KnockOutcome] ?? '#9CA3AF',
          title: outcomeLabel(k.outcome as KnockOutcome),
          subtitle: k.note || (k.follow_up_at ? `Follow up ${new Date(k.follow_up_at).toLocaleDateString()}` : undefined),
        })
      })

      leadsRes.data?.forEach(l => {
        if (l.final_price || l.state === 'won' || l.state === 'lost') {
          feed.push({
            id: `l-${l.id}`,
            kind: 'quote',
            at: l.updated_at ?? l.created_at,
            dot: l.state === 'won' ? '#14B714' : l.state === 'lost' ? '#DD1111' : '#A12EDA',
            title: l.state === 'won' ? 'Won' : l.state === 'lost' ? 'Lost' : 'Quoted',
            subtitle: [l.full_name, l.phone, (l as any).email, l.window_count ? `${l.window_count} windows` : null].filter(Boolean).join(' · ') || undefined,
            amount: l.final_price,
          })
        }
      })

      jobsRes.data?.forEach(j => {
        feed.push({
          id: `j-${j.id}`,
          kind: 'job',
          at: j.scheduled_at,
          dot: j.status === 'completed' ? '#14B714' : j.status === 'cancelled' ? '#9CA3AF' : '#1ABB85',
          title: j.status === 'completed' ? 'Job completed' : j.status === 'cancelled' ? 'Job cancelled' : `Job ${j.status.replace('_', ' ')}`,
          subtitle: new Date(j.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          amount: j.price,
        })
      })

      feed.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      setEvents(feed)
    }

    hydrate()
    return () => { cancelled = true }
  }, [house.id, supabase])

  // ─── Compute the Money Line ────────────────────────────────────────
  const moneyLine = useMemo(() => {
    if (customer && customer.lifetime_value > 0) {
      return {
        big: fmtMoney(customer.lifetime_value),
        tag: `LTV · ${customer.total_jobs} job${customer.total_jobs !== 1 ? 's' : ''}`,
        tone: 'text-emerald-600',
      }
    }
    if (nextJob) {
      return {
        big: fmtMoney(nextJob.price),
        tag: `Booked · ${new Date(nextJob.scheduled_at).toLocaleDateString()}`,
        tone: 'text-emerald-600',
      }
    }
    if (openLead?.final_price) {
      return {
        big: fmtMoney(openLead.final_price),
        tag: openLead.state === 'quoted' ? 'Quote on the table' : 'Potential',
        tone: 'text-purple-600',
      }
    }
    if (openLead?.anchor_price) {
      return {
        big: fmtMoney(openLead.anchor_price),
        tag: 'Anchor price',
        tone: 'text-purple-600',
      }
    }
    return null
  }, [customer, nextJob, openLead])

  // ─── Compute the Next Best Action ──────────────────────────────────
  const nextBestAction = useMemo(() => {
    // Active quote on the table → CLOSE THE DEAL
    if (openLead?.state === 'quoted') {
      return {
        label: 'Close the Deal',
        sub: `Accept ${fmtMoney(openLead.final_price)} quote`,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        action: () => onOpenQuote('closed_on_spot'),
      }
    }
    // Upcoming job → NAVIGATE
    if (nextJob && new Date(nextJob.scheduled_at).getTime() - Date.now() < 24 * 3600_000) {
      return {
        label: 'Navigate to Job',
        sub: new Date(nextJob.scheduled_at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
        color: 'bg-gradient-to-r from-teal-500 to-blue-600',
        action: () => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`, '_blank')
        },
      }
    }
    // Past customer → ASK FOR REVIEW or OFFER RECLEAN
    if (customer) {
      return {
        label: 'Offer Reclean',
        sub: `Last cleaned ${customer.last_job_at ? timeAgo(customer.last_job_at) + ' ago' : 'recently'}`,
        color: 'bg-gradient-to-r from-amber-500 to-orange-600',
        action: () => onOpenQuote('closed_on_spot'),
      }
    }
    // Come-back date has arrived
    const lastKnock = house.lastKnockOutcome
    if (lastKnock === 'come_back') {
      return {
        label: 'Knock Now',
        sub: 'You said you\'d be back',
        color: 'bg-gradient-to-r from-lime-500 to-green-600',
        action: () => onKnock('not_home'), // placeholder — will open outcome grid
      }
    }
    // Previously not home → knock again
    if (lastKnock === 'not_home') {
      return {
        label: 'Knock Again',
        sub: 'They weren\'t home last time',
        color: 'bg-gradient-to-r from-indigo-500 to-blue-600',
        action: () => setShowAllOutcomes(true),
      }
    }
    return null
  }, [openLead, nextJob, customer, house, onOpenQuote, onKnock])

  // ─── Phone for quick actions ───────────────────────────────────────
  const phone = openLead?.phone ?? customer?.phone ?? null
  const nameDisplay = openLead?.full_name ?? customer?.full_name ?? null

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleSaveNotes = async () => {
    setSavingNotes(true)
    const trimmed = notesDraft.trim()
    const { error } = await supabase.from('houses').update({ notes: trimmed || null }).eq('id', house.id)
    if (!error) {
      setHouseNotes(trimmed)
      setEditingNotes(false)
    }
    setSavingNotes(false)
  }

  const handleKnockTap = async (outcome: KnockOutcome, needsQuote: boolean) => {
    if (needsQuote) { onOpenQuote(outcome); return }
    if (outcome === 'come_back') { setShowComeBackPicker(true); return }
    setLoading(true)
    await onKnock(outcome)
    setLoading(false)
  }

  const handleComeBackSubmit = async () => {
    setLoading(true)
    const followUpAt = comeBackDate ? new Date(comeBackDate + 'T10:00:00').toISOString() : undefined
    await onKnock('come_back', followUpAt)
    setLoading(false)
  }

  const hasHistory = events.length > 0

  // ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1.5 rounded-full bg-gray-300" />
        </div>

        {/* Address + contact */}
        <div className="px-5 pt-2 pb-3">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">📍</span>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {house.fullAddress || 'New House'}
              </h2>
              {nameDisplay && (
                <p className="text-sm text-gray-500 mt-0.5">{nameDisplay}{phone ? ` · ${phone}` : ''}</p>
              )}
              {openLead?.email && (
                <a href={`mailto:${openLead.email}`} className="text-sm text-blue-600 mt-0.5 block truncate active:text-blue-800">
                  {openLead.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Notes — always-editable sticky note */}
        <div className="px-5 pb-4">
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="w-full text-left bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-4 py-3 active:bg-amber-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">Notes</span>
                <span className="text-xs text-amber-700 font-semibold">{houseNotes ? 'Edit ✏️' : 'Add +'}</span>
              </div>
              {houseNotes ? (
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-snug">{houseNotes}</p>
              ) : (
                <p className="text-sm text-amber-600/70 italic">Dogs, gate codes, preferences, anything to remember…</p>
              )}
            </button>
          ) : (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-amber-700 font-bold mb-2">Notes</div>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                autoFocus
                placeholder="Dogs, gate codes, preferences, anything to remember…"
                className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-amber-500 outline-none resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex-1 bg-amber-600 text-white font-bold py-2.5 rounded-lg text-sm active:bg-amber-700 disabled:opacity-50"
                >
                  {savingNotes ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setNotesDraft(houseNotes); setEditingNotes(false) }}
                  className="px-4 py-2.5 text-sm text-gray-600 font-medium rounded-lg active:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Money Line — the hero number */}
        {moneyLine && (
          <div className="px-5 pb-4 text-center">
            <div className={`text-5xl font-black tracking-tight ${moneyLine.tone}`}>
              {moneyLine.big}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mt-1 font-semibold">
              {moneyLine.tag}
            </div>
          </div>
        )}

        {/* Next Best Action */}
        {nextBestAction && (
          <div className="px-5 pb-3">
            <button
              onClick={nextBestAction.action}
              disabled={loading}
              className={`w-full ${nextBestAction.color} text-white rounded-2xl py-4 px-5 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50`}
            >
              <div className="text-lg font-bold leading-tight">{nextBestAction.label}</div>
              <div className="text-sm text-white/90 font-medium mt-0.5">{nextBestAction.sub}</div>
            </button>
          </div>
        )}

        {/* Quick actions: Call / Text / Navigate */}
        <div className="px-5 pb-4 flex gap-2">
          {phone && (
            <>
              <a
                href={`tel:${phone}`}
                className="flex-1 bg-gray-100 active:bg-gray-200 rounded-xl py-3 text-center font-semibold text-gray-800 text-sm"
              >
                📞 Call
              </a>
              <a
                href={`sms:${phone}`}
                className="flex-1 bg-gray-100 active:bg-gray-200 rounded-xl py-3 text-center font-semibold text-gray-800 text-sm"
              >
                💬 Text
              </a>
            </>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${house.lat},${house.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-100 active:bg-gray-200 rounded-xl py-3 text-center font-semibold text-gray-800 text-sm"
          >
            🧭 Navigate
          </a>
        </div>

        {/* Knock grid — only for unknocked houses (or when user explicitly expands) */}
        {(!hasHistory || showAllOutcomes) && !showComeBackPicker && (
          <div className="px-5 pb-4">
            {hasHistory && (
              <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
                Log another knock
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {FAST_OUTCOMES.map(({ outcome, label, letter, color }) => (
                <button
                  key={outcome}
                  onClick={() => handleKnockTap(outcome, false)}
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 py-3 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md`}>
                    {letter}
                  </div>
                  <span className="text-[11px] text-gray-700 font-medium">{label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {EXPANDED_OUTCOMES.map(({ outcome, label, letter, color, needsQuote }) => (
                <button
                  key={outcome}
                  onClick={() => handleKnockTap(outcome, needsQuote)}
                  disabled={loading}
                  className="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md`}>
                    {letter}
                  </div>
                  <span className="text-[10px] text-gray-700 font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Come-back date picker */}
        {showComeBackPicker && (
          <div className="px-5 pb-4">
            <div className="bg-lime-50 border border-lime-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">When should you come back?</p>
              <input
                type="date"
                value={comeBackDate}
                onChange={(e) => setComeBackDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base mb-3"
                min={new Date().toISOString().split('T')[0]}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleComeBackSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#91CE16] text-white font-bold py-3 rounded-xl active:scale-95 disabled:opacity-50"
                >
                  {comeBackDate ? 'Set Follow-up' : 'No Date'}
                </button>
                <button onClick={() => setShowComeBackPicker(false)} className="px-4 py-3 text-gray-500 rounded-xl active:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* "Log another" button when history exists and grid is hidden */}
        {hasHistory && !showAllOutcomes && !showComeBackPicker && (
          <div className="px-5 pb-3">
            <button
              onClick={() => setShowAllOutcomes(true)}
              className="w-full py-3 text-center text-gray-600 font-semibold rounded-xl border border-gray-200 active:bg-gray-50 text-sm"
            >
              + Log a knock
            </button>
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <div className="px-5 pb-4">
            <div className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
              Timeline
            </div>
            <div className="relative pl-5">
              {/* vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
              {events.map((ev, i) => (
                <div key={ev.id} className="relative pb-4 last:pb-0">
                  {/* dot */}
                  <div
                    className="absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: ev.dot }}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{ev.title}</div>
                      {ev.subtitle && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{ev.subtitle}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {ev.amount != null && (
                        <div className="text-sm font-bold text-gray-900">{fmtMoney(ev.amount)}</div>
                      )}
                      <div className="text-[11px] text-gray-400 font-medium">{timeAgo(ev.at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced */}
        <div className="px-5 pt-3 pb-6 border-t border-gray-100">
          {!confirmDelete ? (
            <div className="flex items-center justify-between">
              <button
                onClick={onMarkAvoid}
                className="py-2 px-3 text-xs text-red-400 font-medium active:text-red-600"
              >
                Mark as Avoid
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="py-2 px-3 text-xs text-gray-400 font-medium active:text-gray-600"
              >
                Remove Pin
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 text-center mb-2">Delete this pin and all its data?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setConfirmDelete(false); onDeleteHouse() }}
                  className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl active:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 text-gray-500 font-medium rounded-xl border border-gray-200 active:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
