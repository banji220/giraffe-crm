'use client'

/**
 * /me — the operator cockpit.
 * Profile header, Quick Log, Daily Mission, Weekly Goal,
 * Contribution Heatmap + Streak, Invite system, Sign out.
 */

import { useEffect, useRef, useState, useCallback, useMemo, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import QuickLog from '@/components/knock-tracker/QuickLog'
import DailyMission from '@/components/knock-tracker/DailyMission'
import WeeklyGoal from '@/components/knock-tracker/WeeklyGoal'
import ContributionHeatmap from '@/components/knock-tracker/ContributionHeatmap'
import { createClient } from '@/lib/supabase/client'
import { formatE164ForDisplay, toE164, formatAsYouType, last4 } from '@/lib/phone'
import { clearSessionBeacon } from '@/lib/sessionCookie'
import type { DailyStats, UserSettings } from '@/types/database'

export default function MePage() {
  return (
    <AuthGate>
      <MeInner />
    </AuthGate>
  )
}

function MeInner() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Profile
  const [phone, setPhone] = useState('')

  // Knock tracker
  const [doorsToday, setDoorsToday] = useState(0)
  const [dailyTarget, setDailyTarget] = useState(30)
  const [weeklyTarget, setWeeklyTarget] = useState(150)
  const [doorsThisWeek, setDoorsThisWeek] = useState(0)

  // Heatmap data
  const [heatmapData, setHeatmapData] = useState<{
    date: string; doors: number; conversations: number; leads: number; wins: number
  }[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  // Invite system
  const [invites, setInvites] = useState<{ phone: string; label: string | null }[]>([])
  const [invName, setInvName] = useState('')
  const [invPhone, setInvPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setPhone(data.session?.user?.phone || ''))

    // Get weekly date range (Mon-Sun)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - mondayOffset)
    monday.setHours(0, 0, 0, 0)
    const mondayKey = monday.toISOString().slice(0, 10)

    // Get heatmap range (last 365 days)
    const yearAgo = new Date(now)
    yearAgo.setDate(yearAgo.getDate() - 365)
    const yearAgoKey = yearAgo.toISOString().slice(0, 10)

    Promise.all([
      // Today's stats
      supabase.from('daily_stats' as any).select('*').eq('date', todayKey).maybeSingle() as Promise<{ data: DailyStats | null; error: any }>,
      // Settings
      supabase.from('user_settings' as any).select('*').maybeSingle() as Promise<{ data: UserSettings | null; error: any }>,
      // This week's stats (for weekly goal)
      supabase.from('daily_stats' as any).select('date, doors').gte('date', mondayKey).order('date') as Promise<{ data: { date: string; doors: number }[] | null; error: any }>,
      // Heatmap data (last year)
      supabase.from('daily_stats' as any).select('date, doors, conversations, leads, wins').gte('date', yearAgoKey).order('date') as Promise<{ data: { date: string; doors: number; conversations: number; leads: number; wins: number }[] | null; error: any }>,
      // Invites
      supabase.from('allowed_phones').select('phone, label').order('created_at', { ascending: true }),
    ]).then(([statsRes, settingsRes, weekRes, heatmapRes, invRes]) => {
      startTransition(() => {
        // Today
        if (statsRes.data) setDoorsToday(statsRes.data.doors ?? 0)

        // Settings
        if (settingsRes.data) {
          setDailyTarget(settingsRes.data.daily_target ?? 30)
          setWeeklyTarget(settingsRes.data.weekly_target ?? 150)
        }

        // Weekly total
        const weekData = weekRes.data ?? []
        setDoorsThisWeek(weekData.reduce((sum, d) => sum + (d.doors ?? 0), 0))

        // Heatmap
        const hmData = heatmapRes.data ?? []
        setHeatmapData(hmData.map(d => ({
          date: d.date,
          doors: d.doors ?? 0,
          conversations: d.conversations ?? 0,
          leads: d.leads ?? 0,
          wins: d.wins ?? 0,
        })))

        // Calculate streak
        const { current, best } = calcStreak(hmData)
        setStreak(current)
        setBestStreak(best)

        // Invites
        if (invRes.data) setInvites(invRes.data as any)
      })
    })
  }, [supabase, todayKey])

  // Log doors handler (same logic as Today page)
  const handleLog = useCallback(async (count: number) => {
    setDoorsToday(prev => prev + count)
    setDoorsThisWeek(prev => prev + count)

    // Update heatmap data optimistically
    setHeatmapData(prev => {
      const existing = prev.find(d => d.date === todayKey)
      if (existing) {
        return prev.map(d => d.date === todayKey ? { ...d, doors: d.doors + count } : d)
      }
      return [...prev, { date: todayKey, doors: count, conversations: 0, leads: 0, wins: 0 }]
    })

    const { data: existing } = await (supabase.from('daily_stats' as any)
      .select('*')
      .eq('date', todayKey)
      .maybeSingle() as Promise<{ data: DailyStats | null; error: any }>)

    if (existing) {
      await (supabase.from('daily_stats' as any) as any)
        .update({ doors: existing.doors + count })
        .eq('id', existing.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase.from('daily_stats' as any) as any)
          .insert({ user_id: user.id, date: todayKey, doors: count })
      }
    }
  }, [supabase, todayKey])

  const signOut = async () => {
    await supabase.auth.signOut()
    clearSessionBeacon()
    router.replace('/login')
  }

  const sendInvite = async () => {
    const e164 = toE164(invPhone)
    if (!e164) { setToast('Invalid phone'); setTimeout(() => setToast(null), 2000); return }
    setSending(true)
    const { error } = await supabase.from('allowed_phones').insert({ phone: e164, label: invName.trim() || null })
    setSending(false)
    if (error && !/duplicate/i.test(error.message)) {
      setToast(error.message); setTimeout(() => setToast(null), 2500); return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/login?p=${e164.replace('+1', '')}`
    const body = encodeURIComponent(`Hey${invName ? ' ' + invName.split(' ')[0] : ''} — tap to join: ${link}`)
    window.location.href = `sms:${e164}&body=${body}`
    setInvites(prev => [...prev, { phone: e164, label: invName.trim() || null }])
    setInvName(''); setInvPhone('')
    setToast('Added. Opening Messages…'); setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Profile Header ─────────────────────────────────────────── */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-foreground text-background flex items-center justify-center border-2 border-foreground">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path d="M7 3 L7 7" /><path d="M17 3 L17 7" />
              <rect x="4" y="5" width="16" height="16" />
              <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
              <path d="M9 17 L15 17" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">Me</div>
            <div className="text-xl font-bold tracking-tight">Holy Giraffe</div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">Window Cleaning Pro</div>
          </div>
          <button
            onClick={signOut}
            className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-2 border-foreground active:translate-y-[2px] transition-transform"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex-1 pb-24 space-y-4 px-4">
        {/* Quick Log */}
        <QuickLogInline onLog={handleLog} todayDoors={doorsToday} />

        {/* Daily Mission */}
        <DailyMissionInline doorsToday={doorsToday} target={dailyTarget} />

        {/* Weekly Goal */}
        <WeeklyGoal doorsThisWeek={doorsThisWeek} weeklyTarget={weeklyTarget} />

        {/* Contribution Heatmap */}
        <ContributionHeatmap data={heatmapData} streak={streak} bestStreak={bestStreak} />

        {/* Invite card */}
        <div className="border-2 border-foreground bg-card p-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Invite someone</h2>
          <input
            type="text"
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
            placeholder="Name (optional)"
            autoCapitalize="words"
            className="field-input mb-2"
          />
          <input
            type="tel"
            inputMode="tel"
            value={invPhone}
            onChange={(e) => setInvPhone(formatAsYouType(e.target.value))}
            placeholder="(714) 555-1234"
            className="field-input mb-3"
          />
          <button
            onClick={sendInvite}
            disabled={sending}
            className="w-full bg-foreground text-background font-mono font-bold text-sm uppercase tracking-wider py-3 border-2 border-foreground active:translate-y-[2px] transition-transform disabled:opacity-50"
          >
            {sending ? 'Adding…' : 'Send invite text'}
          </button>
        </div>

        {/* Allowlist */}
        <div className="border-2 border-foreground bg-card p-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Who has access ({invites.length})
          </h2>
          <div className="space-y-0">
            {invites.map((row) => (
              <div key={row.phone} className="flex items-center gap-3 py-2 border-b border-foreground/10 last:border-0">
                <div className="w-8 h-8 bg-muted text-foreground flex items-center justify-center text-[10px] font-mono font-bold">
                  {last4(row.phone)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{row.label || 'Unnamed'}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{formatE164ForDisplay(row.phone)}</div>
                </div>
                {row.phone === phone && (
                  <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">You</span>
                )}
              </div>
            ))}
            {invites.length === 0 && (
              <div className="py-4 text-sm font-mono text-muted-foreground text-center">No one invited yet.</div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 text-sm font-mono font-bold z-50 border-2 border-foreground">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}

/**
 * Inline wrappers — QuickLog and DailyMission components use their own
 * full-width padding. On the Me page we want them inside the px-4 flow,
 * so we wrap them and override their outer padding.
 */
function QuickLogInline({ onLog, todayDoors }: { onLog: (n: number) => void; todayDoors: number }) {
  return (
    <div className="[&>section]:px-0 [&>section>div]:max-w-none">
      <QuickLog onLog={onLog} todayDoors={todayDoors} />
    </div>
  )
}

function DailyMissionInline({ doorsToday, target }: { doorsToday: number; target: number }) {
  return (
    <div className="[&>section]:px-0 [&>section>div]:max-w-none">
      <DailyMission doorsToday={doorsToday} target={target} />
    </div>
  )
}

/**
 * Calculate current streak and best streak from daily stats.
 * A "streak day" = any day with doors > 0.
 */
function calcStreak(data: { date: string; doors: number }[]): { current: number; best: number } {
  if (data.length === 0) return { current: 0, best: 0 }

  // Build a set of dates with activity
  const activeDays = new Set(data.filter(d => (d.doors ?? 0) > 0).map(d => d.date))

  // Walk backwards from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let current = 0
  const cursor = new Date(today)

  // Check today first — if no activity yet, start from yesterday
  const todayKey = cursor.toISOString().slice(0, 10)
  if (!activeDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (activeDays.has(key)) {
      current++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  // Best streak: scan all dates chronologically
  let best = 0
  let run = 0
  const sorted = [...activeDays].sort()
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1
    } else {
      const prev = new Date(sorted[i - 1] + 'T00:00:00')
      const curr = new Date(sorted[i] + 'T00:00:00')
      const diff = (curr.getTime() - prev.getTime()) / 86400000
      run = diff === 1 ? run + 1 : 1
    }
    if (run > best) best = run
  }

  return { current, best }
}
