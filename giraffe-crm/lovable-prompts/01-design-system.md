# Prompt 1 — Design System Foundation

Paste this into Lovable first. Don't add any screens yet — just verify the visual system looks right.

---

Set up a mobile-first React app with TailwindCSS using CSS custom properties in OKLCH color space. This is a field sales CRM for a window cleaning business — used on a phone, standing outside, one-handed.

## Color System (OKLCH only — no hex, no rgb, no hsl)

```css
/* UI base — warm but with enough contrast to not look dead */
--background: oklch(0.96 0.01 75);        /* warm cream, slight yellow push */
--foreground: oklch(0.13 0.03 45);        /* rich near-black with warmth */
--card: oklch(0.93 0.02 72);              /* warm card — NOT the same as background */
--primary: oklch(0.50 0.18 38);           /* SATURATED warm brown-amber — this must POP */
--primary-foreground: oklch(0.97 0.008 75);
--accent: oklch(0.85 0.08 70);            /* warm accent with actual color */
--muted-foreground: oklch(0.50 0.04 55);  /* readable muted, not invisible */
--destructive: oklch(0.50 0.25 28);       /* hot red — urgent, not dusty */
--border: oklch(0.75 0.04 65);

/* Heatmap gradient — VIBRANT. These cells must jump off the screen.
   Think autumn leaves, hot coals, espresso. NOT beige-to-slightly-less-beige. */
--heatmap-0: oklch(0.90 0.02 75);   /* empty — light warm grey */
--heatmap-1: oklch(0.82 0.12 85);   /* low — real yellow, visible */
--heatmap-2: oklch(0.73 0.18 70);   /* medium — bright orange-amber */
--heatmap-3: oklch(0.62 0.20 55);   /* good — rich burnt orange */
--heatmap-4: oklch(0.48 0.18 35);   /* high — deep red-brown, like dried blood */
--heatmap-5: oklch(0.35 0.14 30);   /* max — near-black chocolate with red undertone */
```

**IMPORTANT:** The heatmap colors MUST be visibly different from each other at a glance. If you squint and levels 1-3 look the same, you've failed. Each step should be an obvious jump in saturation and darkness. Look at GitHub's contribution graph or the old version of this app — those cells POP. That's what we need.

## Typography

- **Display font:** Space Grotesk (headings, labels, buttons) — import from Google Fonts: `Space+Grotesk:wght@400;500;700`
- **Mono font:** Space Mono (numbers, data, timestamps, badges) — import: `Space+Mono:wght@400;700`

## Shape Rules (Non-negotiable)

- **border-radius: 0px on EVERYTHING.** No rounded corners. No pills. No circles. Sharp rectangles only.
- **Borders:** `border: 2px solid` using foreground color. Thick, visible, intentional.
- **No shadows.** Zero. None. No box-shadow anywhere.
- **No gradients** on UI elements (gradients only allowed in heatmap progress bars).
- Buttons press down on tap: `active:translate-y-[2px]` with `transition-transform`.
- Minimum tap target: 44px. This is used standing up with one hand.

## Component Patterns

- **Cards:** `border-2 border-foreground bg-card p-3` — no radius, no shadow
- **Buttons (primary):** `bg-foreground text-background border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider`
- **Buttons (secondary):** `bg-card text-foreground border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider`
- **Labels:** `text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground`
- **Input fields:** `border-2 border-foreground bg-card text-foreground font-mono text-lg p-3` — no radius

## Verification Page

Create a single page that demonstrates all components so I can verify the system before building screens:
- A section label ("SAMPLE SECTION" with a count badge)
- A card with some text content
- A primary button and a secondary button
- An input field with a label
- A heatmap progress bar (6 segments showing the gradient from heatmap-0 to heatmap-5)
- A stat card showing a big mono number

The feel: **a field notebook designed by a Swiss typographer who loves concrete.** Heavy borders. Sharp corners. Monospace numbers that look stamped. Warm amber tones like sunlight on paper. Nothing decorative — everything earns its pixels.
