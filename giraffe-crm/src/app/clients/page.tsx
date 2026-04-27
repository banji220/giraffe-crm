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
import PageHeader from '@/components/nav/PageHeader'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay } from '@/lib/phone'
import { updateCalendarEvent } from '@/lib/google-calendar'

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
  next_follow_up_at: string | null
  google_calendar_event_id: string | null
  status: string | null
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
      .select('id, full_address, contact_name, contact_phone, contact_email, quoted_price, lifetime_value, total_jobs, reclean_due_at, next_follow_up_at, google_calendar_event_id, status, updated_at, created_at, tags')
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
      <PageHeader section="Clients" />

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
          onUpdate={(updated) => {
            setClients(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))
            setSelectedClient(prev => prev ? { ...prev, ...updated } : null)
          }}
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

/* ─── Inline editable field — tap the value to edit ────────────── */
function EditableField({ label, value, onSave, type = 'text', inputMode, placeholder }: {
  label: string
  value: string
  onSave: (v: string) => void
  type?: string
  inputMode?: 'tel' | 'email' | 'numeric' | 'text'
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    setEditing(false)
    if (draft !== value) onSave(draft)
  }

  if (editing) {
    return (
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground shrink-0">{label}</span>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit() }}
          inputMode={inputMode}
          placeholder={placeholder}
          className="text-sm font-mono text-right bg-transparent border-b-2 border-primary outline-none flex-1 min-w-0"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true) }}
      className="w-full px-3 py-2 flex items-center justify-between active:bg-muted/30 transition-colors"
    >
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-mono truncate ml-2">{value || '—'}</span>
    </button>
  )
}

