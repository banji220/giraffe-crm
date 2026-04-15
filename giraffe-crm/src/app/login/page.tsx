'use client'

/**
 * /login — Giraffe CRM "System Boot" login experience. Google-only.
 *
 * Visual:
 *   1. System boot preloader: 0→100 counter with random speed, cycling status lines,
 *      curtain reveal on complete.
 *   2. Staggered letter-by-letter headline reveal ("Knock, knock." / "Who's there?" / "Giraffe!").
 *   3. Hero Google OAuth button — the only path in.
 *   4. Bottom marquee strip — "KNOCK. QUOTE. CLOSE."
 *
 * Auth logic:
 *   - Supabase signInWithOAuth (Google)
 *   - is_allowed() RPC — invite allowlist check
 *   - Cross-subdomain session beacon on .holygiraffe.com
 *   - ?auto=google → immediately fire Google OAuth (landing-page deep link)
 */

import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon } from '@/lib/sessionCookie'

function haptic(pattern: number | number[] = 10) {
  try { (navigator as any).vibrate?.(pattern) } catch {}
}

export default function LoginPage() {
  return (
    <Suspense fallback={<BootShell label="LOADING…" />}>
      <LoginInner />
    </Suspense>
  )
}

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const supabase = useRef(createClient()).current

  const [booted, setBooted] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // If already signed in → skip everything
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.phone || data.session?.user?.email) {
        setSessionBeacon()
        router.replace('/today')
      }
    })
  }, [router, supabase])

  const signInWithGoogle = useCallback(async () => {
    haptic(12)
    setGoogleBusy(true)
    setErr(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { setGoogleBusy(false); setErr(error.message) }
  }, [supabase])

  // ?auto=google → fire Google OAuth as soon as booted
  useEffect(() => {
    if (!booted) return
    if (search.get('auto') === 'google') signInWithGoogle()
  }, [booted, search, signInWithGoogle])

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[100svh] flex flex-col overflow-x-hidden" style={{ background: 'oklch(0.07 0 0)', color: 'oklch(0.98 0 0)' }}>
      <StyleInjector />
      <div className="gcrm-noise" aria-hidden />

      {!booted && <SystemBootPreloader onComplete={() => setBooted(true)} />}

      {booted && (
        <div className="flex flex-1 flex-col items-center animate-gcrm-fade-in">
          {/* Hero zone */}
          <div className="flex min-h-[42svh] flex-col items-center justify-end gap-4 px-6 pb-8 pt-12 sm:px-10">
            <GiraffeLogo className="w-14 h-14 sm:w-16 sm:h-16" style={{ color: 'oklch(0.72 0.12 75)' }} />
            <HeroHeadline />
          </div>

          {/* Controls — thumb zone */}
          <div className="flex flex-1 flex-col items-center justify-start px-6 sm:px-10">
            <div className="w-full max-w-sm flex flex-col gap-5 animate-gcrm-slide-up" style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}>

              <GoogleHeroButton onClick={signInWithGoogle} busy={googleBusy} />

              {err && (
                <p className="text-center font-mono text-xs tracking-wider text-rose-400 animate-gcrm-fade-in">
                  {err}
                </p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1" style={{ background: 'oklch(0.25 0 0)' }} />
                <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'oklch(0.55 0 0)' }}>
                  INVITE ONLY
                </span>
                <div className="h-px flex-1" style={{ background: 'oklch(0.25 0 0)' }} />
              </div>

              <p className="text-center font-mono text-[10px] tracking-[0.15em] leading-relaxed" style={{ color: 'oklch(0.55 0 0)' }}>
                Your Google account must be on the allowlist.<br />
                Ask whoever sent you if you&apos;re not in yet.
              </p>
            </div>
          </div>

          <MarqueeStrip />
        </div>
      )}
    </div>
  )
}

