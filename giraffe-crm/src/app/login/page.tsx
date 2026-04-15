'use client'

/**
 * /login — Giraffe CRM. Google-only. Black & white editorial,
 * emerald reserved exclusively for the word "Giraffe!".
 */

import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { setSessionBeacon } from '@/lib/sessionCookie'

const GIRAFFE_GOLD = '#D4A24C'
const INK = '#0A0A0A'
const PAPER = '#F5F5F2'
const BG = '#0A0A0A'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.phone || data.session?.user?.email) {
        setSessionBeacon()
        router.replace('/today')
      }
    })
  }, [router, supabase])

  const signInWithGoogle = useCallback(async () => {
    haptic(14)
    setGoogleBusy(true)
    setErr(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { setGoogleBusy(false); setErr(error.message) }
  }, [supabase])

  useEffect(() => {
    if (!booted) return
    if (search.get('auto') === 'google') signInWithGoogle()
  }, [booted, search, signInWithGoogle])

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: BG, color: PAPER }}>
      <StyleInjector />

      {!booted && <SystemBootPreloader onComplete={() => setBooted(true)} />}

      {booted && (
        <div className="flex flex-1 flex-col items-center justify-between animate-gcrm-fade-in min-h-0 w-full">
          {/* Hero logo + headline */}
          <div className="flex flex-col items-center gap-4 px-6 pt-6 shrink-0">
            <GiraffeMark />
            <HeroHeadline />
          </div>

          {/* Thumb zone */}
          <div className="flex flex-col items-center justify-end px-6 w-full shrink-0">
            <div className="w-full max-w-sm flex flex-col gap-4 animate-gcrm-slide-up" style={{ animationDelay: '1.1s', animationFillMode: 'backwards' }}>

              <GoogleHeroButton onClick={signInWithGoogle} busy={googleBusy} />

              {err && (
                <p className="text-center font-mono text-xs tracking-wider animate-gcrm-fade-in" style={{ color: PAPER }}>
                  {err}
                </p>
              )}

              <p className="text-center font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(245,245,242,0.5)' }}>
                Invite only · Allowlist required
              </p>
            </div>
          </div>

          <MarqueeStrip />
        </div>
      )}
    </div>
  )
}

/* ─── Google Hero Button — black & white brutalist stamp ─────────────────── */
function GoogleHeroButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <div className="relative pb-[8px] pr-[8px]">
      {/* Hard white shadow block */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-[8px] translate-y-[8px] rounded-2xl"
        style={{ background: PAPER }}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-label="Sign in with Google"
        className="relative w-full rounded-2xl border-[3px] transition-transform duration-100 ease-out active:translate-x-[8px] active:translate-y-[8px] disabled:opacity-85 disabled:cursor-wait overflow-hidden"
        style={{
          background: INK,
          borderColor: PAPER,
          color: PAPER,
        }}
      >
        {/* Hatch stripe along the top */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-[10px]"
          style={{ background: `repeating-linear-gradient(90deg, ${PAPER} 0 10px, transparent 10px 20px)` }}
        />

        <div className="relative flex items-center justify-center gap-3 py-5 pt-7 px-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl border-[2.5px] shrink-0" style={{ background: PAPER, borderColor: PAPER }}>
            <GoogleG />
          </div>

          <span className="font-black text-[22px] sm:text-2xl uppercase tracking-[0.02em] leading-none">
            {busy ? 'Opening…' : 'Sign in'}
          </span>

          {busy ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0 animate-spin" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </div>

        {/* Bottom caption bar */}
        <div
          className="relative flex items-center justify-center gap-2 py-2 border-t-[2px]"
          style={{ borderColor: 'rgba(245,245,242,0.25)', background: 'rgba(245,245,242,0.06)' }}
        >
          <span className="font-mono text-[9px] tracking-[0.35em]" style={{ color: 'rgba(245,245,242,0.7)' }}>
            VIA GOOGLE · SECURE · ONE TAP
          </span>
        </div>
      </button>
    </div>
  )
}

/* ─── Boot preloader ─────────────────────────────────────────────────────── */
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
      style={{ background: BG }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="font-mono text-7xl sm:text-9xl font-black tracking-tighter tabular-nums" style={{ color: PAPER }}>
          {String(counter).padStart(3, '0')}
        </div>
        <p key={lineIndex} className="font-mono text-xs tracking-[0.3em] animate-gcrm-line" style={{ color: PAPER }}>
          {STATUS_LINES[lineIndex]}
        </p>
      </div>
      <div className="absolute bottom-8 left-8 flex items-center gap-2 opacity-70">
        <GiraffeMark size={20} />
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'rgba(245,245,242,0.5)' }}>
          GIRAFFE CRM v1.0
        </span>
      </div>
    </div>
  )
}

