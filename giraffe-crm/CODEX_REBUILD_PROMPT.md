# GIRAFFE CRM — Full SaaS Rebuild Prompt

> Give this entire document to Codex, Claude, or any AI coding agent as the system prompt for a ground-up rebuild.

---

## WHAT YOU'RE BUILDING

Giraffe CRM — the fastest field sales + service execution platform for door-to-door home service businesses. Think "Salesforce meets Google Maps meets a stopwatch" — but stripped of every feature that doesn't help a salesperson standing at a door with one hand on their phone.

This is NOT a generic CRM. This is a **vertical SaaS** for:
- Window cleaning companies
- Pressure washing crews
- Lawn care operators
- Solar sales teams
- Pest control routes
- Roofing estimators
- Any door-to-door home service business

**Business model**: Multi-tenant SaaS. Free tier (1 user, 100 houses). Pro ($49/mo per user). Enterprise (custom).

**URL**: crm.holygiraffe.com

---

## CORE PRODUCT THESIS

A door-to-door salesperson has **under 60 seconds** between the homeowner opening the door and losing their attention. Every tap, every form field, every loading spinner costs conversion rate.

The entire product exists to optimize ONE metric: **time from knock to captured revenue**.

Secondary metrics:
- Follow-up execution rate (% of scheduled follow-ups actually completed)
- Territory saturation (% of houses in a neighborhood knocked)
- Reclean retention rate (% of customers who rebook)
- Team velocity (doors/hour across the org)

---

## DESIGN PHILOSOPHY

### The 3-Second Rule
Every screen must answer its primary question within 3 seconds of opening. If a user has to scroll or think to understand what to do next — the screen failed.

### Mobile-First Is Not Optional
This app is used:
- Outside, standing on a porch
- On a phone, one-handed
- In direct sunlight
- While talking to a homeowner
- With sweaty/dirty fingers

Design for thumb reach. Design for glare. Design for distraction.

### UI Principles
- **Map-first experience** — the map IS the app. Everything radiates from location.
- **Action-first UI** — every screen leads with "what should I do?" not "here's your data"
- **Zero-friction capture** — defaults over inputs, chips over typing, GPS over address entry
- **One-tap decisions** — the most common action is always one tap away
- **Brutalist aesthetic** — sharp borders, strong type hierarchy, zero border-radius, no gradients, no shadows. The UI should look like a precision instrument, not a toy.

### Design System
- **Typography**: Inter or Space Grotesk (display) + Space Mono (data/labels)
- **Colors**: OKLCH color space for perceptual uniformity. Warm palette — amber primary, cream background, ink foreground.
- **Heatmap scale**: 6-level color ramp (grey → yellow → orange → red) for activity visualization
- **Borders**: 2px solid, always. No border-radius anywhere.
- **Buttons**: `active:translateY(2px)` press feedback. Haptic vibrate on mobile.
- **Cards**: 2px border, 0 radius, padding 12-16px
- **Animations**: Minimal. Pin drops, card slides, flash feedback. No decorative motion.

---

## TECH STACK

### Frontend
- **Next.js 15+** (App Router, Server Components where possible)
- **React 19+**
- **TypeScript** (strict mode, no `any`)
- **Tailwind CSS 4** (utility-first, design tokens via CSS variables)
- **Mapbox GL JS** (map rendering, geocoding, directions)
- **Zustand** or **Jotai** for client state (replace raw useState for shared state)

### Backend
- **Supabase** (Postgres + Auth + Realtime + Edge Functions + Storage)
- **PostGIS** for spatial queries (houses have geography columns)
- **Row-Level Security (RLS)** for multi-tenant data isolation
- **Supabase Realtime** for live updates (new knocks, status changes, team activity)
- **Supabase Edge Functions** (Deno) for:
  - Google Calendar sync
  - Stripe billing webhooks
  - SMS/email notifications (Twilio / Resend)
  - AI-powered features (neighborhood scoring, smart scheduling)

