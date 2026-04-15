'use client'

/**
 * /login — the front door to Giraffe CRM.
 *
 * Design brief:
 *   - Dark OLED background. Emerald accent (matches `closed_on_spot` pin color).
 *   - One screen, three states: phone → code → unlocked.
 *   - No page loads between states — all morph animations.
 *   - SMS auto-fill via `autocomplete="one-time-code"` (iOS + Android native).
 *   - Haptic feedback on tap + success.
 *   - Microcopy sounds like Tyler, not a template.
 *
 * Flow:
 *   1. Phone input → supabase.auth.signInWithOtp({ phone })
 *   2. Code input → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
 *   3. On success: check allowed_phones. If in → redirect to /map. If not → show "Not on the list" state.
 */

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toE164, formatAsYouType, formatE164ForDisplay, digitsOnly } from '@/lib/phone'
import { setSessionBeacon, clearSessionBeacon } from '@/lib/sessionCookie'

type Stage = 'phone' | 'code' | 'success' | 'not-allowed'

function haptic(pattern: number | number[] = 10) {
  try { (navigator as any).vibrate?.(pattern) } catch {}
}

// ─── The page wrapper — uses suspense because useSearchParams is async in static export ─
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <LoginInner />
    </Suspense>
  )
}

function LoadingShell() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Giraffe className="w-20 h-20 opacity-40 animate-pulse" />
    </div>
  )
}

