'use client'

import { useState, useMemo, useCallback, memo } from 'react'

type Metric = 'doors' | 'convos' | 'leads' | 'wins'

interface DayData {
  date: string       // YYYY-MM-DD
  doors: number
  conversations: number
  leads: number
  wins: number
}

interface ContributionHeatmapProps {
  data: DayData[]
  streak: number
  bestStreak: number
}

const METRICS: { key: Metric; label: string }[] = [
  { key: 'doors', label: 'Doors' },
  { key: 'convos', label: 'Convos' },
  { key: 'leads', label: 'Leads' },
  { key: 'wins', label: 'Wins' },
]

const DAY_LABELS = ['', 'MON', '', 'WED', '', 'FRI', '']

function getLevel(value: number, max: number): number {
  if (value === 0) return 0
  if (max === 0) return 0
  const ratio = value / max
  if (ratio <= 0.15) return 1
  if (ratio <= 0.35) return 2
  if (ratio <= 0.55) return 3
  if (ratio <= 0.80) return 4
  return 5
}

function getMonthLabels(weeks: string[][]): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = []
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  let lastMonth = -1

  for (let col = 0; col < weeks.length; col++) {
    // Find first valid date in this week column
    const firstDate = weeks[col].find(d => d !== '')
    if (!firstDate) continue
    const month = new Date(firstDate + 'T00:00:00').getMonth()
    if (month !== lastMonth) {
      labels.push({ label: months[month], col })
      lastMonth = month
    }
  }
  return labels
}

export default memo(function ContributionHeatmap({ data, streak, bestStreak }: ContributionHeatmapProps) {
  const [metric, setMetric] = useState<Metric>('doors')
  const [range, setRange] = useState<90 | 365>(90)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  // Build date → data map
  const dataMap = useMemo(() => {
    const map = new Map<string, DayData>()
    data.forEach(d => map.set(d.date, d))
    return map
  }, [data])

  // Generate grid: array of week columns, each with 7 day slots
  const { weeks, totalValue, maxValue } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysBack = range
    const start = new Date(today)
    start.setDate(start.getDate() - daysBack + 1)

    // Align start to nearest previous Monday (0=Sun, 1=Mon)
    const startDay = start.getDay()
    const alignOffset = startDay === 0 ? 6 : startDay - 1 // days to subtract to get to Monday
    start.setDate(start.getDate() - alignOffset)

    const weeks: string[][] = []
    let total = 0
    let max = 0
    const cursor = new Date(start)

    while (cursor <= today) {
      const week: string[] = []
      for (let d = 0; d < 7; d++) {
        if (cursor > today) {
          week.push('')
        } else {
          const key = cursor.toISOString().slice(0, 10)
          week.push(key)
          const val = dataMap.get(key)
          if (val) {
            const v = getMetricValue(val, metric)
            total += v
            if (v > max) max = v
          }
        }
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }

    return { weeks, totalValue: total, maxValue: max }
  }, [dataMap, range, metric])

  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks])

  const handleCellHover = useCallback((e: React.MouseEvent, dateKey: string) => {
    if (!dateKey) return
    const val = dataMap.get(dateKey)
    const v = val ? getMetricValue(val, metric) : 0
    const date = new Date(dateKey + 'T00:00:00')
    const label = date.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const parent = (e.target as HTMLElement).closest('.heatmap-container')?.getBoundingClientRect()
    if (!parent) return
    setTooltip({
      x: rect.left - parent.left + rect.width / 2,
      y: rect.top - parent.top - 8,
      text: `${label}: ${v} ${metric}`,
    })
  }, [dataMap, metric])

  const handleCellLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className="border-2 border-foreground bg-card p-4">
      {/* Header: total + streak */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="text-3xl font-bold font-mono tabular-nums">{totalValue.toLocaleString()}</div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
            {metric} logged · last {range} days
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block" style={{ background: 'var(--heatmap-4)' }} />
            <span className="text-sm font-mono font-bold">{streak}d streak</span>
          </div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
            Best {bestStreak}d
          </div>
        </div>
      </div>

      {/* Metric switcher + range toggle */}
      <div className="flex items-center justify-between mt-3 mb-3">
        <div className="flex gap-0">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1.5 border-2 border-foreground -ml-[2px] first:ml-0 transition-colors ${
                metric === m.key
                  ? 'bg-foreground text-background'
                  : 'bg-card text-foreground hover:bg-accent/30'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <select
          value={range}
          onChange={e => setRange(Number(e.target.value) as 90 | 365)}
          className="text-[10px] font-mono font-bold uppercase border-2 border-foreground bg-card px-2 py-1.5 appearance-auto"
        >
          <option value={90}>90d</option>
          <option value={365}>1y</option>
        </select>
      </div>

      {/* Heatmap grid */}
      <div className="heatmap-container relative overflow-x-auto">
        {/* Month labels */}
        <div className="flex ml-8 mb-1" style={{ gap: 0 }}>
          {monthLabels.map((ml, i) => (
            <div
              key={i}
              className="text-[9px] font-mono font-bold text-muted-foreground uppercase"
              style={{
                position: 'absolute',
                left: `${32 + ml.col * 15}px`,
              }}
            >
              {ml.label}
            </div>
          ))}
        </div>

        <div className="flex mt-4" style={{ gap: '2px' }}>
          {/* Day labels */}
          <div className="flex flex-col" style={{ gap: '2px', width: '28px', flexShrink: 0 }}>
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="text-[9px] font-mono text-muted-foreground" style={{ height: '13px', lineHeight: '13px' }}>
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
              {week.map((dateKey, di) => {
                if (!dateKey) return <div key={di} style={{ width: 13, height: 13 }} />
                const val = dataMap.get(dateKey)
                const v = val ? getMetricValue(val, metric) : 0
                const level = getLevel(v, maxValue)
                return (
                  <div
                    key={di}
                    className="heatmap-cell"
                    data-level={level}
                    onMouseEnter={e => handleCellHover(e, dateKey)}
                    onMouseLeave={handleCellLeave}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="heatmap-tooltip text-[10px] font-mono font-bold"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[9px] font-mono text-muted-foreground mr-1">Less</span>
        {[0, 1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            className="heatmap-cell heatmap-legend"
            data-level={level}
          />
        ))}
        <span className="text-[9px] font-mono text-muted-foreground ml-1">More</span>
      </div>
    </div>
  )
})

function getMetricValue(day: DayData, metric: Metric): number {
  switch (metric) {
    case 'doors': return day.doors
    case 'convos': return day.conversations
    case 'leads': return day.leads
    case 'wins': return day.wins
  }
}
