'use client'

/**
 * <AuthGate> — wraps any page that requires auth.
 *
 * Checks Supabase session + allowlist (via is_allowed() RPC) client-side.
 * Once a session has been validated in this tab, subsequent mounts render
 * children instantly — no animation, no flash — so navigating between
 * protected routes (Today/Deals/Map/Clients/Me) is zero-friction.
 */

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

// Tab-level memo: once we've validated a session, don't block the UI again
// for subsequent route navigations. Background re-validates silently.
let validatedOnce = false

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [ok, setOk] = useState(validatedOnce)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data: sessionRes } = await supabase.auth.getSession()
      const session = sessionRes.session
      if (cancelled) return

      if (!session?.user?.phone && !session?.user?.email) {
        clearSessionBeacon()
        validatedOnce = false
        router.replace('/login')
        return
      }

      const { data: allowed, error } = await supabase.rpc('is_allowed')
      if (cancelled) return

      if (error || !allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        validatedOnce = false
        router.replace('/login')
        return
      }

      setSessionBeacon()
      validatedOnce = true
      if (!cancelled) setOk(true)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        validatedOnce = false
        clearSessionBeacon()
        router.replace('/login')
      }
    })

    return () => { cancelled = true; sub.subscription.unsubscribe() }
  }, [router, supabase])

  // Already validated in this tab → render instantly, no loader.
  if (ok) return <>{children}</>

  // First-time check: minimal static state, no animation.
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/logo.png"
        alt=""
        draggable={false}
        style={{
          width: 72,
          height: 72,
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      />
    </div>
  )
}
