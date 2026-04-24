# V2 Prompt 6 — Clients Page

Paste after the Deals page works.

---

Build the Clients page. When "Clients" is clicked in the sidebar, show this.

## Page Header

- "CLIENTS" in `text-xs font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground`
- "Customer Base" in `text-2xl font-bold`
- `mb-6`

## Hero Stat (full width, above the grid)

A single row with the big number:
- "$12,847" in `text-5xl font-bold font-mono text-primary tabular-nums`
- "LIFETIME REVENUE" to the right of the number (same baseline) in `text-sm font-mono text-muted-foreground uppercase tracking-wider`
- Below: "23 customers · 47 total jobs" in `text-xs font-mono text-muted-foreground`

`mb-6` below.

## Layout: Two-Column Grid

```
grid grid-cols-[1fr_380px] gap-6
```

### LEFT COLUMN — All Customers List

**Search input at top:**
- `border-2 border-foreground bg-card font-mono text-sm px-4 py-3 w-full mb-4`
- Placeholder: "Search customers..."
- NO border-radius

**Customer list — scrollable, stacked cards:**
Each card: `border-2 border-foreground bg-card p-4 mb-3 cursor-pointer hover:bg-accent/30 transition-colors`

Card layout — single row with info spread across:
- Left: Name in `text-sm font-bold` + address below in `text-xs font-mono text-muted-foreground`
- Center: "12 jobs" in `text-xs font-mono text-muted-foreground` + "Last: Apr 15" below
- Right: LTV "$1,240" in `text-lg font-bold font-mono text-primary`

Mock: 8 customers with varying LTV amounts, job counts, and last job dates. Sort by LTV descending (highest paying customer first).

### RIGHT COLUMN — Action sections stacked:

**DUE FOR RECLEAN card:**
- `border-2 border-foreground bg-card p-4`
- Header: "DUE FOR RECLEAN" label + "4" count badge
- List of compact rows inside:
  - Name in `text-sm font-bold` + "Last clean: Feb 12" in `text-xs font-mono text-muted-foreground`
  - "RECLEAN DUE" badge in `text-[10px] font-mono font-bold uppercase border-2 border-primary text-primary px-2 py-0.5` on the right
- Mock: 4 items

**REVIEW NOT ASKED card:**
- `border-2 border-foreground bg-card p-4 mt-4`
- Header: "REVIEW NOT ASKED" label + "3" count badge
- Same compact row style:
  - Name + "Job completed: Apr 10" below
  - "ASK FOR REVIEW" badge on right in `text-[10px] font-mono font-bold uppercase border-2 border-foreground px-2 py-0.5`
- Mock: 3 items

**Google Calendar Connection card:**
- `border-2 border-foreground bg-card p-4 mt-4`
- 📅 emoji + "GOOGLE CALENDAR" label
- "Connect to auto-sync jobs and follow-ups" in `text-xs font-mono text-muted-foreground`
- "CONNECT CALENDAR" primary button full width
- (This is a placeholder — functionality comes later)

The right column is the retention column. These are customers you already won — now maximize their value through recleans and reviews.
