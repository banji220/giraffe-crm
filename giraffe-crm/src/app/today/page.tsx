'use client'

/**
 * /today — "What do I need to DO now?"
 *
 * Top: QuickLog + DailyMission (knock tracker)
 * Below: CRM action sections — all querying houses directly (no leads table)
 *
 * Design: heatmap design system — brutalist borders, Space Grotesk/Mono,
 * oklch tokens, zero border-radius.
 */

import { useEffect, useRef, useState, useCallback, useMemo, startTransition } from 'react'
import Link from 'next/link'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import QuickLog from '@/components/knock-tracker/QuickLog'
import DailyMission from '@/components/knock-tracker/DailyMission'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'
import type { DailyStats, UserSettings, HouseStatus } from '@/types/database'

/** Lightweight row shape for CRM cards — queried directly from houses */
type HouseRow = {
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

type JobRow = {
  id: string
  house_id: string
  scheduled_at: string | null
  status: string | null
  price: number | null
  house_address?: string | null
}

export default function TodayPage() {
  return (
    <AuthGate>
      <TodayInner />
    </AuthGate>
  )
}

function TodayInner() {
  const supabase = useRef(createClient()).current
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // ── Knock tracker state ──────────────────────────────────────────────
  const [doorsToday, setDoorsToday] = useState(0)
  const [dailyTarget, setDailyTarget] = useState(30)

  // ── CRM state ────────────────────────────────────────────────────────
  const [appts, setAppts] = useState<HouseRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [followUps, setFollowUps] = useState<HouseRow[]>([])
  const [expiring, setExpiring] = useState<HouseRow[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch all data in parallel ───────────────────────────────────────
  useEffect(() => {
    const now = new Date()
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const houseCols = 'id, full_address, status, contact_name, contact_phone, quoted_price, anchor_price, next_follow_up_at, updated_at, created_at'

    Promise.all([
      // Knock tracker data
      supabase.from('daily_stats' as any).select('*').eq('date', todayKey).maybeSingle() as Promise<{ data: DailyStats | null; error: any }>,
      supabase.from('user_settings' as any).select('*').maybeSingle() as Promise<{ data: UserSettings | null; error: any }>,

      // Appointments today: quoted houses with follow-up today
      supabase.from('houses').select(houseCols)
        .eq('status', 'quoted')
        .gte('next_follow_up_at', startOfDay.toISOString())
        .lte('next_follow_up_at', endOfDay.toISOString())
        .order('next_follow_up_at', { ascending: true }),

      // Jobs today
      supabase.from('jobs')
        .select('id, house_id, scheduled_at, status, price')
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'completed')
        .order('scheduled_at', { ascending: true }),

      // Follow-ups due: lead houses with follow-up due today or earlier
      supabase.from('houses').select(houseCols)
        .eq('status', 'lead')
        .not('next_follow_up_at', 'is', null)
        .lte('next_follow_up_at', endOfDay.toISOString())
        .order('next_follow_up_at', { ascending: true })
        .limit(25),

      // Expiring quotes: quoted houses not touched in 5+ days
      supabase.from('houses').select(houseCols)
        .eq('status', 'quoted')
        .lte('updated_at', fiveDaysAgo.toISOString())
        .order('updated_at', { ascending: true })
        .limit(25),
    ]).then(async ([statsRes, settingsRes, a, j, f, e]) => {
      const apptsRaw    = (a.data as HouseRow[]) ?? []
      const jobsRaw     = (j.data as JobRow[])   ?? []
      const followRaw   = (f.data as HouseRow[]) ?? []
      const expRaw      = (e.data as HouseRow[]) ?? []

      // Jobs need house addresses — batch lookup
      const jobHouseIds = [...new Set(jobsRaw.map(r => r.house_id).filter(Boolean))]
      if (jobHouseIds.length > 0) {
        const { data: houses } = await supabase
          .from('houses')
          .select('id, full_address')
          .in('id', jobHouseIds)
        const addrMap = new Map<string, string | null>()
        ;(houses as { id: string; full_address: string | null }[] | null)?.forEach(
          h => addrMap.set(h.id, h.full_address)
        )
        jobsRaw.forEach(j => { j.house_address = addrMap.get(j.house_id) ?? null })
      }

      startTransition(() => {
        // Knock tracker
        if (statsRes.data) setDoorsToday(statsRes.data.doors ?? 0)
        if (settingsRes.data) setDailyTarget(settingsRes.data.daily_target ?? 30)

        // CRM
        setAppts(apptsRaw)
        setJobs(jobsRaw)
        setFollowUps(followRaw)
        setExpiring(expRaw)
        setLoading(false)
      })
    })
  }, [supabase, todayKey])

  // ── Log doors handler ────────────────────────────────────────────────
  const handleLog = useCallback(async (count: number) => {
    setDoorsToday(prev => prev + count)

    const { data: existing } = await (supabase.from('daily_stats' as any)
      .select('*')
      .eq('date', todayKey)
      .maybeSingle() as Promise<{ data: DailyStats | null; error: any }>)

    if (existing) {
      await (supabase.from('daily_stats' as any) as any)
        .update({ doors: existing.doors + count })
        .eq('id', existing.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase.from('daily_stats' as any) as any)
          .insert({ user_id: user.id, date: todayKey, doors: count })
      }
    }
  }, [supabase, todayKey])

  const total = appts.length + jobs.length + followUps.length + expiring.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header total={total} doorsToday={doorsToday} />

      <main className="flex-1 pb-4">
        {/* ── Knock tracker ──────────────────────────────────────── */}
        <div className="space-y-4 pt-4">
          <QuickLog onLog={handleLog} todayDoors={doorsToday} />
          <DailyMission doorsToday={doorsToday} target={dailyTarget} />
        </div>

        {/* ── CRM sections ───────────────────────────────────────── */}
        <div className="px-4 sm:px-10 pt-6">
          <div className="mx-auto max-w-5xl space-y-5">
            <HouseSection title="Appointments today" rows={appts} urgency />
            <JobSection   title="Jobs today"          rows={jobs} />
            <HouseSection title="Follow-ups due"      rows={followUps} urgency />
            <HouseSection title="Expiring quotes"     rows={expiring} showAge />

            {!loading && total === 0 && (
              <div className="border-2 border-foreground bg-card px-6 py-10 text-center">
                <p className="font-mono text-sm text-muted-foreground">Nothing urgent. Go knock some doors.</p>
                <Link
                  href="/map"
                  className="inline-block mt-4 px-5 py-2.5 bg-foreground text-background font-mono font-bold text-sm uppercase tracking-wider border-2 border-foreground active:translate-y-[2px] transition-transform"
                >
                  Open map →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

/* ─── Header ───────────────────────────────────────────────────────────── */
function Header({ total, doorsToday }: { total: number; doorsToday: number }) {
  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <header className="border-b-4 border-foreground px-4 pt-6 pb-4 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary">Today</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{today}</h1>
        <div className="flex items-center gap-4 mt-1.5">
          {doorsToday > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              <span className="font-bold text-foreground">{doorsToday}</span> doors knocked
            </span>
          )}
          {total > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              <span className="font-bold text-foreground">{total}</span> action{total === 1 ? '' : 's'} pending
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

/* ─── Section shell ────────────────────────────────────────────────────── */
function SectionShell({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
        <span className="text-[10px] font-mono font-bold text-muted-foreground tabular-nums">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

/* ─── House card (appointments, follow-ups, expiring quotes) ───────────── */
function HouseSection({ title, rows, urgency, showAge }: { title: string; rows: HouseRow[]; urgency?: boolean; showAge?: boolean }) {
  return (
    <SectionShell title={title} count={rows.length}>
      {rows.map(r => <HouseCard key={r.id} row={r} urgency={urgency} showAge={showAge} />)}
    </SectionShell>
  )
}

function HouseCard({ row, urgency, showAge }: { row: HouseRow; urgency?: boolean; showAge?: boolean }) {
  const addr = row.full_address || 'Unknown address'
  const name = row.contact_name?.trim()
  const price = row.quoted_price ?? row.anchor_price
  const dueLabel = (() => {
    if (showAge) {
      const days = Math.floor((Date.now() - new Date(row.updated_at).getTime()) / 86400000)
      return `${days}d old`
    }
    if (!row.next_follow_up_at) return null
    const d = new Date(row.next_follow_up_at)
    const now = new Date()
    const overdue = d.getTime() < now.getTime() - 60 * 60 * 1000
    const sameDay = d.toDateString() === now.toDateString()
    if (overdue && !sameDay) {
      const days = Math.floor((now.getTime() - d.getTime()) / 86400000)
      return `${days}d overdue`
    }
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  })()

  return (
    <div className="border-2 border-foreground bg-card p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {dueLabel && (
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5"
                style={{
                  background: urgency && dueLabel.includes('overdue')
                    ? 'var(--destructive)'
                    : 'var(--accent)',
                  color: urgency && dueLabel.includes('overdue')
                    ? 'var(--destructive-foreground)'
                    : 'var(--accent-foreground)',
                }}
              >
                {dueLabel}
              </span>
            )}
            {price ? <span className="text-sm font-bold font-mono text-primary tabular-nums">${price}</span> : null}
          </div>
          <div className="text-sm font-bold truncate mt-1">{name || addr}</div>
          {name && <div className="text-xs font-mono text-muted-foreground truncate">{addr}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {row.contact_phone && <CallBtn phone={row.contact_phone} />}
          <NavBtn address={addr} />
        </div>
      </div>
    </div>
  )
}

/* ─── Job section ──────────────────────────────────────────────────────── */
function JobSection({ title, rows }: { title: string; rows: JobRow[] }) {
  return (
    <SectionShell title={title} count={rows.length}>
      {rows.map(j => {
        const addr = j.house_address || 'Unknown address'
        const when = j.scheduled_at ? new Date(j.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
        return (
          <div key={j.id} className="border-2 border-foreground bg-card p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">{when || 'Today'}</div>
                <div className="text-sm font-bold truncate">{addr}</div>
                {j.price ? <div className="text-xs font-mono text-muted-foreground mt-0.5">${j.price}</div> : null}
              </div>
              <NavBtn address={addr} />
            </div>
          </div>
        )
      })}
    </SectionShell>
  )
}

/* ─── Action buttons ───────────────────────────────────────────────────── */
function CallBtn({ phone }: { phone: string }) {
  return (
    <a href={`tel:${phone}`} onClick={e => e.stopPropagation()}
      className="w-9 h-9 flex items-center justify-center bg-primary text-primary-foreground border-2 border-foreground font-mono text-xs font-bold active:translate-y-[1px] transition-transform"
      aria-label={`Call ${formatE164ForDisplay(phone)}`}>
      📞
    </a>
  )
}

function NavBtn({ address }: { address: string }) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
      className="w-9 h-9 flex items-center justify-center bg-card text-foreground border-2 border-foreground font-mono text-xs font-bold active:translate-y-[1px] transition-transform"
      aria-label="Navigate">
      🧭
    </a>
  )
}
