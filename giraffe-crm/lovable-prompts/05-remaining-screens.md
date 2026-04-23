# Prompt 5 — Deals, Clients, Me Pages

Paste this after the capture flow works. These are simpler pages.

---

Build the remaining 3 tab pages: Deals, Clients, and Me.

## Deals Page (/deals)

Pipeline view of active deals. Three sections stacked vertically (each with label + count badge):

### LEADS section
- Houses where we have contact info but haven't quoted yet
- Each card: address (bold), contact name, "X days ago" in muted mono
- Mock: 3-4 cards

### QUOTED section
- Houses with an active quote pending
- Each card: address (bold), contact name, price in `font-bold font-mono` (e.g., "$229"), days since quote
- Mock: 2-3 cards

### WON section
- Recent closes / new customers
- Each card: address, contact name, price in primary color, "Won X days ago"
- Mock: 1-2 cards

Each card is tappable (just style the tap state for now). Standard card style: `border-2 border-foreground bg-card p-3`.

## Clients Page (/clients)

### Hero Section
- Total lifetime revenue in huge bold mono text using primary color (e.g., "$12,847")
- Below: "23 customers" in `text-xs font-mono text-muted-foreground`

### Sections (each with label + count badge):

**DUE FOR RECLEAN** — customers whose last cleaning was 2+ months ago
- Each card: name (bold), address (mono muted), last job date, "Reclean due" badge

**REVIEW NOT ASKED** — customers who completed a job but haven't been asked for a Google review
- Each card: name, address, last job date, "Ask for review" badge

**ALL CUSTOMERS** — full scrollable list
- Each card: name (bold), address, LTV amount in mono, total jobs count, last job date

## Me Page (/me)

### Profile Header
- Large circle... NO — large SQUARE avatar placeholder (remember, no border-radius), 80x80, border-2
- User name below in `text-xl font-bold`
- "Window Cleaning Pro" subtitle in muted text

### Today's Stats
4 stat cards in a 2x2 grid. Each card: `border-2 border-foreground bg-card p-4 text-center`
- **Knocks** — big number in `text-3xl font-bold font-mono`, label below in standard label style
- **Quotes** — same
- **Closes** — same
- **Close Rate** — percentage in primary color

### Bottom
- "Sign Out" button — small, muted, secondary style, at the very bottom

Use mock data for everything. Stats: 24 knocks, 6 quotes, 2 closes, 33% close rate.

## Reminder

On ALL pages, maintain:
- border-radius: 0 everywhere
- border-2 border-foreground on all cards/buttons/inputs
- Space Grotesk for text, Space Mono for numbers/labels
- OKLCH colors only
- No shadows, no gradients on UI
- active:translate-y-[2px] on all buttons
