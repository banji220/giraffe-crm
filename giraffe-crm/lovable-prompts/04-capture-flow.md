# Prompt 4 — Capture Flow (Multi-Step Bottom Sheet)

Paste this after the Today page is solid. This is the core UX — the thing that makes this CRM different.

---

Create a multi-step bottom sheet capture flow. This is what opens when a salesperson taps "Close Deal", "Set Appointment", or "Save Quote" from the map. It must be FAST — every tap matters, the user is standing at someone's front door.

## Layout

- Full-screen bottom sheet that slides up from the bottom
- Semi-transparent backdrop behind it (black/40%)
- Top bar: Close button (✕) on left, dot progress indicator centered
- Persistent address bar below top bar: `📍 123 Oak St` in a bordered card — stays visible on all cards
- Cards slide left-to-right on "Next" tap (CSS transform translateX animation)
- Bottom bar: "Back" button (left, secondary style) + "Next" button (right, primary style, full-width)
- On the last card, "Next" becomes "Close Deal" / "Set Appointment" / "Save Quote"

## Dot Progress Indicator

Small square dots (not circles — remember, no border-radius), 2.5x2.5, border-2 border-foreground. Filled with primary color for completed/current steps, transparent for future steps.

## Card 1 — WHO

- Label: "WHO LIVES HERE?" in standard label style
- Three fields stacked:
  - **Name** — text input, autocapitalize words, autofocus
  - **Phone** — tel input with inputMode="tel"
  - **Email** — email input with inputMode="email"
- All inputs use the brutal style: `border-2 border-foreground bg-card font-mono text-lg p-3`, no border-radius

## Card 2 — WHEN

- Label: "WHEN IS THE JOB?" (or "WHEN TO FOLLOW UP?" depending on context)
- **Date tiles:** 8 buttons in a 4-column grid
  - Today, Tomorrow, then next 5 days by name (e.g., "Wed Apr 23", "Thu Apr 24"...), plus "Later"
  - Each: `border-2 border-foreground font-mono text-xs font-bold uppercase py-3`
  - Active = inverted colors (`bg-foreground text-background`)
  - Tapping "Later" shows a native date picker input below
- **Time picker row:** appears after a date is selected
  - 6 buttons in a row: 9 AM, 10 AM, 11 AM, 1 PM, 2 PM, 3 PM
  - Same toggle style as date tiles but smaller

## Card 3 — WHAT

- Label: "WHAT ARE WE QUOTING?"
- **Window count stepper:**
  - Big − button (56x56, border-2) | Large mono number in center (text-3xl) | Big + button
  - Steps by 5 (tapping + adds 5, tapping − subtracts 5, minimum 1)
  - The number is also an editable input for direct entry
- **Service type chips:** 4 toggle buttons in a 2-column grid
  - Exterior, In + Out, Screens, Tracks
  - Same toggle style: active = inverted, border-2, mono, uppercase
- **Price display card:** bordered card, centered text
  - "Normally $299" in small mono text with line-through (anchor price)
  - "$229" in `text-4xl font-black font-mono text-primary` (actual price)
  - "Edit price" small underlined link below to manually override

## Card 4 — NOTES (Skippable)

- Label: "ANYTHING TO REMEMBER?"
- **Quick tag chips:** flex-wrap row of toggle buttons
  - Tags: Dog, Gate code, Side door, Steep roof, Ladder needed, Cash only, Senior, Ring doorbell, Spanish
  - Same toggle style as service chips
- **Free text area** below: 3 rows, brutal input style, placeholder "Gate code, special instructions, anything..."
- This card is optional — the "Next" button should also show "Skip" as secondary text or the user can just tap Next without entering anything

## Key Behavior

- Swipe left/right should also navigate between cards (60px minimum swipe distance)
- Every card is a valid save point conceptually — partial data is never lost
- The flow should feel physical: cards sliding, buttons pressing down on tap
- Total time from open to close should feel like under 15 seconds for a simple quote

Use mock data. Make the address bar show "📍 1847 Oak Valley Dr". Default to 20 windows, Exterior selected, with a calculated price visible.
