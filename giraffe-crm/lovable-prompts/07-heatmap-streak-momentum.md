# Prompt 7 — Me Page: Contribution Heatmap + Streak + Momentum

Paste this after Prompt 6 (Me page stats) looks right. These go below the Daily Mission card.

---

Add three major components below the Daily Mission card on the Me page: a contribution heatmap calendar, a streak panel, and a momentum meter.

## Contribution Heatmap

A GitHub-style contribution calendar showing daily door-knocking activity. This is the centerpiece of the Me page.

### Layout
- Full-width card: `border-2 border-foreground bg-card px-4 py-4`
- Header row inside the card:
  - Left: Big number "1,247" in `text-3xl font-bold font-mono tabular-nums` + "doors knocked this year" in `text-xs font-mono text-muted-foreground uppercase tracking-wider`
  - Right: streak indicator dot (small square, `w-2 h-2 bg-primary`) + "12d streak" + "best 21d" in muted mono

### Metric Switcher
Row of 4 toggle buttons: **Doors**, **Convos**, **Leads**, **Wins**
- Style: `text-xs font-mono font-bold uppercase tracking-wider`
- Active: `bg-foreground text-background`
- Inactive: `bg-muted text-muted-foreground`
- No border-radius on any of these

### Range Toggle
Next to metric switcher: **90d** and **1y** buttons, same toggle style but smaller

### The Grid (Desktop)
- 7 rows (Sun-Sat) × ~52 columns (weeks)
- Day labels on left: only show Mon, Wed, Fri (alternating rows)
- Month labels across the top: Jan, Feb, Mar... positioned at the first week of each month
- Each cell: 18×18px square (NO border-radius — these are squares, not rounded), gap of 4px
- Cell colors use the heatmap CSS variables based on intensity level (0-5):
  - Level 0 (no activity): `--heatmap-0` (warm grey)
  - Level 1 (1-7 doors): `--heatmap-1` (pale warm)
  - Level 2 (8-19 doors): `--heatmap-2` (warm yellow)
  - Level 3 (20-34 doors): `--heatmap-3` (deep amber)
  - Level 4 (35-49 doors): `--heatmap-4` (rich brown)
  - Level 5 (50+ doors): `--heatmap-5` (dark chocolate)
- Cells in a 3+ day streak get a subtle ring/highlight
- Horizontally scrollable on overflow

### The Grid (Mobile)
- Show 90 days by default (3 months)
- Smaller cells: 14×14px, gap 3px
- Same color coding

### Legend
Below the grid, right-aligned: "Less" → 6 color squares → "More" in `text-[11px] font-mono text-muted-foreground`

### Tooltip (Desktop)
On hover over a cell, show a floating tooltip with:
- Date in mono: "Wed, Apr 15, 2026"
- Stats grid: Doors: 24, Convos: 8, Leads: 3, Appts: 1, Wins: 1

### Day Detail (Mobile)
On tap, show selected day's stats below the grid in an expandable detail card.

## Streak Panel

Below the heatmap. Shows current and longest streak.

### Layout
- Card: `border-2 border-foreground bg-card px-4 py-4`
- Header: "STREAK" in `text-base font-bold uppercase` + status badge on right
- Status badges based on current streak:
  - 0 days: "❄️ COLD" — muted border
  - 1-2 days: "✓ ACTIVE" — normal border
  - 3-4 days: "⚡ WARMING UP" — normal border
  - 5-9 days: "🔥 HOT STREAK" — inverted (bg-foreground text-background)
  - 10+ days: "🔥 ON FIRE" — inverted

### Two stat boxes side by side (grid-cols-2 gap-2):
- **Current:** Big number in `text-3xl font-bold font-mono` + "days" label. If streak is "hot" (5+), this box is inverted (`bg-foreground text-background`)
- **Best:** Big number in `text-3xl font-bold font-mono` + "days" label. Always muted background.

### Progress bar below:
- Label: "PROGRESS TO BEST" left + percentage right, in `text-[10px] font-mono uppercase tracking-wider`
- Bar: `h-2 bg-muted`, fill color matches streak status (hot = `--heatmap-5`, warm = `--heatmap-3`, cold = `--heatmap-1`)
- No border-radius on the bar

## Momentum Meter

Below streak panel. A 0-100 composite score based on consistency, volume, and trend.

### Layout
- Card: `border-2 border-foreground bg-card px-4 py-4`
- Header: "MOMENTUM" + status badge
- Status badges:
  - 85-100: "⚡ PEAK" — inverted
  - 65-84: "🔥 STRONG" — inverted
  - 40-64: "📈 BUILDING" — normal
  - 15-39: "🐢 SLOW" — muted
  - 0-14: "💤 STALLED" — muted

### Score gauge:
- Full-width bar, `h-8 bg-muted`, fill width = score%, fill color from heatmap scale
- Centered overlay text: "72/100" in `text-xs font-mono font-bold`
- Labels below: "Stalled" on left, "Peak" on right in `text-[10px] font-mono uppercase`

### 7-day mini bar chart:
- 7 vertical bars (one per day), `flex items-end gap-1 h-12`
- Each bar: fills proportionally to that day's door count, color matches the overall momentum color
- Day label below each bar: "M", "T", "W", etc., last one says "Today"
- Bars are squares (no border-radius)

### Trend line:
- Below the chart: "↑ 23% vs last week" or "↓ 12% vs last week" or "→ Holding steady vs last week" in `text-xs font-mono text-muted-foreground`

### Score formula (for reference — implement this logic):
- **Consistency (45%):** Active days out of last 7 (e.g., 5/7 = 71%)
- **Volume (40%):** Average daily doors vs target of 25 (e.g., avg 18 = 72%)
- **Trend (15%):** This week total vs last week total, mapped to 0-100 scale

Use mock data: generate a realistic-looking year of data with some empty days, some high days, a current 12-day streak, and a best of 21 days. Momentum score should show 72 in the "Strong" state.
