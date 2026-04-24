# Desktop CRM Rebuild — Complete Layout Specification

You are rebuilding the desktop experience (1024px+) of a field sales CRM for a window cleaning business. The mobile app already exists — do NOT scale it up. This is a ground-up desktop layout designed for sitting at a desk, reviewing performance, planning routes, and managing pipeline.

Reference products for visual quality: Stripe Dashboard, Linear, Notion, Arc Browser. Clean, dense, structured, premium.

---

## GLOBAL LAYOUT STRUCTURE

The desktop layout uses a **fixed left sidebar + scrollable main content area** pattern.

```
┌──────────────────────────────────────────────────────┐
│ LEFT SIDEBAR (240px)  │        MAIN CONTENT          │
│ fixed, full height    │   scrollable, fluid width     │
│                       │                               │
│ Logo                  │  ┌─────────────┬────────────┐ │
│ ─────────             │  │  PRIMARY    │  SECONDARY │ │
│ Nav items             │  │  COLUMN     │  COLUMN    │ │
│                       │  │  (60%)      │  (40%)     │ │
│                       │  │             │            │ │
│                       │  │             │            │ │
│                       │  │             │            │ │
│ ─────────             │  │             │            │ │
│ User / Settings       │  └─────────────┴────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Left Sidebar — 240px, fixed position
- Background: `bg-foreground` (dark, inverted)
- Text: `text-background` (light on dark)
- Full viewport height, fixed left, does NOT scroll with content
- Top: "GIRAFFE" in `text-sm font-mono font-bold uppercase tracking-[0.3em]` + "FIELD CRM" below in `text-[10px] font-mono uppercase tracking-wider opacity-50`
- Navigation items stacked vertically below with 4px gap:
  - **Today** — icon ⚡ + label
  - **Deals** — icon ◎ + label + badge count (e.g., "5" in a small pill)
  - **Map** — icon 🗺️ + label
  - **Clients** — icon 👥 + label
  - **Me** — icon 👤 + label
- Each nav item: `px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider` with full-width hover state `bg-background/10`
- Active item: `bg-background/15 border-l-3 border-primary` with `text-background` (brighter than inactive)
- Bottom of sidebar: user avatar (40x40 square, NO border-radius, `border-2 border-background/20`) + name + "Sign out" small text link
- Divider between nav and user section: `border-t border-background/10`

### Main Content Area — fluid width, right of sidebar
- `margin-left: 240px`
- `padding: 32px 40px`
- `max-width: 1400px` for the inner content (prevents ultra-wide stretching on 4K monitors)
- Background: `bg-background`
- Scrollable vertically

---

## PAGE: ME (Stats + Heatmap + Gamification)

This is the primary dashboard. Two-column layout inside the main content area.

### Top Bar (spans full width of main content)
- Left: Page title "PERFORMANCE" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground` + user name "Holy Giraffe" in `text-2xl font-bold` (Space Grotesk) below
- Right: Date range selector — "Today", "This Week", "This Month", "This Year" as toggle buttons. Style: `text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 border-2 border-foreground`. Active: `bg-foreground text-background`. Inactive: `bg-card text-foreground`.
- `margin-bottom: 32px`

### KPI Row (spans full width, below top bar)
5 stat cards in a single row using `grid grid-cols-5 gap-4`:

| Stat | Example | Notes |
|------|---------|-------|
| DOORS TODAY | 24 | Standard |
| QUOTES | 6 | Standard |
| CLOSES | 2 | Standard |
| CLOSE RATE | 33% | Number in `text-primary` |
| REVENUE | $1,240 | Number in `text-primary` |

Each card:
- `border-2 border-foreground bg-card px-5 py-4`
- Number: `text-3xl font-bold font-mono tabular-nums` (centered or left-aligned, pick one, be consistent)
- Label below: `text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mt-1`
- NO border-radius, NO shadow

### Below KPIs: Two-Column Layout
`grid grid-cols-[1fr_380px] gap-6 mt-6`

**Left column (primary, ~60%):**

#### Contribution Heatmap Card (the centerpiece)
This is the HERO component. It gets the most visual weight.

- Card: `border-2 border-foreground bg-card p-6`
- Header row inside card:
  - Left: Big number "5,976" in `text-4xl font-bold font-mono tabular-nums` + "doors knocked last year" in `text-sm font-mono text-muted-foreground uppercase tracking-wider`
  - Right: streak info — small square dot `w-2.5 h-2.5 bg-primary` + "12d streak" + "best 21d" in `text-sm font-mono text-muted-foreground`
- Metric switcher row: 4 toggle buttons — DOORS, CONVOS, LEADS, WINS
  - Style: `text-xs font-mono font-bold uppercase tracking-wider px-4 py-1.5`
  - Active: `bg-foreground text-background`
  - Inactive: `bg-muted text-muted-foreground`
  - NO border-radius
