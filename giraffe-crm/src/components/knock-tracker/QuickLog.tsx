'use client'

import { useState, useCallback, useRef, memo } from 'react'

const INCREMENTS = [1, 5, 10, 25] as const

interface QuickLogProps {
  onLog: (count: number) => void
  onReset: () => void
  todayDoors: number
}

export default memo(function QuickLog({ onLog, onReset, todayDoors }: QuickLogProps) {
  const [flashed, setFlashed] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const flash = useCallback((key: string) => {
    setFlashed(key)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setFlashed(cur => (cur === key ? null : cur)), 220)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8)
    }
  }, [])

  const handleTap = useCallback((n: number, dir: 'add' | 'sub') => {
    const actual = dir === 'sub' ? -n : n
    if (dir === 'sub' && todayDoors <= 0) return
    onLog(actual)
    flash(`${dir}-${n}`)
  }, [onLog, todayDoors, flash])

  return (
    <div className="border-2 border-foreground bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">Quick Log</h2>
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Today:{' '}
          <span className="font-bold text-foreground tabular-nums">{todayDoors}</span>
        </span>
      </div>

      {/* Each increment gets an add + subtract button side by side */}
      <div className="grid grid-cols-4 gap-2">
        {INCREMENTS.map(n => (
          <div key={n} className="flex flex-col gap-1">
            {/* Add */}
            <button
              type="button"
              onClick={() => handleTap(n, 'add')}
              aria-label={`Add ${n} doors`}
              className={[
                'press-brutal border-2 border-foreground font-mono font-bold text-xl py-3 transition-colors',
                flashed === `add-${n}`
                  ? 'bg-foreground text-background'
                  : 'bg-card text-foreground hover:bg-muted',
              ].join(' ')}
            >
              +{n}
            </button>
            {/* Subtract */}
            <button
              type="button"
              onClick={() => handleTap(n, 'sub')}
              disabled={todayDoors <= 0}
              aria-label={`Subtract ${n} doors`}
              className={[
                'press-brutal border-2 border-foreground font-mono font-bold text-sm py-1.5 transition-colors',
                flashed === `sub-${n}`
                  ? 'bg-foreground text-background'
                  : 'bg-card text-muted-foreground hover:bg-muted',
                todayDoors <= 0 ? 'opacity-30' : '',
              ].join(' ')}
            >
              −{n}
            </button>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={onReset}
        disabled={todayDoors <= 0}
        aria-label="Reset today's count"
        className={[
          'press-brutal w-full mt-2 border-2 border-destructive font-mono font-bold text-xs uppercase tracking-wider py-2 transition-colors',
          todayDoors <= 0
            ? 'opacity-30 text-muted-foreground'
            : 'text-destructive hover:bg-destructive hover:text-destructive-foreground',
        ].join(' ')}
      >
        Reset
      </button>
    </div>
  )
})
