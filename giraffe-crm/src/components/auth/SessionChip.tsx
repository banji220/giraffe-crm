'use client'

/**
 * <SessionChip> — a small circle pill on the map showing who's signed in.
 * Tap it to open a bottom sheet with:
 *   - Current phone
 *   - Invite someone (name + phone → insert allow row + open SMS composer)
 *   - Sign out
 *
 * Keeps the map chrome minimal while still giving Tyler the power to add a
 * friend in ~5 seconds while standing at a door.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toE164, formatAsYouType, last4, formatE164ForDisplay } from '@/lib/phone'

export default function SessionChip() {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState<string>('')
  const [invites, setInvites] = useState<{ phone: string; label: string | null }[]>([])

  // Invite form state
  const [invName, setInvName] = useState('')
  const [invPhone, setInvPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setPhone(data.session?.user?.phone || '')
    })
  }, [supabase])

  useEffect(() => {
    if (!open) return
    supabase.from('allowed_phones').select('phone, label').order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setInvites(data as any)
    })
  }, [open, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const sendInvite = async () => {
    const e164 = toE164(invPhone)
    if (!e164) { setToast('Invalid phone'); setTimeout(() => setToast(null), 2000); return }
    setSending(true)

    // Insert allow row
    const { error } = await supabase
      .from('allowed_phones')
      .insert({ phone: e164, label: invName.trim() || null })

    setSending(false)

    if (error && !/duplicate/i.test(error.message)) {
      setToast(error.message)
      setTimeout(() => setToast(null), 3000)
      return
    }

    // Open SMS composer with pre-filled invite
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/login?p=${e164.replace('+1', '')}`
    const body = encodeURIComponent(
      `Hey${invName ? ' ' + invName.split(' ')[0] : ''} — it's Tyler. Tap to join my CRM: ${link}`
    )
    window.location.href = `sms:${e164}&body=${body}`

    // Optimistic add to list
    setInvites(prev => [...prev, { phone: e164, label: invName.trim() || null }])
    setInvName('')
    setInvPhone('')
    setToast('Added + opening Messages…')
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <>
      {/* Chip */}
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto bg-black/80 backdrop-blur-md text-white rounded-full h-[38px] px-3 flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[11px] font-black">
          {last4(phone) || '··'}
        </div>
      </button>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-black flex items-center justify-center font-black shadow">
                  {last4(phone) || '··'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-gray-400 font-bold">Signed in</div>
                  <div className="text-base font-bold text-gray-900">{formatE164ForDisplay(phone)}</div>
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-2 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg active:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>

            {/* Invite form */}
            <div className="px-5 pb-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-3">
                  Invite someone
                </div>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="Name (optional)"
                  autoCapitalize="words"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white mb-2 outline-none focus:border-emerald-500"
                />
                <input
                  type="tel"
                  inputMode="tel"
                  value={invPhone}
                  onChange={(e) => setInvPhone(formatAsYouType(e.target.value))}
                  placeholder="(714) 555-1234"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-white mb-3 outline-none focus:border-emerald-500"
                />
                <button
                  onClick={sendInvite}
                  disabled={sending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3 rounded-xl active:scale-[0.98] disabled:opacity-50 shadow"
                >
                  {sending ? 'Adding…' : '📱 Send invite text'}
                </button>
                <p className="text-[11px] text-gray-500 text-center mt-2">
                  Adds them to the allowlist + opens your Messages app
                </p>
              </div>
            </div>

            {/* List of allowed phones */}
            <div className="px-5 pb-8">
              <div className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                Who has access ({invites.length})
              </div>
              <div className="space-y-1">
                {invites.map(row => (
                  <div key={row.phone} className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                      {last4(row.phone)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {row.label || 'Unnamed'}
                      </div>
                      <div className="text-xs text-gray-500">{formatE164ForDisplay(row.phone)}</div>
                    </div>
                    {row.phone === phone && (
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">You</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-sm shadow-xl z-[70]">
              {toast}
            </div>
          )}
        </div>
      )}
    </>
  )
}