// ─── The real content ─────────────────────────────────────────────────────────
function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const supabase = useRef(createClient()).current

  const [stage, setStage] = useState<Stage>('phone')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [googleBusy, setGoogleBusy] = useState(false)

  const signInWithGoogle = async () => {
    setGoogleBusy(true)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    if (error) { setGoogleBusy(false); setErr(error.message) }
  }
  const [phoneE164, setPhoneE164] = useState('')           // set after OTP send
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // If already signed in → kick straight to today
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.phone) {
        setSessionBeacon()
        router.replace('/today')
      }
    })
  }, [router, supabase])

  // Invite link ?p=7145551234 — pre-fill phone
  useEffect(() => {
    const prefill = search.get('p')
    if (prefill) {
      setPhoneRaw(formatAsYouType(prefill))
    }
  }, [search])

  // Cooldown tick
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // ─── Send OTP ─────────────────────────────────────────────────────────────
  const sendCode = async () => {
    setErr(null)
    const e164 = toE164(phoneRaw)
    if (!e164) { setErr('That doesn\'t look like a US number.'); return }

    haptic(12)
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 })
    setBusy(false)

    if (error) {
      if (/rate|too many/i.test(error.message)) {
        setErr('Too many tries. Give it a minute.')
        setCooldown(60)
      } else {
        setErr(error.message)
      }
      return
    }

    setPhoneE164(e164)
    setStage('code')
  }

  // ─── Verify code ──────────────────────────────────────────────────────────
  const verifyCode = async (fullCode: string) => {
    setErr(null)
    haptic(8)
    setBusy(true)
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneE164,
      token: fullCode,
      type: 'sms',
    })
    setBusy(false)

    if (error) {
      haptic([30, 60, 30])
      setErr('Wrong code. Try again.')
      setCode(['', '', '', '', '', ''])
      // Focus first box
      setTimeout(() => document.getElementById('otp-0')?.focus(), 50)
      return
    }

    // Verify allowlist via RLS probe
    const { data: allowed } = await supabase.rpc('is_allowed')
    if (!allowed) {
      await supabase.auth.signOut()
      clearSessionBeacon()
      setStage('not-allowed')
      return
    }

    setSessionBeacon()
    haptic([20, 40, 20])
    setStage('success')
    setTimeout(() => router.replace('/today'), 500)
  }

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (stage !== 'code') return
    const full = code.join('')
    if (full.length === 6 && !busy) {
      verifyCode(full)
    }
  }, [code, stage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden flex flex-col">
      {/* Ambient aurora glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-full blur-3xl opacity-20"
             style={{ background: 'radial-gradient(closest-side, #14B714, transparent)' }} />
        <div className="absolute -bottom-40 -right-24 w-[80vw] h-[60vh] rounded-full blur-3xl opacity-10"
             style={{ background: 'radial-gradient(closest-side, #1ABB85, transparent)' }} />
      </div>

      {/* Giraffe mark — breathing */}
      <div className="relative pt-[min(18vh,140px)] flex flex-col items-center">
        <Giraffe className="w-14 h-14 text-emerald-400 animate-breathe" />
        <div className="mt-3 text-xs uppercase tracking-[0.3em] text-white/40 font-semibold">
          Giraffe CRM
        </div>
      </div>

      {/* Stage content */}
      <div className="relative flex-1 flex items-start justify-center px-6 pt-[6vh]">
        {stage === 'phone' && (
          <PhoneStage
            phoneRaw={phoneRaw}
            setPhoneRaw={setPhoneRaw}
            onSubmit={sendCode}
            err={err}
            busy={busy}
            cooldown={cooldown}
            onGoogle={signInWithGoogle}
            googleBusy={googleBusy}
          />
        )}

        {stage === 'code' && (
          <CodeStage
            phoneE164={phoneE164}
            code={code}
            setCode={setCode}
            err={err}
            busy={busy}
            onResend={() => { setStage('phone'); setCode(['', '', '', '', '', '']); setErr(null) }}
          />
        )}

        {stage === 'success' && <SuccessStage />}

        {stage === 'not-allowed' && (
          <NotAllowedStage
            phoneE164={phoneE164}
            onBack={async () => {
              await supabase.auth.signOut()
              clearSessionBeacon()
              setStage('phone')
              setCode(['', '', '', '', '', ''])
              setErr(null)
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="relative pb-8 text-center text-[11px] text-white/30">
        You must be invited. Messages from Giraffe CRM only.
      </div>
    </div>
  )
}

// ─── Stage: Phone ─────────────────────────────────────────────────────────────
function PhoneStage({
  phoneRaw, setPhoneRaw, onSubmit, err, busy, cooldown, onGoogle, googleBusy,
}: {
  phoneRaw: string
  setPhoneRaw: (v: string) => void
  onSubmit: () => void
  err: string | null
  busy: boolean
  cooldown: number
  onGoogle: () => void
  googleBusy: boolean
}) {
  const complete = digitsOnly(phoneRaw).length === 10
  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-slide-up-fade">
      <h1 className="text-3xl font-bold text-white text-center leading-tight">
        Who&apos;s at the door?
      </h1>
      <p className="text-white/50 text-sm mt-2 text-center">
        We&apos;ll text you a code.
      </p>

      <div className="w-full mt-10">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 h-[72px] focus-within:border-emerald-400/60 focus-within:bg-white/10 transition-colors">
          <span className="text-lg mr-2">🇺🇸</span>
          <span className="text-white/40 text-2xl font-light mr-1 tabular-nums">+1</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            value={phoneRaw}
            onChange={(e) => setPhoneRaw(formatAsYouType(e.target.value))}
            onKeyDown={(e) => { if (e.key === 'Enter' && complete) onSubmit() }}
            placeholder="(714) 555-1234"
            className="flex-1 bg-transparent text-white text-2xl font-semibold tabular-nums placeholder:text-white/20 outline-none"
          />
        </div>

        {err && (
          <div className="mt-3 text-sm text-rose-400 text-center">{err}</div>
        )}

        <button
          onClick={onSubmit}
          disabled={!complete || busy || cooldown > 0}
          className={`mt-6 w-full h-[64px] rounded-2xl text-lg font-bold transition-all active:scale-[0.98]
            ${complete && !busy && cooldown === 0
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-black shadow-[0_10px_40px_-10px_rgba(20,183,20,0.6)]'
              : 'bg-white/10 text-white/40'}
          `}
        >
          {busy ? <Dots /> : cooldown > 0 ? `Wait ${cooldown}s` : 'Text it to me'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google */}
        <button
          onClick={onGoogle}
          disabled={googleBusy}
          className="w-full h-[60px] rounded-2xl bg-white text-gray-900 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {googleBusy ? <Dots /> : (
            <>
              <GoogleG />
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ─── Stage: Code ──────────────────────────────────────────────────────────────
function CodeStage({
  phoneE164, code, setCode, err, busy, onResend,
}: {
  phoneE164: string
  code: string[]
  setCode: (c: string[]) => void
  err: string | null
  busy: boolean
  onResend: () => void
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first box on mount
    setTimeout(() => inputs.current[0]?.focus(), 80)
  }, [])

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length < 2) return
    e.preventDefault()
    const next = pasted.split('').concat(['', '', '', '', '', '']).slice(0, 6)
    setCode(next)
    const last = Math.min(pasted.length, 5)
    inputs.current[last]?.focus()
  }

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-slide-up-fade">
      <h1 className="text-3xl font-bold text-white text-center leading-tight">
        Check your texts.
      </h1>
      <p className="text-white/50 text-sm mt-2 text-center">
        Sent to {formatE164ForDisplay(phoneE164)}
      </p>

      <div className="flex gap-2 mt-10" onPaste={handlePaste}>
        {code.map((d, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            ref={el => { inputs.current[i] = el }}
            type="tel"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className={`w-11 h-14 rounded-xl text-center text-2xl font-bold tabular-nums
              bg-white/5 border-2 transition-all outline-none
              ${err ? 'border-rose-400/70 animate-shake' : d ? 'border-emerald-400/80 text-emerald-300' : 'border-white/10 text-white focus:border-emerald-400/80'}
            `}
          />
        ))}
      </div>

      {err && <div className="mt-3 text-sm text-rose-400">{err}</div>}
      {busy && <div className="mt-4"><Dots /></div>}

      <button
        onClick={onResend}
        className="mt-8 text-sm text-white/50 active:text-white"
      >
        Wrong number? ← Go back
      </button>
    </div>
  )
}

