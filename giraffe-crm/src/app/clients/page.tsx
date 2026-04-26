'use client'

/**
 * /clients — "Who already paid me?"
 *
 * Hero: total lifetime revenue + customer count
 * Due for reclean — customers with reclean_due_at <= today
 * All customers — searchable, sorted by LTV
 * Tap any client → detail modal with contact, jobs, invoices, send invoice SMS
 */

import { useEffect, useRef, useState, useMemo, useCallback, startTransition } from 'react'
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

type JobRow = {
  id: string
  scheduled_at: string | null
  completed_at: string | null
  status: string
  price: number
  paid_amount: number
}

type InvoiceRow = {
  id: string
  invoice_number: string
  status: string
  total: number
  paid_amount: number
  created_at: string
  sent_at: string | null
  sent_via: string | null
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
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null)

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
        <div className="flex items-center gap-2 mb-1">
          <img src="/logo-dark.png" alt="" className="w-6 h-6 object-contain" draggable={false} />
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">Clients</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Base</h1>
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
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="w-full text-left border-2 border-foreground bg-card p-3 active:translate-y-[1px] transition-transform"
              >
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
              </button>
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
              <ClientCard key={c.id} client={c} onTap={() => setSelectedClient(c)} />
            ))}
          </div>
        </section>
      </main>

      {/* Client detail modal */}
      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}

/* ─── Client Card (list item) ───────────────────────────────────── */
function ClientCard({ client: c, onTap }: { client: ClientRow; onTap: () => void }) {
  const addr = c.full_address || 'Unknown address'
  const name = c.contact_name?.trim()
  const lastDate = c.updated_at ? formatDate(c.updated_at) : '—'

  return (
    <button
      onClick={onTap}
      className="w-full text-left border-2 border-foreground bg-card p-3 active:translate-y-[1px] transition-transform"
    >
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
        {/* Chevron indicator */}
        <span className="text-muted-foreground text-sm mt-1 shrink-0">›</span>
      </div>
    </button>
  )
}

