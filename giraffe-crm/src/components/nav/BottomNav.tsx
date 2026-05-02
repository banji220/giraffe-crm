'use client'

/**
 * <BottomNav /> — brutalist bottom navigation bar (ported from Lovable).
 * 5 slots. Center Map is raised + inverted. Active tab gets primary color.
 * Badges show live counts from Supabase.
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/* Inline icon primitives — no lucide-react dependency */
type IconProps = { className?: string; strokeWidth?: number }
const Zap = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)
const Compass = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity="0.15" stroke="none" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)
const MapIcon = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M1 6v15l7-3 8 3 7-3V3l-7 3-8-3-7 3z" />
    <path d="M8 3v15M16 6v15" />
  </svg>
)
const Users = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const User = ({ className, strokeWidth = 2 }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

type TabId = 'today' | 'next' | 'map' | 'clients' | 'me'

interface Tab {
  id: TabId
  href: string
  label: string
  Icon: React.ComponentType<IconProps>
  center?: boolean
}

const TABS: Tab[] = [
  { id: 'today',   href: '/today',   label: 'Today',   Icon: Zap },
  { id: 'next',    href: '/next',    label: 'Next',    Icon: Compass },
  { id: 'map',     href: '/map',     label: 'Map',     Icon: MapIcon, center: true },
  { id: 'clients', href: '/clients', label: 'Clients', Icon: Users },
  { id: 'me',      href: '/me',      label: 'Me',      Icon: User },
]

interface BadgeCounts {
  today: number
  next: number
  clients: number
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [badges, setBadges] = useState<BadgeCounts>({ today: 0, next: 0, clients: 0 })

  const activeId: TabId | null = (() => {
    if (!pathname) return null
    for (const t of TABS) if (pathname === t.href || pathname.startsWith(t.href + '/')) return t.id
    return null
  })()

  // Live badge counts
  useEffect(() => {
    let cancelled = false
    const loadBadges = async () => {
      const now = new Date()
      const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999)

      const [followupsRes, unsignedRes, recleanRes] = await Promise.all([
        supabase.from('houses').select('id', { count: 'exact', head: true })
          .eq('status', 'lead')
          .not('next_follow_up_at', 'is', null)
          .lte('next_follow_up_at', endOfToday.toISOString()),
        supabase.from('houses').select('id', { count: 'exact', head: true })
          .eq('status', 'quoted'),
        supabase.from('houses').select('id', { count: 'exact', head: true })
          .eq('status', 'customer')
          .not('reclean_due_at', 'is', null)
          .lte('reclean_due_at', endOfToday.toISOString()),
      ])

      if (cancelled) return
      setBadges({
        today:   followupsRes.count ?? 0,
        next:    unsignedRes.count ?? 0,
        clients: recleanRes.count ?? 0,
      })
    }

    loadBadges()
    const interval = setInterval(loadBadges, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [supabase])

  const handleTap = (tab: Tab) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8)
    router.push(tab.href)
  }

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 max-w-2xl mx-auto bg-card border-t-2 border-foreground sm:border-x-2 sm:border-foreground">
      <ul className="grid grid-cols-5 items-end">
        {TABS.map(({ id, href, label, Icon, center }, idx) => {
          const active = id === activeId
          const count =
            id === 'today'   ? badges.today :
            id === 'next'    ? badges.next :
            id === 'clients' ? badges.clients : 0
          // Hide right-border on the cell just before center and on center itself (dark bg acts as divider)
          const nextIsCenter = TABS[idx + 1]?.center
          const hideBorder = center || nextIsCenter || idx === TABS.length - 1

          return (
            <li key={id} className={`relative ${hideBorder ? '' : 'border-r-2 border-foreground'}`}>
              <button
                onClick={() => handleTap({ id, href, label, Icon, center })}
                className={`relative w-full flex flex-col items-center justify-center gap-1 press-brutal ${
                  center ? 'py-4 bg-foreground text-background' : 'py-3'
                } pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
                  active && !center ? 'text-primary' : ''
                } ${active && center ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <Icon
                  className={center ? 'size-8' : 'size-6'}
                  strokeWidth={active || center ? 2.75 : 2.25}
                />
                <span className={`font-mono font-bold uppercase tracking-[0.15em] ${center ? 'text-[11px]' : 'text-[10px]'}`}>
                  {label}
                </span>
                {count > 0 && (
                  <span
                    className="absolute top-1.5 right-3 min-w-[18px] h-[18px] px-1 border-2 border-foreground bg-destructive text-destructive-foreground font-mono font-bold text-[10px] flex items-center justify-center leading-none"
                    aria-label={`${count} pending`}
                  >
                    {count}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
