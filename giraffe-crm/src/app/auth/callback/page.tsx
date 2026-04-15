'use client'

/**
 * /auth/callback — Google OAuth return destination.
 *
 * Runs the System Boot sequence (counter → logo flash → curtain) while the
 * PKCE exchange + allowlist probe happen in parallel, so the animation from
 * Google-return → /today feels continuous.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

const INK = '#0A0A0A'
const PAPER = '#F5F5F2'
const BOOT_STATUS = ['INIT…', 'AUTH…', 'READY.']

type Result =
  | { kind: 'ok' }
  | { kind: 'not_allowed' }
  | { kind: 'failed' }

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current

  const [counter, setCounter] = useState(0)
  const [phase, setPhase] = useState<'count' | 'logo' | 'curtain'>('count')
  const [result, setResult] = useState<Result | null>(null)

  // Kick off auth work immediately.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errParam = url.searchParams.get('error_description') || url.searchParams.get('error')

      if (errParam) {
        if (!cancelled) setResult({ kind: 'failed' })
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
        setResult({ kind: 'failed' })
        return
      }

      const { data: allowed, error: rpcErr } = await supabase.rpc('is_allowed')
      if (cancelled) return

      if (rpcErr) {
        // Let AuthGate re-check; don't nuke the session on a transient error.
        setSessionBeacon()
        setResult({ kind: 'ok' })
        return
      }
      if (!allowed) {
        await supabase.auth.signOut()
        clearSessionBeacon()
        setResult({ kind: 'not_allowed' })
        return
      }
      setSessionBeacon()
      setResult({ kind: 'ok' })
    })()
    return () => { cancelled = true }
  }, [supabase])

  // Counter — ticks up, holds at 99 until auth resolves.
  useEffect(() => {
    if (phase !== 'count') return
    const id = setInterval(() => {
      setCounter(prev => {
        if (prev >= 99 && !result) return 99
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
  }, [phase, result])

  // Logo flash → curtain → navigate.
  useEffect(() => {
    if (phase === 'logo') {
      const t = setTimeout(() => setPhase('curtain'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'curtain') {
      const t = setTimeout(() => {
        if (!result) return
        if (result.kind === 'ok') router.replace('/today')
        else if (result.kind === 'not_allowed') router.replace('/login?not_allowed=1')
        else router.replace('/login')
      }, 420)
      return () => clearTimeout(t)
    }
  }, [phase, result, router])

  const statusIdx = counter < 40 ? 0 : counter < 85 ? 1 : 2

  return (
    <div
      className={phase === 'curtain' ? 'gcrm-curtain-anim' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        background: INK,
        color: PAPER,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      {phase === 'count' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 900,
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.05em',
              lineHeight: 1,
              fontSize: 'clamp(72px, 18vw, 160px)',
            }}
          >
            {String(counter).padStart(3, '0')}
          </div>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 10,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            {result?.kind === 'failed'
              ? 'FAILED'
              : result?.kind === 'not_allowed'
              ? 'NOT ALLOWED'
              : BOOT_STATUS[statusIdx]}
          </div>
        </div>
      )}

      {phase !== 'count' && (
        <img
          src="/logo.png"
          alt="Giraffe CRM"
          draggable={false}
          className="gcrm-logo-pop-anim"
          style={{
            width: 'clamp(96px, 22vw, 140px)',
            height: 'clamp(96px, 22vw, 140px)',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      )}

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
    </div>
  )
}
