'use client'

/**
 * /deals — "Who owes me a decision?"
 *
 * Sections:
 * 1. Pipeline money bar (leads $ / quoted $ / won $)
 * 2. HOTTEST — overdue follow-ups, dying quotes, urgent items
 * 3. PIPELINE — working deals, not urgent yet
 * 4. WON — recent closes (last 30 days)
 * 5. Pipeline stats
 */

import { useEffect, useRef, useState, startTransition } from 'react'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'
import type { HouseStatus } from '@/types/database'

type DealRow = {
  id: string
  full_address: string | null
  status: HouseStatus | null
  contact_name: string | null
  contact_phone: string | null
  quoted_price: number | null
  anchor_price: number | null
  next_follow_up_at: string | null
  updated_at: string
  created_at: string
}

export default function DealsPage() {
  return (
    <AuthGate>
      <DealsInner />
    </AuthGate>
  )
}

function DealsInner() {
  const supabase = useRef(createClient()).current
  const [hottest, setHottest] = useState<DealRow[]>([])
  const [pipeline, setPipeline] = useState<DealRow[]>([])
  const [won, setWon] = useState<DealRow[]>([])
  const [loading, setLoading] = useState(true)

  // Pipeline values
  const [leadsVal, setLeadsVal] = useState(0)
  const [quotedVal, setQuotedVal] = useState(0)
  const [wonVal, setWonVal] = useState(0)

  useEffect(() => {
    const now = new Date()
    const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)
    const cols = 'id, full_address, status, contact_name, contact_phone, quoted_price, anchor_price, next_follow_up_at, updated_at, created_at'

    Promise.all([
      // Leads with follow-ups due (overdue or today) — HOTTEST
      supabase.from('houses').select(cols)
        .eq('status', 'lead')
        .not('next_follow_up_at', 'is', null)
        .lte('next_follow_up_at', endOfDay.toISOString())
        .order('next_follow_up_at', { ascending: true })
        .limit(25),

      // Quoted houses — expiring (5+ days old) — HOTTEST
      supabase.from('houses').select(cols)
        .eq('status', 'quoted')
        .lte('updated_at', fiveDaysAgo.toISOString())
        .order('updated_at', { ascending: true })
        .limit(25),

      // Quoted houses — fresh (less than 5 days) — PIPELINE
      supabase.from('houses').select(cols)
        .eq('status', 'quoted')
        .gt('updated_at', fiveDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(25),

      // Fresh leads without follow-up or future follow-up — PIPELINE
      supabase.from('houses').select(cols)
        .eq('status', 'lead')
        .or(`next_follow_up_at.is.null,next_follow_up_at.gt.${endOfDay.toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(25),

      // Won (last 30 days) — customers
      supabase.from('houses').select(cols)
        .eq('status', 'customer')
        .gte('updated_at', thirtyDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(15),

      // Sum values: all leads
      supabase.from('houses').select('quoted_price, anchor_price')
        .eq('status', 'lead'),
      // Sum values: all quoted
      supabase.from('houses').select('quoted_price, anchor_price')
        .eq('status', 'quoted'),
      // Sum values: won last 30d
      supabase.from('houses').select('quoted_price, anchor_price')
        .eq('status', 'customer')
        .gte('updated_at', thirtyDaysAgo.toISOString()),
    ]).then(([followDue, expiringQuotes, freshQuotes, freshLeads, wonRes, leadsSum, quotedSum, wonSum]) => {
      startTransition(() => {
        // HOTTEST: overdue follow-ups + expiring quotes, sorted by urgency
        const hot = [
          ...((followDue.data as DealRow[]) ?? []),
          ...((expiringQuotes.data as DealRow[]) ?? []),
        ]
        setHottest(hot)

        // PIPELINE: fresh quotes + fresh leads
        const pipe = [
          ...((freshQuotes.data as DealRow[]) ?? []),
          ...((freshLeads.data as DealRow[]) ?? []),
        ]
        setPipeline(pipe)

        // WON
        setWon((wonRes.data as DealRow[]) ?? [])

        // Sum pipeline values
        const sumPrices = (rows: any[] | null) =>
          (rows ?? []).reduce((s: number, r: any) => s + (r.quoted_price ?? r.anchor_price ?? 0), 0)
        setLeadsVal(sumPrices(leadsSum.data))
        setQuotedVal(sumPrices(quotedSum.data))
        setWonVal(sumPrices(wonSum.data))

        setLoading(false)
      })
    })
  }, [supabase])

  const totalPipeline = leadsVal + quotedVal
  const avgDealSize = (() => {
    const allDeals = [...hottest, ...pipeline]
    if (allDeals.length === 0) return 0
    const sum = allDeals.reduce((s, d) => s + (d.quoted_price ?? d.anchor_price ?? 0), 0)
    return Math.round(sum / allDeals.length)
  })()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-4 border-foreground px-4 pt-6 pb-4">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">Deals</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Pipeline</h1>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4 space-y-4">
        {/* Pipeline Money Bar */}
        <PipelineBar leads={leadsVal} quoted={quotedVal} won={wonVal} />

        {/* HOTTEST */}
        <DealSection
          title="Hottest"
          subtitle="Needs action"
          count={hottest.length}
          urgentLabel
        >
          {hottest.length === 0 && !loading && (
            <div className="border-2 border-foreground bg-card px-4 py-6 text-center">
              <p className="text-sm font-mono text-muted-foreground">Pipeline is clean. Go knock some doors.</p>
            </div>
          )}
          {hottest.map(row => (
            <DealCard key={row.id} row={row} showUrgency />
          ))}
        </DealSection>

        {/* PIPELINE */}
        <DealSection title="Pipeline" count={pipeline.length}>
          {pipeline.map(row => (
            <DealCard key={row.id} row={row} />
          ))}
        </DealSection>

        {/* WON */}
        <DealSection title="Won" count={won.length} rightLabel="Last 30 days">
          {won.map(row => (
            <DealCard key={row.id} row={row} isWon />
          ))}
        </DealSection>

        {/* Stats */}
        <div className="space-y-3">
          <StatCard label="Total Pipeline Value" value={`$${totalPipeline.toLocaleString()}`} />
          <StatCard label="Avg Deal Size" value={`$${avgDealSize}`} />
          <StatCard label="Active Deals" value={`${hottest.length + pipeline.length}`} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

/* ─── Pipeline Money Bar ─────────────────────────────────────────── */
function PipelineBar({ leads, quoted, won }: { leads: number; quoted: number; won: number }) {
  const total = leads + quoted + won
  if (total === 0) return null

  const pctL = (leads / total) * 100
  const pctQ = (quoted / total) * 100
  const pctW = (won / total) * 100

  return (
    <div>
      <div className="h-8 w-full flex overflow-hidden border-2 border-foreground">
        {pctL > 0 && <div style={{ width: `${pctL}%`, background: 'var(--heatmap-1)' }} />}
        {pctQ > 0 && <div style={{ width: `${pctQ}%`, background: 'var(--heatmap-3)' }} />}
        {pctW > 0 && <div style={{ width: `${pctW}%`, background: 'var(--heatmap-5)' }} />}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--heatmap-1)' }}>LEADS ${leads}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--heatmap-3)' }}>QUOTED ${quoted}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--heatmap-5)' }}>WON ${won}</span>
      </div>
    </div>
  )
}

/* ─── Deal Section ───────────────────────────────────────────────── */
function DealSection({ title, count, subtitle, urgentLabel, rightLabel, children }: {
  title: string
  count: number
  subtitle?: string
  urgentLabel?: boolean
  rightLabel?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
          <span className="text-[10px] font-mono font-bold bg-muted text-foreground px-1.5 py-0.5">{count}</span>
        </div>
        {urgentLabel && count > 0 && (
          <span className="text-[10px] font-mono font-bold text-destructive uppercase tracking-wider">Needs action</span>
        )}
        {rightLabel && (
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{rightLabel}</span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

/* ─── Deal Card ──────────────────────────────────────────────────── */
function DealCard({ row, showUrgency, isWon }: { row: DealRow; showUrgency?: boolean; isWon?: boolean }) {
  const addr = row.full_address || 'Unknown address'
  const name = row.contact_name?.trim()
  const price = row.quoted_price ?? row.anchor_price

  // Urgency calculation
  const urgencyInfo = (() => {
    if (isWon) {
      const days = Math.floor((Date.now() - new Date(row.updated_at).getTime()) / 86400000)
      return { text: `Won ${days}d ago`, color: 'var(--heatmap-5)', stripe: 'var(--heatmap-5)' }
    }

    if (row.status === 'quoted') {
      const days = Math.floor((Date.now() - new Date(row.updated_at).getTime()) / 86400000)
      if (days >= 7) return { text: `Quote dying — ${days}d old`, color: 'var(--destructive)', stripe: 'var(--destructive)' }
      if (days >= 5) return { text: `Quote aging — ${days}d old`, color: 'var(--heatmap-3)', stripe: 'var(--heatmap-3)' }
      return { text: `Quoted ${days}d ago`, color: 'var(--muted-foreground)', stripe: 'var(--heatmap-2)' }
    }

    if (row.next_follow_up_at) {
      const due = new Date(row.next_follow_up_at)
      const now = new Date()
      const diff = Math.floor((now.getTime() - due.getTime()) / 86400000)
      if (diff > 0) return { text: `${diff}d overdue`, color: 'var(--destructive)', stripe: 'var(--destructive)' }
      if (diff === 0) return { text: 'Follow up today', color: 'var(--primary)', stripe: 'var(--primary)' }
      return { text: `Follow up in ${Math.abs(diff)}d`, color: 'var(--muted-foreground)', stripe: 'var(--heatmap-2)' }
    }

    return { text: 'New lead', color: 'var(--muted-foreground)', stripe: 'var(--primary)' }
  })()

  const statusLabel = row.status === 'quoted' ? 'QUOTED' : row.status === 'lead' ? 'LEAD' : row.status === 'customer' ? 'WON' : ''

  return (
    <div className="border-2 border-foreground bg-card p-3 relative">
      {/* Urgency stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: urgencyInfo.stripe }} />

      <div className="flex items-start gap-2 pl-3">
        <div className="flex-1 min-w-0">
          {/* Address + Price */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold truncate">{name || addr}</span>
            {price ? <span className="text-lg font-bold font-mono tabular-nums shrink-0">${price}</span> : null}
          </div>

          {/* Name + Status badge */}
          <div className="flex items-center gap-2 mt-0.5">
            {name && <span className="text-xs font-mono text-muted-foreground truncate">{addr}</span>}
            {statusLabel && (
              <span className="text-[10px] font-mono font-bold uppercase border-2 border-foreground px-1.5 py-0.5 shrink-0">
                {statusLabel}
              </span>
            )}
          </div>

          {/* Urgency text */}
          {showUrgency && (
            <div className="text-xs font-mono mt-1" style={{ color: urgencyInfo.color }}>
              {urgencyInfo.text}
            </div>
          )}
          {!showUrgency && (
            <div className="text-xs font-mono text-muted-foreground mt-1">
              {urgencyInfo.text}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 shrink-0">
          {row.contact_phone && (
            <a
              href={`tel:${row.contact_phone}`}
              onClick={e => e.stopPropagation()}
              className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground border-2 border-foreground text-xs active:translate-y-[1px] transition-transform"
            >
              📞
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center bg-card text-foreground border-2 border-foreground text-xs active:translate-y-[1px] transition-transform"
          >
            🧭
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-foreground bg-card p-4">
      <div className="text-2xl font-bold font-mono tabular-nums">{value}</div>
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  )
}
