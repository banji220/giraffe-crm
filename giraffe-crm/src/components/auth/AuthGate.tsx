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
        <img
          src="/logo.png"
          alt="Giraffe CRM"
          draggable={false}
          className="w-24 h-24 object-contain select-none pointer-events-none animate-pulse"
        />
      </div>
    )
  }

  return <>{children}</>
}
