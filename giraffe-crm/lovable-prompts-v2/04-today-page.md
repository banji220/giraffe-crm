# V2 Prompt 4 — Today Page

Paste after the Me page is solid.

---

Build the Today page. When "Today" is clicked in the sidebar, the main content area shows this page.

## Page Header (full width)

- "TODAY" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-primary`
- "Wednesday, April 22" in `text-2xl font-bold` (Space Grotesk)
- "6 doors knocked · 10 actions pending" in `text-xs font-mono text-muted-foreground`
- `mb-6` below

## Layout: Two-Column Grid

```
grid grid-cols-[1fr_380px] gap-6
```

### LEFT COLUMN — stacked vertically with `space-y-4`:

**Quick Log Card:**
- `border-2 border-foreground bg-card p-5`
- Header: "QUICK LOG" + "Today: **6**" on right
- 4 buttons: +1, +5, +10, +25 in `grid grid-cols-4 gap-2`
- Each: `border-2 border-foreground bg-card text-xl font-bold font-mono py-3 text-center active:translate-y-[2px]`

**Daily Mission Card:**
- Same as on Me page: progress bar with heatmap colors, "14 / 30 doors", suggestion text

**Appointments & Jobs — side by side:**
`grid grid-cols-2 gap-4`

**APPOINTMENTS TODAY card:**
- `border-2 border-foreground bg-card p-4`
- Header: "APPOINTMENTS TODAY" label + "2" count badge
- Stacked list of appointment cards inside, each with `border-2 border-foreground p-3 mb-2`:
  - Time badge: "10:00 AM" in `text-[10px] font-mono font-bold border-2 border-foreground px-2 py-0.5 inline-block mb-1`
  - Price on the right: "$38" in `text-lg font-bold font-mono`
  - Contact name: "MR PATEL" in `text-sm font-bold uppercase`
  - Address: "20 Oak Street" in `text-xs font-mono text-muted-foreground`
  - Action buttons below: 📞 and 🧭 as two small square buttons (`w-9 h-9 border-2 border-foreground inline-flex items-center justify-center`) side by side

**JOBS TODAY card:**
- Same structure, 3 mock items

### RIGHT COLUMN — stacked vertically with `space-y-4`:

**FOLLOW-UPS DUE card:**
- `border-2 border-foreground bg-card p-4`
- Header: "FOLLOW-UPS DUE" label + "3" count badge
- List of cards, each with:
  - Urgency badge at top: "TODAY" in `text-[10px] font-mono font-bold border-2 border-foreground px-2 py-0.5` or "1D OVERDUE" / "3D OVERDUE" in `text-[10px] font-mono font-bold bg-destructive text-background px-2 py-0.5`
  - Contact name bold + address in mono muted below
  - 📞 and 🧭 buttons on the right
- Mock: one "TODAY", one "1D OVERDUE", one "3D OVERDUE"

**EXPIRING QUOTES card:**
- Same structure
- Urgency badges: "6D OLD", "7D OLD" in destructive style
- Show price on each card
- Mock: 2 items

The right column is the URGENCY column. Follow-ups and expiring quotes — the stuff that costs you money if you ignore it. It should feel like a warning panel.
