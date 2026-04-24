# V2 Prompt 1 — Design System + Desktop Shell

Start a new project. This is a field sales CRM for a window cleaning business. We are building DESKTOP-FIRST, then making it responsive later.

---

## Tech

React, TailwindCSS, CSS custom properties. Import Google Fonts: `Space+Grotesk:wght@400;500;700` and `Space+Mono:wght@400;700`.

## Colors (OKLCH only — no hex, rgb, or hsl anywhere)

```css
:root {
  --background: oklch(0.96 0.01 75);
  --foreground: oklch(0.13 0.03 45);
  --card: oklch(0.93 0.02 72);
  --primary: oklch(0.50 0.18 38);
  --primary-foreground: oklch(0.97 0.008 75);
  --accent: oklch(0.85 0.08 70);
  --muted: oklch(0.88 0.03 72);
  --muted-foreground: oklch(0.50 0.04 55);
  --destructive: oklch(0.50 0.25 28);

  --heatmap-0: oklch(0.90 0.02 75);
  --heatmap-1: oklch(0.82 0.12 85);
  --heatmap-2: oklch(0.73 0.18 70);
  --heatmap-3: oklch(0.62 0.20 55);
  --heatmap-4: oklch(0.48 0.18 35);
  --heatmap-5: oklch(0.35 0.14 30);
}
```

## Typography

- **Space Grotesk** — headings, body text, buttons
- **Space Mono** — numbers, stats, labels, badges, timestamps, data

## Shape Rules (apply globally, no exceptions)

- `border-radius: 0` on EVERYTHING. No rounded corners. No pills. No circles. Squares and rectangles only.
- All cards, buttons, inputs: `border-2 border-foreground` (use the foreground color, not grey)
- No shadows. No box-shadow anywhere.
- No gradients on UI elements.
- All buttons: `active:translate-y-[2px] transition-transform` for physical press feel.

## Component Patterns

- **Card:** `border-2 border-foreground bg-card p-5`
- **Button (primary):** `bg-foreground text-background border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider px-4 py-2.5`
- **Button (secondary):** `bg-card text-foreground border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider px-4 py-2.5`
- **Label:** `text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground`
- **Input:** `border-2 border-foreground bg-card text-foreground font-mono text-base p-3`

## Desktop Shell Layout

Build this exact structure. It is the permanent frame — all pages render inside it.

### Left Sidebar — 240px wide, fixed position, full viewport height

- Background: `bg-foreground` (dark — inverted from the rest of the app)
- All text inside: light colored (`text-background` or `opacity-60` variants)
- Padding: `px-5 py-6`

**Top section:**
- "GIRAFFE" in `text-sm font-mono font-bold uppercase tracking-[0.3em] text-background`
- "FIELD CRM" below in `text-[10px] font-mono uppercase tracking-wider text-background/50`
- Divider below: `border-t border-background/10 mt-5 mb-4`

**Navigation — 5 items stacked vertically with gap-1:**
Each item is a button spanning full width:
- `px-4 py-3 text-sm font-mono font-bold uppercase tracking-wider text-left`
- Icon on the left (use text characters: ⚡ Today, ◎ Deals, 🗺 Map, 👥 Clients, 👤 Me)
- Badge count on the right for Today (3) and Deals (5) — small `text-[10px] bg-background/20 text-background px-1.5 py-0.5 font-mono font-bold`
- Inactive: `text-background/60 hover:bg-background/10`
- Active: `bg-background/15 text-background border-l-3 border-primary`

**Bottom section (anchored to bottom of sidebar):**
- Divider: `border-t border-background/10 mb-4`
- User row: square avatar (40x40, `border-2 border-background/20`, NO border-radius) + "Holy Giraffe" name in `text-sm font-mono font-bold text-background` + "Sign out" below in `text-[10px] font-mono text-background/40 uppercase tracking-wider hover:text-background/60 cursor-pointer`

### Main Content Area — right of sidebar

- `margin-left: 240px`
- `padding: 32px 40px`
- `max-width: 1400px` for inner content
- `background: var(--background)`

For now, just show a placeholder page title "PERFORMANCE" in label style + "Holy Giraffe" in `text-2xl font-bold` below it. We will add page content in the next prompts.

## Verification

This prompt should produce: a dark sidebar on the left with navigation, a warm-toned main content area on the right, correct fonts loaded, correct colors applied, zero rounded corners anywhere, thick 2px borders on everything. Click through the 5 nav items — they should highlight as active. The sidebar should NOT scroll — it's fixed. The main content area should scroll independently.

Do not add any page content beyond the placeholder title. Do not add a bottom navigation bar. Do not add a top horizontal navbar. The sidebar IS the navigation.
