'use client'

/**
 * /login — Giraffe CRM "System Boot" login experience.
 *
 * Visual design ported from Loveable kinetic-typography mockup:
 *   1. System boot preloader: 0→100 counter with random speed, cycling status lines,
 *      curtain reveal on complete.
 *   2. Staggered letter-by-letter headline reveal ("Knock, knock." / "Who's there?" / "Giraffe!").
 *   3. Google OAuth + phone SMS OTP flow, styled as brutalist inputs.
 *   4. Bottom marquee strip — "KNOCK. QUOTE. CLOSE."
 *
 * Auth logic preserved from prior version:
 *   - Supabase signInWithOtp / verifyOtp / signInWithOAuth
 *   - is_allowed() RPC for allowlist check
 *   - Cross-subdomain session beacon on .holygiraffe.com
 *   - Invite link ?p=... prefill
 *   - ?auto=google → immediately fire Google OAuth (landing-page deep link)
 */

import { useEffect, useRef, useState, Suspense, useCallback, type KeyboardEvent, type ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toE164, formatAsYouType, digitsOnly } from '@/lib/phone'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

type Stage = 'phone' | 'code' | 'success' | 'not-allowed'

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

  // Preloader + stage state
  const [booted, setBooted] = useState(false)
  const [stage, setStage] = useState<Stage>('phone')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [phoneE164, setPhoneE164] = useState('')
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // If already signed in → skip everything
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.phone || data.session?.user?.email) {
        setSessionBeacon()
        router.replace('/today')
      }
    })
  }, [router, supabase])

  // Prefill phone from ?p=...
  useEffect(() => {
    const prefill = search.get('p')
    if (prefill) setPhoneRaw(formatAsYouType(prefill))
  }, [search])

  const signInWithGoogle = useCallback(async () => {
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

  // Cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const sendCode = async () => {
    setErr(null)
    const e164 = toE164(phoneRaw)
    if (!e164) { setErr('That doesn\'t look like a US number.'); return }
    haptic(10); setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    setBusy(false)
    if (error) {
      if (/rate limit|too many/i.test(error.message)) { setErr('Slow down. Try again in a moment.'); setCooldown(60) }
      else setErr(error.message)
      return
    }
    setPhoneE164(e164)
    setStage('code')
  }

  const verifyCode = async (fullCode: string) => {
    setErr(null); haptic(8); setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ phone: phoneE164, token: fullCode, type: 'sms' })
    setBusy(false)
    if (error) {
      haptic([30, 60, 30])
      setErr('Wrong code. Try again.')
      setCode(['', '', '', '', '', ''])
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50)
      return
    }
    const { data: allowed } = await supabase.rpc('is_allowed')
    if (!allowed) {
      await supabase.auth.signOut(); clearSessionBeacon()
      setStage('not-allowed'); return
    }
    setSessionBeacon(); haptic([20, 40, 20]); setStage('success')
    setTimeout(() => router.replace('/today'), 500)
  }

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (stage !== 'code') return
    const full = code.join('')
    if (full.length === 6 && !busy) verifyCode(full)
  }, [code, stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[100svh] flex flex-col overflow-x-hidden" style={{ background: 'oklch(0.07 0 0)', color: 'oklch(0.98 0 0)' }}>
      <StyleInjector />
      <div className="gcrm-noise" aria-hidden />

      {!booted && <SystemBootPreloader onComplete={() => setBooted(true)} />}

      {booted && (
        <div className="flex flex-1 flex-col items-center animate-gcrm-fade-in">
          {/* Hero zone */}
          <div className="flex min-h-[38svh] flex-col items-center justify-end gap-4 px-6 pb-6 pt-12 sm:px-10">
            <GiraffeLogo className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400" />
            <HeroHeadline />
          </div>

          {/* Controls — thumb zone */}
          <div className="flex flex-1 flex-col items-center justify-start px-6 sm:px-10">
            <div className="w-full max-w-sm flex flex-col gap-4 animate-gcrm-slide-up" style={{ animationDelay: '1.2s', animationFillMode: 'backwards' }}>

              {stage === 'phone' && (
                <PhoneFormBlock
                  phoneRaw={phoneRaw}
                  setPhoneRaw={setPhoneRaw}
                  onSubmit={sendCode}
                  onGoogle={signInWithGoogle}
                  busy={busy}
                  googleBusy={googleBusy}
                  cooldown={cooldown}
                  err={err}
                />
              )}

              {stage === 'code' && (
                <CodeFormBlock
                  phoneE164={phoneE164}
                  code={code}
                  setCode={setCode}
                  busy={busy}
                  err={err}
                  onBack={() => { setStage('phone'); setCode(['', '', '', '', '', '']); setErr(null) }}
                />
              )}

              {stage === 'success' && <SuccessBlock />}

              {stage === 'not-allowed' && (
                <NotAllowedBlock
                  phoneE164={phoneE164}
                  onBack={async () => {
                    await supabase.auth.signOut(); clearSessionBeacon()
                    setStage('phone'); setCode(['', '', '', '', '', '']); setErr(null)
                  }}
                />
              )}

              <p className="mt-2 text-center font-mono text-[10px] tracking-[0.15em]" style={{ color: 'oklch(0.55 0 0)' }}>
                You must be invited. Messages from Giraffe CRM only.
              </p>
            </div>
          </div>

          <MarqueeStrip />
        </div>
      )}
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
  let globalIdx = 0
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {HERO_LINES.map((line, lineIdx) => (
        <div key={lineIdx} className="overflow-hidden">
          <div className="flex flex-wrap justify-center">
            {line.split('').map((ch, charIdx) => {
              const delay = 100 + lineIdx * 250 + charIdx * 25
              const stroked = lineIdx === 1
              const emerald = lineIdx === 2
              globalIdx++
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

/* ─── Phone form block ──────────────────────────────────────────────────── */
function PhoneFormBlock({
  phoneRaw, setPhoneRaw, onSubmit, onGoogle, busy, googleBusy, cooldown, err,
}: {
  phoneRaw: string
  setPhoneRaw: (v: string) => void
  onSubmit: () => void
  onGoogle: () => void
  busy: boolean
  googleBusy: boolean
  cooldown: number
  err: string | null
}) {
  const complete = digitsOnly(phoneRaw).length === 10
  const [focused, setFocused] = useState(false)

  return (
    <>
      <button type="button" onClick={onGoogle} disabled={googleBusy}
        className="flex items-center justify-center gap-3 w-full py-3.5 font-semibold text-sm transition-opacity disabled:opacity-50"
        style={{ background: 'oklch(0.98 0 0)', color: 'oklch(0.1 0 0)' }}
      >
        <GoogleG />
        <span>{googleBusy ? 'Opening Google…' : 'Continue with Google'}</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: 'oklch(0.25 0 0)' }} />
        <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'oklch(0.55 0 0)' }}>OR</span>
        <div className="h-px flex-1" style={{ background: 'oklch(0.25 0 0)' }} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex border transition-colors duration-150" style={{ borderColor: focused ? 'oklch(0.72 0.12 75)' : 'oklch(0.25 0 0)' }}>
          <div className="flex items-center gap-1.5 px-3 font-mono text-sm" style={{ background: focused ? 'oklch(0.13 0.01 75)' : 'oklch(0.2 0 0)', color: focused ? 'oklch(0.98 0 0)' : 'oklch(0.55 0 0)' }}>
            <span className="text-base">🇺🇸</span>
            <span>+1</span>
          </div>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phoneRaw}
            onChange={(e) => setPhoneRaw(formatAsYouType(e.target.value))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter' && complete) onSubmit() }}
            placeholder="(555) 000-0000"
            className="flex-1 px-4 py-3.5 outline-none font-mono text-lg tracking-wide bg-transparent"
            style={{ color: 'oklch(0.98 0 0)', borderLeft: `1px solid ${focused ? 'oklch(0.72 0.12 75)' : 'oklch(0.25 0 0)'}`, background: focused ? 'oklch(0.13 0.01 75)' : 'oklch(0.2 0 0)' }}
          />
        </div>

        {err && <p className="text-xs font-mono tracking-wider text-rose-400">{err}</p>}

        <button type="button" onClick={onSubmit} disabled={!complete || busy || cooldown > 0}
          className="w-full py-4 font-extrabold text-sm uppercase tracking-[0.15em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'oklch(0.72 0.12 75)', color: 'oklch(0.07 0 0)' }}
        >
          {busy ? 'Sending…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Text me the code'}
        </button>
      </div>
    </>
  )
}

/* ─── Code form block ───────────────────────────────────────────────────── */
function CodeFormBlock({
  phoneE164, code, setCode, busy, err, onBack,
}: {
  phoneE164: string
  code: string[]
  setCode: (c: string[]) => void
  busy: boolean
  err: string | null
  onBack: () => void
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...code]; next[i] = v; setCode(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      e.preventDefault()
      const next = ['', '', '', '', '', '']
      pasted.split('').forEach((d, i) => next[i] = d)
      setCode(next)
      refs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-xs tracking-[0.2em]" style={{ color: 'oklch(0.55 0 0)' }}>
        ENTER 6-DIGIT CODE
      </p>
      <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'oklch(0.55 0 0)' }}>
        Sent to {phoneE164.replace('+1', '+1 ')}
      </p>

      <div className="flex gap-2" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            autoComplete="one-time-code"
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            autoFocus={i === 0}
            disabled={busy}
            className="w-12 h-14 text-center font-mono text-2xl font-bold outline-none border transition-colors"
            style={{ background: 'oklch(0.2 0 0)', color: 'oklch(0.98 0 0)', borderColor: digit ? 'oklch(0.72 0.12 75)' : 'oklch(0.25 0 0)' }}
          />
        ))}
      </div>

      {err && <p className="text-xs font-mono tracking-wider text-rose-400">{err}</p>}
      {busy && <p className="text-xs font-mono tracking-wider" style={{ color: 'oklch(0.72 0.12 75)' }}>VERIFYING…</p>}

      <button type="button" onClick={onBack}
        className="font-mono text-[10px] tracking-[0.2em] underline underline-offset-4"
        style={{ color: 'oklch(0.55 0 0)' }}
      >
        ← BACK
      </button>
    </div>
  )
}

