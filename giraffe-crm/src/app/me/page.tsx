'use client'

/**
 * /me — the operator cockpit.
 * Signed-in phone, today's stats, invite someone, sign out.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay, toE164, formatAsYouType, last4 } from '@/lib/phone'
import { clearSessionBeacon } from '@/lib/sessionCookie'

export default function MePage() {
  return (
    <AuthGate>
      <MeInner />
    </AuthGate>
  )
}

function MeInner() {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [phone, setPhone] = useState('')
  const [stats, setStats] = useState({ knocksToday: 0, quotesToday: 0, closedToday: 0 })
  const [invites, setInvites] = useState<{ phone: string; label: string | null }[]>([])
  const [invName, setInvName] = useState('')
  const [invPhone, setInvPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setPhone(data.session?.user?.phone || ''))

    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
    Promise.all([
      supabase.from('knocks').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()).not('final_price', 'is', null),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('updated_at', startOfDay.toISOString()).eq('state', 'won'),
    ]).then(([k, q, c]) => setStats({ knocksToday: k.count ?? 0, quotesToday: q.count ?? 0, closedToday: c.count ?? 0 }))

    supabase.from('allowed_phones').select('phone, label').order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setInvites(data as any)
    })
  }, [supabase])

  const closeRate = stats.knocksToday > 0 ? Math.round((stats.closedToday / stats.knocksToday) * 100) : 0

  const signOut = async () => {
    await supabase.auth.signOut()
    clearSessionBeacon()
    router.replace('/login')
  }

  const sendInvite = async () => {
    const e164 = toE164(invPhone)
    if (!e164) { setToast('Invalid phone'); setTimeout(() => setToast(null), 2000); return }
    setSending(true)
    const { error } = await supabase.from('allowed_phones').insert({ phone: e164, label: invName.trim() || null })
    setSending(false)
    if (error && !/duplicate/i.test(error.message)) {
      setToast(error.message); setTimeout(() => setToast(null), 2500); return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/login?p=${e164.replace('+1', '')}`
    const body = encodeURIComponent(`Hey${invName ? ' ' + invName.split(' ')[0] : ''} — tap to join: ${link}`)
    window.location.href = `sms:${e164}&body=${body}`
    setInvites(prev => [...prev, { phone: e164, label: invName.trim() || null }])
    setInvName(''); setInvPhone('')
    setToast('Added. Opening Messages…'); setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <div className="px-4 pt-8 pb-4">
        <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-700">You</div>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-black flex items-center justify-center font-black text-lg shadow-[0_4px_0_0_rgba(0,0,0,1)] border-[3px] border-black">
            {last4(phone) || '··'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black text-gray-900">{formatE164ForDisplay(phone)}</div>
            <div className="text-xs text-gray-500">Owner</div>
          </div>
          <button onClick={signOut} className="px-3 py-2 text-xs font-bold text-gray-600 border-[2px] border-black/20 rounded-lg active:bg-gray-100">
            Sign out
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 pt-2 pb-4">
        {/* Today's stats */}
        <section className="mb-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Today</h2>
          <div className="grid grid-cols-3 gap-2">
            <Stat big={stats.knocksToday} label="Knocks" color="#FF6B5B" />
            <Stat big={stats.quotesToday} label="Quotes" color="#FFD93D" />
            <Stat big={stats.closedToday} label="Closed" color="#14B714" />
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Close rate: <span className="font-bold text-gray-900">{closeRate}%</span>
          </div>
        </section>

        {/* Invite card */}
        <section className="mb-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Invite someone</h2>
          <div className="bg-white border-[3px] border-black rounded-2xl p-4 shadow-[0_6px_0_0_rgba(0,0,0,1)]">
            <input type="text" value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Name (optional)" autoCapitalize="words"
              className="w-full border-[2px] border-black/15 rounded-lg px-3 py-2.5 text-base mb-2 outline-none focus:border-emerald-500" />
            <input type="tel" inputMode="tel" value={invPhone} onChange={(e) => setInvPhone(formatAsYouType(e.target.value))} placeholder="(714) 555-1234"
              className="w-full border-[2px] border-black/15 rounded-lg px-3 py-2.5 text-base mb-3 outline-none focus:border-emerald-500" />
            <button onClick={sendInvite} disabled={sending}
              className="w-full bg-emerald-500 text-black font-black py-3 rounded-xl border-[2px] border-black active:translate-y-[2px] active:shadow-none shadow-[0_4px_0_0_rgba(0,0,0,1)] disabled:opacity-50">
              {sending ? 'Adding…' : '📱 Send invite text'}
            </button>
          </div>
        </section>

        {/* Allowlist */}
        <section className="mb-5">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Who has access ({invites.length})</h2>
          <div className="bg-white border border-black/10 rounded-2xl divide-y divide-gray-100">
            {invites.map((row) => (
              <div key={row.phone} className="flex items-center gap-3 px-3 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">{last4(row.phone)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{row.label || 'Unnamed'}</div>
                  <div className="text-xs text-gray-500">{formatE164ForDisplay(row.phone)}</div>
                </div>
                {row.phone === phone && <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">You</div>}
              </div>
            ))}
            {invites.length === 0 && <div className="p-4 text-sm text-gray-400 italic">No one invited yet.</div>}
          </div>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm shadow-xl z-50">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function Stat({ big, label, color }: { big: number; label: string; color: string }) {
  return (
    <div className="bg-white border-[2px] border-black rounded-2xl p-3 text-center shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="text-3xl font-black tabular-nums" style={{ color }}>{big}</div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-1">{label}</div>
    </div>
  )
}
