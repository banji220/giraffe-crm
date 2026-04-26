'use client'

/**
 * StepFlow — Generic multi-step sliding card container.
 *
 * Used for any mobile data entry flow (quote, deal, follow-up edit).
 * Each step is a card. Cards slide left/right. Every card is a valid
 * save point — the user can bail at any step and still keep partial data.
 *
 * Features:
 *   - Dot progress indicator (not numbered — feels lighter)
 *   - Swipe or tap Next/Back
 *   - Address bar persists across all steps
 *   - Skip button on optional steps
 *   - Each step can declare itself complete or incomplete
 */

import { useState, useRef, useCallback, type ReactNode } from 'react'

export interface Step {
  id: string
  content: ReactNode
  /** If true, the user can skip this step */
  optional?: boolean
}

interface StepFlowProps {
  steps: Step[]
  /** Persistent header above all cards (e.g. address bar) */
  header?: ReactNode
  /** Called when user taps "Done" on the last step */
  onComplete: () => void
  /** Called when user closes the flow (X button) */
  onClose: () => void
  /** Label for the final step's button. Default: "Done" */
  completeLabel?: string
  /** If true, show a loading state on the complete button */
  loading?: boolean
}

export default function StepFlow({
  steps,
  header,
  onComplete,
  onClose,
  completeLabel = 'Done',
  loading = false,
}: StepFlowProps) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const isLast = current === steps.length - 1
  const isFirst = current === 0

  const goNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setCurrent(prev => Math.min(prev + 1, steps.length - 1))
    }
  }, [isLast, onComplete, steps.length])

  const goBack = useCallback(() => {
    setCurrent(prev => Math.max(prev - 1, 0))
  }, [])

  // ── Touch swipe handling ─────────────────────────────────────────
  const touchStart = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    touchStart.current = null

    // Minimum 60px swipe to trigger
    if (diff > 60 && !isLast) goNext()
    if (diff < -60 && !isFirst) goBack()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-card border-t-4 border-foreground max-h-[92vh] flex flex-col">
        {/* Top row: close + dots + spacer */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center border-2 border-foreground bg-card text-foreground font-mono font-bold text-sm active:translate-y-[1px] transition-transform"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Dot progress */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className="w-2.5 h-2.5 border-2 border-foreground transition-colors"
                style={{
                  background: i <= current ? 'var(--primary)' : 'transparent',
                }}
              />
            ))}
          </div>

          {/* Spacer to balance the X button */}
          <div className="w-9" />
        </div>

        {/* Persistent header (address bar) */}
        {header && (
          <div className="px-4 pb-3">
            {header}
          </div>
        )}

        {/* Sliding card track */}
        <div
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-200 ease-out h-full"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {steps.map((step) => (
              <div
                key={step.id}
                className="w-full min-w-0 flex-shrink-0 px-4 pb-4 overflow-y-auto overflow-x-hidden"
              >
                {step.content}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav: Back / Next */}
        <div className="px-4 pb-6 pt-2 flex gap-3 border-t-2 border-foreground">
          {!isFirst ? (
            <button
              onClick={goBack}
              className="px-5 py-3.5 border-2 border-foreground bg-card text-foreground font-mono font-bold text-sm uppercase tracking-wider active:translate-y-[1px] transition-transform"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={goNext}
            disabled={loading}
            className="flex-1 py-3.5 border-2 border-foreground bg-foreground text-background font-mono font-bold text-sm uppercase tracking-wider active:translate-y-[1px] transition-transform disabled:opacity-50"
          >
            {loading ? 'Saving...' : isLast ? completeLabel : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
