'use client'

/**
 * /today — "What do I need to DO now?"
 * Real data: appointments, jobs, follow-ups due, expiring quotes.
 * Every row is one-tap: Call / Navigate / Open.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'

type HouseLite = { id: string; full_address: string | null }
type LeadRow = {
  id: string
  house_id: string
  state: string
  full_name: string | null
  phone: string | null
  final_price: number | null
  anchor_price: number | null
  next_touch_at: string | null
  updated_at: string
  created_at: string
  address?: string | null
}
type JobRow = {
  id: string
  house_id: string
  scheduled_at: string | null
  status: string | null
  price: number | null
  address?: string | null
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

  const [appts, setAppts] = useState<LeadRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [followUps, setFollowUps] = useState<LeadRow[]>([])
  const [expiring, setExpiring] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)

    const leadCols = 'id, house_id, state, full_name, phone, final_price, anchor_price, next_touch_at, updated_at, created_at'

    Promise.all([
      supabase.from('leads').select(leadCols)
        .eq('state', 'quoted')
        .gte('next_touch_at', startOfDay.toISOString())
        .lte('next_touch_at', endOfDay.toISOString())
        .order('next_touch_at', { ascending: true }),

      supabase.from('jobs')
        .select('id, house_id, scheduled_at, status, price')
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'completed')
        .order('scheduled_at', { ascending: true }),

      supabase.from('leads').select(leadCols)
        .in('state', ['new', 'nurture'])
        .not('next_touch_at', 'is', null)
        .lte('next_touch_at', endOfDay.toISOString())
        .order('next_touch_at', { ascending: true })
        .limit(25),

      supabase.from('leads').select(leadCols)
        .eq('state', 'quoted')
        .lte('updated_at', fiveDaysAgo.toISOString())
        .order('updated_at', { ascending: true })
        .limit(25),
    ]).then(async ([a, j, f, e]) => {
      const apptsRaw  = (a.data as LeadRow[]) ?? []
      const jobsRaw   = (j.data as JobRow[])  ?? []
      const followRaw = (f.data as LeadRow[]) ?? []
      const expRaw    = (e.data as LeadRow[]) ?? []

      // Collect all house_ids and do a single batched lookup
      const houseIds = Array.from(new Set([
        ...apptsRaw.map(r => r.house_id),
        ...jobsRaw.map(r => r.house_id),
        ...followRaw.map(r => r.house_id),
        ...expRaw.map(r => r.house_id),
      ].filter(Boolean)))

      const addrMap = new Map<string, string | null>()
      if (houseIds.length > 0) {
        const { data: houses } = await supabase
          .from('houses')
          .select('id, full_address')
          .in('id', houseIds)
        ;(houses as HouseLite[] | null)?.forEach(h => addrMap.set(h.id, h.full_address))
      }

      const attach = <T extends { house_id: string }>(rows: T[]): (T & { address: string | null })[] =>
        rows.map(r => ({ ...r, address: addrMap.get(r.house_id) ?? null }))

      setAppts(attach(apptsRaw))
      setJobs(attach(jobsRaw))
      setFollowUps(attach(followRaw))
      setExpiring(attach(expRaw))
      setLoading(false)
    })
  }, [supabase])

  const total = appts.length + jobs.length + followUps.length + expiring.length

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Header total={total} />
      <main className="flex-1 px-4 pt-4 pb-4">
        <ApptSection title="Appointments today" color="#14B714" rows={appts} />
        <JobSection  title="Jobs today"          color="#1ABB85" rows={jobs} />
        <LeadSection title="Follow-ups due"      color="#FF6B5B" rows={followUps} urgency />
        <LeadSection title="Expiring quotes"     color="#FFD93D" rows={expiring} showAge />

        {!loading && total === 0 && (
          <div className="mt-12 mb-8 text-center">
            <div className="text-5xl mb-2">☕🦒</div>
            <p className="text-sm text-gray-500">Nothing urgent. Go knock some doors.</p>
            <Link href="/map" className="inline-block mt-4 px-5 py-3 bg-emerald-500 text-black font-black rounded-xl border-[2px] border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none">
              Open map →
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

function Header({ total }: { total: number }) {
  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div className="px-4 pt-8 pb-4">
      <div className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: '#FF6B5B' }}>Today</div>
      <h1 className="text-3xl font-black tracking-tight text-gray-900 mt-1">{today}</h1>
      {total > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-bold text-gray-900">{total}</span> thing{total === 1 ? '' : 's'} on your plate
        </p>
      )}
    </div>
  )
}

function SectionShell({ title, color, count, children }: { title: string; color: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold">{title}</h2>
        <span className="ml-auto text-[10px] font-bold text-gray-400 tabular-nums">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function ApptSection({ title, color, rows }: { title: string; color: string; rows: LeadRow[] }) {
  return (
    <SectionShell title={title} color={color} count={rows.length}>
      {rows.map((r) => <LeadRowCard key={r.id} row={r} urgency accent={color} />)}
    </SectionShell>
  )
}

function JobSection({ title, color, rows }: { title: string; color: string; rows: JobRow[] }) {
  return (
    <SectionShell title={title} color={color} count={rows.length}>
      {rows.map((j) => {
        const addr = j.address || 'Unknown address'
        const when = j.scheduled_at ? new Date(j.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
        return (
          <div key={j.id} className="bg-white border-[2px] border-black rounded-2xl p-3 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>{when || 'Today'}</div>
                <div className="text-sm font-bold text-gray-900 truncate">{addr}</div>
                {j.price ? <div className="text-xs text-gray-500 mt-0.5">${j.price}</div> : null}
              </div>
              <NavBtn address={addr} />
            </div>
          </div>
        )
      })}
    </SectionShell>
  )
}

function LeadSection({ title, color, rows, urgency, showAge }: { title: string; color: string; rows: LeadRow[]; urgency?: boolean; showAge?: boolean }) {
  return (
    <SectionShell title={title} color={color} count={rows.length}>
      {rows.map((r) => <LeadRowCard key={r.id} row={r} urgency={urgency} showAge={showAge} accent={color} />)}
    </SectionShell>
  )
}

function LeadRowCard({ row, urgency, showAge, accent }: { row: LeadRow; urgency?: boolean; showAge?: boolean; accent: string }) {
  const addr = row.address || 'Unknown address'
  const name = row.full_name?.trim()
  const price = row.final_price ?? row.anchor_price
  const dueLabel = (() => {
    if (showAge) {
      const days = Math.floor((Date.now() - new Date(row.updated_at).getTime()) / 86400000)
      return `${days}d old`
    }
    if (!row.next_touch_at) return null
    const d = new Date(row.next_touch_at)
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
    <div className="bg-white border-[2px] border-black rounded-2xl p-3 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {dueLabel && (
              <span
                className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  background: urgency && dueLabel.includes('overdue') ? '#FF6B5B' : accent,
                  color: '#000',
                }}
              >
                {dueLabel}
              </span>
            )}
            {price ? <span className="text-sm font-black text-emerald-600 tabular-nums">${price}</span> : null}
          </div>
          <div className="text-sm font-bold text-gray-900 truncate mt-1">{name || addr}</div>
          {name && <div className="text-xs text-gray-500 truncate">{addr}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {row.phone && <CallBtn phone={row.phone} />}
          <NavBtn address={addr} />
        </div>
      </div>
    </div>
  )
}

function CallBtn({ phone }: { phone: string }) {
  return (
    <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()}
      className="w-9 h-9 flex items-center justify-center bg-emerald-500 text-black border-[2px] border-black rounded-lg shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
      aria-label={`Call ${formatE164ForDisplay(phone)}`}>
      📞
    </a>
  )
}

function NavBtn({ address }: { address: string }) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
      className="w-9 h-9 flex items-center justify-center bg-white text-black border-[2px] border-black rounded-lg shadow-[0_2px_0_0_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none"
      aria-label="Navigate">
      🧭
    </a>
  )
}