### Infrastructure
- **Vercel** or **Cloudflare Pages** for frontend hosting
- **Supabase Cloud** for database + auth + realtime
- **Stripe** for billing
- **Twilio** for SMS
- **Resend** for transactional email
- **PostHog** or **Mixpanel** for product analytics
- **Sentry** for error tracking

### PWA
- Full Progressive Web App with:
  - Service worker for offline queue (knocks cached locally, synced when online)
  - App manifest for "Add to Home Screen"
  - Push notifications (web push API)
  - Background sync for data uploads

---

## DATABASE SCHEMA

### Multi-Tenancy Model

```
ORGANIZATIONS
├─ id (UUID, PK)
├─ name (TEXT) — "Tyler's Window Cleaning"
├─ slug (TEXT, UNIQUE) — "tylers-wc" (for subdomains if needed)
├─ owner_id (FK → auth.users)
├─ plan (ENUM: free, pro, enterprise)
├─ stripe_customer_id (TEXT)
├─ stripe_subscription_id (TEXT)
├─ settings (JSONB) — org-level config
│  ├─ default_rate_per_window (DECIMAL, default 7.00)
│  ├─ min_charge (DECIMAL, default 229)
│  ├─ anchor_min (DECIMAL, default 299)
│  ├─ reclean_cycle_days (INT, default 180)
│  ├─ dead_lockout_days (INT, default 90)
│  ├─ timezone (TEXT, default 'America/Los_Angeles')
│  ├─ service_types (TEXT[]) — customizable per org
│  └─ follow_up_defaults (JSONB) — per-outcome delay config
├─ created_at, updated_at

MEMBERSHIPS
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ user_id (FK → auth.users)
├─ role (ENUM: owner, admin, manager, rep)
├─ status (ENUM: active, invited, suspended)
├─ invited_email (TEXT) — for pending invites
├─ invited_at, joined_at
├─ created_at, updated_at
├─ UNIQUE(org_id, user_id)
```

### Core Tables

