'use client'

/**
 * /me — the operator cockpit.
 * Lovable-ported components wired to real Supabase data.
 * Mobile: single stacked column. Desktop: two-column.
 */

import { useEffect, useRef, useState, useCallback, useMemo, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/nav/BottomNav'
import QuickLog from '@/components/knock-tracker/QuickLog'
import DailyMission from '@/components/knock-tracker/DailyMission'
import WeeklyGoal from '@/components/knock-tracker/WeeklyGoal'
import ContributionHeatmap from '@/components/knock-tracker/ContributionHeatmap'
import StreakPanel from '@/components/knock-tracker/StreakPanel'
import MomentumMeter from '@/components/knock-tracker/MomentumMeter'
import BadgesPanel, { type BadgeStats } from '@/components/knock-tracker/BadgesPanel'
import { buildDayRecords, computeStreaks, type DayRecord } from '@/lib/activity-data'
import { createClient } from '@/lib/supabase/client'
import { clearSessionBeacon } from '@/lib/sessionCookie'
import type { DailyStats, UserSettings } from '@/types/database'

export default function MePage() {
  return (
    <AuthGate>
      <MeInner />
    </AuthGate>
  )
}

/* Smart suggestion based on time of day + progress */
function getSuggestion(doors: number, target: number): string {
  const hour = new Date().getHours()
  const remaining = target - doors
  const pct = (doors / Math.max(1, target)) * 100

  if (doors >= target * 1.5) return 'Beast mode. You\'ve blown past the goal.'
  if (doors >= target) return 'Mission complete. Anything extra is bonus.'
  if (doors === 0 && hour >= 14) return 'Day\'s slipping \u2014 start now, finish strong.'
  if (doors === 0) return 'Clock\'s ticking. First knock sets the tone.'
  if (remaining <= 5) return `Just ${remaining} more. You're right there.`
  if (remaining <= 10) return `Push ${remaining} more doors to hit your goal.`
  if (pct >= 70) return 'You\'re on track for a strong day.'
  if (pct >= 40) return 'Solid pace. Keep the momentum going.'
  if (pct < 30 && hour >= 15) return 'You\'re behind pace today. Time to lock in.'
  if (pct < 30 && hour >= 12) return 'Still early enough to catch up. Get moving.'
  return 'Good start. Stay consistent and stack the numbers.'
}

function MeInner() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Knock tracker
  const [doorsToday, setDoorsToday] = useState(0)
  const [dailyTarget, setDailyTarget] = useState(30)
  const [weeklyTarget, setWeeklyTarget] = useState(150)
  const [doorsThisWeek, setDoorsThisWeek] = useState(0)

  // Raw supabase stats for heatmap → DayRecord conversion
  const [rawStats, setRawStats] = useState<{
    date: string; doors: number; conversations: number; leads: number; appointments: number; wins: number
  }[]>([])

  // Badge stats
  const [totalCloses, setTotalCloses] = useState(0)

  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // Get weekly date range (Sun-Sat)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - dayOfWeek)
    sunday.setHours(0, 0, 0, 0)
    const sundayKey = sunday.toISOString().slice(0, 10)

    // Get heatmap range (last 365 days)
    const yearAgo = new Date(now)
    yearAgo.setDate(yearAgo.getDate() - 365)
    const yearAgoKey = yearAgo.toISOString().slice(0, 10)

    Promise.all([
      // Today's stats
      supabase.from('daily_stats' as any).select('*').eq('date', todayKey).maybeSingle() as unknown as Promise<{ data: DailyStats | null; error: any }>,
      // Settings
      supabase.from('user_settings' as any).select('*').maybeSingle() as unknown as Promise<{ data: UserSettings | null; error: any }>,
      // This week's stats (for weekly goal)
      supabase.from('daily_stats' as any).select('date, doors').gte('date', sundayKey).order('date') as unknown as Promise<{ data: { date: string; doors: number }[] | null; error: any }>,
      // Heatmap data (last year) — include appointments for buildDayRecords
      supabase.from('daily_stats' as any).select('date, doors, conversations, leads, appointments, wins').gte('date', yearAgoKey).order('date') as unknown as Promise<{ data: { date: string; doors: number; conversations: number; leads: number; appointments: number; wins: number }[] | null; error: any }>,
      // Total closes for badges
      supabase.from('houses').select('id', { count: 'exact', head: true }).eq('status', 'customer'),
    ]).then(([statsRes, settingsRes, weekRes, heatmapRes, closesRes]) => {
      startTransition(() => {
        if (statsRes.data) setDoorsToday(statsRes.data.doors ?? 0)

        if (settingsRes.data) {
          setDailyTarget(settingsRes.data.daily_target ?? 30)
          setWeeklyTarget(settingsRes.data.weekly_target ?? 150)
        }

        const weekData = weekRes.data ?? []
        setDoorsThisWeek(weekData.reduce((sum, d) => sum + (d.doors ?? 0), 0))

        const hmData = heatmapRes.data ?? []
        setRawStats(hmData)

        setTotalCloses(closesRes.count ?? 0)
      })
    })
  }, [supabase, todayKey])

  // Convert raw Supabase stats → DayRecord[] for heatmap, streak, momentum
  const dayRecords: DayRecord[] = useMemo(() => {
    if (rawStats.length === 0) return buildDayRecords([], 365)
    // Merge today's optimistic count into raw stats
    const merged = rawStats.map(s => s.date === todayKey ? { ...s, doors: doorsToday } : s)
    const hasToday = merged.some(s => s.date === todayKey)
    if (!hasToday && doorsToday > 0) {
      merged.push({ date: todayKey, doors: doorsToday, conversations: 0, leads: 0, appointments: 0, wins: 0 })
    }
    return buildDayRecords(merged, 365)
  }, [rawStats, doorsToday, todayKey])

  const streaks = useMemo(() => computeStreaks(dayRecords), [dayRecords])

  const badgeStats: BadgeStats = useMemo(() => ({
    doorsToday,
    doorsThisWeek,
    currentStreak: streaks.current,
    totalCloses,
    preDawnKnocks: 0, // TODO: wire up when knock timestamps are available
    lateNightKnocks: 0,
  }), [doorsToday, doorsThisWeek, streaks.current, totalCloses])

  // Log doors handler
  const handleLog = useCallback(async (count: number) => {
    setDoorsToday(prev => prev + count)
    setDoorsThisWeek(prev => prev + count)

    // Update raw stats optimistically
    setRawStats(prev => {
      const existing = prev.find(d => d.date === todayKey)
      if (existing) {
        return prev.map(d => d.date === todayKey ? { ...d, doors: d.doors + count } : d)
      }
      return [...prev, { date: todayKey, doors: count, conversations: 0, leads: 0, appointments: 0, wins: 0 }]
    })

    const { data: existing } = await (supabase.from('daily_stats' as any)
      .select('*')
      .eq('date', todayKey)
      .maybeSingle() as unknown as Promise<{ data: DailyStats | null; error: any }>)

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

  // Weekly target change handler — persist to user_settings
  const handleWeeklyTargetChange = useCallback(async (target: number) => {
    setWeeklyTarget(target)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('user_settings' as any) as any)
      .upsert({ user_id: user.id, weekly_target: target }, { onConflict: 'user_id' })
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    clearSessionBeacon()
    router.replace('/login')
  }

  const suggestion = getSuggestion(doorsToday, dailyTarget)

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
            className="press-brutal px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-2 border-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main Content — Mobile stacked ──────────────────────────── */}
      <main className="flex-1 pb-24 space-y-4 px-4">
        <QuickLog onLog={handleLog} todayDoors={doorsToday} />

        <DailyMission doorsToday={doorsToday} target={dailyTarget} suggestion={suggestion} />

        <WeeklyGoal
          doorsThisWeek={doorsThisWeek}
          weeklyTarget={weeklyTarget}
          onTargetChange={handleWeeklyTargetChange}
        />

        {/* Today KPI tiles */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Today
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Knocks', value: doorsToday, accent: false },
              { label: 'Streak', value: `${streaks.current}d`, accent: false },
              { label: 'Best', value: `${streaks.best}d`, accent: false },
              { label: 'Closes', value: totalCloses, accent: true },
            ].map(s => (
              <div key={s.label} className="border-2 border-foreground bg-card p-4 text-center">
                <div className={`text-3xl font-bold font-mono leading-none tabular-nums ${s.accent ? 'text-primary' : 'text-foreground'}`}>
                  {s.value}
                </div>
                <div className="mt-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ContributionHeatmap data={dayRecords} />

        <StreakPanel currentStreak={streaks.current} longestStreak={streaks.best} />

        <MomentumMeter data={dayRecords} />

        <BadgesPanel stats={badgeStats} />
      </main>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 text-sm font-mono font-bold z-50 border-2 border-foreground toast-slide-in">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