/* ─── Google Hero Button — Soft Pop Neo-Brutalism ────────────────────────── */
function GoogleHeroButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <div className="relative pb-2 pr-2">
      {/* Shadow block — sits behind button, gets "absorbed" on press */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-2xl"
        style={{ background: '#0F0F0F' }}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="gcrm-pop-btn relative w-full rounded-2xl border-[3px] border-black transition-transform duration-100 ease-out active:translate-x-[6px] active:translate-y-[6px] disabled:opacity-80 disabled:cursor-wait overflow-hidden"
        style={{
          background: '#FFE85C', // pastel yellow
          color: '#0F0F0F',
        }}
      >
        {/* Inner stripe accent */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-2"
          style={{ background: 'repeating-linear-gradient(90deg, #0F0F0F 0 12px, transparent 12px 24px)' }}
        />

        <div className="relative flex items-center justify-center gap-3 py-6 px-6 pt-7">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl border-[2.5px] border-black bg-white">
            <GoogleG />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-mono text-[10px] tracking-[0.25em] opacity-70">TAP TO</span>
            <span className="font-black text-xl uppercase tracking-tight">
              {busy ? 'Opening…' : 'Sign in'}
            </span>
          </div>
          {!busy ? (
            <svg viewBox="0 0 24 24" className="ml-auto w-7 h-7 transition-transform group-active:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-auto w-7 h-7 animate-spin" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            </svg>
          )}
        </div>
      </button>
    </div>
  )
}

/* ─── System Boot Preloader ──────────────────────────────────────────────── */
const STATUS_LINES = ['INITIALIZING AUTH…', 'LOADING TERRITORY…', 'SECURING CHANNEL…', 'BOOT COMPLETE.']