```
HOUSES — every physical address in the system
├─ id (UUID, PK)
├─ org_id (FK → organizations) — tenant isolation
├─ street_number, street_name, unit, city, state, postal_code, country
├─ full_address (TEXT, generated/computed)
├─ geom (GEOGRAPHY(Point, 4326)) — PostGIS spatial column
├─ neighborhood_id (FK → neighborhoods, nullable)
├─ status (ENUM: unknocked, lead, quoted, scheduled, customer, dead, avoid)
├─ dead_reason (ENUM: hard_no, not_interested, have_a_guy, tenant, other)
├─ dead_until (TIMESTAMPTZ) — soft lockout expiry
├─ contact_name, contact_phone, contact_email
├─ quoted_price, anchor_price (DECIMAL)
├─ window_count (INT)
├─ service_types (TEXT[])
├─ lifetime_value (DECIMAL, default 0)
├─ total_jobs (INT, default 0)
├─ knock_count (INT, default 0)
├─ last_knock_at (TIMESTAMPTZ)
├─ last_knock_outcome (TEXT)
├─ next_follow_up_at (TIMESTAMPTZ)
├─ reclean_due_at (TIMESTAMPTZ)
├─ assigned_to (FK → auth.users, nullable) — rep assignment
├─ tags (TEXT[])
├─ notes (TEXT)
├─ photos (TEXT[]) — Supabase Storage URLs
├─ metadata (JSONB) — extensible fields
├─ created_by (FK → auth.users)
├─ created_at, updated_at
├─ INDEXES: geom (GiST), status, org_id, assigned_to, next_follow_up_at, reclean_due_at
├─ RLS: org_id = current_user's org (via membership lookup)

KNOCKS — every interaction (door, call, text, quote)
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ house_id (FK → houses)
├─ user_id (FK → auth.users) — who knocked
├─ type (ENUM: door, call, text, quote, email)
├─ outcome (ENUM: not_home, not_interested, hard_no, have_a_guy, tenant, come_back, quoted, appointment_set, closed_on_spot)
├─ note (TEXT)
├─ follow_up_at (TIMESTAMPTZ)
├─ duration_seconds (INT, nullable) — time spent at door
├─ knocked_from (GEOGRAPHY(Point)) — GPS position when knocked
├─ photos (TEXT[]) — before/after, property condition
├─ created_at
├─ TRIGGER: knocks_after_insert → update house status, tracking fields, daily_stats
├─ INDEX: house_id + created_at, user_id + created_at

JOBS — scheduled and completed work
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ house_id (FK → houses)
├─ assigned_to (FK → auth.users)
├─ scheduled_at (TIMESTAMPTZ)
├─ started_at, completed_at (TIMESTAMPTZ)
├─ status (ENUM: scheduled, en_route, in_progress, completed, cancelled, no_show)
├─ price (DECIMAL)
├─ paid_amount (DECIMAL, default 0)
├─ payment_method (ENUM: cash, check, card, venmo, zelle, invoice)
├─ payment_status (ENUM: unpaid, partial, paid)
├─ service_types (TEXT[])
├─ window_count (INT)
├─ before_photos, after_photos (TEXT[])
├─ notes (TEXT)
├─ rating (INT, 1-5, nullable) — customer satisfaction
├─ google_calendar_event_id (TEXT)
├─ route_order (INT, nullable) — position in day's route
├─ created_at, updated_at
├─ TRIGGER: job_completed → update house LTV, total_jobs, schedule reclean

NEIGHBORHOODS — territory management
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ name (TEXT) — "Harbor View Estates"
├─ boundary (GEOGRAPHY(Polygon)) — drawn on map or auto-generated
├─ score (INT, 0-100) — AI-computed desirability score
├─ total_houses (INT)
├─ knocked_count, lead_count, customer_count, dead_count (INT)
├─ avg_home_value (DECIMAL, nullable) — from Zillow/census data
├─ avg_deal_size (DECIMAL)
├─ conversion_rate (DECIMAL) — % knocked → customer
├─ last_knocked_at (TIMESTAMPTZ)
├─ notes (TEXT)
├─ created_at, updated_at

DAILY_STATS — per-user activity gamification
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ user_id (FK → auth.users)
├─ date (DATE)
├─ doors (INT, default 0)
├─ conversations (INT, default 0)
├─ leads (INT, default 0)
├─ quotes (INT, default 0)
├─ appointments (INT, default 0)
├─ closes (INT, default 0)
├─ revenue (DECIMAL, default 0)
├─ hours_active (DECIMAL) — computed from first/last knock timestamps
├─ notes (TEXT)
├─ created_at, updated_at
├─ UNIQUE(org_id, user_id, date)

USER_SETTINGS — per-user preferences
├─ user_id (FK → auth.users, PK)
├─ org_id (FK → organizations)
├─ daily_target (INT, default 30)
├─ weekly_target (INT, default 150)
├─ default_service_types (TEXT[])
├─ notification_preferences (JSONB)
├─ created_at, updated_at

TEMPLATES — reusable message templates
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ type (ENUM: sms, email)
├─ name (TEXT) — "Quote follow-up"
├─ body (TEXT) — with {{variables}}
├─ variables (TEXT[]) — [contact_name, address, price]
├─ created_by, created_at, updated_at

AUTOMATIONS — trigger-based workflows
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ trigger (ENUM: knock_outcome, quote_created, job_completed, follow_up_due, reclean_due)
├─ conditions (JSONB) — filter rules
├─ action (ENUM: send_sms, send_email, create_task, assign_rep, schedule_follow_up)
├─ action_config (JSONB) — template_id, delay, assignee, etc.
├─ enabled (BOOLEAN, default true)
├─ created_at, updated_at

REVIEW_REQUESTS — post-job review solicitation
├─ id (UUID, PK)
├─ org_id (FK → organizations)
├─ job_id (FK → jobs)
├─ house_id (FK → houses)
├─ sent_at (TIMESTAMPTZ)
├─ channel (ENUM: sms, email)
├─ review_url (TEXT) — Google/Yelp review link
├─ clicked_at (TIMESTAMPTZ, nullable)
├─ reviewed_at (TIMESTAMPTZ, nullable)
├─ rating (INT, nullable)
├─ created_at
```

### RPC Functions (PostGIS)

