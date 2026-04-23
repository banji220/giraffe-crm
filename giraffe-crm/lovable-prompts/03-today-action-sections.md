# Prompt 3 — Today Page Action Sections

Paste this after the Today page header + QuickLog + DailyMission look right.

---

Add 4 action sections below the DailyMission card on the Today page. These are the things that need attention RIGHT NOW.

## Section Pattern

Each section has:
- A label in standard style (`text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground`)
- A count badge right-aligned on the same line (e.g., "3" in a small bordered badge)
- A list of cards below

## The 4 Sections

### 1. APPOINTMENTS TODAY
Houses with scheduled appointments for today.

### 2. JOBS TODAY
Scheduled window cleaning jobs for today.

### 3. FOLLOW-UPS DUE
Leads that need follow-up today or are overdue.

### 4. EXPIRING QUOTES
Quotes that haven't been touched in 5+ days — about to go cold.

## Card Design (same for all sections)

Each item is a card (`border-2 border-foreground bg-card p-3`) showing:

- **Left side:**
  - Due/time label badge at top — e.g., "10:00 AM", "2d overdue", "5d old"
  - If overdue or expiring: badge uses `text-destructive` color
  - Price in `font-bold font-mono` if available (e.g., "$229")
  - Contact name in `font-bold` (Space Grotesk)
  - Address below in `text-xs font-mono text-muted-foreground`

- **Right side (vertically centered):**
  - Call button (📞) — `w-9 h-9 border-2 border-foreground` square button
  - Navigate button (🧭) — same style, below the call button

## Empty State

When all sections are empty, show:
- "Nothing urgent. Go knock some doors." in muted text, centered
- "Open Map →" primary button below

Use 2-3 mock items per section so I can see the layout. Make one follow-up "2d overdue" with destructive coloring to show the urgency state.
