'use client'

/**
 * /invoices — "Who owes me money?"
 *
 * Lists all invoices, filterable by status (unpaid/paid/all).
 * Tap an invoice to view detail + generate PDF.
 */

import { useEffect, useRef, useState, useMemo, startTransition } from 'react'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'

type InvoiceRow = {
  id: string
  invoice_number: string
  status: string
  contact_name: string | null
  address: string | null
  total: number
  paid_amount: number
  payment_method: string | null
  line_items: { description: string; qty: number; unit_price: number; total: number }[]
  created_at: string
  paid_at: string | null
  sent_via: string | null
  sent_at: string | null
  house_id: string
  job_id: string | null
}

export default function InvoicesPage() {
  return (
    <AuthGate>
      <InvoicesInner />
    </AuthGate>
  )
}

function InvoicesInner() {
  const supabase = useRef(createClient()).current
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRow | null>(null)

  useEffect(() => {
    supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        startTransition(() => {
          setInvoices((data as InvoiceRow[]) ?? [])
          setLoading(false)
        })
      })
  }, [supabase])

  const filtered = useMemo(() => {
    if (filter === 'all') return invoices
    if (filter === 'paid') return invoices.filter(i => i.status === 'paid')
    return invoices.filter(i => i.status === 'unpaid' || i.status === 'partial')
  }, [invoices, filter])

  const totalUnpaid = useMemo(
    () => invoices.filter(i => i.status !== 'paid' && i.status !== 'void').reduce((s, i) => s + (i.total - i.paid_amount), 0),
    [invoices]
  )

  const handleMarkPaid = async (inv: InvoiceRow, method: string) => {
    const now = new Date().toISOString()
    await (supabase.from('invoices') as any).update({
      status: 'paid',
      paid_amount: inv.total,
      payment_method: method,
      paid_at: now,
    }).eq('id', inv.id)
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid', paid_amount: inv.total, payment_method: method, paid_at: now } : i))
    setSelectedInvoice(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b-4 border-foreground px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <img src="/logo-dark.png" alt="" className="w-6 h-6 object-contain" draggable={false} />
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">Invoices</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4 space-y-4">
        {/* Unpaid hero */}
        {totalUnpaid > 0 && (
          <div className="border-2 border-foreground bg-card p-4">
            <div className="text-4xl font-bold font-mono tabular-nums" style={{ color: 'var(--destructive)' }}>
              ${totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-1">
              Outstanding
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'unpaid', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'press-brutal px-3 py-1.5 border-2 border-foreground font-mono font-bold text-xs uppercase tracking-wider transition-colors',
                filter === f ? 'bg-foreground text-background' : 'bg-card text-foreground',
              ].join(' ')}
            >
              {f} {f === 'unpaid' ? `(${invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length})` : ''}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        {!loading && filtered.length === 0 && (
          <div className="border-2 border-foreground bg-card px-4 py-6 text-center">
            <p className="text-sm font-mono text-muted-foreground">
              {filter === 'unpaid' ? 'All paid up.' : 'No invoices yet. Complete a job to generate one.'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(inv => (
            <button
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className="w-full text-left border-2 border-foreground bg-card p-3 active:translate-y-[1px] transition-transform relative"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{
                background: inv.status === 'paid' ? 'var(--heatmap-5)' : inv.status === 'partial' ? 'var(--heatmap-3)' : 'var(--destructive)'
              }} />
              <div className="pl-3 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground">{inv.invoice_number}</span>
                    <span className={[
                      'text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 border-2',
                      inv.status === 'paid' ? 'border-primary text-primary' : 'border-destructive text-destructive',
                    ].join(' ')}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold truncate mt-0.5">{inv.contact_name || inv.address || 'Unknown'}</div>
                  <div className="text-xs font-mono text-muted-foreground">{formatDate(inv.created_at)}</div>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums shrink-0">
                  ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Invoice detail modal */}
      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      <BottomNav />
    </div>
  )
}

/* ─── Invoice Detail Modal ─────────────────────────────────────────── */
function InvoiceDetail({ invoice, onClose, onMarkPaid }: {
  invoice: InvoiceRow
  onClose: () => void
  onMarkPaid: (inv: InvoiceRow, method: string) => void
}) {
  const [payMethod, setPayMethod] = useState('cash')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true)
    try {
      // Generate PDF client-side using the edge function
      const supabase = createClient()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-invoice-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_id: invoice.id }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${invoice.invoice_number}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('PDF generation failed:', err)
    }
    setGeneratingPdf(false)
  }

  const items = (invoice.line_items || []) as { description: string; qty: number; unit_price: number; total: number }[]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/50" />
      <div
        className="relative w-full max-w-md bg-background border-2 border-foreground p-5 mx-4 mb-4 sm:mb-0 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">{invoice.invoice_number}</h2>
          <button onClick={onClose} className="text-muted-foreground font-mono font-bold text-lg leading-none">&times;</button>
        </div>

        {/* Status */}
        <div className={[
          'inline-block text-[10px] font-mono font-bold uppercase px-2 py-1 border-2 mb-3',
          invoice.status === 'paid' ? 'border-primary text-primary' : 'border-destructive text-destructive',
        ].join(' ')}>
          {invoice.status}
        </div>

        {/* Customer */}
        <div className="text-sm font-bold">{invoice.contact_name || 'Unknown'}</div>
        <div className="text-xs font-mono text-muted-foreground mb-4">{invoice.address}</div>

        {/* Line items */}
        <div className="border-2 border-foreground divide-y-2 divide-foreground mb-3">
          <div className="flex items-center justify-between px-3 py-2 bg-muted">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Item</span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Amount</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <span className="text-sm">{item.description}</span>
              <span className="text-sm font-mono font-bold tabular-nums">${item.total.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2 bg-card">
            <span className="text-sm font-bold">Total</span>
            <span className="text-lg font-bold font-mono tabular-nums">${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment info */}
        {invoice.status === 'paid' && (
          <div className="text-xs font-mono text-muted-foreground mb-4">
            Paid {invoice.payment_method ? `via ${invoice.payment_method}` : ''} on {invoice.paid_at ? formatDate(invoice.paid_at) : '—'}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {invoice.status !== 'paid' && (
            <>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(['cash', 'check', 'card', 'venmo', 'zelle'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={[
                      'press-brutal px-3 py-1.5 border-2 border-foreground font-mono font-bold text-xs uppercase tracking-wider transition-colors',
                      payMethod === m ? 'bg-foreground text-background' : 'bg-card text-foreground',
                    ].join(' ')}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onMarkPaid(invoice, payMethod)}
                className="w-full press-brutal py-3 border-2 border-foreground bg-foreground text-background font-mono font-bold text-sm uppercase tracking-wider"
              >
                Mark Paid ({payMethod})
              </button>
            </>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="w-full press-brutal py-2.5 border-2 border-foreground bg-card text-foreground font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {generatingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
