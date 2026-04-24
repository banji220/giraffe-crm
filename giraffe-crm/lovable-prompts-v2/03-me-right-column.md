# V2 Prompt 3 — Me Page: Right Column (Stacked Cards)

Paste after the heatmap looks right in the left column.

---

Fill the right column (380px) of the Me page with these 6 cards stacked vertically. Use `space-y-4` for gaps between them. Every card uses `border-2 border-foreground bg-card p-5`.

## Card 1 — Daily Mission

- Header row: emoji (🎯 not started / 🔥 in progress / 🏆 complete) + "DAILY MISSION" in `text-sm font-bold uppercase` + right side: status badge "IN PROGRESS" in `text-[10px] font-mono font-bold uppercase tracking-wider border-2 border-foreground px-2 py-0.5`
- Progress bar: `h-6 w-full bg-muted` (NO border-radius). Fill color changes by percentage:
  - 0-30%: `var(--heatmap-2)` yellow
  - 31-60%: `var(--heatmap-3)` orange
  - 61-99%: `var(--heatmap-4)` red-brown
  - 100%: `var(--heatmap-5)` dark chocolate
- Centered text overlay on bar: "14 / 30 doors" in `text-xs font-mono font-bold`
- Below bar: "Target: 30 doors" + small "EDIT" button on the right (`text-[10px] font-mono font-bold uppercase border-2 border-foreground px-2 py-0.5`)
- Suggestion text: "Hit 6 more before lunch — momentum stays alive." in `text-xs font-mono text-muted-foreground mt-2`

## Card 2 — Weekly Goal

- Header: "WEEKLY GOAL" label + "4D LEFT" badge on right in `text-[10px] font-mono font-bold uppercase border-2 border-foreground px-2 py-0.5`
- Big number row: "67" in `text-4xl font-bold font-mono` + "/ 150 doors" in `text-sm font-mono text-muted-foreground` on the same baseline + "45%" on the far right in `text-lg font-bold font-mono`
- Progress bar: same style as Daily Mission, `h-4 bg-muted`, fill based on 45%
- Below: "Need 21/day to hit target" in `text-xs font-mono text-muted-foreground`

## Card 3 — Streak Panel

- Header: "STREAK" in `text-sm font-bold uppercase` + badge on right
- Status badges based on streak length:
  - 0 days: "❄️ COLD" muted border
  - 1-2: "✓ ACTIVE" normal
  - 3-4: "⚡ WARMING UP" normal
  - 5-9: "🔥 HOT STREAK" inverted (`bg-foreground text-background`)
  - 10+: "🔥 ON FIRE" inverted
- Two stat boxes side by side (`grid grid-cols-2 gap-2`):
  - Current: `text-3xl font-bold font-mono` number + "DAYS" label below in `text-[10px] font-mono uppercase`. If streak ≥ 5, this box is inverted: `bg-foreground text-background`
  - Best: same style but always `bg-muted`
- Progress bar below: "PROGRESS TO BEST" left + "57%" right in `text-[10px] font-mono uppercase tracking-wider text-muted-foreground`. Bar: `h-2 bg-muted`, fill color matches streak status.
- Mock: current 12, best 21, ON FIRE state

## Card 4 — Momentum Meter

- Header: "MOMENTUM" + badge "🔥 STRONG" inverted
- Score bar: `h-8 w-full bg-muted`, filled to 72%, fill color `var(--heatmap-4)`. Centered overlay: "72/100" in `text-xs font-mono font-bold`
- Labels below bar: "Stalled" left, "Peak" right in `text-[10px] font-mono uppercase tracking-wider text-muted-foreground`
- 7-day mini bar chart: `flex items-end gap-1 h-12`. Each bar is a div, width `flex-1`, height proportional to that day's doors, color matches momentum state. Day labels below: S, M, T, W, T, F, "Today" in `text-[9px] font-mono text-muted-foreground`. Bars have NO border-radius.
- Trend: "↑ 20% vs last week" in `text-xs font-mono text-muted-foreground mt-2`

## Card 5 — Quick Log

- Header: "QUICK LOG" + "Today: **24**" on right in `text-sm font-mono`
- 4 buttons in a row (`grid grid-cols-4 gap-2`): +1, +5, +10, +25
- Each button: `border-2 border-foreground bg-card text-xl font-bold font-mono py-3 text-center active:translate-y-[2px] transition-transform`
- Below each number: "door"/"doors" in `text-[9px] text-muted-foreground`

## Card 6 — Badges

- Header: "BADGES" + "8/20" count on right in `text-xs font-mono text-muted-foreground`
- Grid: `grid grid-cols-4 gap-2`
- Unlocked badge cell: `bg-muted py-3 text-center`. Emoji `text-xl` on top + name in `text-[8px] font-mono font-bold uppercase text-center leading-tight mt-1`
- Locked badge cell: `bg-muted/50 py-3 text-center`. Emoji `text-lg grayscale opacity-40` + name in `text-muted-foreground` + progress bar `w-4/5 h-1 bg-muted-foreground/15 mx-auto mt-1` with fill `bg-primary/60` (NO border-radius) + fraction `text-[7px] font-mono text-muted-foreground/60`
- Show first 8 unlocked, rest locked with varying progress
- Badge names (use these exact names, they are intentional):
  - Row 1: FINALLY OFF YOUR ASS, WARM BODY, NOT COMPLETELY USELESS, DIDN'T BITCH OUT
  - Row 2: NO LIFE CONFIRMED, BROKE THE SEAL, LANDLORD CAN UNCLENCH, HOMELESS OR HUSTLING?
  - Row 3 (locked): DOOR SLUT, BAZUKA, UNHINGED, FERAL
  - Row 4 (locked): TOUCHED 100 DOORS (PAUSE), PSYCHOPATH HOURS, BLOCK CAPTAIN, FLATLINED STANDING UP
  - Row 5 (locked): DANGEROUSLY COCKY, NO FUCKIN' BOUNDARIES, WALKING NATURAL DISASTER, OWNS YOUR STREET

IMPORTANT: ALL 6 cards go in the RIGHT column. Nothing from this list goes in the left column. The left column only has KPIs and the heatmap.
