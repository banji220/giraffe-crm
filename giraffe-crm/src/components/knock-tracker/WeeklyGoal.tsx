import { memo, useMemo } from 'react'

interface WeeklyGoalProps {
  doorsThisWeek: number
  weeklyTarget: number
}

export default memo(function WeeklyGoal({ doorsThisWeek, weeklyTarget }: WeeklyGoalProps) {
  const { percent, daysLeft } = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun
    // Remaining days including today: Mon-Sun week
    const remaining = dayOfWeek === 0 ? 1 : 7 - dayOfWeek
    return {
      percent: weeklyTarget > 0 ? Math.min(Math.round((doorsThisWeek / weeklyTarget) * 100), 100) : 0,
      daysLeft: remaining,
    }
  }, [doorsThisWeek, weeklyTarget])

  return (
    <div className="border-2 border-foreground bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold tracking-tight uppercase">Weekly Goal</h2>
        <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          {daysLeft}d left
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-4xl font-bold font-mono tabular-nums">{doorsThisWeek}</span>
          <span className="text-sm font-mono text-muted-foreground ml-1">
            / <span className="border-b border-muted-foreground">{weeklyTarget}</span> doors
          </span>
        </div>
        <span className="text-2xl font-bold font-mono tabular-nums text-muted-foreground">
          {percent}%
        </span>
      </div>
    </div>
  )
})
