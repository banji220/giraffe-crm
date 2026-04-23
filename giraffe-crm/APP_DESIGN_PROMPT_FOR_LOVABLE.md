# Giraffe CRM — App Design Prompt (app.holygiraffe.com)

**Role:** Expert mobile-first UI/UX Designer and React Developer.
**Style:** "Brutalist Warm" — clean brutalism meets warm amber tones. Think Notion's clarity with a door-knocker's energy.
**Stack:** React, TailwindCSS, CSS custom properties.
**Target:** Mobile phone, one-handed use, standing outside in the sun.

---

## WHAT THIS IS

A field sales CRM for a window cleaning door-knocking business. One person knocks doors, quotes on the spot, schedules jobs, and follows up. Everything happens on a phone, standing at someone's front door, with one hand free.

This is NOT a dashboard. This is NOT an admin panel. This is a **field weapon** — fast, brutal, zero friction.

---

## DESIGN SYSTEM (Non-negotiable — follow exactly)

### Colors (OKLCH color space)

```css
/* Light mode — warm but ALIVE, not washed out */
--background: oklch(0.96 0.01 75);        /* warm cream with yellow push */
--foreground: oklch(0.13 0.03 45);        /* rich near-black */
--card: oklch(0.93 0.02 72);              /* warm card — NOT same as background */
--primary: oklch(0.50 0.18 38);           /* SATURATED amber-brown — must POP */
--primary-foreground: oklch(0.97 0.008 75);
--accent: oklch(0.85 0.08 70);            /* warm accent with real color */
--muted-foreground: oklch(0.50 0.04 55);  /* readable, not invisible */
--destructive: oklch(0.50 0.25 28);       /* hot red — urgent */
--border: oklch(0.75 0.04 65);

/* Heatmap gradient — VIBRANT. Each level must be visibly different.
   Think autumn leaves, hot coals, espresso. NOT beige-to-slightly-less-beige. */
--heatmap-0: oklch(0.90 0.02 75);   /* empty — light warm grey */
--heatmap-1: oklch(0.82 0.12 85);   /* low — real yellow, visible */
--heatmap-2: oklch(0.73 0.18 70);   /* medium — bright orange-amber */
--heatmap-3: oklch(0.62 0.20 55);   /* good — rich burnt orange */
--heatmap-4: oklch(0.48 0.18 35);   /* high — deep red-brown */
--heatmap-5: oklch(0.35 0.14 30);   /* max — near-black chocolate with red */
```

### Typography

- **Display font:** Space Grotesk (headings, labels, buttons)
- **Mono font:** Space Mono (numbers, data, timestamps, badges)
- Import from Google Fonts: `Space+Grotesk:wght@400;500;700` and `Space+Mono:wght@400;700`

### Shape Language

- **border-radius: 0px on EVERYTHING.** No rounded corners. No pills. No circles. Sharp rectangles only.
- **Borders:** `border: 2px solid` using foreground color. Thick, visible, intentional.
- **No shadows.** Zero. None. No box-shadow anywhere.
- **No gradients** on UI elements (gradients only in heatmap progress bars).
- Buttons press down on tap: `active:translate-y-[2px]` with `transition-transform`.

### Component Patterns

- **Cards:** `border-2 border-foreground bg-card p-3` — no radius, no shadow
- **Buttons (primary):** `bg-foreground text-background border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider`
- **Buttons (secondary):** `bg-card text-foreground border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider`
- **Labels:** `text-xs font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground`
- **Section headers:** Same as labels but with a count badge right-aligned
- **Input fields:** `border-2 border-foreground bg-card text-foreground font-mono text-lg p-3` — no radius

---

## APP STRUCTURE (5 tabs + map)

### Bottom Navigation Bar
Five tabs in a bottom nav, always visible:
1. **Today** (⚡) — daily action hub
2. **Deals** (◎) — pipeline view
3. **Map** (🗺️) — center, larger icon, the primary tool
4. **Clients** (👥) — customer list
5. **Me** (👤) — profile + stats

