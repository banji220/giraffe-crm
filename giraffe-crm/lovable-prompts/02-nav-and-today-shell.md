# Prompt 2 — Bottom Nav + Today Page Shell

Paste this after the design system looks right.

---

Add a bottom navigation bar and build the Today page shell.

## Bottom Navigation Bar

Five tabs, always visible at bottom:
1. **Today** (⚡) — daily action hub
2. **Deals** (◎) — pipeline view
3. **Map** (🗺️) — center tab, slightly larger icon, the primary tool
4. **Clients** (👥) — customer list
5. **Me** (👤) — profile + stats

Style: `border-t-2 border-foreground bg-card`. Active tab uses `text-primary` color. Inactive tabs use `text-muted-foreground`. Add small badge dots for pending items (just static dots for now).

## Today Page (/today)

This is the "What do I need to DO right now?" screen.

### Header
- Top-left: "TODAY" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary`
- Below: Full date like "Tuesday, April 21" in `text-2xl font-bold` (Space Grotesk)
- Below: Stats line: "12 doors knocked · 3 actions pending" in `text-xs font-mono text-muted-foreground`

### QuickLog Card
- Label above: "LOG DOORS" in the standard label style
- 4 big tap buttons in a row: **+1**, **+5**, **+10**, **+25**
- Each button: `border-2 border-foreground bg-card` with the number in `text-xl font-bold font-mono`
- On tap, button briefly flashes inverted (`bg-foreground text-background`) then returns
- Minimum button height: 56px — these get tapped fast while walking

### DailyMission Card
- Label: "DAILY MISSION" in standard label style
- Progress bar: simple div, no border-radius, height 8px, background uses the heatmap gradient based on completion percentage
- Text: "14 / 30 doors" with percentage on the right
- Status badge below: "IN PROGRESS" or "MISSION COMPLETE" in `font-mono text-xs uppercase` — use a bordered badge
- Smart suggestion: "At this pace, you'll hit 30 by 2:45 PM" in `text-xs text-muted-foreground`

Use static/mock data for now. No API calls. The page should feel fast and punchy — the first thing you see when you open the app in the morning.
