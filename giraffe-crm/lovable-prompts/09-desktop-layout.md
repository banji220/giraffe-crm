# Prompt 9 — Desktop Layout: Map-Centric Command Center

This is the desktop experience. DO NOT apply any of this below 1024px — mobile stays exactly as it is with the bottom tab bar and single column. This prompt only affects screens 1024px and wider.

---

Rebuild the desktop layout as a map-centric command center. The core idea: the map is always visible as the base layer. Everything else is a panel that floats on top of it. The user never loses spatial context — they can see their territory while reviewing deals, checking follow-ups, or browsing clients.

## The Structure (3 layers)

### Layer 1: Full-Screen Map (always visible)
The Mapbox map fills the ENTIRE viewport edge to edge. It is always rendered, always interactive, always behind everything. It never goes away. On every "page," the map is there. Pins are always visible. GPS dot is always tracking.

### Layer 2: Left Panel (the command panel)
A floating panel on the left side of the screen. Think Google Maps' left panel on desktop.

- Width: 380px fixed
- Height: full viewport minus top bar
- Position: fixed, left: 0, top: 56px (below the top bar)
- Background: bg-card with border-r-2 border-foreground
- Has its own vertical scroll (overflow-y-auto)
- Can be collapsed to just icons (48px wide) by clicking a collapse button at the top — the map expands to fill the space
- Smooth transition on collapse/expand (200ms)

**Panel header: 5 navigation tabs across the top of the panel**
Same 5 sections as mobile (Today, Deals, Map, Clients, Me) but as horizontal text tabs inside the panel header, NOT a sidebar list. Style: `text-xs font-mono font-bold uppercase tracking-wider`. Active tab gets `border-b-2 border-primary text-primary`. Inactive: `text-muted-foreground`.

When "Map" tab is active, the left panel collapses to just the tab bar (or shows map controls/filters). The map gets the full stage.

**Panel content: shows the active tab's content**
Exactly the same content as the mobile pages, but rendered inside this 380px panel instead of full-screen. Today's cards, Deals pipeline, Clients list, Me page — all inside this panel. The components don't need to change, they just render in a narrower fixed container.

### Layer 3: Right Panel (detail panel — slides in on demand)
When the user clicks a pin on the map OR taps a card in the left panel, a detail panel slides in from the right.

- Width: 420px
- Height: full viewport minus top bar
- Position: fixed, right: 0, top: 56px
- Background: bg-card with border-l-2 border-foreground
- Slides in with a 200ms ease-out transform from translateX(100%) to translateX(0)
- Has a close button (✕) at the top right
- Has its own vertical scroll

**Right panel shows:**
- House detail card (contact info, pricing, service details, timeline, quick actions)
- OR the capture flow (when creating a quote/deal)
- OR client detail (when tapping a client from the list)

This means: you can be looking at your Deals list in the left panel, see the pins on the map, click a pin, and the house detail opens on the right — all three visible at once. You never navigate away. You never lose context.

### Top Bar
Minimal strip across the top, full width, above everything.

- Height: 56px
- Background: bg-foreground (dark — inverted from the rest of the app)
- Text: text-background (light on dark)
- Left: "GIRAFFE" logo text in font-mono font-bold uppercase tracking-widest
- Center: Search bar — `w-80 bg-background/10 border border-background/20 text-background font-mono text-sm px-4 py-2` — placeholder "Search address or client..." — NO border-radius
- Right: User avatar (square, 36x36, border-2 border-background/30) + notification dot if pending items

The top bar is always visible. It gives the app identity without wasting space.

## Key Interactions

**Clicking a pin on the map:**
- The pin highlights (ring-2 ring-primary)
- The right panel slides in with that house's detail
- The map smoothly pans/zooms to center the pin with enough room for both panels
- If the left panel is expanded, the map visible area is between the two panels

**Clicking a card in the left panel (deal, client, follow-up):**
- The right panel slides in with that house/client's detail
- The corresponding pin on the map gets highlighted
- The map pans to show that pin

**Closing the right panel:**
- Slides back out to the right (200ms)
- Pin highlight removes
- Map stays where it is

**Collapsing the left panel:**
- Click the collapse icon (« chevron) at the top of the panel
- Panel shrinks to 48px showing only the tab icons vertically
- Map area expands
- Click any icon to expand the panel back with that tab active

## Visual Rules (same as mobile, plus desktop additions)

- All the brutalist rules still apply: border-radius: 0, border-2, no shadows, Space Grotesk/Mono, oklch colors
- The panels should feel like they're floating on the map — the map is the ground, panels are cards laid on top
- The top bar is the only element that spans full width — everything else is either the map or a panel
- Panels get a very subtle `border-2 border-foreground` to separate from the map
- No blur or frosted glass effects — just solid bg-card backgrounds
- Transitions are quick (200ms) and use ease-out — nothing bouncy or playful, just snappy

## What This Replaces

- Kill the sidebar navigation that was generated before — there is no sidebar
- Kill any two-column grid layouts on desktop — content is always in the left panel (single column, 380px)
- Kill any full-width desktop page layouts — pages don't exist on desktop, only panels over the map

## The Feel

Think: Google Maps meets Bloomberg Terminal meets a field commander's war room. The map is your territory. The left panel is your battle plan. The right panel is your intel on the current target. You're sitting at HQ, planning tomorrow's assault on the neighborhood.

Use mock data for everything. Show the Today tab active in the left panel with a few cards, one pin highlighted on the map, and the right panel open with a house detail. The map should show ~20 pins scattered around a neighborhood.
