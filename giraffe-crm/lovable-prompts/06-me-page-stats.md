# Prompt 6 — Me Page: Profile + Stats + Quick Log

Paste this after the main app screens (Prompts 1-5) are working. This starts the Me page rebuild — the gamification hub.

---

Rebuild the Me page (/me) as the personal stats and gamification hub. This is where the user checks their performance, sees streaks, earns badges, and gets motivated. Stack everything vertically — it's a long scrollable page.

## Profile Header

- Square avatar placeholder (80x80, `border-2 border-foreground`, NO border-radius — remember, zero rounded corners in this app)
- User name below: `text-xl font-bold` (Space Grotesk)
- Subtitle: "Window Cleaning Pro" in `text-xs font-mono text-muted-foreground uppercase tracking-wider`

## Today's Stats

4 stat cards in a 2x2 grid. Each card: `border-2 border-foreground bg-card p-4 text-center`

| Stat | Value | Style |
|------|-------|-------|
| Knocks | 24 | `text-3xl font-bold font-mono` |
| Quotes | 6 | `text-3xl font-bold font-mono` |
| Closes | 2 | `text-3xl font-bold font-mono` |
| Close Rate | 33% | `text-3xl font-bold font-mono text-primary` |

Label below each number: standard label style (`text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground`)

## Quick Log Card

Below the stats grid. This is for speed-logging door knocks without opening the map.

- Section label: "QUICK LOG" with today's count on the right (e.g., "Today: **24**" in mono)
- 4 big tap buttons in a row: **+1**, **+5**, **+10**, **+25**
- Each button: tall (56px height minimum), `border-2 border-foreground bg-card font-mono font-bold text-2xl`
- Below each number: tiny text "door" / "doors" in `text-[9px] text-muted-foreground`
- On tap: button briefly flashes inverted (`bg-foreground text-background`) for 600ms, then a small feedback line appears below: "Logged 5 doors" that fades after 600ms
- `active:translate-y-[2px]` on every button
- Touch targets must be fat — this gets used fast while walking between houses

## Daily Mission Card

Below Quick Log. Tracks progress toward a daily door target.

- Section label: "DAILY MISSION" with emoji 🎯 (changes to 🔥 when in progress, 🏆 when complete)
- Status badge on the right: "NOT STARTED" / "IN PROGRESS" / "MISSION COMPLETE" in mono uppercase bordered badge
- Progress bar: `h-6 w-full bg-muted` (no border-radius), filled portion uses heatmap colors:
  - 0-30%: `--heatmap-2`
  - 31-60%: `--heatmap-3`
  - 61-99%: `--heatmap-4`
  - 100%: `--heatmap-5`
- Centered text overlay on the progress bar: "14 / 30 doors" in `text-xs font-mono font-bold`
- Below the bar: editable target (small "Edit" button toggles an inline input)
- Smart suggestion text in `text-sm font-mono text-muted-foreground`:
  - 0 doors before 2pm: "Clock's ticking. First knock sets the tone."
  - 0 doors after 2pm: "Day's slipping — start now, finish strong."
  - Under 30%: "Good start. Stay consistent and stack the numbers."
  - 40-70%: "Solid pace. Keep the momentum going."
  - Over 70%: "You're on track for a strong day."
  - 5 or fewer remaining: "Just 3 more. You're right there."
  - Complete: "Mission complete. Anything extra is bonus."
  - Over 150%: "Beast mode. You've blown past the goal."

Use mock data: 14 doors knocked, target 30. Show the "In progress" state.