- Range toggle next to metrics: **90D** and **1Y** buttons, same style but smaller
- The grid itself:
  - 7 rows (Sun–Sat) × 52 columns (weeks)
  - Cell size: 16x16px, gap: 3px, NO border-radius (squares)
  - Day labels on left (Mon, Wed, Fri only)
  - Month labels across top (Jan, Feb, Mar...)
  - Cell colors use heatmap variables:
    - Level 0: `--heatmap-0` (light warm grey)
    - Level 1: `--heatmap-1` (real yellow)
    - Level 2: `--heatmap-2` (bright orange-amber)
    - Level 3: `--heatmap-3` (rich burnt orange)
    - Level 4: `--heatmap-4` (deep red-brown)
    - Level 5: `--heatmap-5` (near-black chocolate)
  - Each level MUST be visibly different. If you squint and levels 1-3 look the same, increase the saturation.
  - Cells in a 3+ day streak get a subtle `ring-1 ring-primary/30` highlight
- Legend below grid (right-aligned): "Less" → 6 squares → "More" in `text-[11px] font-mono text-muted-foreground`
- Tooltip on hover: floating card showing date + stats grid (Doors, Convos, Leads, Appts, Wins) in `text-[11px] font-mono`
- The heatmap should be wide enough to fill the card. Calculate cell size to maximize width usage.

#### Momentum Meter Card (below heatmap)
- Card: `border-2 border-foreground bg-card p-5 mt-4`
- Header: "MOMENTUM" label + status badge (⚡ PEAK / 🔥 STRONG / 📈 BUILDING / 🐢 SLOW / 💤 STALLED)
- Score bar: `h-8 w-full bg-muted`, fill uses heatmap color based on score, centered text "72/100" in `text-xs font-mono font-bold`
- 7-day mini bar chart below: 7 vertical bars, labeled M T W T F S S, last one "Today"
- Trend text: "↑ 23% vs last week" in `text-xs font-mono text-muted-foreground`

**Right column (secondary, 380px fixed):**

#### Daily Mission Card
- `border-2 border-foreground bg-card p-5`
- Header: emoji 🎯/🔥/🏆 + "DAILY MISSION" + status badge + Edit button
- Progress bar: `h-6 bg-muted`, fill color transitions through heatmap scale based on %, centered text "14 / 30 doors"
- Smart suggestion text below

#### Weekly Goal Card
- `border-2 border-foreground bg-card p-5 mt-4`
- Same pattern: progress bar + "67 / 150 doors" + "4D LEFT" badge + "Need 21/day to hit target"

#### Streak Panel Card
- `border-2 border-foreground bg-card p-5 mt-4`
- "STREAK" header + status badge (❄️ COLD / ⚡ WARMING UP / 🔥 ON FIRE)
- Two boxes side by side: Current (big number + "days") and Best (big number + "days")
- If current streak is 5+, the Current box inverts to `bg-foreground text-background`
- Progress bar below: "PROGRESS TO BEST" + percentage

#### Quick Log Card
- `border-2 border-foreground bg-card p-5 mt-4`
- "QUICK LOG" header + "Today: 24" on right
- 4 buttons in a row: +1, +5, +10, +25
- Each button: `border-2 border-foreground bg-card font-mono font-bold text-xl py-3`, full width within the grid
- Flash animation on tap

#### Badges Card
- `border-2 border-foreground bg-card p-5 mt-4`
- "BADGES" header + "8/20" count
- Grid: `grid-cols-4 gap-2` (fits better in the 380px column than 3 or 5)
- Unlocked: `bg-muted py-3`, emoji + name
- Locked: `bg-muted/50`, greyscale emoji, progress bar, fraction text

---

## PAGE: TODAY

Two-column layout: `grid grid-cols-[1fr_380px] gap-6`

**Left column:**
- Header: "TODAY" label + full date "Wednesday, April 22" in `text-2xl font-bold` + stats line
- QuickLog card (same as Me page — duplicated here for fast access)
- Daily Mission card
- Below: Appointments Today + Jobs Today as two cards side by side `grid grid-cols-2 gap-4`

**Right column:**
- Follow-Ups Due section (full list, scrollable within the column)
- Expiring Quotes section below
- These are the urgency items — they get their own dedicated column so nothing gets buried

Each action card: left urgency stripe (4px colored bar on left edge), address bold, contact name, price mono, time badge, call + navigate buttons.

---

## PAGE: DEALS

Two-column layout: `grid grid-cols-[1fr_380px] gap-6`

**Left column:**
- Pipeline Money Bar at top (horizontal stacked bar showing $ per stage)
- HOTTEST section (urgency-sorted cards)
- PIPELINE section (working deals)

