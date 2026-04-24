/* =========================================================================
   Activity data helpers — ported from Lovable.
   In Lovable these used seeded mock data. Here they operate on real
   daily_stats from Supabase, passed in as DayRecord[].
   ========================================================================= */

export type Metric = 'doors' | 'convos' | 'leads' | 'appts' | 'wins'

export type DayRecord = {
  date: Date
  doors: number
  convos: number
  leads: number
  appts: number
  wins: number
  inFuture: boolean
}

export function metricValue(d: DayRecord, m: Metric): number {
  return d[m]
}

export const METRIC_LABELS: Record<Metric, string> = {
  doors: 'Doors',
  convos: 'Convos',
  leads: 'Leads',
  appts: 'Appts',
  wins: 'Wins',
}

/* Doors thresholds — fixed buckets.
   Other metrics: relative to a per-metric ceiling. */
const RELATIVE_MAX: Record<Metric, number> = {
  doors: 60,
  convos: 25,
  leads: 12,
  appts: 6,
  wins: 5,
}

export function colorStep(value: number, metric: Metric): 0 | 1 | 2 | 3 | 4 | 5 {
  if (value <= 0) return 0
  if (metric === 'doors') {
    if (value <= 7) return 1
    if (value <= 19) return 2
    if (value <= 34) return 3
    if (value <= 49) return 4
    return 5
  }
  const pct = value / RELATIVE_MAX[metric]
  if (pct < 0.2) return 1
  if (pct < 0.4) return 2
  if (pct < 0.6) return 3
  if (pct < 0.85) return 4
  return 5
}

/* Compute current and best streaks (consecutive days with doors > 0). */
export function computeStreaks(days: DayRecord[]) {
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].doors > 0) current++
    else break
  }
  let best = 0
  let run = 0
  for (const d of days) {
    if (d.doors > 0) {
      run++
      if (run > best) best = run
    } else run = 0
  }
  return { current, best }
}

/* Composite momentum score — consistency 45 / volume 40 / trend 15 */
export function computeMomentum(days: DayRecord[]) {
  const last7 = days.slice(-7)
  const prev7 = days.slice(-14, -7)

  const activeDays = last7.filter((d) => d.doors > 0).length
  const consistency = (activeDays / 7) * 100

  const avgDoors = last7.reduce((s, d) => s + d.doors, 0) / 7
  const volume = Math.min(100, (avgDoors / 25) * 100)

  const thisWeekTotal = last7.reduce((s, d) => s + d.doors, 0)
  const lastWeekTotal = prev7.reduce((s, d) => s + d.doors, 0)
  let trendPct = 0
  if (lastWeekTotal > 0) {
    trendPct = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
  } else if (thisWeekTotal > 0) {
    trendPct = 100
  }
  const trendScore = Math.max(0, Math.min(100, 50 + trendPct))

  const score = Math.round(
    consistency * 0.45 + volume * 0.4 + trendScore * 0.15,
  )
  return {
    score,
    consistency: Math.round(consistency),
    volume: Math.round(volume),
    trendPct: Math.round(trendPct),
    thisWeekTotal,
    lastWeekTotal,
    last7,
  }
}

/** Convert Supabase daily_stats rows into DayRecord[] for the last N days */
export function buildDayRecords(
  stats: { date: string; doors: number; conversations: number; leads: number; appointments: number; wins: number }[],
  daysBack: number = 365,
): DayRecord[] {
  const map = new Map<string, typeof stats[0]>()
  stats.forEach(s => map.set(s.date, s))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - daysBack + 1)

  const days: DayRecord[] = []
  const cursor = new Date(start)
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10)
    const row = map.get(key)
    days.push({
      date: new Date(cursor),
      doors: row?.doors ?? 0,
      convos: row?.conversations ?? 0,
      leads: row?.leads ?? 0,
      appts: row?.appointments ?? 0,
      wins: row?.wins ?? 0,
      inFuture: false,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
