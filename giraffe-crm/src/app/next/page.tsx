'use client'

/**
 * /next — "Where should I knock next?"
 *
 * Card 1: Bible verse (always first, dismissible per session)
 * Card 2: AI micro-zone recommendation (one at a time)
 *
 * Replaces the old Deals page. This is not a list view —
 * it's a single-card decision engine.
 */

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react'
import AuthGate from '@/components/auth/AuthGate'
import PageHeader from '@/components/nav/PageHeader'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { getTodayVerse } from '@/lib/bible-verses'
import type { HouseStatus, KnockOutcome } from '@/types/database'

/* ═══════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════ */

interface ZoneHouse {
  id: string
  city: string | null
  postal_code: string | null
  status: HouseStatus | null
  quoted_price: number | null
  anchor_price: number | null
  knock_count: number
  last_knock_at: string | null
  dead_reason: KnockOutcome | null
}

interface MicroZone {
  key: string           // "Anaheim Hills 92807"
  city: string
  zip: string
  totalHouses: number
  knocked: number
  leads: number
  quoted: number
  customers: number
  dead: number
  conversionRate: number // customers / knocked
  avgDealValue: number
  pipelineValue: number
  lastKnocked: Date | null
  untouched: number
  score: number
  reasons: string[]
}

/* ═══════════════════════════════════════════════════════════════════
   Page Shell
   ═══════════════════════════════════════════════════════════════════ */

export default function NextPage() {
  return (
    <AuthGate>
      <NextInner />
    </AuthGate>
  )
}