// ─── Stage: Success — green flash + giraffe ──────────────────────────────────
function SuccessStage() {
  return (
    <div className="w-full flex flex-col items-center animate-success-fade">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-60 animate-pulse-once" />
        <Giraffe className="w-32 h-32 text-emerald-300 relative" />
      </div>
      <div className="mt-8 text-2xl font-bold text-emerald-300">Unlocked.</div>
    </div>
  )
}

// ─── Stage: Not on the allowlist ──────────────────────────────────────────────
function NotAllowedStage({ phoneE164, onBack }: { phoneE164: string; onBack: () => void }) {
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_PHONE || ''
  const msg = encodeURIComponent(`Hey Tyler — it's ${formatE164ForDisplay(phoneE164)}. Can you add me to Giraffe CRM?`)
  return (
    <div className="w-full max-w-sm flex flex-col items-center animate-slide-up-fade text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
        <span className="text-3xl">🚪</span>
      </div>
      <h1 className="text-3xl font-bold text-white">Not on the list.</h1>
      <p className="text-white/50 text-sm mt-3 leading-relaxed">
        Your number checks out, but Tyler hasn&apos;t invited you yet.<br />
        Send him a quick text and he&apos;ll let you in.
      </p>

      {ownerPhone && (
        <a
          href={`sms:${ownerPhone}&body=${msg}`}
          className="mt-8 w-full h-[60px] rounded-2xl bg-white text-black font-bold flex items-center justify-center active:scale-[0.98]"
        >
          📱 Text Tyler
        </a>
      )}

      <button onClick={onBack} className="mt-4 text-sm text-white/50 active:text-white">
        Use a different number
      </button>
    </div>
  )
}

// ─── Visual primitives ────────────────────────────────────────────────────────
function Dots() {
  return (
    <div className="flex gap-1.5 justify-center items-center h-5">
      <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.32s]" />
      <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.16s]" />
      <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
    </div>
  )
}

function Giraffe({ className = '' }: { className?: string }) {
  // Minimalist giraffe silhouette — tall neck, little head, two horns.
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M38 8c-1.5 0-2.5 1-3 2l-1 3-3 1c-2 .5-3.5 2.5-3.5 4.5v6L22 28c-4 2-6 6-6 10v15c0 2 1.5 3.5 3.5 3.5S23 55 23 53v-12l3-2v12c0 2 1.5 3.5 3.5 3.5S33 53 33 51V30l2-1v4c0 1.5 1 2.5 2.5 2.5S40 34.5 40 33V18c0-1 .5-2 1.5-2.5l1.5-.5v-2c0-1-.5-2-1.5-2.5l-1-.5.5-2c0-.5-.5-1-1-1zM39 11v2M42 11v2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  )
}