```sql
-- Spatial house query for map view
get_houses_in_bbox(org_id, min_lng, min_lat, max_lng, max_lat, max_rows)
  → houses within bounding box, sorted by status priority

-- Neighborhood auto-detection
assign_neighborhood(house_id)
  → finds which neighborhood polygon contains the house point

-- Territory stats rollup
compute_neighborhood_stats(neighborhood_id)
  → recalculates all counts and rates for a neighborhood

-- Smart follow-up queue
get_follow_up_queue(org_id, user_id?, limit)
  → prioritized list of houses needing follow-up, weighted by:
    days_overdue × deal_value × conversion_probability

-- Route optimization
optimize_route(job_ids[])
  → returns job_ids in optimal driving order (nearest-neighbor or TSP)
```

---

## FEATURES — COMPLETE SPEC

### 1. MAP VIEW (Primary Screen)

The map IS the app. When a rep opens Giraffe, they see the map centered on their GPS position with every house in a 1-mile radius rendered as colored pins.

**Pin System:**
- Each pin is colored by its LAST KNOCK OUTCOME using a 9-color palette with 40°+ hue spacing for maximum visual distinctness
- Pins show 1-2 letter abbreviations inside (NH = Not Home, $ = Quoted, ✓ = Customer, X = Hard No, etc.)
- Unknocked houses: grey pins
- Avoid houses: black pins with red stroke
- Pins scale on hover/tap for fat-finger friendliness

**Pin Color Palette:**
```
not_home:         #5858CE (blue)
not_interested:   #EBA313 (orange)  
hard_no:          #DD1111 (red)
have_a_guy:       #D8269D (magenta)
tenant:           #2496D0 (cyan)
come_back:        #91CE16 (chartreuse)
quoted:           #A12EDA (purple)
appointment_set:  #1ABB85 (teal)
closed_on_spot:   #14B714 (green)
unknocked:        #B7B7B7 (grey)
avoid:            #262626 (black + red stroke)
```

**Map Interactions:**
- Tap pin → slide up HouseCard (bottom sheet)
- Long-press empty spot → create new house at that location (reverse geocode)
- Pinch zoom → reload houses for new bbox
- Search bar → Mapbox Geocoder, fly to address
- GPS tracking → blue dot with accuracy ring
- Layer toggles: satellite, street, heatmap overlay

**Territory Overlay:**
- Toggle neighborhood boundaries on map
- Color neighborhoods by: score, saturation %, conversion rate, avg deal size
- Show neighborhood name + key stat in a floating label

### 2. HOUSE CARD (Bottom Sheet)

When a pin is tapped, a bottom sheet slides up with everything about that house.

**Layout:**
```
┌─────────────────────────────────┐
│ 123 Main St, Newport Beach     │ ← address (tappable → Maps)
│ John Smith · (949) 555-1234    │ ← contact (tappable → call)
│ ─────────────────────────────  │
│ $350 QUOTED · 24 windows       │ ← money line
│ Status: QUOTED · 3d ago        │ ← status + recency
│ ─────────────────────────────  │
│ [ FOLLOW UP ]  [ CALL ]  [NAV]│ ← next best action + quick actions
│ ─────────────────────────────  │
│ Outcome Grid:                  │
│ [NH] [NI] [X] [HG] [T]        │ ← one-tap knock logging
│ [CB] [Q]  [AP] [$]            │
│ ─────────────────────────────  │
│ Timeline:                      │
│ Apr 21 — Quoted $350 (Tyler)   │
│ Apr 19 — Not home (Tyler)      │
│ Apr 18 — Door knock (Tyler)    │
│ ─────────────────────────────  │
│ Notes: Dog in backyard, gate   │
│ Tags: [steep roof] [cash only] │
│ Photos: [📷] [📷] [📷]         │
└─────────────────────────────────┘
```

**"Next Best Action" Button:**
This is the single most important UI element. It dynamically changes based on house status:
- `unknocked` → "LOG KNOCK" (show outcome grid)
- `lead` → "FOLLOW UP" (call or re-knock)
- `quoted` → "CLOSE IT" (re-present quote)
- `scheduled` → "CONFIRM APPT" (call to confirm)
- `customer` → "SCHEDULE RECLEAN"
- `dead` → "RE-KNOCK" (if dead_until expired)

