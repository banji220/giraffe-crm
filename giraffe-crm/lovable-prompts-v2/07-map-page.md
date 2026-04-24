# V2 Prompt 7 — Map Page

Paste after the Clients page works.

---

Build the Map page. This page is DIFFERENT from all others — it does NOT use the two-column grid.

## Layout

- The sidebar (240px) stays visible on the left — do not hide it
- The map fills the ENTIRE remaining viewport: `position: fixed; top: 0; right: 0; bottom: 0; left: 240px;`
- No padding, no max-width, no content container — the map IS the page
- No scroll — the map handles its own pan/zoom

## Map Placeholder

Since we can't use Mapbox in Lovable yet, create a placeholder:
- Full area filled with `bg-muted` and a subtle grid pattern (CSS grid lines every 40px using a background-image with repeating-linear-gradient, color `var(--foreground)` at 5% opacity)
- Center text: "MAP VIEW" in `text-2xl font-mono font-bold text-muted-foreground/30 uppercase tracking-widest`
- Scatter 15-20 mock pin dots on the placeholder at random positions — each is a `w-4 h-4` colored square (NO border-radius) with absolute positioning. Use a mix of pin colors:
  - Green (`#14B714`) — 3 pins (won)
  - Purple (`#A12EDA`) — 4 pins (quoted)
  - Blue (`#5858CE`) — 5 pins (not home)
  - Orange (`#EBA313`) — 3 pins (not interested)
  - Grey (`#B7B7B7`) — 4 pins (unknocked)

## Map Controls (floating on top of map)

### Top-left: Search bar
- `position: absolute; top: 20px; left: 20px;`
- `w-80 border-2 border-foreground bg-card font-mono text-sm px-4 py-3`
- Placeholder: "Search address..."
- NO border-radius, NO shadow

### Top-right: Filter buttons
- `position: absolute; top: 20px; right: 20px;`
- Row of small toggle buttons: "All", "Leads", "Quoted", "Won", "Not Home"
- Same toggle style as metric switcher: `text-[10px] font-mono font-bold uppercase px-2.5 py-1.5 border-2 border-foreground`
- Active: inverted. Default: "All" active.

### Bottom-right: "KNOCK HERE" FAB button
- `position: absolute; bottom: 32px; right: 20px;`
- `bg-foreground text-background border-2 border-foreground font-mono font-bold text-sm uppercase tracking-wider px-6 py-4 active:translate-y-[2px] transition-transform`
- This is the primary action — the button a user taps to log a knock at their current location

## Right Detail Panel (slides in when a pin is clicked)

When any mock pin is clicked, a detail panel slides in from the right:

- `position: fixed; top: 0; right: 0; bottom: 0; width: 420px;`
- `bg-card border-l-2 border-foreground`
- `transform: translateX(100%)` by default, `translateX(0)` when open, `transition: transform 200ms ease-out`
- Has its own scroll (`overflow-y-auto`)
- `padding: 24px`
- `z-index: 50` (above map, below any modals)

### Panel content:
- Close button: ✕ in top-right corner, `w-9 h-9 border-2 border-foreground`
- Address: "📍 1847 Oak Valley Dr" in `text-lg font-bold`
- Status badge: "QUOTED" in `text-[10px] font-mono font-bold uppercase border-2 border-primary text-primary px-2 py-0.5`
- Contact: "John Smith" + "(949) 555-1234" in `text-sm font-mono`
- Price: "$229" in `text-3xl font-bold font-mono text-primary mt-3`
- Anchor price above: "Normally $279" in `text-xs font-mono text-muted-foreground line-through`

- Quick actions row: 4 buttons — 📞 Call, 💬 Text, 🧭 Navigate, ✏️ Edit — each `w-12 h-12 border-2 border-foreground inline-flex items-center justify-center text-lg` in a row with `gap-2`

- Service details: "20 windows · Exterior" in `text-xs font-mono text-muted-foreground mt-4`
- Notes: tags as small badges ("Dog", "Gate code") + free text

- Timeline section at bottom:
  - "HISTORY" label
  - List of events, each: date in `text-[10px] font-mono text-muted-foreground` + outcome badge + note
  - Mock: 3 entries — "Knocked: Not home", "Knocked: Quoted $229", "Knocked: Appointment set"

- Bottom danger zone: "Mark as Avoid" and "Remove Pin" as small muted text links

Make one pin "active" by default so the detail panel is visible on load — showing how the layout works with both the map and the detail panel visible.
