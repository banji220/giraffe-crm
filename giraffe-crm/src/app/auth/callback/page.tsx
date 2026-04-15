'use client'

/**
 * /auth/callback — Google OAuth return destination.
 *
 * Exchanges the PKCE code, probes the allowlist, sets the cross-subdomain
 * beacon, and redirects. No animation — just a static logo while the work
 * completes. Speed over spectacle.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errParam = url.searchParams.get('error_description') || url.searchParams.get('error')

      if (errParam) {
        if (!cancelled) {
          setMsg('Sign-in failed')
          setTimeout(() => router.replace('/login'), 800)
        }
        return
      }

      let session = (await supabase.auth.getSession()).data.session
      if (!session && code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          await new Promise(r => setTimeout(r, 400))
          if (cancelled) return
        }
        session = (await supabase.auth.getSession()).data.session
      }
      if (cancelled) return

      if (!session) {
        setMsg('Sign-in failed')
        setTimeout(() => router.replace('/login'), 800)
        return
      }

      const { data: allowed, error: rpcErr } = await supabase.rpc('is_allowed')
      if (cancelled) return

      if (rpcErr) {
        setSessionBeacon()
        router.replace('/today')
        return
      }
      if (!allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        setMsg('Not on the invite list')
        setTimeout(() => router.replace('/login?not_allowed=1'), 1000)
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
        alt=""
        draggable={false}
        style={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      />
      {msg ? (
        <div style={{ marginTop: 20, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.6 }}>
          {msg}
        </div>
      ) : null}
    </div>
  )
}