function BootShell({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: BG, color: PAPER }}>
      <p className="font-mono text-xs tracking-[0.3em]">{label}</p>
    </div>
  )
}

/* ─── Kinetic headline — emerald reserved for "Giraffe!" only ───────────── */
const HERO_LINES = ['Knock, knock.', "Who's there?", 'Giraffe!']

function HeroHeadline() {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {HERO_LINES.map((line, lineIdx) => (
        <div key={lineIdx} className="overflow-hidden">
          <div className="flex flex-wrap justify-center">
            {line.split('').map((ch, charIdx) => {
              const delay = 100 + lineIdx * 220 + charIdx * 22
              const stroked = lineIdx === 1
              const emerald = lineIdx === 2
              return (
                <span
                  key={`${lineIdx}-${charIdx}`}
                  className="inline-block text-[40px] sm:text-6xl font-black uppercase leading-[0.95] tracking-[-0.02em] animate-gcrm-letter"
                  style={{
                    animationDelay: `${delay}ms`,
                    animationFillMode: 'backwards',
                    color: emerald ? GIRAFFE_GOLD : stroked ? 'transparent' : PAPER,
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

/* ─── Marquee — black & white ───────────────────────────────────────────── */
function MarqueeStrip() {
  const TEXT = 'KNOCK. QUOTE. CLOSE.'
  const renderTrack = (ariaHidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="flex items-center gap-6 pr-6 pl-6">
          <span>{TEXT}</span>
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: PAPER }} />
        </span>
      ))}
    </div>
  )

  return (
    <div
      className="w-full overflow-hidden py-3 border-y-[3px] shrink-0"
      style={{ background: INK, color: PAPER, borderColor: PAPER }}
    >
      <div
        className="flex whitespace-nowrap font-black text-base tracking-[0.12em] uppercase will-change-transform"
        style={{ animation: 'gcrm-marquee-x 22s linear infinite' }}
      >
        {renderTrack()}
        {renderTrack(true)}
      </div>
    </div>
  )
}

/* ─── Giraffe mark — inline SVG, no external asset required ──────────────── */
function GiraffeMark({ size = 128 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="animate-gcrm-logo-in select-none"
      aria-label="Giraffe CRM"
      role="img"
    >
      <rect x="4" y="4" width="112" height="112" rx="24" fill={GIRAFFE_GOLD} />
      <rect x="4" y="4" width="112" height="112" rx="24" fill="none" stroke={INK} strokeWidth="4" />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="78"
        fill={INK}
      >
        G
      </text>
    </svg>
  )
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

/* ─── Style injector — lean, no infinite ambient animations ──────────────── */
function StyleInjector() {
  return (
    <style jsx global>{`
      html, body {
        background: ${BG};
        overscroll-behavior-y: none;
      }

      @keyframes gcrm-letter {
        from { opacity: 0; transform: translateY(40px) rotateX(90deg); }
        to   { opacity: 1; transform: translateY(0)    rotateX(0deg); }
      }
      .animate-gcrm-letter { animation: gcrm-letter 380ms cubic-bezier(0.22, 1, 0.36, 1); }

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
      .animate-gcrm-slide-up { animation: gcrm-slide-up 500ms cubic-bezier(0.22, 1, 0.36, 1); }

      @keyframes gcrm-line {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-gcrm-line { animation: gcrm-line 180ms ease-out; }

      @keyframes gcrm-marquee-x {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      @keyframes gcrm-logo-in {
        from { opacity: 0; transform: scale(0.6); filter: blur(8px); }
        to   { opacity: 1; transform: scale(1);   filter: blur(0); }
      }
      .animate-gcrm-logo-in { animation: gcrm-logo-in 600ms cubic-bezier(0.22, 1, 0.36, 1); }
    `}</style>
  )
}
