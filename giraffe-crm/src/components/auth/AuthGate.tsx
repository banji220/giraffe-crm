'use client'

/**
 * <AuthGate> — wraps any page that requires auth.
 *
 * Optimistic: if the cross-subdomain session beacon cookie is present (set
 * after a successful login), we render children IMMEDIATELY — no loader,
 * no flash. The real Supabase session + allowlist check runs in the
 * background and only kicks to /login if something's actually wrong.
 *
 * This makes tab switching between Today/Deals/Map/Clients/Me instant.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon, hasSessionBeacon } from '@/lib/sessionCookie'

// Tab-level memo: once validated, future mounts don't even re-check until
// the user signs out or the session expires.
let validatedOnce = false

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  // Optimistic render: beacon cookie OR prior validation in this tab.
  const [ok, setOk] = useState<boolean>(() => {
    if (validatedOnce) return true
    if (typeof window !== 'undefined' && hasSessionBeacon()) return true
    return false
  })

  useEffect(() => {
    // If we've already validated in this tab, skip the re-check entirely.
    if (validatedOnce) return

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

      if (error) {
        // Transient RPC failure — trust the session, mark validated.
        setSessionBeacon()
        validatedOnce = true
        setOk(true)
        return
      }

      if (!allowed) {
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

  if (ok) return <>{children}</>

  // Truly cold start with no session signal: minimal static screen.
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
      }}
    />
  )
}
