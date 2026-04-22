'use client'

/**
 * CaptureFlow — The field data entry flow for quotes, appointments, and closes.
 *
 * Replaces QuoteForm with a multi-step sliding card pattern.
 * Optimized for one-handed phone use at the door.
 *
 * Flow:
 *   Top bar: 📍 auto-address (from pin, tappable to edit)
 *   Card 1 — WHO: Name, Phone, Email
 *   Card 2 — WHEN: Date tiles + time slot (auto-push to Google Calendar later)
 *   Card 3 — WHAT: Window count stepper + service chips + price
 *   Card 4 — NOTES: Quick tags + free text (skippable)
 *
 * Every card is a valid save point. If you bail after Card 1,
 * the house gets name + phone. After Card 2, it also has a date.
 */

import { useState, useCallback, type ReactNode } from 'react'
import { calculatePrice, formatPrice } from '@/lib/pricing'
import StepFlow from '@/components/capture/StepFlow'
import type { KnockOutcome, ServiceType } from '@/types/database'

// ── Public API ──────────────────────────────────────────────────────

export interface CaptureData {
  contactName: string
  contactPhone: string
  contactEmail: string
  scheduledAt: string | null
  windowCount: number
  serviceTypes: ServiceType[]
  anchorPrice: number
  quotedPrice: number
  notes: string | null
  outcome: KnockOutcome
}

interface CaptureFlowProps {
  outcome: KnockOutcome
  address: string
  onSubmit: (data: CaptureData) => Promise<void>
  onClose: () => void
}

// ── Service options ─────────────────────────────────────────────────

const SERVICES: { type: ServiceType; label: string }[] = [
  { type: 'exterior',          label: 'Exterior' },
  { type: 'interior_exterior', label: 'In + Out' },
  { type: 'screens',           label: 'Screens' },
  { type: 'tracks',            label: 'Tracks' },
]

