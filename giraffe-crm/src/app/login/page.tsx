'use client'

/**
 * /login — Giraffe CRM.
 * Uses heatmap design system tokens (Space Grotesk, oklch palette, brutalist).
 * Wordmark "Giraffe!" = --heatmap-2 warm yellow.
 * Inverted canvas (dark bg) for dramatic entry. Locked viewport, zero scroll.
 */

import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon } from '@/lib/sessionCookie'

/* Token-aligned colors — pulled from globals.css :root */
const BRAND = 'oklch(0.82 0.14 78)'   /* --heatmap-2: warm yellow wordmark */
const INK   = 'oklch(0.15 0.02 50)'   /* --foreground */
const PAPER = 'oklch(0.97 0.005 80)'  /* --background */

function haptic(pattern: number | number[] = 10) {
  try { (navigator as any).vibrate?.(pattern) } catch {}
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Shell />}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const supabase = useRef(createClient()).current

  const [booted, setBooted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.phone || data.session?.user?.email) {
        setSessionBeacon()
        router.replace('/me')
      }
    })
  }, [router, supabase])

  const signInWithGoogle = useCallback(async () => {
    haptic(14)
    setBusy(true)
    setErr(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { setBusy(false); setErr(error.message) }
  }, [supabase])

  useEffect(() => {
    if (search.get('auto') === 'google') signInWithGoogle()
  }, [search, signInWithGoogle])

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      style={{ background: INK, color: PAPER }}
    >
      <Styles />

      {!booted && <BootPreloader onComplete={() => setBooted(true)} />}

      {/* Hero — fills remaining space, centered */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 min-h-0">
        <GiraffeMark />

        <Headline />

        <div className="w-full max-w-[320px] flex flex-col items-center gap-4">
          <SignInButton onClick={signInWithGoogle} busy={busy} />

          {err ? (
            <p className="font-mono text-[11px] tracking-wider text-center opacity-80">
              {err}
            </p>
          ) : (
            <p
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-center"
              style={{ color: 'rgba(245,245,242,0.45)' }}
            >
              Invite Only
            </p>
          )}
        </div>
      </main>

      {/* Bottom bar — always pinned, never requires scrolling */}
      <Marquee />
    </div>
  )
}

/* ─── Headline ───────────────────────────────────────────────────────────── */
function Headline() {
  return (
    <h1 className="text-center font-black uppercase leading-[0.95] tracking-[-0.02em]">
      <span
        className="block text-[clamp(32px,7vw,56px)]"
        style={{ color: PAPER }}
      >
        Knock, knock.
      </span>
      <span
        className="block text-[clamp(40px,9vw,72px)] mt-1"
        style={{ color: BRAND }}
      >
        Giraffe!
      </span>
    </h1>
  )
}

/* ─── Sign in button — minimal brutalist ─────────────────────────────────── */
function SignInButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Sign in with Google"
      className="group relative w-full flex items-center justify-center gap-2 px-4 py-2.5 transition-transform duration-100 ease-out active:translate-y-[2px] disabled:opacity-50 disabled:cursor-wait"
      style={{
        background: INK,
        color: PAPER,
        border: `2px solid ${PAPER}`,
      }}
    >
      <GoogleG />
      <span className="font-mono text-sm font-bold uppercase tracking-wider">
        {busy ? '...' : 'Sign in'}
      </span>
      {busy && (
        <svg viewBox="0 0 24 24" className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M21 12a9 9 0 1 1-6.22-8.56" />
        </svg>
      )}
    </button>
  )
}

/* ─── Giraffe mark — uses /public/logo.png ───────────────────────────────── */
function GiraffeMark() {
  return (
    <img
      src="/logo.png"
      alt="Giraffe CRM"
      draggable={false}
      className="object-contain select-none pointer-events-none"
      style={{
        width: 'clamp(88px, 18vw, 128px)',
        height: 'clamp(88px, 18vw, 128px)',
      }}
    />
  )
}

/* ─── Marquee — thin black bar with white text, always at bottom ─────────── */
function Marquee() {
  const TEXT = 'KNOCK · QUOTE · CLOSE'
  const track = (ariaHidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="flex items-center gap-4 pr-4 pl-4">
          <span>{TEXT}</span>
          <span className="inline-block w-1 h-1 rounded-full" style={{ background: PAPER }} />
        </span>
      ))}
    </div>
  )

  return (
    <div
      className="w-full overflow-hidden py-3 shrink-0 border-t"
      style={{
        background: INK,
        color: PAPER,
        borderColor: 'rgba(245,245,242,0.15)',
      }}
    >
      <div
        className="flex whitespace-nowrap font-bold text-[11px] tracking-[0.3em] uppercase will-change-transform"
        style={{ animation: 'gcrm-marquee 28s linear infinite' }}
      >
        {track()}
        {track(true)}
      </div>
    </div>
  )
}

/* ─── Boot preloader — fast system-boot sequence, ends with logo flash ───── */
const BOOT_STATUS = ['INIT…', 'AUTH…', 'READY.']

function BootPreloader({ onComplete }: { onComplete: () => void }) {
  const [counter, setCounter] = useState(0)
  const [phase, setPhase] = useState<'count' | 'logo' | 'curtain'>('count')

  // Counter 0 → 100, visible but quick (~900ms) with hacking jumps
  useEffect(() => {
    if (phase !== 'count') return
    const id = setInterval(() => {
      setCounter(prev => {
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
  }, [phase])

  // Logo flash (~500ms) → curtain up → unmount
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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${phase === 'curtain' ? 'animate-gcrm-curtain' : ''}`}
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
          className="object-contain select-none pointer-events-none animate-gcrm-logo-pop"
          style={{ width: 'clamp(96px, 22vw, 140px)', height: 'clamp(96px, 22vw, 140px)' }}
        />
      )}
    </div>
  )
}

/* ─── Loading shell ──────────────────────────────────────────────────────── */
function Shell() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: INK, color: PAPER }}>
      <p className="font-mono text-[10px] tracking-[0.3em] opacity-60">LOADING…</p>
    </div>
  )
}

/* ─── Global styles ──────────────────────────────────────────────────────── */
function Styles() {
  return (
    <style jsx global>{`
      html, body {
        background: ${INK};
        overscroll-behavior: none;
        overflow: hidden;
        font-family: 'Space Grotesk', system-ui, sans-serif;
      }
      @keyframes gcrm-marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes gcrm-blink {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.2; }
      }
      @keyframes gcrm-curtain {
        from { transform: translateY(0); }
        to   { transform: translateY(-100%); }
      }
      .animate-gcrm-curtain { animation: gcrm-curtain 360ms cubic-bezier(0.76, 0, 0.24, 1) forwards; }
      @keyframes gcrm-logo-pop {
        0%   { opacity: 0; transform: scale(0.6); }
        60%  { opacity: 1; transform: scale(1.08); }
        100% { opacity: 1; transform: scale(1); }
      }
      .animate-gcrm-logo-pop { animation: gcrm-logo-pop 360ms cubic-bezier(0.22, 1, 0.36, 1); }
    `}</style>
  )
}

/* ─── Google G ───────────────────────────────────────────────────────────── */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
