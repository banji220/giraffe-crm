'use client'

import { useEffect, useMemo, useState } from 'react'

/* =========================================================================
   BadgesPanel — 20 unlockable badges. Funny, mean, brutalist.
   Accepts real stats from parent (wired to Supabase).
   ========================================================================= */

type BadgeCategory = 'daily' | 'streak' | 'weekly' | 'closes' | 'special'

type Badge = {
  id: number
  emoji: string
  name: string
  target: number
  unit: string
  category: BadgeCategory
}

const BADGES: Badge[] = [
  /* Daily door */
  { id: 1,  emoji: '\u{1F6AA}', name: 'Finally Off Your Ass',            target: 1,   unit: 'doors today',    category: 'daily' },
  { id: 2,  emoji: '\u{1F51F}', name: 'Warm Body',                        target: 10,  unit: 'doors today',    category: 'daily' },
  { id: 3,  emoji: '\u{1F3AF}', name: 'Not Completely Useless',           target: 30,  unit: 'doors today',    category: 'daily' },
  { id: 4,  emoji: '\u{1F969}', name: 'Door Slut',                        target: 50,  unit: 'doors today',    category: 'daily' },
  { id: 5,  emoji: '\u{1F608}', name: 'Unhinged',                         target: 75,  unit: 'doors today',    category: 'daily' },
  { id: 6,  emoji: '\u{1F480}', name: 'What The Fuck Is Wrong With You',  target: 100, unit: 'doors today',    category: 'daily' },
  /* Streak */
  { id: 7,  emoji: '\u{1FA79}', name: "Didn't Bitch Out",                 target: 3,   unit: 'day streak',     category: 'streak' },
  { id: 8,  emoji: '\u{1F525}', name: 'No Life Confirmed',                target: 7,   unit: 'day streak',     category: 'streak' },
  { id: 9,  emoji: '\u{1F9DF}', name: 'Homeless Or Hustling?',            target: 14,  unit: 'day streak',     category: 'streak' },
  { id: 10, emoji: '\u{1F410}', name: 'Bazuka',                           target: 30,  unit: 'day streak',     category: 'streak' },
  { id: 11, emoji: '\u2620\uFE0F', name: 'Restraining Order Pending',     target: 60,  unit: 'day streak',     category: 'streak' },
  /* Weekly */
  { id: 12, emoji: '\u{1F4AF}', name: 'Touched 100 Doors (Pause)',        target: 100, unit: 'doors / week',   category: 'weekly' },
  { id: 13, emoji: '\u{1F98D}', name: 'Feral',                            target: 150, unit: 'doors / week',   category: 'weekly' },
  { id: 14, emoji: '\u{1F30B}', name: 'The Whole Block Hates You',        target: 200, unit: 'doors / week',   category: 'weekly' },
  /* Closes */
  { id: 15, emoji: '\u{1F4B5}', name: 'Broke The Seal',                   target: 1,   unit: 'closes',         category: 'closes' },
  { id: 16, emoji: '\u{1F4B8}', name: 'Landlord Can Unclench',            target: 5,   unit: 'closes',         category: 'closes' },
  { id: 17, emoji: '\u{1F911}', name: 'Dangerously Cocky',                target: 20,  unit: 'closes',         category: 'closes' },
  { id: 18, emoji: '\u{1F451}', name: 'Owns Your Street',                 target: 50,  unit: 'closes',         category: 'closes' },
  /* Special */
  { id: 19, emoji: '\u{1F305}', name: 'Psychopath Hours',                 target: 1,   unit: 'knock pre-8am',  category: 'special' },
  { id: 20, emoji: '\u{1F319}', name: "No Fuckin' Boundaries",            target: 1,   unit: 'knock post-7pm', category: 'special' },
]

export interface BadgeStats {
  doorsToday: number
  doorsThisWeek: number
  currentStreak: number
  totalCloses: number
  preDawnKnocks: number
  lateNightKnocks: number
}

function progressFor(badge: Badge, stats: BadgeStats): number {
  switch (badge.category) {
    case 'daily':   return stats.doorsToday
    case 'streak':  return stats.currentStreak
    case 'weekly':  return stats.doorsThisWeek
    case 'closes':  return stats.totalCloses
    case 'special':
      return badge.id === 19 ? stats.preDawnKnocks : stats.lateNightKnocks
  }
}

interface Props {
  stats: BadgeStats
}

export default function BadgesPanel({ stats }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const enriched = useMemo(() => {
    const list = BADGES.map(b => {
      const value = progressFor(b, stats)
      const unlocked = value >= b.target
      return { ...b, value, unlocked }
    })
    return list.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
      if (a.unlocked) return a.id - b.id
      const aPct = a.target > 0 ? a.value / a.target : 0
      const bPct = b.target > 0 ? b.value / b.target : 0
      return bPct - aPct
    })
  }, [stats])

  const unlockedCount = enriched.filter(b => b.unlocked).length

  if (!mounted) {
    return (
      <section className="border-2 border-foreground bg-card px-4 py-4">
        <div className="h-[280px]" aria-hidden />
      </section>
    )
  }

  return (
    <section className="border-2 border-foreground bg-card px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold uppercase tracking-tight">Badges</h2>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {unlockedCount}/{BADGES.length}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {enriched.map(b => {
          const pct = b.target > 0 ? Math.min(1, b.value / b.target) : 0
          if (b.unlocked) {
            return (
              <div
                key={b.id}
                className="bg-muted py-3 px-1 min-h-[80px] flex flex-col items-center justify-center text-center"
                title={`${b.name} \u2014 unlocked`}
              >
                <span className="text-xl leading-none" aria-hidden>{b.emoji}</span>
                <span className="mt-1.5 text-[9px] font-mono font-bold uppercase leading-tight px-0.5">
                  {b.name}
                </span>
              </div>
            )
          }
          return (
            <div
              key={b.id}
              className="bg-muted/50 border border-border/50 py-3 px-1 min-h-[80px] flex flex-col items-center justify-between text-center"
              title={`${b.name} \u2014 ${b.value}/${b.target} ${b.unit}`}
            >
              <span className="text-xl leading-none grayscale opacity-40" aria-hidden>{b.emoji}</span>
              <span className="mt-1 text-[9px] font-mono font-bold uppercase leading-tight px-0.5 text-muted-foreground">
                {b.name}
              </span>
              <div className="w-full flex flex-col items-center mt-1">
                <div className="w-4/5 h-1 bg-muted-foreground/15 overflow-hidden">
                  <div className="h-full bg-primary/60" style={{ width: `${pct * 100}%` }} />
                </div>
                <span className="mt-1 text-[8px] font-mono text-muted-foreground/70 tabular-nums">
                  {b.value}/{b.target} {b.unit}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