### 3. CAPTURE FLOW (Quote Builder)

Multi-step sliding card flow, optimized for one-handed use:

**Step 1 — WHO** (auto-filled from existing data)
- Contact name (text input)
- Phone (formatted as-you-type: (949) 555-1234)
- Email (optional)

**Step 2 — WHEN**
- Date tiles: Today, Tomorrow, then next 14 days (scrollable)
- Time slot: Default 10:00 AM, picker in 30-min increments
- "No specific date" option for quote-only

**Step 3 — WHAT**
- Window count: stepper (±1, ±5, ±10) with big display
- Service type chips: Exterior Only, Interior + Exterior, Screens, Tracks
- Live price calculation: shows base price, anchor price, final price
- Price override: tap the price to manually adjust
- Add-ons: configurable per org (gutter cleaning, pressure washing, etc.)

**Step 4 — NOTES**
- Quick-tag chips: Dog, Gate code, Side door, Steep roof, Ladder needed, Cash only, Senior, Ring doorbell, Spanish speaker
- Free text notes
- Photo capture (camera button → before photo)

**Every step is a save point** — if the homeowner walks away mid-quote, whatever was captured is saved.

**Pricing Engine:**
```
base_rate = org.settings.default_rate_per_window (default $7)
base_price = windows × base_rate
multiplier = 1.0
  + (interior_exterior ? 0.8 : 0)
  + (screens ? 0.25 : 0)
  + (tracks ? 0.15 : 0)
raw_price = base_price × multiplier
final_price = MAX(raw_price, org.settings.min_charge)
anchor_price = MAX(raw_price × 1.3, org.settings.anchor_min)
```

### 4. KNOCK TRACKING & GAMIFICATION (`/me`)

Personal operator cockpit with motivational gamification.

**Quick Log:**
- Big buttons: +1, +5, +10, +25
- Matching subtract buttons: −1, −5, −10, −25
- Reset button (zero out today)
- Haptic feedback on every tap
- Real-time sync to daily_stats

**Daily Mission:**
- Progress bar toward daily_target (default 30 doors)
- Smart suggestion based on time of day + progress:
  - "Clock's ticking. First knock sets the tone."
  - "Just 5 more. You're right there."
  - "Mission complete. Anything extra is bonus."

**Weekly Goal:**
- Progress toward weekly_target (default 150)
- Editable target (tap to change)
- Pace calculation: "You need 22/day to hit your goal"

**Contribution Heatmap:**
- GitHub-style 365-day grid
- Toggle: 90d / 180d / 1y
- Metrics: Doors, Conversations, Leads, Closes
- 6-level color ramp (grey → yellow → orange → red)

**Streak Panel:**
- Current streak (consecutive days with doors > 0)
- Longest streak (all-time best)
- Hot/warm/cold indicator with emoji (🔥/⚡/❄️)

**Momentum Meter:**
- Composite score 0–100 (45% consistency + 40% volume + 15% trend)
- 7-day mini bar chart
- Status label: Peak / Strong / Building / Slow / Stalled

**Badges:**
- 20+ unlockable achievements with progress bars
- Examples: First Knock, Century Club (100 doors/day), Iron Streak (30-day streak), Closer (10 closes), Neighborhood King (80% saturation)

### 5. TODAY PAGE (`/today`)

"What do I need to DO right now?" — sorted by urgency.

Sections (only shown if items exist):
1. **Appointments Today** — scheduled jobs/follow-ups for today, sorted by time
2. **Jobs Today** — service jobs to complete, with route order
3. **Follow-Ups Due** — overdue + today's follow-ups, sorted by days overdue
4. **Expiring Quotes** — quotes older than 5 days that haven't been closed
5. **Recleans Due** — customers due for recurring service

Each card shows: time/urgency badge, address, contact, price, one-tap call + navigate buttons.

Empty state: "Nothing urgent. Go knock some doors. → Open Map"

### 6. DEALS PAGE (`/deals`)