// ── Quick date helpers ──────────────────────────────────────────────

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function formatDateLabel(d: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function toDateValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ── Note tags (one-tap chips) ───────────────────────────────────────

const NOTE_TAGS = [
  'Dog', 'Gate code', 'Side door', 'Steep roof', 'Ladder needed',
  'Cash only', 'Senior', 'Ring doorbell', 'Spanish',
]

// ── Main component ──────────────────────────────────────────────────

export default function CaptureFlow({ outcome, address, onSubmit, onClose }: CaptureFlowProps) {
  // Card 1 — WHO
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Card 2 — WHEN
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('10:00')

  // Card 3 — WHAT
  const [windowCount, setWindowCount] = useState(20)
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['exterior'])
  const [priceOverride, setPriceOverride] = useState<number | null>(null)

  // Card 4 — NOTES
  const [noteTags, setNoteTags] = useState<string[]>([])
  const [freeNote, setFreeNote] = useState('')

  const [loading, setLoading] = useState(false)

  // ── Pricing ─────────────────────────────────────────────────────
  const pricing = calculatePrice(windowCount, serviceTypes)
  const effectivePrice = priceOverride ?? pricing.finalPrice
  const effectiveAnchor = Math.max(pricing.anchorPrice, effectivePrice + 50)

  // ── Service toggle ──────────────────────────────────────────────
  const toggleService = useCallback((type: ServiceType) => {
    setServiceTypes(prev => {
      if (type === 'interior_exterior') {
        const without = prev.filter(t => t !== 'exterior' && t !== 'interior_exterior')
        return prev.includes(type) ? [...without, 'exterior'] : [...without, type]
      }
      if (type === 'exterior') {
        const without = prev.filter(t => t !== 'exterior' && t !== 'interior_exterior')
        return prev.includes(type) ? without : [...without, type]
      }
      return prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    })
  }, [])

  // ── Note tag toggle ─────────────────────────────────────────────
  const toggleTag = useCallback((tag: string) => {
    setNoteTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }, [])

  // ── Submit ──────────────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    setLoading(true)

    const allNotes = [...noteTags, freeNote.trim()].filter(Boolean).join('. ') || null
    const scheduledAt = selectedDate
      ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
      : null

    await onSubmit({
      contactName: name.trim(),
      contactPhone: phone.trim(),
      contactEmail: email.trim(),
      scheduledAt,
      windowCount,
      serviceTypes,
      anchorPrice: effectiveAnchor,
      quotedPrice: effectivePrice,
      notes: allNotes,
      outcome,
    })

    setLoading(false)
  }, [
    name, phone, email, selectedDate, selectedTime,
    windowCount, serviceTypes, effectiveAnchor, effectivePrice,
    noteTags, freeNote, outcome, onSubmit,
  ])

  // ── Quick date tiles ────────────────────────────────────────────
  const today = new Date()
  const dateTiles = [
    today,
    addDays(today, 1),
    addDays(today, 2),
    addDays(today, 3),
    addDays(today, 4),
    addDays(today, 5),
    addDays(today, 6),
  ]

  // ── Complete label based on outcome ─────────────────────────────
  const completeLabel = outcome === 'closed_on_spot'
    ? 'Close Deal'
    : outcome === 'appointment_set'
    ? 'Set Appointment'
    : 'Save Quote'

  // ── Build steps ─────────────────────────────────────────────────
  const steps = [
    {
      id: 'who',
      content: (
        <div className="space-y-4 pt-2">
          <StepLabel>Who lives here?</StepLabel>

          <FieldGroup label="Name">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First Last"
              autoFocus
              autoCapitalize="words"
              className="field-input"
            />
          </FieldGroup>

          <FieldGroup label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(949) 555-1234"
              inputMode="tel"
              className="field-input"
            />
          </FieldGroup>

          <FieldGroup label="Email">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@email.com"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="field-input"
            />
          </FieldGroup>
        </div>
      ),
    },
    {
      id: 'when',
      content: (
        <div className="space-y-4 pt-2">
          <StepLabel>
            {outcome === 'closed_on_spot' ? 'When is the job?' : 'When to follow up?'}
          </StepLabel>

          {/* Quick date tiles */}
          <div className="grid grid-cols-4 gap-2">
            {dateTiles.map(d => {
              const val = toDateValue(d)
              const active = selectedDate === val
              return (
                <button
                  key={val}
                  onClick={() => setSelectedDate(active ? '' : val)}
                  className={`py-3 border-2 border-foreground font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors active:translate-y-[1px] ${
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-card text-foreground'
                  }`}
                >
                  {formatDateLabel(d)}
                </button>
              )
            })}
            {/* "Later" option — shows native date picker */}
            <button
              onClick={() => {
                // Set to next week as default "later"
                const nextWeek = addDays(today, 7)
                setSelectedDate(toDateValue(nextWeek))
              }}
              className={`py-3 border-2 border-foreground font-mono text-xs font-bold uppercase tracking-wider text-center transition-colors active:translate-y-[1px] ${
                selectedDate && !dateTiles.some(d => toDateValue(d) === selectedDate)
                  ? 'bg-foreground text-background'
                  : 'bg-card text-foreground'
              }`}
            >
              Later
            </button>
          </div>

          {/* Custom date if "Later" or manual */}
          {selectedDate && !dateTiles.some(d => toDateValue(d) === selectedDate) && (
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              min={toDateValue(today)}
              className="field-input font-mono"
            />
          )}

          {/* Time picker */}
          {selectedDate && (
            <div className="flex gap-2">
              {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map(t => {
                const active = selectedTime === t
                const label = new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`flex-1 py-2.5 border-2 border-foreground font-mono text-xs font-bold text-center transition-colors active:translate-y-[1px] ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-card text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'what',
      content: (
        <div className="space-y-4 pt-2">
          <StepLabel>What are we quoting?</StepLabel>

          {/* Window count stepper */}
          <FieldGroup label="Windows">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWindowCount(Math.max(1, windowCount - 5))}
                className="w-14 h-14 border-2 border-foreground bg-card text-foreground text-2xl font-bold flex items-center justify-center active:translate-y-[1px] transition-transform"
              >
                −
              </button>
              <input
                type="number"
                value={windowCount}
                onChange={e => setWindowCount(Math.max(1, parseInt(e.target.value) || 1))}
                inputMode="numeric"
                className="flex-1 text-center text-3xl font-bold font-mono border-2 border-foreground py-2 bg-card text-foreground focus:outline-none"
              />
              <button
                onClick={() => setWindowCount(windowCount + 5)}
                className="w-14 h-14 border-2 border-foreground bg-card text-foreground text-2xl font-bold flex items-center justify-center active:translate-y-[1px] transition-transform"
              >
                +
              </button>
            </div>
          </FieldGroup>

          {/* Service type chips */}
          <FieldGroup label="Service">
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map(({ type, label }) => {
                const active = serviceTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleService(type)}
                    className={`py-3 border-2 border-foreground font-mono text-sm font-bold uppercase tracking-wider text-center transition-colors active:translate-y-[1px] ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-card text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </FieldGroup>

          {/* Price display */}
          <div className="border-2 border-foreground bg-card p-4 text-center">
            <div className="text-xs font-mono text-muted-foreground line-through">
              Normally {formatPrice(effectiveAnchor)}
            </div>
            <div className="text-4xl font-black font-mono text-primary mt-1">
              {formatPrice(effectivePrice)}
            </div>
            {/* Tap to override */}
            <button
              onClick={() => {
                const input = prompt('Override price:', String(effectivePrice))
                if (input !== null) {
                  const val = parseFloat(input)
                  if (!isNaN(val) && val > 0) setPriceOverride(val)
                }
              }}
              className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-2 underline"
            >
              Edit price
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'notes',
      optional: true,
      content: (
        <div className="space-y-4 pt-2">
          <StepLabel>Anything to remember?</StepLabel>

          {/* Quick tag chips */}
          <div className="flex flex-wrap gap-2">
            {NOTE_TAGS.map(tag => {
              const active = noteTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 border-2 border-foreground font-mono text-xs font-bold uppercase tracking-wider transition-colors active:translate-y-[1px] ${
                    active
                      ? 'bg-foreground text-background'
                      : 'bg-card text-foreground'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>

          {/* Free text */}
          <textarea
            value={freeNote}
            onChange={e => setFreeNote(e.target.value)}
            placeholder="Gate code, special instructions, anything..."
            rows={3}
            className="field-input resize-none"
          />
        </div>
      ),
    },
  ]

  // ── Address header (persistent across all cards) ────────────────
  const addressHeader = (
    <div className="flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2.5">
      <span className="text-base">📍</span>
      <span className="text-sm font-bold font-mono text-foreground flex-1 truncate">
        {address || 'No address'}
      </span>
    </div>
  )

  return (
    <StepFlow
      steps={steps}
      header={addressHeader}
      onComplete={handleComplete}
      onClose={onClose}
      completeLabel={completeLabel}
      loading={loading}
    />
  )
}

// ── Shared UI pieces (local to this file) ─────────────────────────

function StepLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </h3>
  )
}

function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

