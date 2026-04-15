'use client'

/**
 * /auth/callback — Google OAuth return destination.
 *
 * Supabase PKCE flow lands here with a `?code=...` query param. We exchange
 * it for a session, probe the allowlist, set the cross-subdomain beacon,
 * and either punt into /today or kick back to /login with a message.
 *
 * A module-level lock ensures the PKCE code is only exchanged once per
 * page load — React effect re-runs will short-circuit to waiting for the
 * in-flight exchange instead of triggering a duplicate failing call.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

// Module-level exchange lock — survives React effect re-runs.
let exchangePromise: Promise<{ ok: boolean }> | null = null

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [msg, setMsg] = useState('Unlocking…')

  useEffect(() => {
    let cancelled = false

    const runExchange = async (code: string) => {
      if (exchangePromise) return exchangePromise
      exchangePromise = (async () => {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          // Exchange failed — check whether a session nevertheless exists
          // (possible if a parallel tab or prior run already consumed the code).
          const { data } = await supabase.auth.getSession()
          return { ok: !!data.session }
        }
        return { ok: true }
      })()
      return exchangePromise
    }

    ;(async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errParam = url.searchParams.get('error_description') || url.searchParams.get('error')

      if (errParam) {
        if (!cancelled) {
          setMsg('Sign-in failed. Sending you back…')
          setTimeout(() => router.replace('/login'), 1200)
        }
        return
      }

      // If a session already exists, skip the exchange entirely.
      const { data: existing } = await supabase.auth.getSession()
      if (cancelled) return

      let sessionOk = !!existing.session

      if (!sessionOk && code) {
        const result = await runExchange(code)
        if (cancelled) return
        sessionOk = result.ok
      }

      if (!sessionOk) {
        setMsg('Sign-in failed. Sending you back…')
        setTimeout(() => router.replace('/login'), 1200)
        return
      }

      // Check allowlist
      const { data: allowed } = await supabase.rpc('is_allowed')
      if (cancelled) return

      if (!allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        setMsg('Not on the invite list. Sending you back…')
        setTimeout(() => router.replace('/login?not_allowed=1'), 1500)
        return
      }

      setSessionBeacon()
      router.replace('/today')
    })()

    return () => { cancelled = true }
  }, [router, supabase])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
        color: '#F5F5F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <img
        src="/logo.png"
        alt="Giraffe CRM"
        draggable={false}
        style={{
          width: 96,
          height: 96,
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          animation: 'gcrm-pulse 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ marginTop: 20, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6 }}>
        {msg}
      </div>
      <style jsx global>{`
        @keyframes gcrm-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(0.96); }
        }
      `}</style>
    </div>
  )
}
