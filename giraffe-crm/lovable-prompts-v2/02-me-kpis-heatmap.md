# V2 Prompt 2 — Me Page: KPIs + Heatmap (Left Column)

Paste after the desktop shell looks right.

---

Build the Me page content. The Me page uses a two-column grid inside the main content area:

```
grid grid-cols-[1fr_380px] gap-6
```

Left column is wider and fluid. Right column is fixed at 380px. This prompt builds the LEFT COLUMN only. We will fill the right column in the next prompt.

## Page Header (above the grid, full width)

- Left side: "PERFORMANCE" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground` + "Holy Giraffe" below in `text-2xl font-bold` (Space Grotesk)
- Right side: date range toggles — "Today", "This Week", "This Month", "This Year" as 4 buttons in a row
  - Style: `text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-foreground`
  - Active: `bg-foreground text-background`
  - Inactive: `bg-card text-foreground`
  - Default active: "This Week"
- `mb-6` below the header

## KPI Row (above the grid, full width, spans both columns)

5 stat cards in `grid grid-cols-5 gap-4`:

| Label | Value | Color |
|-------|-------|-------|
| DOORS TODAY | 24 | default |
| QUOTES | 6 | default |
| CLOSES | 2 | default |
| CLOSE RATE | 33% | `text-primary` |
| REVENUE | $1,240 | `text-primary` |

Each card: `border-2 border-foreground bg-card px-5 py-4`
- Number: `text-3xl font-bold font-mono tabular-nums`
- Label: `text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-1`

`mb-6` below the KPI row, then the two-column grid starts.

## Left Column — Contribution Heatmap Card

This is the HERO of the entire app. It should be large, prominent, and visually striking.

Card: `border-2 border-foreground bg-card p-6`

### Header inside card:
- Left: "5,976" in `text-4xl font-bold font-mono tabular-nums` + "doors knocked last year" in `text-sm font-mono text-muted-foreground uppercase tracking-wider` on the same baseline
- Right: square dot `w-2.5 h-2.5 bg-primary` (NO border-radius) + "12d streak" in `text-sm font-mono text-muted-foreground` + "best 21d" in `text-sm font-mono text-muted-foreground/60`

### Metric switcher + range toggle (below header, mb-4):
Row with two groups:
- Left group: 4 toggle buttons — DOORS, CONVOS, LEADS, WINS
- Right group: 2 toggle buttons — 90D, 1Y
- All toggles: `text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5`
- Active: `bg-foreground text-background`
- Inactive: `bg-muted text-muted-foreground`
- NO border-radius on any of them
- Default: DOORS active, 1Y active

### The heatmap grid:
- 7 rows (Sunday at top, Saturday at bottom) × ~52 columns (one per week of the year)
- Each cell: 15x15px square, gap 3px, NO border-radius — these are sharp squares
- Day labels on the left column: only show "Mon", "Wed", "Fri" (rows 1, 3, 5) in `text-[11px] font-mono text-muted-foreground`. Day label column width: 32px.
- Month labels across the top: "Jan", "Feb", "Mar"... positioned at the start of each month's first week. `text-[11px] font-mono text-muted-foreground`. Skip a month label if it would be too close to the previous one (less than 4 columns apart).
- Cell colors based on intensity level 0-5:
  - Level 0: `var(--heatmap-0)` — light warm grey, for zero activity
  - Level 1: `var(--heatmap-1)` — visible yellow
  - Level 2: `var(--heatmap-2)` — bright orange-amber
  - Level 3: `var(--heatmap-3)` — rich burnt orange
  - Level 4: `var(--heatmap-4)` — deep red-brown
  - Level 5: `var(--heatmap-5)` — near-black chocolate
- CRITICAL: Each color level MUST be obviously different from its neighbors. If levels 1 and 2 look similar, increase saturation. The whole point of the heatmap is seeing patterns at a glance.
- Cells in a 3+ consecutive day streak: add `ring-1 ring-primary/30` for subtle highlight
- The grid should stretch to fill the available card width. Calculate cell size to maximize usage.
- On hover: show a tooltip with date + stats (Doors, Convos, Leads, Appts, Wins) — tooltip is a small card with `border-2 border-foreground bg-card p-3`, positioned above the cell, `text-[11px] font-mono`

### Legend (below grid, right-aligned):
"Less" then 6 small squares (one per level 0-5) then "More" — all in `text-[11px] font-mono text-muted-foreground`

### Mock data:
Generate a realistic full year of data. Most days should have some activity (level 1-3). Scatter in some high days (level 4-5). Include a few empty stretches (vacation). Make the last 12 days all active (to show the current streak). The data should look like a real person's work pattern — busier on weekdays, lighter on weekends, occasional gaps.

## Right Column — Empty for now
Just render an empty `div` for the right column. We fill it in the next prompt. It should be visible as the 380px space.

The heatmap should be the dominant visual element on the page. If it looks small or cramped, increase the cell size. It should feel like you're looking at a year of your life in color.
