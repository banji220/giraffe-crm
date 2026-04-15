'use client'

/**
 * /auth/callback — Google OAuth return destination.
 *
 * Supabase PKCE flow lands here with a `?code=...` query param. We exchange
 * it for a session, probe the allowlist, set the cross-subdomain beacon,
 * and either punt into /today or kick back to /login with a message.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [msg, setMsg] = useState('Unlocking…')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errParam = url.searchParams.get('error_description') || url.searchParams.get('error')

      if (errParam) {
        setMsg('Sign-in failed. Sending you back…')
        setTimeout(() => router.replace('/login'), 1200)
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setMsg('Sign-in failed. Sending you back…')
          setTimeout(() => router.replace('/login'), 1200)
          return
        }
      }

      if (cancelled) return

      // Check allowlist
      const { data: allowed } = await supabase.rpc('is_allowed')
      if (!allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        setMsg('Not on the invite list. Sending you back…')
        setTimeout(() => router.replace('/login?not_allowed=1'), 1500)
        return
      }

      setSessionBeacon()
      setMsg('You\u2019re in.')
      router.replace('/today')
    })()

    return () => { cancelled = true }
  }, [router, supabase])

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
      <svg viewBox="0 0 64 64" className="w-16 h-16 text-emerald-400 animate-breathe" fill="none">
        <path
          d="M38 8c-1.5 0-2.5 1-3 2l-1 3-3 1c-2 .5-3.5 2.5-3.5 4.5v6L22 28c-4 2-6 6-6 10v15c0 2 1.5 3.5 3.5 3.5S23 55 23 53v-12l3-2v12c0 2 1.5 3.5 3.5 3.5S33 53 33 51V30l2-1v4c0 1.5 1 2.5 2.5 2.5S40 34.5 40 33V18c0-1 .5-2 1.5-2.5l1.5-.5v-2c0-1-.5-2-1.5-2.5l-1-.5.5-2c0-.5-.5-1-1-1zM39 11v2M42 11v2"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          fill="currentColor" fillOpacity="0.15"
        />
      </svg>
      <div className="mt-4 text-sm text-white/60">{msg}</div>
    </div>
  )
}
