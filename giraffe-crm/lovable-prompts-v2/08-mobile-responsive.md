# V2 Prompt 8 — Mobile Responsive

Paste LAST, after all desktop pages are working correctly.

---

Make the app responsive for mobile and tablet. The desktop layout is the source of truth — do not change it. We are adding responsive behavior on top.

## Breakpoints

| Width | Layout |
|-------|--------|
| ≥ 1024px | Desktop — sidebar + two-column grid (keep as-is) |
| 768px – 1023px | Tablet — no sidebar, single column, max-w-lg centered, bottom tab nav |
| < 768px | Mobile — no sidebar, single column, full width, bottom tab nav |

## Changes for < 1024px:

### Hide the sidebar
- `display: none` on the sidebar at `max-width: 1023px`
- Main content: `margin-left: 0` (remove the 240px offset)

### Add bottom tab navigation
Show a bottom nav bar fixed to the bottom of the viewport:

- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;`
- `border-t-2 border-foreground bg-card`
- 5 tabs in a row (`flex justify-around`): Today (⚡), Deals (◎), Map (🗺), Clients (👥), Me (👤)
- Each tab: icon on top + label below in `text-[10px] font-mono font-bold uppercase`
- Active tab: `text-primary`
- Inactive: `text-muted-foreground`
- Badge dots on Today and Deals tabs (small square dot, 6x6, `bg-destructive`, NO border-radius, positioned top-right of icon)
- Tab bar height: ~64px
- Add `padding-bottom: 80px` to the main content so nothing gets hidden behind the nav

### Collapse two-column grids to single column
All pages: change `grid grid-cols-[1fr_380px]` to `grid grid-cols-1` at < 1024px. The right column content stacks below the left column content.

### KPI row: change from `grid-cols-5` to `grid-cols-2` on mobile
The 5 KPI cards become a 2-column grid. The 5th card (Revenue) spans full width below.

### Heatmap mobile behavior
- Show only last 90 days (not full year)
- Smaller cells: calculate to fill width with 13 columns (weeks) in the available space
- Remove the range toggle (always 90d on mobile)
- Keep metric switcher

### Map page on mobile
- Map fills entire viewport (no sidebar offset)
- Bottom nav still visible over the map
- "KNOCK HERE" button positioned above the bottom nav: `bottom: 80px`
- Detail panel: becomes a bottom sheet instead of right panel — slides up from the bottom, max-height 85vh, same content

### Today page on mobile
- Appointments and Jobs: change from `grid-cols-2` side by side to stacked vertically

### Deals page on mobile
- Pipeline money bar stays full width
- All sections stack vertically

### Clients page on mobile
- Hero stat: number on its own line, not inline with label
- Google Calendar card moves above the customer list (more discoverable on mobile)

## Typography on mobile
No changes to font sizes. The brutalist style works at the same sizes on mobile. The spacing and padding can tighten slightly:
- Card padding: `p-4` instead of `p-5`
- Page padding: `px-4 py-4` instead of `px-10 py-8`

## What NOT to do on mobile
- Do NOT show the sidebar as a hamburger menu or slide-out drawer — it simply doesn't exist on mobile
- Do NOT add swipe gestures between tabs — just tap the bottom nav
- Do NOT make cards horizontally scrollable — everything stacks vertically
- Do NOT change the color scheme, border thickness, or font families
- Do NOT add border-radius on mobile — zero rounded corners everywhere, always