The nav bar itself: `border-t-2 border-foreground bg-card`. Active tab uses `text-primary`. Badge dots for pending items.

---

## SCREEN DESIGNS

### 1. TODAY PAGE (/today)

The "What do I need to DO right now?" screen. Top to bottom:

**Header:**
- Top-left: "TODAY" label in xs mono uppercase tracking-[0.3em] text-primary
- Below: Full date "Tuesday, April 21" in text-2xl font-bold
- Below: Stats line: "12 doors knocked · 3 actions pending" in xs mono muted

**QuickLog Card:**
- A card with 4 big tap buttons in a row: +1, +5, +10, +25
- Each button: `border-2 border-foreground bg-card` with the number in `text-xl font-bold font-mono`
- Tapping flashes the button with `bg-foreground text-background` briefly
- Label above: "LOG DOORS" in xs mono uppercase

**DailyMission Card:**
- Progress bar using heatmap gradient colors (--heatmap-0 through --heatmap-5)
- Shows: "14 / 30 doors" with a percentage
- Status badge: "IN PROGRESS" or "MISSION COMPLETE" in mono uppercase
- Smart suggestion below: "At this pace, you'll hit 30 by 2:45 PM"
- The progress bar is a simple div with no border-radius, height 8px

**Action Sections (below the tracker):**
Four sections, each with a label + count + card list:

1. **APPOINTMENTS TODAY** — Houses with status "quoted" and follow-up date = today
2. **JOBS TODAY** — Scheduled jobs for today
3. **FOLLOW-UPS DUE** — Houses with status "lead" and follow-up due today or overdue
4. **EXPIRING QUOTES** — Houses with status "quoted" not touched in 5+ days

Each item is a card showing:
- Due label badge (time, "2d overdue", "5d old") — colored destructive if overdue
- Price in bold mono if available
- Contact name (bold) + address below (mono muted)
- Right side: Call button (📞) and Navigate button (🧭) — both `w-9 h-9 border-2 border-foreground`

Empty state: "Nothing urgent. Go knock some doors." + "Open map →" button

### 2. MAP PAGE (/map)

Full-screen Mapbox map with:
- Colored circle pins for each house (color = last knock outcome)
- Letter labels inside pins (NH, X, $, Q, etc.)
- GPS tracking with heading indicator
- Search bar (top-left, geocoder)
- "Knock Here" FAB button (bottom-right): `bg-foreground text-background border-2 border-foreground font-mono font-bold uppercase`

**On pin tap → Bottom sheet (HouseCard):**
- Slides up from bottom
- Address header with 📍
- Contact name + phone + status badge
- Money line (big number — LTV, quote price, or anchor)
- Next Best Action button (contextual: "Close the Deal", "Knock Again", "Offer Reclean")
- Quick actions row: Call / Text / Navigate
- Knock outcome grid (9 outcomes as colored circle buttons with letter labels)
- Timeline (unified feed of knocks + jobs, newest first)
- Bottom: "Mark as Avoid" + "Remove Pin" (buried, small text)

**On quote/close tap → Multi-step Capture Flow:**
See below.

### 3. CAPTURE FLOW (Multi-step sliding cards)

This replaces the old single-page quote form. It's the core UX innovation.

**Layout:**
- Full-screen bottom sheet
- Persistent address bar at top: `📍 123 Oak St` in a bordered card
- Dot progress indicator (not numbers — dots feel lighter)
- Cards slide left-to-right on "Next" tap or swipe
- Bottom bar: Back button (left) + Next/Done button (right, full-width primary)

**Card 1 — WHO:**
- Label: "WHO LIVES HERE?" in xs mono uppercase
- Fields: Name (text, autocapitalize), Phone (tel), Email (email)
- All fields use the brutal input style (border-2, no radius, mono font)