Sales pipeline visibility for the rep and manager.

**Pipeline Money Bar** (top):
- 3-segment horizontal bar: Leads $ | Quoted $ | Won $
- Shows total dollar potential at each stage

**Sections:**
1. **Hottest** — overdue follow-ups + expiring quotes. Red urgency labels.
2. **Pipeline** — active leads + fresh quotes. Working deals.
3. **Won** — recent closes (last 30 days). Celebration.

**Stats Footer:**
- Total pipeline value
- Average deal size
- Active deals count
- Win rate (closes / total outcomes)

### 7. CLIENTS PAGE (`/clients`)

Customer lifetime value management.

**Hero Stat:** Total lifetime revenue across all customers.

**Sections:**
1. **Due for Reclean** — customers with reclean_due_at ≤ today
2. **Review Not Asked** — recent jobs where we haven't sent a review request
3. **All Customers** — searchable, sorted by LTV

Each card: contact info, LTV, total jobs, last service date, one-tap call + navigate.

### 8. TEAM MANAGEMENT (New — SaaS Feature)

**Invite Flow:**
- Owner sends invite link or email
- Invitee signs up → auto-joins org
- Roles: Owner, Admin, Manager, Rep

**Team Dashboard** (manager/admin view):
- Leaderboard: doors knocked today/week/month per rep
- Activity feed: real-time knock/quote/close stream
- Territory assignments: drag reps onto neighborhood zones
- Performance metrics: conversion rate, avg deal size, follow-up compliance per rep

**Permissions:**
```
Owner:    Everything + billing + delete org
Admin:    Everything except billing
Manager:  View all data, manage reps, assign territories
Rep:      Own data + houses in assigned territory
```

### 9. BILLING (Stripe Integration)

**Plans:**
```
Free:       1 user, 100 houses, no SMS, no automations
Pro:        $49/mo per seat, unlimited houses, SMS, automations, team features
Enterprise: Custom pricing, SSO, API access, dedicated support
```

**Implementation:**
- Stripe Checkout for initial subscription
- Stripe Customer Portal for upgrades/downgrades/cancellations
- Webhook handler for subscription events
- Usage metering for SMS credits
- Seat-based billing (add/remove users adjusts next invoice)

### 10. NOTIFICATIONS & AUTOMATIONS

**Push Notifications (Web Push):**
- Follow-up due in 1 hour
- Quote expiring (5 days old)
- Reclean due today
- Team member closed a deal (celebration)
- Daily summary at 7 AM

**SMS Automations (Twilio):**
- Auto-text after quote: "Thanks {{name}}! Here's your window cleaning quote for ${{price}}..."
- Follow-up reminder: "Hi {{name}}, just checking in on your window cleaning quote..."
- Appointment confirmation: "Reminder: Window cleaning tomorrow at {{time}} at {{address}}"
- Post-job review request: "How'd we do? Leave us a review: {{review_url}}"

**Email Automations (Resend):**
- Quote PDF email
- Appointment confirmation
- Invoice/receipt
- Review request

**Automation Builder (Pro feature):**
- Trigger → Condition → Action
- Example: "When knock outcome = quoted AND 3 days pass → send follow-up SMS"
- Example: "When job completed → wait 2 hours → send review request SMS"

### 11. ROUTE OPTIMIZATION (New Feature)

**Daily Route Planner:**
- Shows all today's jobs on map with numbered sequence
- One-tap "Optimize Route" → reorders by driving distance (nearest-neighbor TSP)
- Turn-by-turn link per stop (Apple Maps / Google Maps deep link)
- Estimated drive time between stops
- "Start Route" mode: sequential navigation, mark complete at each stop

### 12. NEIGHBORHOOD INTELLIGENCE (New Feature)

**Neighborhood Scoring:**
AI-computed score (0–100) based on:
- Historical conversion rate in this neighborhood
- Average deal size
- Home value data (Census/Zillow API)
- Saturation level (% knocked)
- Recency (when was it last knocked?)
- Competition density (are other services active here?)

**Territory Heatmap:**
- Color neighborhoods on map by score
- "Where should I knock today?" → top 3 recommendation with reasoning
- Track neighborhood over time (trending up/down)

