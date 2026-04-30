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

import { useEffect, useRef, useState, useMemo, useCallback, startTransition } from 'react'
import Link from 'next/link'
import { todayLocalKey } from '@/lib/local-date'
import AuthGate from '@/components/auth/AuthGate'
import PageHeader from '@/components/nav/PageHeader'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'
import type { HouseStatus } from '@/types/database'

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
  service_types: string[] | null
  window_count: number | null
  house_address?: string | null
  contact_name?: string | null
  contact_phone?: string | null
}

const PAYMENT_METHODS = ['cash', 'check', 'card', 'venmo', 'zelle'] as const

export default function TodayPage() {
  return (
    <AuthGate>
      <TodayInner />
    </AuthGate>
  )
}

function TodayInner() {
  const supabase = useRef(createClient()).current
  const todayKey = useMemo(() => todayLocalKey(), [])

  // ── CRM state ────────────────────────────────────────────────────────
  const [appts, setAppts] = useState<HouseRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [followUps, setFollowUps] = useState<HouseRow[]>([])
  const [expiring, setExpiring] = useState<HouseRow[]>([])
  const [completingJob, setCompletingJob] = useState<JobRow | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Fetch all data in parallel ───────────────────────────────────────
  useEffect(() => {
    const now = new Date()
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999)
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    const houseCols = 'id, full_address, status, contact_name, contact_phone, quoted_price, anchor_price, next_follow_up_at, updated_at, created_at'

    Promise.all([
      // Appointments today: quoted houses with follow-up today
      supabase.from('houses').select(houseCols)
        .eq('status', 'quoted')
        .gte('next_follow_up_at', startOfDay.toISOString())
        .lte('next_follow_up_at', endOfDay.toISOString())
        .order('next_follow_up_at', { ascending: true }),

      // Jobs today
      supabase.from('jobs')
        .select('id, house_id, scheduled_at, status, price, service_types, window_count')
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
    ]).then(async ([a, j, f, e]) => {
      const apptsRaw    = (a.data as HouseRow[]) ?? []
      const jobsRaw     = (j.data as JobRow[])   ?? []
      const followRaw   = (f.data as HouseRow[]) ?? []
      const expRaw      = (e.data as HouseRow[]) ?? []

      // Jobs need house info — batch lookup
      const jobHouseIds = [...new Set(jobsRaw.map(r => r.house_id).filter(Boolean))]
      if (jobHouseIds.length > 0) {
        const { data: houses } = await supabase
          .from('houses')
          .select('id, full_address, contact_name, contact_phone')
          .in('id', jobHouseIds)
        const houseMap = new Map<string, { full_address: string | null; contact_name: string | null; contact_phone: string | null }>()
        ;(houses as { id: string; full_address: string | null; contact_name: string | null; contact_phone: string | null }[] | null)?.forEach(
          h => houseMap.set(h.id, h)
        )
        jobsRaw.forEach(j => {
          const h = houseMap.get(j.house_id)
          j.house_address = h?.full_address ?? null
          j.contact_name = h?.contact_name ?? null
          j.contact_phone = h?.contact_phone ?? null
        })
      }

      startTransition(() => {
        setAppts(apptsRaw)
        setJobs(jobsRaw)
        setFollowUps(followRaw)
        setExpiring(expRaw)
        setLoading(false)
      })
    })
  }, [supabase, todayKey])

  // ── Job actions ──────────────────────────────────────────────────────
  const handleStartJob = useCallback(async (job: JobRow) => {
    await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', job.id)
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j))
  }, [supabase])

  const handleCompleteJob = useCallback(async (jobId: string, paidAmount: number, paymentMethod: string) => {
    const now = new Date().toISOString()
    const job = jobs.find(j => j.id === jobId)

    await supabase.from('jobs').update({
      status: 'completed',
      completed_at: now,
      paid_amount: paidAmount,
      payment_method: paymentMethod,
    }).eq('id', jobId)

    // Update house LTV + total_jobs + schedule reclean
    if (job) {
      const { data: house } = await supabase.from('houses')
        .select('lifetime_value, total_jobs, contact_name, contact_phone, contact_email, full_address')
        .eq('id', job.house_id)
        .single()
      if (house) {
        const recleanDays = 180
        await supabase.from('houses').update({
          lifetime_value: (house.lifetime_value ?? 0) + (job.price ?? 0),
          total_jobs: (house.total_jobs ?? 0) + 1,
          reclean_due_at: new Date(Date.now() + recleanDays * 86400000).toISOString(),
        }).eq('id', job.house_id)

        // Auto-generate invoice
        const serviceLabel = (job.service_types ?? []).map((s: string) =>
          s === 'interior_exterior' ? 'Interior + Exterior' : s.charAt(0).toUpperCase() + s.slice(1)
        ).join(', ') || 'Window Cleaning'

        const lineItems = [{
          description: `${serviceLabel}${job.window_count ? ` (${job.window_count} windows)` : ''}`,
          qty: 1,
          unit_price: job.price ?? 0,
          total: job.price ?? 0,
        }]

        const { data: seqRes } = await (supabase.rpc as any)('nextval_invoice_number')
        const invoiceNum = seqRes ?? `INV-${Date.now().toString(36).toUpperCase()}`

        const { data: { user } } = await supabase.auth.getUser()

        await (supabase.from('invoices') as any).insert({
          job_id: jobId,
          house_id: job.house_id,
          invoice_number: typeof invoiceNum === 'number' ? `INV-${invoiceNum}` : invoiceNum,
          status: paidAmount >= (job.price ?? 0) ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
          contact_name: house.contact_name,
          contact_phone: house.contact_phone,
          contact_email: house.contact_email,
          address: house.full_address,
          line_items: lineItems,
          subtotal: job.price ?? 0,
          total: job.price ?? 0,
          paid_amount: paidAmount,
          payment_method: paymentMethod,
          paid_at: paidAmount > 0 ? now : null,
          created_by: user?.id,
        })
      }
    }

    // Remove from list
    setJobs(prev => prev.filter(j => j.id !== jobId))
    setCompletingJob(null)
  }, [supabase, jobs])

  const total = appts.length + jobs.length + followUps.length + expiring.length

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader section="Today" />

      <main className="flex-1 pb-24">
        {/* ── CRM sections ───────────────────────────────────────── */}
        <div className="px-4 sm:px-10 pt-4">
          <div className="mx-auto max-w-5xl space-y-5">
            <HouseSection title="Appointments today" rows={appts} urgency />
            <JobSection title="Jobs today" rows={jobs} onStart={handleStartJob} onComplete={setCompletingJob} />
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
      {/* Job Completion Modal */}
      {completingJob && (
        <JobCompleteModal
          job={completingJob}
          onClose={() => setCompletingJob(null)}
          onComplete={handleCompleteJob}
        />
      )}

      <BottomNav />
    </div>
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
function JobSection({ title, rows, onStart, onComplete }: {
  title: string
  rows: JobRow[]
  onStart: (job: JobRow) => void
  onComplete: (job: JobRow) => void
}) {
  return (
    <SectionShell title={title} count={rows.length}>
      {rows.map(j => {
        const addr = j.house_address || 'Unknown address'
        const name = j.contact_name?.trim()
        const when = j.scheduled_at ? new Date(j.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''
        const isInProgress = j.status === 'in_progress'

        return (
          <div key={j.id} className="border-2 border-foreground bg-card p-3 relative">
            {/* Status stripe */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ background: isInProgress ? 'var(--heatmap-3)' : 'var(--primary)' }}
            />
            <div className="pl-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">{when || 'Today'}</span>
                    {isInProgress && (
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5" style={{ background: 'var(--heatmap-3)', color: 'var(--background)' }}>
                        In progress
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold truncate mt-0.5">{name || addr}</div>
                  {name && <div className="text-xs font-mono text-muted-foreground truncate">{addr}</div>}
                  {j.price ? <div className="text-xs font-mono text-muted-foreground mt-0.5">${j.price}</div> : null}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {j.contact_phone && <CallBtn phone={j.contact_phone} />}
                  <NavBtn address={addr} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-2">
                {!isInProgress ? (
                  <button
                    onClick={() => onStart(j)}
                    className="flex-1 press-brutal py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-xs uppercase tracking-wider active:translate-y-[1px] transition-transform"
                  >
                    Start Job
                  </button>
                ) : (
                  <button
                    onClick={() => onComplete(j)}
                    className="flex-1 press-brutal py-2 border-2 border-foreground font-mono font-bold text-xs uppercase tracking-wider active:translate-y-[1px] transition-transform"
                    style={{ background: 'var(--heatmap-5)', color: 'var(--background)', borderColor: 'var(--heatmap-5)' }}
                  >
                    Complete Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </SectionShell>
  )
}

/* ─── Job Completion Modal ────────────────────────────────────────────── */
function JobCompleteModal({ job, onClose, onComplete }: {
  job: JobRow
  onClose: () => void
  onComplete: (jobId: string, paidAmount: number, paymentMethod: string) => void
}) {
  const [paidAmount, setPaidAmount] = useState(job.price?.toString() || '')
  const [method, setMethod] = useState<string>('cash')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    await onComplete(job.id, parseFloat(paidAmount) || 0, method)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/50" />
      <div
        className="relative w-full max-w-md bg-background border-2 border-foreground p-5 mx-4 mb-4 sm:mb-0"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">Complete Job</h2>
          <button onClick={onClose} className="text-muted-foreground font-mono font-bold text-lg leading-none">&times;</button>
        </div>

        <div className="text-sm font-bold truncate">{job.contact_name || job.house_address || 'Unknown'}</div>
        <div className="text-xs font-mono text-muted-foreground truncate mb-4">{job.house_address}</div>

        {/* Amount */}
        <label className="block mb-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Amount Paid</span>
          <div className="flex items-center border-2 border-foreground mt-1">
            <span className="px-3 py-2 font-mono font-bold text-muted-foreground border-r-2 border-foreground">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
              className="flex-1 px-3 py-2 font-mono font-bold text-lg bg-transparent outline-none tabular-nums"
              placeholder="0"
            />
          </div>
        </label>

        {/* Payment method */}
        <div className="mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Payment Method</span>
          <div className="flex flex-wrap gap-1.5">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={[
                  'press-brutal px-3 py-1.5 border-2 border-foreground font-mono font-bold text-xs uppercase tracking-wider transition-colors',
                  method === m
                    ? 'bg-foreground text-background'
                    : 'bg-card text-foreground',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full press-brutal py-3 border-2 border-foreground bg-foreground text-background font-mono font-bold text-sm uppercase tracking-wider active:translate-y-[1px] transition-transform disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Mark Complete'}
        </button>
      </div>
    </div>
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
