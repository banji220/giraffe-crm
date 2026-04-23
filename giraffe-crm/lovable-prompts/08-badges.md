# Prompt 8 — Me Page: Badges (The Fun Part)

Paste this after the heatmap, streak, and momentum look right. This goes below the Momentum Meter.

---

Add a Badges section below the Momentum Meter on the Me page. These are unlockable badges that reward door-knocking hustle. The names are intentionally funny and a little unhinged — this is a solo field worker's app, not a corporate tool.

## Layout
- Card: `border-2 border-foreground bg-card px-4 py-4`
- Header: "BADGES" in `text-base font-bold uppercase` + "X/20" count on the right in `text-xs font-mono text-muted-foreground`

## Badge Grid
- `grid grid-cols-3 gap-2` on mobile, `grid-cols-5` on desktop
- Each badge is a cell within the grid

### Unlocked Badge Style:
- `bg-muted py-3`, centered content
- Emoji on top: `text-xl`
- Name below: `text-[9px] font-mono font-bold text-center uppercase`
- Subtle pop animation when first unlocked (`animate-achievement-pop` — a quick scale 1→1.15→1 over 300ms)

### Locked Badge Style:
- `bg-muted/50 border border-border/50 py-3`, centered
- Emoji greyscale + 40% opacity
- Name in `text-muted-foreground`
- Tiny progress bar below: `w-4/5 h-1 bg-muted-foreground/15`, fill uses `bg-primary/60` — NO border-radius
- Progress text: "12/30 doors today" in `text-[8px] font-mono text-muted-foreground/70`

## THE BADGES (20 total)

These should feel like getting roasted by your own app. Harsh. Personal. The kind of shit your boys would say to your face. One badge is dedicated to Bazuka — the rest are just mean.

### Daily Door Badges (based on doors knocked today):

| # | Emoji | Name | Target | Unlock Condition |
|---|-------|------|--------|-----------------|
| 1 | 🚪 | FINALLY OFF YOUR ASS | 1 door | 1 door. Wow. You want a trophy for breathing too? |
| 2 | 🔟 | WARM BODY | 10 doors | 10 doors. A toddler with a clipboard could do this. |
| 3 | 🎯 | NOT COMPLETELY USELESS | 30 doors | Hit the target. Took you long enough, dipshit. |
| 4 | 🥩 | DOOR SLUT | 50 doors | 50 doors. You'll knock anything with a doorbell at this point. |
| 5 | 😈 | UNHINGED | 75 doors | 75 doors. HOA got a group chat about you. |
| 6 | 💀 | WHAT THE FUCK IS WRONG WITH YOU | 100 doors | 100 doors. This isn't hustle anymore. This is a cry for help. |

### Streak Badges (based on consecutive active days):

| # | Emoji | Name | Target | Unlock Condition |
|---|-------|------|--------|-----------------|
| 7 | 🩹 | DIDN'T BITCH OUT | 3 days | 3 days straight. Low bar but at least you cleared it. |
| 8 | 🔥 | NO LIFE CONFIRMED | 7 days | Full week. Your friends forgot what you look like. |
| 9 | 🧟 | HOMELESS OR HUSTLING? | 14 days | 14 days. Neighbors genuinely can't tell. |
| 10 | 🐐 | BAZUKA | 30 days | 30-day streak. Loud. Relentless. Can't be ignored. Bazuka. |
| 11 | ☠️ | RESTRAINING ORDER PENDING | 60 days | 60 days. Multiple zip codes want you gone. |

### Weekly Badges (based on total doors this week):

| # | Emoji | Name | Target | Unlock Condition |
|---|-------|------|--------|-----------------|
| 12 | 💯 | TOUCHED 100 DOORS (PAUSE) | 100/week | 100 doors in a week. Phrasing is unfortunate. Numbers aren't. |
| 13 | 🦍 | FERAL | 150/week | 150 doors. You can't be domesticated anymore. |
| 14 | 🌋 | THE WHOLE BLOCK HATES YOU | 200/week | 200+ doors. Ring cameras forming a union against you. |

### Closing Badges (based on deals closed):

| # | Emoji | Name | Target | Unlock Condition |
|---|-------|------|--------|-----------------|
| 15 | 💵 | BROKE THE SEAL | 1 close | First deal. Took you how many doors to close ONE? Embarrassing. |
| 16 | 💸 | LANDLORD CAN UNCLENCH | 5 closes | 5 closes. Rent's handled. Barely. |
| 17 | 🤑 | DANGEROUSLY COCKY | 20 closes | 20 closes. You're starting to believe your own bullshit. |
| 18 | 👑 | OWNS YOUR STREET | 50 closes | 50 closes. The zip code pays rent to YOU now. |

### Special / Rare Badges:

| # | Emoji | Name | Target | Unlock Condition |
|---|-------|------|--------|-----------------|
| 19 | 🌅 | PSYCHOPATH HOURS | — | Knock before 8 AM. Sun's barely up and you're terrorizing porches. |
| 20 | 🌙 | NO FUCKIN' BOUNDARIES | — | Knock after 7 PM. People are eating dinner. You don't care. |

## Toast Notification on Unlock

When a badge unlocks for the first time:
- Toast slides in from the top center
- Style: `border-2 border-foreground bg-foreground text-background px-5 py-3`
- Content: emoji (bouncing animation) + "BADGE UNLOCKED" in `text-[10px] font-mono uppercase tracking-wider opacity-70` + badge name in `text-sm font-bold font-mono`
- Auto-dismisses after 2.5 seconds, also tappable to dismiss
- The badge in the grid does a pop animation simultaneously

## Important Notes
- Sort order: unlocked badges first (in earn order), then locked badges (by progress, closest to unlocking first)
- Progress bars on locked badges should show real progress (e.g., if user has knocked 35 doors today, the "DOOR SLUT" badge shows 35/50 = 70%))
- All text is uppercase in the badge grid
- No border-radius on anything — badges are squares, progress bars are rectangles
- The grid cells should be at least 80px tall for good tap targets

Use mock data: unlock the first 8 badges, show the rest as locked with varying progress levels. Have one badge ("DID MY DAMN JOB") show the pop animation as if it was just earned. Show the toast notification for it at the top.