/* ─── Client Detail Modal ───────────────────────────────────────── */
function ClientDetail({ client, onClose, onUpdate }: {
  client: ClientRow
  onClose: () => void
  onUpdate: (updated: Partial<ClientRow> & { id: string }) => void
}) {
  const supabase = useRef(createClient()).current
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [sendingInvoice, setSendingInvoice] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null)
  const [toast, setToast] = useState('')

  // Job reschedule state
  const [rescheduleJobId, setRescheduleJobId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  // Load jobs + invoices
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

  // ── Save a single field on the house ──────────────────────────────
  const saveField = useCallback(async (field: string, value: string | number | null) => {
    await supabase.from('houses').update({ [field]: value }).eq('id', client.id)
    onUpdate({ id: client.id, [field]: value } as Partial<ClientRow> & { id: string })
    setToast('Saved')
    setTimeout(() => setToast(''), 1500)
  }, [supabase, client.id, onUpdate])

  // ── Reschedule a job ──────────────────────────────────────────────
  const handleReschedule = useCallback(async (job: JobRow) => {
    if (!rescheduleDate) return
    setRescheduling(true)
    const newDateTime = new Date(`${rescheduleDate}T${rescheduleTime || '10:00'}:00`)

    // Update job in DB
    await supabase.from('jobs').update({ scheduled_at: newDateTime.toISOString() }).eq('id', job.id)

    // Update local state
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, scheduled_at: newDateTime.toISOString() } : j))

    // Delete old calendar event + create new one (non-blocking)
    updateCalendarEvent({
      houseId: client.id,
      oldEventId: client.google_calendar_event_id,
      contactName: name,
      phone: phone || '',
      address: addr,
      price: client.quoted_price ?? 0,
      date: newDateTime.toISOString(),
      type: 'job',
    }).catch(err => console.error('Calendar reschedule failed:', err))

    // Send reschedule SMS (non-blocking)
    if (phone) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return
        fetch(`${supabaseUrl}/functions/v1/send-confirmation-sms`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone,
            customer_name: name,
            scheduled_date: newDateTime.toISOString(),
            price: client.quoted_price,
            address: addr,
          }),
        }).catch(err => console.error('Reschedule SMS failed:', err))
      })
    }

    setRescheduleJobId(null)
    setRescheduling(false)
    setToast('Rescheduled')
    setTimeout(() => setToast(''), 2000)
  }, [supabase, client, name, phone, addr, rescheduleDate, rescheduleTime])

  // Send invoice via SMS
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
        body: JSON.stringify({ invoice_id: inv.id, phone, customer_name: name }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSendResult({ id: inv.id, ok: true, msg: 'Sent!' })
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

        {/* Toast */}
        {toast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background px-4 py-1.5 font-mono font-bold text-xs uppercase tracking-wider">
            {toast}
          </div>
        )}

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
              <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform">
                <span className="text-lg">📞</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Call</span>
              </a>
            )}
            {phone && (
              <a href={`sms:${phone.replace(/[^0-9+]/g, '')}`} className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform">
                <span className="text-lg">💬</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Text</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform">
                <span className="text-lg">📧</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Email</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`}
              target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-1 py-3 border-2 border-foreground bg-card active:translate-y-[1px] transition-transform"
            >
              <span className="text-lg">🧭</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Navigate</span>
            </a>
          </div>

          {/* ── Contact Info — tap any row to edit ─────────────────── */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Details — tap to edit</h3>
            <div className="border-2 border-foreground bg-card divide-y-2 divide-foreground">
              <EditableField
                label="Name"
                value={client.contact_name ?? ''}
                onSave={v => saveField('contact_name', v || null)}
              />
              <EditableField
                label="Phone"
                value={client.contact_phone ?? ''}
                onSave={v => saveField('contact_phone', v || null)}
                type="tel"
                inputMode="tel"
                placeholder="+19495551234"
              />
              <EditableField
                label="Email"
                value={client.contact_email ?? ''}
                onSave={v => saveField('contact_email', v || null)}
                type="email"
                inputMode="email"
              />
              <EditableField
                label="Price"
                value={client.quoted_price?.toString() ?? ''}
                onSave={v => saveField('quoted_price', v ? parseFloat(v) : null)}
                type="number"
                inputMode="numeric"
                placeholder="$0"
              />
              <EditableField
                label="Reclean"
                value={client.reclean_due_at?.slice(0, 10) ?? ''}
                onSave={v => saveField('reclean_due_at', v ? new Date(v + 'T00:00:00').toISOString() : null)}
                type="date"
              />
            </div>
          </div>

          {/* ── Jobs — tap to schedule/reschedule ─────────────────────── */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Jobs — tap to edit</h3>
            {loadingData ? (
              <div className="text-xs font-mono text-muted-foreground py-2">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="border-2 border-foreground bg-card px-3 py-3 text-center">
                <p className="text-xs font-mono text-muted-foreground">No jobs yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map(j => (
                  <div key={j.id} className="border-2 border-foreground bg-card">
                    <button
                      onClick={() => {
                        if (rescheduleJobId === j.id) {
                          setRescheduleJobId(null)
                        } else {
                          setRescheduleJobId(j.id)
                          if (j.scheduled_at) {
                            const d = new Date(j.scheduled_at)
                            setRescheduleDate(d.toISOString().slice(0, 10))
                            setRescheduleTime(d.toTimeString().slice(0, 5))
                          } else {
                            setRescheduleDate('')
                            setRescheduleTime('10:00')
                          }
                        }
                      }}
                      className="w-full px-3 py-2 flex items-center justify-between active:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                          j.status === 'completed' ? 'border-primary text-primary' :
                          j.status === 'in_progress' ? 'border-foreground text-foreground bg-muted' :
                          j.status === 'cancelled' ? 'border-muted-foreground text-muted-foreground' :
                          'border-foreground text-foreground'
                        }`}>
                          {j.status}
                        </span>
                        <span className={`text-[10px] font-mono ${j.scheduled_at ? 'text-muted-foreground' : 'text-destructive font-bold'}`}>
                          {j.scheduled_at ? formatDateFull(j.scheduled_at) : 'Not scheduled'}
                        </span>
                      </div>
                      <span className="text-sm font-bold font-mono tabular-nums">${(j.price ?? 0).toFixed(0)}</span>
                    </button>

                    {/* Reschedule panel — slides open */}
                    {rescheduleJobId === j.id && (
                      <div className="border-t-2 border-foreground px-3 py-3 bg-muted/20 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-mono font-bold uppercase text-muted-foreground">New Date</label>
                            <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className="field-input mt-1" />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono font-bold uppercase text-muted-foreground">New Time</label>
                            <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className="field-input mt-1" />
                          </div>
                        </div>
                        <button
                          onClick={() => handleReschedule(j)}
                          disabled={rescheduling || !rescheduleDate}
                          className="w-full py-2.5 border-2 border-foreground bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-wider active:translate-y-[1px] transition-transform disabled:opacity-50"
                        >
                          {rescheduling ? 'Saving...' : j.scheduled_at ? 'Reschedule + Update Calendar' : 'Schedule + Add to Calendar'}
                        </button>
                        <div className="text-[9px] font-mono text-muted-foreground text-center">
                          Removes old event, creates new one, sends SMS
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                      {inv.status !== 'paid' && phone && (
                        <button
                          onClick={() => handleSendInvoiceSms(inv)}
                          disabled={sendingInvoice === inv.id}
                          className="mt-2 w-full press-brutal py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-[10px] uppercase tracking-wider disabled:opacity-50"
                        >
                          {sendingInvoice === inv.id ? 'Sending...' : inv.sent_at ? 'Resend SMS' : 'Send Invoice SMS'}
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
