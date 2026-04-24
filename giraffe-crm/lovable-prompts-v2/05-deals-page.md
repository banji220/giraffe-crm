# V2 Prompt 5 — Deals Page

Paste after the Today page is solid.

---

Build the Deals page. When "Deals" is clicked in the sidebar, show this.

## Page Header

- "DEALS" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground`
- "Pipeline" in `text-2xl font-bold`
- `mb-6`

## Pipeline Money Bar (full width, above the grid)

A single horizontal stacked bar showing dollar value per stage. `h-10 w-full flex` — three segments side by side, NO border-radius, NO gap between them:

- Leads segment: `bg-[var(--heatmap-1)]` — width proportional to leads $ value
- Quoted segment: `bg-[var(--heatmap-3)]` — width proportional to quoted $ value
- Won segment: `bg-[var(--heatmap-5)]` — width proportional to won $ value

Labels below the bar in a `flex justify-between`:
- "LEADS $380" in `text-xs font-mono font-bold` colored with heatmap-1
- "QUOTED $1,240" colored with heatmap-3
- "WON $890" colored with heatmap-5

`mb-6` below the bar.

## Layout: Two-Column Grid

```
grid grid-cols-[1fr_380px] gap-6
```

### LEFT COLUMN:

**HOTTEST section (needs action NOW):**
- Header: "HOTTEST" label + count badge + "NEEDS ACTION" on right in `text-[10px] font-mono text-destructive uppercase tracking-wider`
- Cards stacked vertically. Each card `border-2 border-foreground bg-card p-4 mb-3`:
  - Left edge: `border-l-4` colored urgency stripe inside the card (use a colored div, 4px wide, full height, absolute positioned on the left)
    - Red (`var(--destructive)`) for overdue
    - Orange (`var(--heatmap-3)`) for expiring
    - Primary (`var(--primary)`) for fresh
  - Content (with `pl-4` to clear the stripe):
    - Top row: Address in `text-sm font-bold` + price on right in `text-lg font-bold font-mono`
    - Second row: Contact name + status badge ("LEAD" or "QUOTED") in `text-[10px] font-mono font-bold uppercase border-2 border-foreground px-1.5 py-0.5`
    - Third row: urgency reason in `text-xs font-mono text-destructive` — "2d overdue", "Quote dying — 6d old", "Follow up today"
  - Right side: 📞 and 🧭 buttons stacked vertically
- Mock: 4 items — one "2d overdue" (red stripe), one "Quote dying — 6d old" (orange), one "Follow up today" (primary), one "Quoted yesterday" (primary)

**PIPELINE section (working deals, not urgent yet):**
- Header: "PIPELINE" label + count badge
- Same card structure but stripe is `var(--heatmap-2)` yellow for all
- Urgency line replaced with "Quoted 2d ago" or "Lead captured today" in `text-xs font-mono text-muted-foreground`
- Mock: 3 items

### RIGHT COLUMN:

**WON section (recent closes):**
- Header: "WON" label + count badge + "LAST 30 DAYS" on right
- Cards show: address, name, amount in `text-primary font-bold font-mono`, "Won 3d ago"
- Stripe: `var(--heatmap-5)`
- Mock: 2 items

**Pipeline Stats (below Won):**
Three small stat cards stacked vertically (`space-y-3`):
- Total Pipeline Value: "$1,620" in `text-2xl font-bold font-mono`
- Avg Deal Size: "$215"
- Avg Days to Close: "4.2"
Each: `border-2 border-foreground bg-card p-4`, number + label below

Empty state for HOTTEST (when no urgent items): "Pipeline is clean. Go knock some doors." in `text-sm font-mono text-muted-foreground text-center py-8`