**Right column:**
- WON section (recent closes, collapsed by default)
- Pipeline stats: total pipeline value, average deal size, avg days to close — in small stat cards stacked vertically

---

## PAGE: CLIENTS

Two-column layout: `grid grid-cols-[1fr_380px] gap-6`

**Left column:**
- Hero: total LTV in huge primary mono text
- All Customers list (searchable — add a search input at the top)

**Right column:**
- Due for Reclean section
- Review Not Asked section
- These are the action items — separated into their own column for visibility

---

## PAGE: MAP

On desktop, the map route is different from the others.

- Sidebar stays visible (240px)
- Map fills the ENTIRE remaining viewport (no padding, no max-width constraint)
- No two-column layout — the map IS the content
- Map controls (search, filters) float on top of the map in the top-left area
- Pin detail opens as a right-side panel (420px, slides in from right, `border-l-2 border-foreground bg-card`) overlaying the map
- The map remains interactive behind the detail panel

---

## BREAKPOINT LOGIC

| Breakpoint | Layout |
|-----------|--------|
| < 768px (mobile) | Single column, bottom tab nav, no sidebar. Exactly as currently built. |
| 768px–1023px (tablet) | Single column, max-w-lg centered, bottom tab nav still. Sidebar hidden. |
| ≥ 1024px (desktop) | Sidebar + two-column main content. Bottom nav hidden. |

The sidebar and two-column layouts ONLY activate at 1024px+. Below that, the app looks exactly like the current mobile version. Do NOT show a sidebar or multi-column grid on mobile or tablet.

---

## SPACING SCALE

- Section gap (between major cards): 16px (`gap-4`)
- Inner card padding: 20-24px (`p-5` or `p-6`)
- Between label and content inside a card: 12-16px
- Between KPI row and main content: 24px
- Page padding: 32px top/bottom, 40px left/right

---

## TYPOGRAPHY SCALING (desktop)

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page title | text-2xl | text-2xl (same) |
| KPI numbers | text-3xl | text-3xl (same) |
| Heatmap total | text-3xl | text-4xl |
| Card headers | text-base | text-base (same) |
| Labels | text-xs | text-xs (same) |
| Body text | text-sm | text-sm (same) |

Typography does NOT scale much. The extra desktop space goes to layout density, not bigger text.

---

## WHAT NOT TO DO

- Do NOT use rounded corners anywhere. `border-radius: 0` on everything.
- Do NOT add shadows or elevation to cards.
- Do NOT use a top horizontal navbar (the sidebar handles navigation).
- Do NOT center the layout in a narrow column on desktop — USE the space with the two-column grid.
- Do NOT make cards wider than necessary — the right column is fixed at 380px, not fluid.
- Do NOT use gradient backgrounds on UI elements.
- Do NOT use thin 1px borders — always 2px with foreground color.
- Do NOT add decorative elements, illustrations, or empty state graphics.
- Do NOT use a hamburger menu on desktop.
- Do NOT stretch the mobile bottom nav across a wide desktop screen.
- Do NOT make the heatmap small — it is the hero element and should command attention.

---

## COLOR SYSTEM (same as mobile — do not change)

```css
--background: oklch(0.96 0.01 75);
--foreground: oklch(0.13 0.03 45);
--card: oklch(0.93 0.02 72);
--primary: oklch(0.50 0.18 38);
--primary-foreground: oklch(0.97 0.008 75);
--accent: oklch(0.85 0.08 70);
--muted-foreground: oklch(0.50 0.04 55);
--destructive: oklch(0.50 0.25 28);
--border: oklch(0.75 0.04 65);
--heatmap-0: oklch(0.90 0.02 75);
--heatmap-1: oklch(0.82 0.12 85);
--heatmap-2: oklch(0.73 0.18 70);
--heatmap-3: oklch(0.62 0.20 55);
--heatmap-4: oklch(0.48 0.18 35);
--heatmap-5: oklch(0.35 0.14 30);
```

Fonts: Space Grotesk (headings/body), Space Mono (numbers/labels/badges/data).

---

## DESIGN INTENT

This desktop layout should feel like a **command center for a one-person sales machine**. The user sits down at the end of the day, sees their heatmap lighting up, checks which deals need follow-up, reviews their streak, and plans tomorrow. It should feel dense but organized — like a Bloomberg terminal designed by the Stripe design team. Every pixel earns its place. The heatmap is the emotional centerpiece — it's the thing that makes you proud or makes you work harder. The right column is the action column — goals, streaks, quick log, badges. The left column is the data column — numbers, history, patterns.

Use mock data throughout. Generate realistic-looking heatmap data with some empty days, clusters of activity, and a visible current streak. Show 8/20 badges unlocked. Daily mission at 45% (14/30 doors). Momentum at 72 (Strong). Current streak 12 days, best 21 days.
