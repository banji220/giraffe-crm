'use client'

/**
 * Google OAuth Callback Page
 *
 * Google redirects here after the user approves calendar access.
 * Grabs the auth code from the URL, sends it to our edge function
 * to exchange for tokens, then redirects back to the Me page.
 */

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (!code || !state) {
        setStatus('error')
        setErrorMsg('Missing authorization code from Google.')
        return
      }

      try {
        const supabase = createClient()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

        const res = await fetch(
          `${supabaseUrl}/functions/v1/google-auth?action=callback`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, state }),
          }
        )

        const data = await res.json()

        if (!res.ok || data.error) {
          throw new Error(data.error || data.detail || 'Failed to connect Google Calendar')
        }

        setStatus('success')

        // Redirect back to Me page after 1.5s
        setTimeout(() => router.push('/me'), 1500)
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message || 'Something went wrong')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="border-2 border-foreground bg-card p-6 max-w-sm w-full text-center">
        {status === 'processing' && (
          <>
            <div className="text-2xl mb-3">📅</div>
            <h1 className="text-sm font-mono font-bold uppercase tracking-wider">
              Connecting Google Calendar...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-2xl mb-3">✓</div>
            <h1 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
              Calendar Connected
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-2">
              Redirecting back...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-2xl mb-3">✕</div>
            <h1 className="text-sm font-mono font-bold uppercase tracking-wider text-destructive">
              Connection Failed
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-2">
              {errorMsg}
            </p>
            <button
              onClick={() => router.push('/me')}
              className="mt-4 px-4 py-2 border-2 border-foreground bg-foreground text-background font-mono font-bold text-xs uppercase tracking-wider active:translate-y-[2px] transition-transform"
            >
              Back to Me
            </button>
          </>
        )}
      </div>
    </div>
  )
}
