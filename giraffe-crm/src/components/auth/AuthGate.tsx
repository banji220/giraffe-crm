'use client'

/**
 * <AuthGate> — wraps any page that requires auth.
 *
 * Checks Supabase session + allowlist (via is_allowed() RPC) client-side.
 * Shows the same System Boot sequence (counter → logo flash → curtain)
 * as the login page so the transition feels continuous.
 */

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

type State = 'checking' | 'ok' | 'denied'

const INK = '#0A0A0A'
const PAPER = '#F5F5F2'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [state, setState] = useState<State>('checking')
  const [authDone, setAuthDone] = useState(false)
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      const session = sessionRes.session
      if (cancelled) return

      if (!session?.user?.phone && !session?.user?.email) {
        clearSessionBeacon()
        router.replace('/login')
        return
      }

      const { data: allowed, error } = await supabase.rpc('is_allowed')
      if (cancelled) return

      if (error || !allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        router.replace('/login')
        return
      }

      setSessionBeacon()
      setState('ok')
      setAuthDone(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { clearSessionBeacon(); router.replace('/login') }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [router, supabase])

  // Only reveal children once BOTH auth check and boot animation are done
  if (state === 'checking' || !bootDone) {
    return <BootPreloader authDone={authDone} onComplete={() => setBootDone(true)} />
  }

  return <>{children}</>
}

/* ─── Boot preloader — same style as login page ──────────────────────────── */
const BOOT_STATUS = ['INIT…', 'AUTH…', 'READY.']

function BootPreloader({ authDone, onComplete }: { authDone: boolean; onComplete: () => void }) {
  const [counter, setCounter] = useState(0)
  const [phase, setPhase] = useState<'count' | 'logo' | 'curtain'>('count')

  // Counter 0 → 100, holds at 99 until auth finishes
  useEffect(() => {
    if (phase !== 'count') return
    const id = setInterval(() => {
      setCounter(prev => {
        // Pause at 99 until auth resolves
        if (prev >= 99 && !authDone) return 99
        const jump = Math.floor(Math.random() * 4) + 1
        const next = Math.min(prev + jump, 100)
        if (next >= 100) {
          clearInterval(id)
          setTimeout(() => setPhase('logo'), 180)
        }
        return next
      })
    }, 32)
    return () => clearInterval(id)
  }, [phase, authDone])

  useEffect(() => {
    if (phase === 'logo') {
      const t = setTimeout(() => setPhase('curtain'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'curtain') {
      const t = setTimeout(onComplete, 420)
      return () => clearTimeout(t)
    }
  }, [phase, onComplete])

  const statusIdx = counter < 40 ? 0 : counter < 85 ? 1 : 2

  return (
    <>
      <style jsx global>{`
        @keyframes gcrm-curtain {
          from { transform: translateY(0); }
          to   { transform: translateY(-100%); }
        }
        .gcrm-curtain-anim { animation: gcrm-curtain 360ms cubic-bezier(0.76, 0, 0.24, 1) forwards; }
        @keyframes gcrm-logo-pop {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        .gcrm-logo-pop-anim { animation: gcrm-logo-pop 360ms cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${phase === 'curtain' ? 'gcrm-curtain-anim' : ''}`}
        style={{ background: INK, color: PAPER }}
      >
        {phase === 'count' && (
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono font-black tabular-nums tracking-tighter leading-none text-[clamp(72px,18vw,160px)]">
              {String(counter).padStart(3, '0')}
            </div>
            <div className="font-mono text-[10px] tracking-[0.35em] uppercase opacity-70">
              {BOOT_STATUS[statusIdx]}
            </div>
          </div>
        )}

        {phase !== 'count' && (
          <img
            src="/logo.png"
            alt="Giraffe CRM"
            draggable={false}
            className="object-contain select-none pointer-events-none gcrm-logo-pop-anim"
            style={{ width: 'clamp(96px, 22vw, 140px)', height: 'clamp(96px, 22vw, 140px)' }}
          />
        )}
      </div>
    </>
  )
}