**Saturation Tracking:**
- Total addressable houses (from address data)
- % knocked, % converted, % dead
- "Finish the block" suggestions — unknocked houses near recent activity

### 13. REPORTING & ANALYTICS (Admin/Manager)

**Dashboards:**
- Revenue: daily/weekly/monthly, by rep, by neighborhood
- Pipeline: funnel visualization (knocked → led → quoted → closed)
- Activity: doors/day trend, conversations/day, quotes/day
- Retention: reclean rate, churn rate, LTV distribution
- Team: leaderboard, rep comparison, territory performance

**Exports:**
- CSV download for any report
- Scheduled email reports (weekly summary to owner)

### 14. INTEGRATIONS

**Google Calendar:**
- OAuth connection per user
- Auto-create events for scheduled jobs and follow-ups
- Sync status changes (cancelled job → delete event)
- Smart reminders: 12 hours before job, 1 hour before follow-up

**Quickbooks/Stripe Invoicing:**
- Generate invoice after job completion
- Track payment status
- Revenue reconciliation

**Zapier/Webhooks (Enterprise):**
- Webhook events for: knock_created, quote_created, job_completed, customer_created
- Zapier integration for connecting to 5000+ apps

### 15. OFFLINE MODE (PWA)

**Critical for field use:**
- Cache map tiles for current area
- Queue knocks/captures offline → sync when connection returns
- Show stale data with "last synced" indicator
- Conflict resolution: last-write-wins with server timestamp

### 16. ONBOARDING

**First-time user flow:**
1. Sign up (Google OAuth or email)
2. Create organization (company name, service type)
3. Invite team (optional, skip for solo)
4. Connect Google Calendar (optional)
5. Set daily/weekly targets
6. Drop first pin or go to current location
7. Interactive tutorial: "Tap a house to log your first knock"

---

## PAGES & ROUTES

```
/                     → redirect to /today
/login                → auth (Google OAuth, email/password)
/signup               → create account + org
/onboarding           → first-time setup wizard
/today                → daily action dashboard
/map                  → primary map view (default screen)
/deals                → sales pipeline
/clients              → customer LTV management
/me                   → knock tracking, gamification, personal stats
/team                 → team management, leaderboard (manager+)
/settings             → org settings, billing, integrations
/settings/billing     → Stripe portal
/settings/team        → invite/manage members
/settings/automations → automation builder
/settings/templates   → SMS/email templates
/reports              → analytics dashboards (manager+)
/route                → daily route planner
/neighborhoods        → territory intelligence
/auth/callback        → OAuth callback handler
/auth/callback/google → Google Calendar OAuth callback
```

---

## NAVIGATION

**Mobile (bottom nav — 5 tabs):**
```
[ Today ] [ Deals ] [ 🗺 MAP ] [ Clients ] [ Me ]
```
- Map is center tab, raised + inverted (primary action)
- Live badge counts on Today (pending actions), Deals (hot items), Clients (recleans due)
- Manager+ sees additional "Team" tab replacing or alongside "Me"

**Desktop (side nav):**
- Same tabs as vertical sidebar
- Wider cards, two-column layouts where appropriate
- Map takes full viewport width

---

## API DESIGN

Use Supabase client SDK (PostgREST) for all CRUD operations. Edge Functions only for:

1. **Webhooks**: Stripe billing events, incoming SMS replies
2. **External APIs**: Google Calendar, Twilio, Resend, Zillow/Census
3. **Compute**: Route optimization, neighborhood scoring, AI features
4. **Auth flows**: Google Calendar OAuth exchange

All data access goes through RLS policies — no custom API layer needed for basic CRUD.

---

## RLS POLICY PATTERN

Every table with `org_id` uses this pattern:

```sql
-- Users can only see data in their org
CREATE POLICY "org_isolation" ON houses
  FOR ALL
  USING (org_id IN (
    SELECT org_id FROM memberships
    WHERE user_id = auth.uid()
    AND status = 'active'
  ));
```