**Card 2 — WHEN:**
- Label: "WHEN IS THE JOB?" or "WHEN TO FOLLOW UP?"
- Quick date tiles: Today, Tomorrow, Wed, Thu, Fri, Sat, Sun + "Later"
- Each tile: `border-2 border-foreground font-mono text-xs uppercase` — active = inverted colors
- Time picker row: 9AM, 10AM, 11AM, 1PM, 2PM, 3PM as small bordered buttons
- This is where Google Calendar sync will fire

**Card 3 — WHAT:**
- Label: "WHAT ARE WE QUOTING?"
- Window count stepper: big − and + buttons flanking a large mono number
- Service type chips: Exterior, In+Out, Screens, Tracks — toggle buttons, active = inverted
- Price display card: "Normally $299" strikethrough + "$229" in big bold mono primary color
- "Edit price" link below (tappable to override)

**Card 4 — NOTES (skippable):**
- Label: "ANYTHING TO REMEMBER?"
- Quick tag chips: Dog, Gate code, Side door, Steep roof, Ladder needed, Cash only, Senior, etc.
- Free text area below
- This card is optional — user can skip straight to Done

**Key rule: Every card is a valid save point.** If you fill Card 1 and bail, the house gets name + phone saved. Card 2 locks the date. You never lose data.

### 4. DEALS PAGE (/deals)

Pipeline view of active deals. Three swim lanes (horizontal scroll or vertical sections):

1. **LEADS** — Houses with status "lead"
2. **QUOTED** — Houses with status "quoted"
3. **WON** — Houses with status "customer" (recent)

Each card: address, contact name, price, days since last touch. Tap to open house detail.

### 5. CLIENTS PAGE (/clients)

Hero: Total lifetime revenue in huge bold mono green number.
Below: "X customers" count.

Sections:
- **DUE FOR RECLEAN** — Customers with reclean_due_at approaching
- **REVIEW NOT ASKED** — Customers who haven't been asked for a review
- **ALL CUSTOMERS** — Full list

Each card: Name, address, LTV, total jobs, last job date.

### 6. ME PAGE (/me)

Profile + daily stats:
- User avatar + name
- Today's stats: Knocks, Quotes, Closes, Close Rate %
- Each stat in a bordered card with the number in huge mono font
- Sign out button at bottom (small, muted)

---

## CRITICAL RULES

1. **Mobile-first.** Every element designed for a 375px viewport, one thumb.
2. **No rounded corners.** Anywhere. Ever. `border-radius: 0`.
3. **No shadows.** Anywhere. Ever.
4. **border-2 border-foreground** on every card, button, and input.
5. **font-mono** on every number, stat, badge, timestamp, and label.
6. **Space Grotesk** for body text and headings.
7. **OKLCH colors only.** No hex, no rgb, no hsl.
8. **Tap targets minimum 44px.** This is used standing up with one hand.
9. **Uppercase tracking-wider mono** for all section labels and button text.
10. **Active states:** `active:translate-y-[2px]` on every button — feels physical.

---

## WHAT NOT TO DO

- No rounded buttons or pill shapes
- No card shadows or elevation
- No gradient backgrounds on UI (only heatmap progress)
- No thin 1px borders — always 2px
- No light grey placeholder borders — always foreground color
- No generic sans-serif — Space Grotesk or Space Mono only
- No dashboard-style charts or graphs
- No sidebar navigation
- No hamburger menus
- No modals (use bottom sheets)
- No loading spinners (use skeleton placeholders)
- No "enterprise CRM" patterns

---

## THE FEEL

Think: **a field notebook designed by a Swiss typographer who loves concrete.**

It should feel physical. Heavy borders. Sharp corners. Monospace numbers that look like they're stamped. Warm amber tones that feel like sunlight on paper. Every tap gives instant feedback. Nothing is decorative — everything earns its pixels.

This is not pretty. This is **functional and honest.** A tool that respects the person using it by not wasting their time.