function NextInner() {
  const supabase = useRef(createClient()).current
  const [verseDismissed, setVerseDismissed] = useState(false)
  const [zones, setZones] = useState<MicroZone[]>([])
  const [zoneIndex, setZoneIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [skippedKeys, setSkippedKeys] = useState<Set<string>>(new Set())

  const verse = useMemo(() => getTodayVerse(), [])

  /* ── Load all houses & compute micro-zones ────────────────────── */
  const loadZones = useCallback(async () => {
    const { data } = await supabase
      .from('houses')
      .select('id, city, postal_code, status, quoted_price, anchor_price, knock_count, last_knock_at, dead_reason')

    if (!data || data.length === 0) {
      setLoading(false)
      return
    }

    const zoneMap = new Map<string, ZoneHouse[]>()
    for (const h of data as ZoneHouse[]) {
      const city = (h.city ?? 'Unknown').trim()
      const zip = (h.postal_code ?? '00000').trim()
      const key = `${city} ${zip}`
      if (!zoneMap.has(key)) zoneMap.set(key, [])
      zoneMap.get(key)!.push(h)
    }

    const now = Date.now()
    const scored: MicroZone[] = []

    for (const [key, houses] of zoneMap) {
      const parts = key.split(' ')
      const zip = parts.pop()!
      const city = parts.join(' ')

      const knocked = houses.filter(h => h.knock_count > 0).length
      const leads = houses.filter(h => h.status === 'lead').length
      const quoted = houses.filter(h => h.status === 'quoted').length
      const customers = houses.filter(h => h.status === 'customer').length
      const dead = houses.filter(h => h.status === 'dead' || h.status === 'avoid').length
      const untouched = houses.filter(h => !h.status && h.knock_count === 0).length

      const conversionRate = knocked > 0 ? customers / knocked : 0

      const prices = houses
        .map(h => h.quoted_price ?? h.anchor_price ?? 0)
        .filter(p => p > 0)
      const avgDealValue = prices.length > 0
        ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
        : 0

      const pipelineValue = houses
        .filter(h => h.status === 'lead' || h.status === 'quoted')
        .reduce((s, h) => s + (h.quoted_price ?? h.anchor_price ?? 0), 0)

      const lastKnockDates = houses
        .filter(h => h.last_knock_at)
        .map(h => new Date(h.last_knock_at!).getTime())
      const lastKnocked = lastKnockDates.length > 0
        ? new Date(Math.max(...lastKnockDates))
        : null

      // ── Scoring algorithm ──
      // Higher = better recommendation
      let score = 0
      const reasons: string[] = []

      // 1. Conversion rate bonus (0-30 pts)
      if (knocked >= 3) {
        const crScore = Math.min(30, Math.round(conversionRate * 100))
        score += crScore
        if (conversionRate >= 0.15) reasons.push(`${Math.round(conversionRate * 100)}% close rate`)
      }

      // 2. Deal value bonus (0-25 pts)
      if (avgDealValue >= 200) {
        score += Math.min(25, Math.round((avgDealValue / 400) * 25))
        reasons.push(`$${avgDealValue} avg deal`)
      }

      // 3. Untouched density bonus (0-20 pts) — fresh territory
      if (untouched >= 5) {
        score += Math.min(20, Math.round((untouched / 20) * 20))
        reasons.push(`${untouched} untouched doors`)
      }

      // 4. Active pipeline bonus (0-15 pts)
      if (leads + quoted > 0) {
        score += Math.min(15, (leads + quoted) * 3)
        reasons.push(`${leads + quoted} active leads`)
      }

      // 5. Recency penalty — if knocked today/yesterday, lower priority
      if (lastKnocked) {
        const daysSince = Math.floor((now - lastKnocked.getTime()) / 86400000)
        if (daysSince <= 1) {
          score -= 15
        } else if (daysSince >= 7 && leads + quoted > 0) {
          score += 10
          reasons.push(`${daysSince}d since last visit`)
        }
      }

      // 6. Dead zone penalty — too many hard no's = bad territory
      const deadRate = houses.length > 0 ? dead / houses.length : 0
      if (deadRate > 0.5) {
        score -= 20
      }

      // Minimum threshold: need at least some data
      if (houses.length < 2) score -= 10

      scored.push({
        key,
        city,
        zip,
        totalHouses: houses.length,
        knocked,
        leads,
        quoted,
        customers,
        dead,
        conversionRate,
        avgDealValue,
        pipelineValue,
        lastKnocked,
        untouched,
        score,
        reasons: reasons.length > 0 ? reasons : ['Explore new territory'],
      })
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score)

    startTransition(() => {
      setZones(scored)
      setZoneIndex(0)
      setLoading(false)
    })
  }, [supabase])

  useEffect(() => { loadZones() }, [loadZones])

  /* ── Current zone (skip already-skipped ones) ─────────────────── */
  const currentZone = useMemo(() => {
    const available = zones.filter(z => !skippedKeys.has(z.key))
    return available.length > 0 ? available[0] : null
  }, [zones, skippedKeys])

  const remainingCount = zones.filter(z => !skippedKeys.has(z.key)).length

  const handleSkip = useCallback(() => {
    if (!currentZone) return
    setSkippedKeys(prev => {
      const next = new Set(prev)
      next.add(currentZone.key)
      return next
    })
  }, [currentZone])

  const handleReset = useCallback(() => {
    setSkippedKeys(new Set())
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader section="Next" />

      <main className="flex-1 px-4 pb-24 pt-4 space-y-4">
        {/* ── Bible Verse Card ─────────────────────────────────── */}
        {!verseDismissed && (
          <VerseCard
            reference={verse.reference}
            text={verse.text}
            theme={verse.theme}
            reflection={verse.reflection}
            onDismiss={() => setVerseDismissed(true)}
          />
        )}

        {/* ── AI Zone Card ─────────────────────────────────────── */}
        {loading ? (
          <div className="border-2 border-foreground bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="size-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-mono text-muted-foreground">Analyzing your territory...</span>
            </div>
          </div>
        ) : currentZone ? (
          <ZoneCard
            zone={currentZone}
            rank={zones.indexOf(currentZone) + 1}
            total={zones.length}
            remaining={remainingCount}
            onSkip={handleSkip}
          />
        ) : zones.length > 0 ? (
          <div className="border-2 border-foreground bg-card p-6 text-center space-y-3">
            <p className="text-sm font-mono text-muted-foreground">You've reviewed all {zones.length} zones.</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-xs uppercase tracking-wider press-brutal"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="border-2 border-foreground bg-card p-6 text-center">
            <p className="text-lg font-bold mb-1">No territory data yet</p>
            <p className="text-sm font-mono text-muted-foreground">
              Go knock some doors on the Map tab. Once you have data, AI will recommend where to go next.
            </p>
          </div>
        )}

        {/* ── Quick Pipeline Summary ───────────────────────────── */}
        {!loading && zones.length > 0 && <PipelinePulse zones={zones} />}
      </main>

      <BottomNav />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Bible Verse Card
   ═══════════════════════════════════════════════════════════════════ */

function VerseCard({
  reference,
  text,
  theme,
  reflection,
  onDismiss,
}: {
  reference: string
  text: string
  theme: string
  reflection: string
  onDismiss: () => void
}) {
  return (
    <div className="border-2 border-foreground bg-card p-5 relative overflow-hidden">
      {/* Warm accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ background: 'var(--amber)' }}
      />

      {/* Theme badge */}
      <div className="flex items-center justify-between mb-3 pl-3">
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] px-2 py-0.5 border-2"
          style={{ borderColor: 'var(--amber)', color: 'var(--amber)' }}
        >
          {theme}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Today&apos;s word
        </span>
      </div>

      {/* Scripture */}
      <div className="pl-3 mb-3">
        <p className="text-base leading-relaxed font-medium italic">
          &ldquo;{text}&rdquo;
        </p>
        <p
          className="text-xs font-mono font-bold mt-2 tracking-wide"
          style={{ color: 'var(--amber)' }}
        >
          — {reference}
        </p>
      </div>

      {/* Reflection */}
      <div className="pl-3 mb-4">
        <p className="text-xs font-mono leading-relaxed text-muted-foreground">
          {reflection}
        </p>
      </div>

      {/* Dismiss */}
      <div className="pl-3 flex justify-end">
        <button
          onClick={onDismiss}
          className="px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-[0.15em] press-brutal"
        >
          Amen &middot; Let&apos;s work &rarr;
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   AI Zone Recommendation Card
   ═══════════════════════════════════════════════════════════════════ */

function ZoneCard({
  zone,
  rank,
  total,
  remaining,
  onSkip,
}: {
  zone: MicroZone
  rank: number
  total: number
  remaining: number
  onSkip: () => void
}) {
  const scoreColor =
    zone.score >= 40 ? 'var(--heatmap-5)' :
    zone.score >= 25 ? 'var(--heatmap-4)' :
    zone.score >= 10 ? 'var(--heatmap-3)' :
    'var(--heatmap-2)'

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zone.city + ' ' + zone.zip)}`

  return (
    <div className="border-2 border-foreground bg-card relative overflow-hidden">
      {/* Score stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: scoreColor }} />

      {/* Header */}
      <div className="p-5 pl-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
            AI Recommendation
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {remaining} zone{remaining !== 1 ? 's' : ''} left
          </span>
        </div>

        {/* Zone name — BIG */}
        <h2 className="text-2xl font-bold tracking-tight mb-1">{zone.city}</h2>
        <p className="text-sm font-mono text-muted-foreground mb-3">{zone.zip}</p>

        {/* Reasons */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {zone.reasons.map((r, i) => (
            <span
              key={i}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border-2 border-foreground bg-muted"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 border-t-2 border-foreground">
        <StatCell label="Doors" value={zone.totalHouses} />
        <StatCell label="Knocked" value={zone.knocked} border />
        <StatCell label="Wins" value={zone.customers} border />
        <StatCell label="Pipeline" value={`$${zone.pipelineValue}`} border />
      </div>

      {/* Conversion bar */}
      {zone.knocked >= 3 && (
        <div className="px-5 pl-6 py-3 border-t-2 border-foreground">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Close rate
            </span>
            <span className="text-sm font-mono font-bold" style={{ color: scoreColor }}>
              {Math.round(zone.conversionRate * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted border border-foreground overflow-hidden">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${Math.min(100, Math.round(zone.conversionRate * 100))}%`,
                background: scoreColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t-2 border-foreground">
        <button
          onClick={onSkip}
          className="flex-1 py-3.5 text-center font-mono font-bold text-xs uppercase tracking-wider text-muted-foreground hover:bg-muted transition-colors press-brutal border-r-2 border-foreground"
        >
          Skip
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-[2] py-3.5 text-center font-mono font-bold text-xs uppercase tracking-wider bg-foreground text-background press-brutal block"
        >
          Navigate &rarr;
        </a>
      </div>
    </div>
  )
}

function StatCell({ label, value, border }: { label: string; value: string | number; border?: boolean }) {
  return (
    <div className={`py-3 px-3 text-center ${border ? 'border-l-2 border-foreground' : ''}`}>
      <div className="text-lg font-bold font-mono tabular-nums">{value}</div>
      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Pipeline Pulse — compact territory overview
   ═══════════════════════════════════════════════════════════════════ */

function PipelinePulse({ zones }: { zones: MicroZone[] }) {
  const totals = useMemo(() => {
    let doors = 0, knocked = 0, leads = 0, customers = 0, pipeline = 0
    for (const z of zones) {
      doors += z.totalHouses
      knocked += z.knocked
      leads += z.leads + z.quoted
      customers += z.customers
      pipeline += z.pipelineValue
    }
    return { doors, knocked, leads, customers, pipeline }
  }, [zones])

  return (
    <div className="border-2 border-foreground bg-card">
      <div className="px-4 py-2 border-b-2 border-foreground">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Territory Pulse
        </span>
      </div>
      <div className="grid grid-cols-4">
        <div className="py-3 px-3 text-center">
          <div className="text-lg font-bold font-mono tabular-nums">{totals.doors}</div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Doors</div>
        </div>
        <div className="py-3 px-3 text-center border-l-2 border-foreground">
          <div className="text-lg font-bold font-mono tabular-nums">{totals.leads}</div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Active</div>
        </div>
        <div className="py-3 px-3 text-center border-l-2 border-foreground">
          <div className="text-lg font-bold font-mono tabular-nums">{totals.customers}</div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Wins</div>
        </div>
        <div className="py-3 px-3 text-center border-l-2 border-foreground">
          <div className="text-lg font-bold font-mono tabular-nums">${totals.pipeline}</div>
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Pipeline</div>
        </div>
      </div>
    </div>
  )
}
