'use client'

/**
 * /deals — "Who owes me a decision?"
 * Shows quoted (unsigned), scheduled appointments, and come-back knocks.
 * Sorted by value. Skeleton for now.
 */

import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'

export default function DealsPage() {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <div className="px-4 pt-8 pb-4">
          <div className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: '#FFD93D' }}>Deals</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mt-1">In motion</h1>
          <p className="text-sm text-gray-500 mt-1">Everyone considering you, sorted by $ value.</p>
        </div>

        <main className="flex-1 px-4 pt-2">
          <Section title="Quoted · unsigned" color="#A12EDA" empty="No open quotes yet." />
          <Section title="Appointments"      color="#1ABB85" empty="No appointments booked." />
          <Section title="Come-backs"        color="#91CE16" empty="No come-backs scheduled." />
        </main>

        <BottomNav />
      </div>
    </AuthGate>
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
