'use client'

import { useState } from 'react'
import type { KnockOutcome, HouseStatus } from '@/types/database'

/** The house data passed in from the map when a pin is tapped */
export interface SheetHouse {
  id: string
  fullAddress: string
  status: HouseStatus | null
  deadReason?: KnockOutcome | null
  deadUntil?: string | null
  lastKnockOutcome?: KnockOutcome | null
  lastKnockAt?: string | null
  contactName?: string | null
  contactPhone?: string | null
  quotedPrice?: number | null
  lat: number
  lng: number
}

interface KnockSheetProps {
  house: SheetHouse
  onClose: () => void
  onKnock: (outcome: KnockOutcome, followUpAt?: string) => Promise<void>
  onOpenQuote: (outcome: KnockOutcome) => void
  onMarkAvoid: () => void
  onDeleteHouse: () => void
}

// The four fast-cut outcomes (70% of knocks)
const FAST_OUTCOMES: { outcome: KnockOutcome; label: string; emoji: string; color: string }[] = [
  { outcome: 'not_home',       label: 'Not Home',       emoji: '🏠', color: 'bg-gray-100 text-gray-700 active:bg-gray-200' },
  { outcome: 'hard_no',        label: 'Hard No',        emoji: '🚫', color: 'bg-red-50 text-red-700 active:bg-red-100' },
  { outcome: 'not_interested', label: 'Not Interested', emoji: '👋', color: 'bg-orange-50 text-orange-700 active:bg-orange-100' },
  { outcome: 'have_a_guy',     label: 'Has a Guy',      emoji: '🔒', color: 'bg-blue-50 text-blue-700 active:bg-blue-100' },
]

// The five expanded outcomes (30% — need more info)
const EXPANDED_OUTCOMES: { outcome: KnockOutcome; label: string; emoji: string; color: string; needsQuote: boolean }[] = [
  { outcome: 'tenant',          label: 'Tenant',          emoji: '🏢', color: 'bg-purple-50 text-purple-700 active:bg-purple-100', needsQuote: false },
  { outcome: 'come_back',       label: 'Come Back',       emoji: '📅', color: 'bg-yellow-50 text-yellow-700 active:bg-yellow-100', needsQuote: false },
  { outcome: 'quoted',          label: 'Quoted',          emoji: '💰', color: 'bg-green-50 text-green-700 active:bg-green-100',    needsQuote: true },
  { outcome: 'appointment_set', label: 'Appointment',     emoji: '📋', color: 'bg-emerald-50 text-emerald-700 active:bg-emerald-100', needsQuote: true },
  { outcome: 'closed_on_spot',  label: 'Closed!',         emoji: '🎉', color: 'bg-green-100 text-green-800 active:bg-green-200',   needsQuote: true },
]

/**
 * Format a relative time string like "3 days ago" or "2 hours ago".
 */
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

/**
 * Human-readable label for a knock outcome.
 */
function outcomeLabel(outcome: KnockOutcome): string {
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
  return map[outcome] ?? outcome
}

export default function KnockSheet({ house, onClose, onKnock, onOpenQuote, onMarkAvoid, onDeleteHouse }: KnockSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [comeBackDate, setComeBackDate] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleFastKnock = async (outcome: KnockOutcome) => {
    setLoading(true)
    await onKnock(outcome)
    setLoading(false)
  }

  const handleExpandedKnock = async (outcome: KnockOutcome, needsQuote: boolean) => {
    if (needsQuote) {
      // Open the quote form — the knock will be recorded there after form submission
      onOpenQuote(outcome)
      return
    }

    if (outcome === 'come_back') {
      setShowDatePicker(true)
      return
    }

    // Tenant — one tap, done
    setLoading(true)
    await onKnock(outcome)
    setLoading(false)
  }

  const handleComeBack = async () => {
    setLoading(true)
    const followUpAt = comeBackDate
      ? new Date(comeBackDate + 'T10:00:00').toISOString()
      : undefined
    await onKnock('come_back', followUpAt)
    setLoading(false)
  }

  // Reawaken context for previously dead houses (status null + dead_reason means it expired)
  const isReawakened = house.status === null && house.deadReason
  const reawakendMessage = isReawakened
    ? `Reawakened from "${outcomeLabel(house.deadReason!)}" — try again!`
    : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop — tap to close */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* House header */}
        <div className="px-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {house.fullAddress || 'New House'}
          </h2>

          {/* Last knock context */}
          {house.lastKnockOutcome && house.lastKnockAt && (
            <p className="text-sm text-gray-500 mt-0.5">
              Last knock: {outcomeLabel(house.lastKnockOutcome)} · {timeAgo(house.lastKnockAt)}
            </p>
          )}

          {/* Reawaken context */}
          {reawakendMessage && (
            <p className="text-sm text-amber-600 font-medium mt-1">
              {reawakendMessage}
            </p>
          )}

          {/* Contact + price context */}
          {house.contactName && (
            <p className="text-sm text-blue-600 mt-0.5">
              {house.contactName}
              {house.quotedPrice ? ` · $${house.quotedPrice}` : ''}
              {house.status ? ` (${house.status})` : ''}
            </p>
          )}
        </div>

        {/* Date picker for "Come Back" */}
        {showDatePicker && (
          <div className="px-5 py-4 border-b border-gray-100 bg-yellow-50">
            <p className="text-sm font-medium text-gray-700 mb-2">When should you come back?</p>
            <input
              type="date"
              value={comeBackDate}
              onChange={(e) => setComeBackDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base mb-3"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="flex gap-2">
              <button
                onClick={handleComeBack}
                disabled={loading}
                className="flex-1 bg-yellow-500 text-white font-semibold py-3 rounded-xl active:bg-yellow-600 disabled:opacity-50"
              >
                {comeBackDate ? 'Set Follow-up' : 'Come Back (No Date)'}
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-3 text-gray-500 rounded-xl active:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Fast disposition buttons (4) — always visible */}
        {!showDatePicker && (
          <div className="px-5 py-4">
            <div className="grid grid-cols-2 gap-2.5">
              {FAST_OUTCOMES.map(({ outcome, label, emoji, color }) => (
                <button
                  key={outcome}
                  onClick={() => handleFastKnock(outcome)}
                  disabled={loading}
                  className={`${color} rounded-xl py-4 px-3 text-center font-medium text-base transition-all disabled:opacity-50`}
                >
                  <span className="text-2xl block mb-1">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* "More" expand button */}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="w-full mt-3 py-3 text-center text-gray-500 font-medium rounded-xl border border-gray-200 active:bg-gray-50"
              >
                More options →
              </button>
            )}

            {/* Expanded outcomes (5) */}
            {expanded && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  {EXPANDED_OUTCOMES.map(({ outcome, label, emoji, color, needsQuote }) => (
                    <button
                      key={outcome}
                      onClick={() => handleExpandedKnock(outcome, needsQuote)}
                      disabled={loading}
                      className={`${color} rounded-xl py-4 px-3 text-center font-medium text-base transition-all disabled:opacity-50 ${
                        outcome === 'closed_on_spot' ? 'col-span-2 border-2 border-green-300' : ''
                      }`}
                    >
                      <span className="text-2xl block mb-1">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom actions: Avoid + Delete */}
            {!confirmDelete ? (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
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
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 text-center mb-2">
                  Delete this pin and all its data?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setConfirmDelete(false); onDeleteHouse(); }}
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
        )}
      </div>
    </div>
  )
}