/* ─── Success & Not-allowed blocks ──────────────────────────────────────── */
function SuccessBlock() {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="font-mono text-xs tracking-[0.3em]" style={{ color: 'oklch(0.72 0.12 75)' }}>UNLOCKED.</div>
      <div className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'oklch(0.55 0 0)' }}>Routing you to HQ…</div>
    </div>
  )
}

function NotAllowedBlock({ phoneE164, onBack }: { phoneE164: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="font-mono text-xs tracking-[0.3em] text-rose-400">NOT ON THE LIST.</div>
      <p className="text-sm" style={{ color: 'oklch(0.55 0 0)' }}>
        <span className="font-mono">{phoneE164}</span> isn&apos;t invited yet.
        Ask whoever sent you to add your number.
      </p>
      <button onClick={onBack} className="font-mono text-[10px] tracking-[0.2em] underline underline-offset-4" style={{ color: 'oklch(0.55 0 0)' }}>
        ← TRY A DIFFERENT NUMBER
      </button>
    </div>
  )
}

/* ─── Marquee strip ─────────────────────────────────────────────────────── */
function MarqueeStrip() {
  const TEXT = 'KNOCK. QUOTE. CLOSE. — '
  return (
    <div className="w-full overflow-hidden whitespace-nowrap py-3" style={{ background: 'oklch(0.72 0.12 75)', color: 'oklch(0.07 0 0)' }}>
      <div className="inline-block animate-gcrm-marquee font-black text-base tracking-[0.2em] uppercase">
        {Array.from({ length: 12 }).map((_, i) => <span key={i} className="mr-4">{TEXT}</span>)}
      </div>
    </div>
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

function GiraffeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      .animate-gcrm-marquee { animation: gcrm-marquee 30s linear infinite; }
    `}</style>
  )
}
