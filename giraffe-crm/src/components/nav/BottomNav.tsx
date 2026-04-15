'use client'

/**
 * <BottomNav /> — the always-visible command bar.
 *
 * Design brief:
 *   5 slots. The middle slot (Map) is a raised emerald island — the signature
 *   move. Inactive tabs are muted grays; the active tab lifts, scales, and
 *   shows a colored dot underneath.
 *
 *   Badges pulse when they change (live data from Supabase). Haptic on every
 *   tap. Horizontal swipe gesture on the page body changes tabs.
 *
 * Each tab has an identity color used by:
 *   - the active dot under the icon
 *   - the badge ring
 *   - subtle tab transitions
 *
 * Routes:
 *   /today    coral
 *   /deals    yellow
 *   /map      emerald (raised island)
 *   /clients  purple
 *   /me       black
 */

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Flame, Users, User, Map as MapIcon } from 'lucide-react'

type TabId = 'today' | 'deals' | 'map' | 'clients' | 'me'

interface Tab {
  id: TabId
  href: string
  label: string
  color: string        // used for the active dot + badge ring
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const TABS: Tab[] = [
  { id: 'today',   href: '/today',   label: 'Today',   color: '#FF6B5B', Icon: Zap },
  { id: 'deals',   href: '/deals',   label: 'Deals',   color: '#FFD93D', Icon: Flame },
  { id: 'map',     href: '/map',     label: 'Map',     color: '#14B714', Icon: MapIcon },
  { id: 'clients', href: '/clients', label: 'Clients', color: '#A12EDA', Icon: Users },
  { id: 'me',      href: '/me',      label: 'Me',      color: '#0F0F0F', Icon: User },
]

function haptic(n: number | number[] = 6) {
  try { (navigator as any).vibrate?.(n) } catch {}
}

interface BadgeCounts {
  today: number
  deals: number
  clients: number
}

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [badges, setBadges] = useState<BadgeCounts>({ today: 0, deals: 0, clients: 0 })
  const [pulsedTab, setPulsedTab] = useState<TabId | null>(null)
  const prevBadges = useRef<BadgeCounts>({ today: 0, deals: 0, clients: 0 })

  // Determine active tab from URL
  const activeId: TabId | null = (() => {
    if (!pathname) return null
    for (const t of TABS) if (pathname === t.href || pathname.startsWith(t.href + '/')) return t.id
    return null
  })()

  // Live badge counts (cheap — one query each, parallel)
  useEffect(() => {
    let cancelled = false
    const loadBadges = async () => {
      const now = new Date()
      const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999)

      const [followupsRes, unsignedRes, recleanRes] = await Promise.all([
        // Follow-ups or scheduled touches due today
        supabase.from('leads').select('id', { count: 'exact', head: true })
          .lte('next_touch_at', endOfToday.toISOString())
          .in('state', ['nurture', 'new']),
        // Unsigned quotes (deals in motion)
        supabase.from('leads').select('id', { count: 'exact', head: true })
          .eq('state', 'quoted'),
        // Customers due for reclean
        supabase.from('customers').select('id', { count: 'exact', head: true })
          .lte('reclean_due_at', endOfToday.toISOString()),
      ])

      if (cancelled) return

      const next: BadgeCounts = {
        today:   followupsRes.count ?? 0,
        deals:   unsignedRes.count ?? 0,
        clients: recleanRes.count ?? 0,
      }

      // Pulse any badge that went up
      const prev = prevBadges.current
      const grew: TabId[] = []
      if (next.today > prev.today)     grew.push('today')
      if (next.deals > prev.deals)     grew.push('deals')
      if (next.clients > prev.clients) grew.push('clients')
      if (grew.length > 0) {
        setPulsedTab(grew[0])
        setTimeout(() => setPulsedTab(null), 1400)
      }

      prevBadges.current = next
      setBadges(next)
    }

    loadBadges()
    const interval = setInterval(loadBadges, 60_000) // refresh every minute
    return () => { cancelled = true; clearInterval(interval) }
  }, [supabase])

  const handleTap = (tab: Tab) => {
    if (tab.id === activeId) { haptic(4); return }
    haptic(8)
    router.push(tab.href)
  }

  return (
    <>
      {/* Safe-area spacer so page content isn't occluded */}
      <div className="h-[92px] shrink-0" aria-hidden />

      <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
        <div className="relative mx-auto max-w-md px-3 pb-3 pointer-events-auto">
          {/* The bar */}
          <div className="relative bg-white/95 backdrop-blur-xl border border-black/10 rounded-[28px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] h-[68px] flex items-stretch">
            {TABS.map((tab) => {
              const active = tab.id === activeId
              const isCenter = tab.id === 'map'
              const count =
                tab.id === 'today'   ? badges.today :
                tab.id === 'deals'   ? badges.deals :
                tab.id === 'clients' ? badges.clients : 0
              const pulsing = pulsedTab === tab.id

              if (isCenter) {
                return (
                  <div key={tab.id} className="relative flex-1 flex items-start justify-center">
                    <button
                      onClick={() => handleTap(tab)}
                      aria-label={tab.label}
                      className={`
                        absolute -top-[18px] w-[62px] h-[62px] rounded-full
                        bg-gradient-to-br from-emerald-400 to-emerald-600
                        border-[3px] border-black
                        shadow-[0_8px_0_0_rgba(0,0,0,1)]
                        flex items-center justify-center
                        active:shadow-[0_3px_0_0_rgba(0,0,0,1)]
                        active:translate-y-[5px]
                        transition-all duration-100
                        ${active ? 'scale-[1.04]' : ''}
                      `}
                    >
                      <tab.Icon
                        className="w-7 h-7 text-black"
                        strokeWidth={2.8}
                      />
                    </button>
                  </div>
                )
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTap(tab)}
                  aria-label={tab.label}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
                >
                  <div className="relative">
                    <tab.Icon
                      className={`transition-all duration-200
                        ${active ? 'w-[26px] h-[26px] -translate-y-[2px]' : 'w-[22px] h-[22px]'}
                        ${active ? '' : 'text-gray-400'}
                      `}
                      strokeWidth={active ? 2.6 : 2}
                      style={active ? { color: tab.color } : undefined}
                    />
                    {/* Count badge */}
                    {count > 0 && (
                      <span
                        className={`absolute -top-1 -right-2 min-w-[16px] h-[16px] px-[3px] rounded-full text-[9px] font-black text-white flex items-center justify-center border-2 border-white
                          ${pulsing ? 'animate-badge-pulse' : ''}
                        `}
                        style={{ background: tab.color, color: tab.color === '#FFD93D' ? '#0F0F0F' : '#fff' }}
                      >
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wide transition-colors
                      ${active ? '' : 'text-gray-400'}
                    `}
                    style={active ? { color: tab.color } : undefined}
                  >
                    {tab.label}
                  </span>
                  {/* Active dot */}
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full transition-all
                      ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
                    `}
                    style={{ background: tab.color }}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
