'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* Pick a heatmap CSS var based on percentage 0-100. */
function fillForPct(pct: number): string {
  if (pct >= 100) return 'var(--heatmap-5)'
  if (pct >= 80) return 'var(--heatmap-4)'
  if (pct >= 60) return 'var(--heatmap-3)'
  if (pct >= 30) return 'var(--heatmap-2)'
  if (pct > 0) return 'var(--heatmap-1)'
  return 'var(--heatmap-0)'
}

function statusFor(pct: number) {
  if (pct >= 100) return { emoji: '\u{1F3C6}', label: 'Crushed it' }
  if (pct >= 50) return { emoji: '\u{1F525}', label: 'On track' }
  if (pct > 0) return { emoji: '\u{1F3AF}', label: 'In progress' }
  return { emoji: '\u{1F4A4}', label: 'Not started' }
}

interface Props {
  doorsToday: number
  target: number
  suggestion?: string
  onTargetChange?: (target: number) => void
}

export default function DailyMission({ doorsToday, target, suggestion, onTargetChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(target))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = useCallback(() => {
    setDraft(String(target))
    setEditing(true)
  }, [target])

  const commitEdit = useCallback(() => {
    const parsed = parseInt(draft, 10)
    const next = isNaN(parsed) ? target : Math.min(999, Math.max(1, parsed))
    onTargetChange?.(next)
    setEditing(false)
  }, [draft, target, onTargetChange])

  const pct = useMemo(
    () => Math.min(100, Math.round((doorsToday / Math.max(1, target)) * 100)),
    [doorsToday, target],
  )
  const status = statusFor(pct)
  const fill = fillForPct(pct)

  return (
    <div className="border-2 border-foreground bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none" aria-hidden>{status.emoji}</span>
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">Daily Mission</h2>
        </div>
        <span className="px-2 py-0.5 border-2 border-foreground bg-background font-mono font-bold text-[10px] uppercase tracking-wider">
          {status.label}
        </span>
      </div>

      {/* Progress bar — tap to edit target */}
      <button
        onClick={startEdit}
        className="relative h-6 w-full bg-muted border-2 border-foreground overflow-hidden active:translate-y-[1px] transition-transform"
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, background: fill }}
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs tabular-nums text-foreground mix-blend-difference">
          <span className="text-background">
            {doorsToday} / {target} doors
          </span>
        </div>
      </button>

      {/* Edit target — opens below the bar */}
      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground shrink-0">Daily target:</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={999}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="flex-1 text-center text-lg font-bold font-mono border-2 border-foreground py-1.5 bg-background text-foreground outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={commitEdit}
            className="px-3 py-1.5 border-2 border-foreground bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-wider active:translate-y-[1px] transition-transform"
          >
            Set
          </button>
        </div>
      ) : (
        <p className="mt-1 text-[9px] font-mono text-muted-foreground text-center">Tap bar to change target</p>
      )}

      {suggestion && (
        <p className="mt-2 text-xs font-mono text-muted-foreground">{suggestion}</p>
      )}
    </div>
  )
}