For rep-level restrictions:
```sql
-- Reps only see houses assigned to them or unassigned
CREATE POLICY "rep_assignment" ON houses
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR assigned_to IS NULL
    OR EXISTS (
      SELECT 1 FROM memberships
      WHERE user_id = auth.uid()
      AND org_id = houses.org_id
      AND role IN ('owner', 'admin', 'manager')
    )
  );
```

---

## REALTIME SUBSCRIPTIONS

Use Supabase Realtime for live updates:

```typescript
// Team activity feed
supabase.channel('org-knocks')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'knocks',
    filter: `org_id=eq.${orgId}`
  }, (payload) => {
    // Show "Tyler just closed at 123 Main St!"
  })
  .subscribe()

// House status changes (update pins in real-time)
supabase.channel('org-houses')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'houses',
    filter: `org_id=eq.${orgId}`
  }, (payload) => {
    // Update pin color on map
  })
  .subscribe()
```

---

## WHAT MAKES THIS A MULTI-MILLION DOLLAR PRODUCT

1. **Vertical focus** — not trying to be Salesforce. Being the best CRM for door-to-door, period.
2. **Speed** — 60-second capture flow. Nobody else is this fast.
3. **Map-first** — territory is everything in door-to-door. The map IS the product.
4. **Gamification** — reps are competitive. Streaks, badges, leaderboards drive daily usage.
5. **Automations** — follow-up SMS, review requests, reclean reminders happen automatically.
6. **Neighborhood intelligence** — "where should I knock?" is the #1 question. We answer it with data.
7. **Route optimization** — save 30 minutes/day in driving = real money.
8. **Offline mode** — field workers lose signal. The app must keep working.
9. **Team features** — solo operators start free, then hire reps and upgrade to Pro.
10. **Retention engine** — reclean reminders + review requests = recurring revenue + word-of-mouth.

---

## IMPLEMENTATION PRIORITIES

Build in this order:

### Phase 1 — Core (Week 1-2)
1. Auth (Google OAuth + email/password)
2. Organization + membership model
3. Houses table with PostGIS
4. Map view with pins
5. House card + knock logging
6. Capture flow (quote builder)
7. Bottom nav + page shells

### Phase 2 — Operations (Week 3-4)
8. Today page (action dashboard)
9. Deals page (pipeline)
10. Clients page (LTV)
11. Jobs table + completion flow
12. Knock tracking gamification (Me page)
13. Daily stats + heatmap

### Phase 3 — Growth (Week 5-6)
14. Team management + invites
15. Stripe billing integration
16. Google Calendar sync
17. SMS integration (Twilio)
18. Basic automations
19. Neighborhood scoring

### Phase 4 — Scale (Week 7-8)
20. Route optimization
21. Reporting dashboards
22. Offline PWA mode
23. Push notifications
24. Review request system
25. Advanced automations builder

---

## CODE QUALITY STANDARDS

- **TypeScript strict mode** — no `any`, no implicit returns
- **Domain-organized** — group by feature (map/, capture/, team/) not by type (components/, hooks/, utils/)
- **Co-located** — component + hook + types + tests in same folder
- **No scattered business logic** — pricing in pricing.ts, status flows in status.ts, never in components
- **No enterprise theater** — no abstract factories, no dependency injection, no over-engineering
- **Mobile-first CSS** — base styles are mobile, `sm:` breakpoints add desktop enhancements
- **Accessibility** — aria-labels on all interactive elements, keyboard navigation, screen reader support
- **Error boundaries** — graceful failures, never a white screen
- **Loading states** — skeleton screens, not spinners
- **Optimistic updates** — UI updates immediately, syncs in background

---

## FINAL DIRECTIVE

Build this like you're the CTO of a $10M ARR vertical SaaS company. Every decision should optimize for:

1. **Speed of use** — can a rep use this faster than any alternative?
2. **Retention** — does this feature make users come back daily?
3. **Expansion** — does this feature make solo users invite their team?
4. **Revenue** — does this feature justify Pro pricing?

If a feature doesn't clearly serve one of these four goals, cut it.

Ship fast. Iterate based on usage data. The best CRM is the one that gets used every day at every door.