function SystemBootPreloader({ onComplete }: { onComplete: () => void }) {
  const [counter, setCounter] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (done) return
    const id = setInterval(() => {
      setCounter(prev => {
        const jump = Math.floor(Math.random() * 8) + 2
        const next = Math.min(prev + jump, 100)
        if (next >= 100) { setDone(true); clearInterval(id) }
        return next
      })
    }, 30)
    return () => clearInterval(id)
  }, [done])

  useEffect(() => {
    const thresholds = [0, 25, 55, 85]
    const idx = thresholds.reduce((acc, t, i) => (counter >= t ? i : acc), 0)
    setLineIndex(idx)
  }, [counter])

  useEffect(() => {
    if (!done) return
    const t1 = setTimeout(() => setClosing(true), 300)
    const t2 = setTimeout(onComplete, 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [done, onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${closing ? 'animate-gcrm-curtain-up' : ''}`}
      style={{ background: 'oklch(0.07 0 0)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="font-mono text-7xl sm:text-9xl font-black tracking-tighter tabular-nums" style={{ color: 'oklch(0.98 0 0)' }}>
          {String(counter).padStart(3, '0')}
        </div>
        <p key={lineIndex} className="font-mono text-xs tracking-[0.3em] animate-gcrm-line" style={{ color: 'oklch(0.72 0.12 75)' }}>
          {STATUS_LINES[lineIndex]}
        </p>
      </div>
      <div className="absolute bottom-8 left-8 flex items-center gap-2">
        <GiraffeLogo className="w-5 h-5 opacity-60" />
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'oklch(0.55 0 0)' }}>
          GIRAFFE CRM v1.0
        </span>
      </div>
    </div>
  )
}

function BootShell({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'oklch(0.07 0 0)', color: 'oklch(0.98 0 0)' }}>
      <p className="font-mono text-xs tracking-[0.3em]">{label}</p>
    </div>
  )
}

/* ─── Hero headline — staggered letter reveal ───────────────────────────── */
const HERO_LINES = ['Knock, knock.', "Who's there?", 'Giraffe!']

function HeroHeadline() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {HERO_LINES.map((line, lineIdx) => (
        <div key={lineIdx} className="overflow-hidden">
          <div className="flex flex-wrap justify-center">
            {line.split('').map((ch, charIdx) => {
              const delay = 100 + lineIdx * 250 + charIdx * 25
              const stroked = lineIdx === 1
              const emerald = lineIdx === 2
              return (
                <span
                  key={`${lineIdx}-${charIdx}`}
                  className="inline-block text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-none tracking-tight animate-gcrm-letter"
                  style={{
                    animationDelay: `${delay}ms`,
                    animationFillMode: 'backwards',
                    color: emerald ? 'oklch(0.72 0.12 75)' : stroked ? 'transparent' : 'oklch(0.98 0 0)',
                    WebkitTextStroke: stroked ? '1.5px currentColor' : undefined,
                  }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Marquee strip — two-track seamless scroll ─────────────────────────── */
function MarqueeStrip() {
  const TEXT = 'KNOCK. QUOTE. CLOSE. '
  const track = Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-6">
      {TEXT}
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#0F0F0F' }} />
    </span>
  ))

  return (
    <div
      className="w-full overflow-hidden py-4 border-y-[3px] border-black"
      style={{ background: '#FFE85C', color: '#0F0F0F' }}
    >
      <div className="flex whitespace-nowrap animate-gcrm-marquee font-black text-base tracking-[0.15em] uppercase will-change-transform">
        <div className="flex shrink-0">{track}</div>
        <div className="flex shrink-0" aria-hidden>{track}</div>
      </div>
    </div>
  )
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GiraffeLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M38 8c-1.5 0-2.5 1-3 2l-1 3-3 1c-2 .5-3.5 2.5-3.5 4.5v6L22 28c-4 2-6 6-6 10v15c0 2 1.5 3.5 3.5 3.5S23 55 23 53v-12l3-2v12c0 2 1.5 3.5 3.5 3.5S33 53 33 51V30l2-1v4c0 1.5 1 2.5 2.5 2.5S40 34.5 40 33V18c0-1 .5-2 1.5-2.5l1.5-.5v-2c0-1-.5-2-1.5-2.5l-1-.5.5-2c0-.5-.5-1-1-1zM39 11v2M42 11v2"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        fill="currentColor" fillOpacity="0.15"
      />
    </svg>
  )
}

/* ─── Style injector — keyframes + noise overlay ────────────────────────── */
function StyleInjector() {
  return (
    <style jsx global>{`
      .gcrm-noise {
        position: fixed; inset: 0; pointer-events: none; z-index: 9999;
        opacity: 0.04;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 128px 128px;
      }

      @keyframes gcrm-letter {
        from { opacity: 0; transform: translateY(40px) rotateX(90deg); }
        to   { opacity: 1; transform: translateY(0)    rotateX(0deg); }
      }
      .animate-gcrm-letter { animation: gcrm-letter 350ms cubic-bezier(0.22, 1, 0.36, 1); }

      @keyframes gcrm-curtain-up {
        from { transform: translateY(0); }
        to   { transform: translateY(-100%); }
      }
      .animate-gcrm-curtain-up { animation: gcrm-curtain-up 500ms cubic-bezier(0.76, 0, 0.24, 1) forwards; }

      @keyframes gcrm-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .animate-gcrm-fade-in { animation: gcrm-fade-in 300ms ease-out; }

      @keyframes gcrm-slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-gcrm-slide-up { animation: gcrm-slide-up 400ms cubic-bezier(0.22, 1, 0.36, 1); }

      @keyframes gcrm-line {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-gcrm-line { animation: gcrm-line 180ms ease-out; }

      @keyframes gcrm-marquee {
        0%   { transform: translate3d(0, 0, 0); }
        100% { transform: translate3d(-50%, 0, 0); }
      }
      .animate-gcrm-marquee { animation: gcrm-marquee 22s linear infinite; }

      @keyframes gcrm-shimmer {
        0%   { transform: translateX(-100%); }
        60%  { transform: translateX(100%); }
        100% { transform: translateX(100%); }
      }
      .animate-gcrm-shimmer { animation: gcrm-shimmer 2.8s ease-in-out infinite; animation-delay: 1.6s; }
    `}</style>
  )
}
