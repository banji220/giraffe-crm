'use client'

/**
 * /clients — "Who already paid me?"
 * Hero line: total lifetime revenue. Below: reclean-due, no-review-yet, all clients.
 */

import { useEffect, useRef, useState } from 'react'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'

export default function ClientsPage() {
  return (
    <AuthGate>
      <ClientsInner />
    </AuthGate>
  )
}

function ClientsInner() {
  const supabase = useRef(createClient()).current
  const [ltv, setLtv] = useState<number>(0)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    supabase.from('houses').select('lifetime_value').eq('status', 'customer').then(({ data }) => {
      const total = (data ?? []).reduce((s, r: any) => s + (r.lifetime_value || 0), 0)
      setLtv(total)
      setCount(data?.length ?? 0)
    })
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <div className="px-4 pt-8 pb-4">
        <div className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: '#A12EDA' }}>Clients</div>
        <div className="mt-2 text-5xl font-black tabular-nums text-emerald-600">
          ${ltv.toLocaleString()}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Lifetime · {count} customer{count === 1 ? '' : 's'}
        </p>
      </div>

      <main className="flex-1 px-4 pt-2">
        <Section title="Due for reclean"   color="#FF6B5B" empty="Nobody due yet." />
        <Section title="Review not asked"  color="#FFD93D" empty="All caught up on reviews." />
        <Section title="All customers"     color="#A12EDA" empty="No customers yet. Go close one." />
      </main>

      <BottomNav />
    </div>
  )
}

function Section({ title, color, empty }: { title: string; color: string; empty: string }) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold">{title}</h2>
      </div>
      <div className="bg-white border border-black/5 rounded-2xl p-4 text-sm text-gray-400 italic">
        {empty}
      </div>
    </section>
  )
}
