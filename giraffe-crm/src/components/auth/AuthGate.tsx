'use client'

/**
 * <AuthGate> — wraps any page that requires auth.
 *
 * Checks Supabase session + allowlist (via is_allowed() RPC) client-side.
 * - Authenticated + allowed  → renders children
 * - Authenticated + not allowed → signs out + kicks to /login
 * - Not authenticated → redirects to /login
 *
 * While checking, shows a minimal dark loading state (matches login page aesthetic,
 * so the transition to an authenticated page feels continuous).
 *
 * Static-export compatible: no middleware, no server code.
 */

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

type State = 'checking' | 'ok' | 'denied'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      const session = sessionRes.session
      if (cancelled) return

      if (!session?.user?.phone) {
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
    })()

    // Watch for sign-out events in other tabs
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { clearSessionBeacon(); router.replace('/login') }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [router, supabase])

  if (state === 'checking') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 64 64" className="w-16 h-16 text-emerald-400 animate-breathe" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M38 8c-1.5 0-2.5 1-3 2l-1 3-3 1c-2 .5-3.5 2.5-3.5 4.5v6L22 28c-4 2-6 6-6 10v15c0 2 1.5 3.5 3.5 3.5S23 55 23 53v-12l3-2v12c0 2 1.5 3.5 3.5 3.5S33 53 33 51V30l2-1v4c0 1.5 1 2.5 2.5 2.5S40 34.5 40 33V18c0-1 .5-2 1.5-2.5l1.5-.5v-2c0-1-.5-2-1.5-2.5l-1-.5.5-2c0-.5-.5-1-1-1zM39 11v2M42 11v2"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              fill="currentColor" fillOpacity="0.15"
            />
          </svg>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