/* ─── Client Detail Modal ───────────────────────────────────────── */
function ClientDetail({ client, onClose }: { client: ClientRow; onClose: () => void }) {
  const supabase = useRef(createClient()).current
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null)

  // Load jobs + invoices for this client
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [jobsRes, invoicesRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, scheduled_at, completed_at, status, price, paid_amount')
          .eq('house_id', client.id)
          .order('scheduled_at', { ascending: false })
          .limit(20),
        supabase
          .from('invoices')
          .select('id, invoice_number, status, total, paid_amount, created_at, sent_at, sent_via')
          .eq('house_id', client.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])
      if (cancelled) return
      setJobs((jobsRes.data as JobRow[]) ?? [])
      setInvoices((invoicesRes.data as InvoiceRow[]) ?? [])
      setLoadingData(false)
    })()
    return () => { cancelled = true }
  }, [supabase, client.id])

  const addr = client.full_address || 'Unknown address'
  const name = client.contact_name?.trim() || 'Unknown'
  const phone = client.contact_phone
  const email = client.contact_email
  const unpaidInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'void')

  // Send invoice via SMS (calls edge function)
  const handleSendInvoiceSms = useCallback(async (inv: InvoiceRow) => {
    if (!phone) return
    setSendingInvoice(inv.id)
    setSendResult(null)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${supabaseUrl}/functions/v1/send-invoice-sms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: inv.id,
          phone: phone,
          customer_name: name,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSendResult({ id: inv.id, ok: true, msg: 'Sent!' })
        // Update invoice sent_at locally
        setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, sent_at: new Date().toISOString(), sent_via: 'sms' } : i))
      } else {
        setSendResult({ id: inv.id, ok: false, msg: data.error || 'Failed' })
      }
    } catch {
      setSendResult({ id: inv.id, ok: false, msg: 'Network error' })
    }
    setSendingInvoice(null)
  }, [supabase, phone, name])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/50" />
      <div
        className="relative w-full max-w-md bg-background border-2 border-foreground mx-4 mb-20 sm:mb-0 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b-2 border-foreground px-4 py-3 flex items-center justify-between z-10">
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate">{name}</h2>
            <div className="text-[10px] font-mono text-muted-foreground truncate">{addr}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground font-mono font-bold text-lg leading-none shrink-0 ml-2">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          {/* ── LTV Badge ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="border-2 border-foreground bg-card px-3 py-2 text-center flex-1">
              <div className="text-2xl font-bold font-mono tabular-nums text-primary">${client.lifetime_value?.toLocaleString() ?? 0}</div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">LTV</div>
            </div>
            <div className="border-2 border-foreground bg-card px-3 py-2 text-center flex-1">
              <div className="text-2xl font-bold font-mono tabular-nums">{client.total_jobs}</div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Jobs</div>
            </div>
          </div>

          {/* ── Quick Actions ──────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform"
              >
                <span className="text-lg">📞</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Call</span>
              </a>
            )}
            {phone && (
              <a
                href={`sms:${phone.replace(/[^0-9+]/g, '')}`}
                className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform"
              >
                <span className="text-lg">💬</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Text</span>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform"
              >
                <span className="text-lg">📧</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Email</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform"
            >
              <span className="text-lg">🧭</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Navigate</span>
            </a>
          </div>

          {/* ── Contact Info ───────────────────────────────────────── */}
          <div className="border-2 border-foreground bg-card divide-y-2 divide-foreground">
            {phone && (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Phone</span>
                <span className="text-sm font-mono">{formatE164ForDisplay(phone)}</span>
              </div>
            )}
            {email && (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                <span className="text-sm font-mono truncate ml-2">{email}</span>
              </div>
            )}
            {client.reclean_due_at && (
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Reclean</span>
                <span className="text-sm font-mono">{formatDate(client.reclean_due_at)}</span>
              </div>
            )}
          </div>

          {/* ── Invoices ───────────────────────────────────────────── */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Invoices</h3>
            {loadingData ? (
              <div className="text-xs font-mono text-muted-foreground py-2">Loading...</div>
            ) : invoices.length === 0 ? (
              <div className="border-2 border-foreground bg-card px-3 py-3 text-center">
                <p className="text-xs font-mono text-muted-foreground">No invoices yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map(inv => (
                  <div key={inv.id} className="border-2 border-foreground bg-card p-3 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1" style={{
                      background: inv.status === 'paid' ? 'var(--heatmap-5)' : 'var(--destructive)'
                    }} />
                    <div className="pl-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">{inv.invoice_number}</span>
                          <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border-2 ${
                            inv.status === 'paid' ? 'border-primary text-primary' : 'border-destructive text-destructive'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <span className="text-sm font-bold font-mono tabular-nums">${inv.total.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {formatDate(inv.created_at)}
                        {inv.sent_at && ` · Sent via ${inv.sent_via || 'sms'}`}
                      </div>

                      {/* Send invoice button — only for unpaid, if customer has phone */}
                      {inv.status !== 'paid' && phone && (
                        <button
                          onClick={() => handleSendInvoiceSms(inv)}
                          disabled={sendingInvoice === inv.id}
                          className="mt-2 w-full press-brutal py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-wider disabled:opacity-50"
                        >
                          {sendingInvoice === inv.id
                            ? 'Sending...'
                            : inv.sent_at
                            ? 'Resend SMS'
                            : 'Send Invoice SMS'}
                        </button>
                      )}
                      {sendResult?.id === inv.id && (
                        <div className={`text-[10px] font-mono font-bold mt-1 ${sendResult.ok ? 'text-primary' : 'text-destructive'}`}>
                          {sendResult.msg}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Job History ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Job History</h3>
            {loadingData ? (
              <div className="text-xs font-mono text-muted-foreground py-2">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="border-2 border-foreground bg-card px-3 py-3 text-center">
                <p className="text-xs font-mono text-muted-foreground">No jobs yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {jobs.map(j => (
                  <div key={j.id} className="border-2 border-foreground bg-card px-3 py-2 flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                        j.status === 'completed' ? 'border-primary text-primary' :
                        j.status === 'in_progress' ? 'border-foreground text-foreground bg-muted' :
                        j.status === 'cancelled' ? 'border-muted-foreground text-muted-foreground' :
                        'border-foreground text-foreground'
                      }`}>
                        {j.status}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-2">
                        {j.scheduled_at ? formatDateFull(j.scheduled_at) : '—'}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums">${(j.price ?? 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatDateFull(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
