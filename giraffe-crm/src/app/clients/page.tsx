'use client'

/**
 * /clients — "Who already paid me?"
 *
 * Hero: total lifetime revenue + customer count
 * Due for reclean — customers with reclean_due_at <= today
 * Review not asked — recent jobs where we haven't asked for a review
 * All customers — searchable, sorted by LTV
 */

import { useEffect, useRef, useState, useMemo, startTransition } from 'react'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'

type ClientRow = {
  id: string
  full_address: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  quoted_price: number | null
  lifetime_value: number
  total_jobs: number
  reclean_due_at: string | null
  updated_at: string
  created_at: string
  tags: string[]
}

export default function ClientsPage() {
  return (
    <AuthGate>
      <ClientsInner />
    </AuthGate>
  )
}

function ClientsInner() {
  const supabase = useRef(createClient()).current
  const [clients, setClients] = useState<ClientRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('houses')
      .select('id, full_address, contact_name, contact_phone, contact_email, quoted_price, lifetime_value, total_jobs, reclean_due_at, updated_at, created_at, tags')
      .eq('status', 'customer')
      .order('lifetime_value', { ascending: false })
      .then(({ data }) => {
        startTransition(() => {
          setClients((data as ClientRow[]) ?? [])
          setLoading(false)
        })
      })
  }, [supabase])

  // Computed lists
  const ltv = useMemo(() => clients.reduce((s, c) => s + (c.lifetime_value ?? 0), 0), [clients])
  const totalJobs = useMemo(() => clients.reduce((s, c) => s + (c.total_jobs ?? 0), 0), [clients])

  const recleanDue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return clients.filter(c => c.reclean_due_at && c.reclean_due_at.slice(0, 10) <= today)
  }, [clients])

  // Filter for search
  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter(c =>
      (c.contact_name?.toLowerCase().includes(q)) ||
      (c.full_address?.toLowerCase().includes(q)) ||
      (c.contact_phone?.includes(q))
    )
  }, [clients, search])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b-4 border-foreground px-4 pt-6 pb-4">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">Clients</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Customer Base</h1>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4 space-y-4">
        {/* Hero Stat */}
        <div className="border-2 border-foreground bg-card p-4">
          <div className="text-4xl font-bold font-mono tabular-nums text-primary">
            ${ltv.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-1">
            Lifetime Revenue
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {clients.length} customer{clients.length === 1 ? '' : 's'} · {totalJobs} total jobs
          </div>
        </div>

        {/* Due for Reclean */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Due for reclean</h2>
              <span className="text-[10px] font-mono font-bold bg-muted text-foreground px-1.5 py-0.5">{recleanDue.length}</span>
            </div>
          </div>
          {recleanDue.length === 0 && !loading && (
            <div className="border-2 border-foreground bg-card px-4 py-4 text-center">
              <p className="text-sm font-mono text-muted-foreground">Nobody due yet.</p>
            </div>
          )}
          <div className="space-y-2">
            {recleanDue.map(c => (
              <div key={c.id} className="border-2 border-foreground bg-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{c.contact_name || c.full_address || 'Unknown'}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Last clean: {c.reclean_due_at ? formatDate(c.reclean_due_at) : '—'}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase border-2 border-primary text-primary px-2 py-0.5 shrink-0">
                    Reclean due
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Customers */}
        <section>
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            All customers
          </h2>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="field-input mb-3"
          />

          {filtered.length === 0 && !loading && (
            <div className="border-2 border-foreground bg-card px-4 py-6 text-center">
              <p className="text-sm font-mono text-muted-foreground">
                {search ? 'No matches.' : 'No customers yet. Go close one.'}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {filtered.map(c => (
              <ClientCard key={c.id} client={c} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

/* ─── Client Card ────────────────────────────────────────────────── */
function ClientCard({ client: c }: { client: ClientRow }) {
  const addr = c.full_address || 'Unknown address'
  const name = c.contact_name?.trim()
  const lastDate = c.updated_at ? formatDate(c.updated_at) : '—'

  return (
    <div className="border-2 border-foreground bg-card p-3">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold truncate">{name || addr}</span>
            <span className="text-lg font-bold font-mono tabular-nums text-primary shrink-0">${c.lifetime_value?.toLocaleString() ?? 0}</span>
          </div>
          {name && <div className="text-xs font-mono text-muted-foreground truncate">{addr}</div>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] font-mono text-muted-foreground">{c.total_jobs} job{c.total_jobs === 1 ? '' : 's'}</span>
            <span className="text-[10px] font-mono text-muted-foreground">Last: {lastDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {c.contact_phone && (
            <a
              href={`tel:${c.contact_phone}`}
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

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
