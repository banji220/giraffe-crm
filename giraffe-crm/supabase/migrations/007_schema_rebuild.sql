-- 007_schema_rebuild.sql
--
-- THE BIG ONE: Merge leads + customers into houses.
--
-- What changes:
--   1. Houses gain contact fields, tracking fields, pricing fields
--   2. Houses get a new TEXT status column: null | lead | quoted | customer | dead | avoid
--   3. Knocks get a type column: door | call | text | quote
--   4. Lead data backfilled into houses
--   5. leads + customers tables dropped
--   6. Old triggers + functions cleaned up
--   7. Jobs lose lead_id + customer_id (they already have house_id)
--
-- Why TEXT instead of ENUM for status:
--   Enums in Postgres are painful to alter. A CHECK constraint is
--   equally safe and trivial to extend later.

BEGIN;

-- ══════════════════════════════════════════════════════════════════════
-- 1. ADD NEW COLUMNS TO HOUSES
-- ══════════════════════════════════════════════════════════════════════

-- Contact info (previously on leads + customers)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Tracking (previously derived from leads)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS last_knock_at TIMESTAMPTZ;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS knock_count INTEGER NOT NULL DEFAULT 0;

-- Pricing (previously on leads)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS quoted_price NUMERIC;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS anchor_price NUMERIC;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS window_count INTEGER;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS service_types service_type[] DEFAULT '{}';

-- Customer lifetime (previously on customers)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS total_jobs INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS reclean_due_at TIMESTAMPTZ;

-- New status column (replaces the old house_state enum column)
ALTER TABLE public.houses ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.houses ADD CONSTRAINT houses_status_check
  CHECK (status IS NULL OR status IN ('lead', 'quoted', 'customer', 'dead', 'avoid'));

-- ══════════════════════════════════════════════════════════════════════
-- 2. ADD TYPE COLUMN TO KNOCKS
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.knocks ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'door';
ALTER TABLE public.knocks ADD CONSTRAINT knocks_type_check
  CHECK (type IN ('door', 'call', 'text', 'quote'));

-- ══════════════════════════════════════════════════════════════════════
-- 3. BACKFILL HOUSES FROM LEADS
-- ══════════════════════════════════════════════════════════════════════

-- Map lead_state → house status
-- new/nurture → 'lead', quoted → 'quoted', won → 'customer', lost → 'dead'
UPDATE public.houses h SET
  contact_name     = l.full_name,
  contact_phone    = l.phone,
  contact_email    = l.email,
  quoted_price     = l.final_price,
  anchor_price     = l.anchor_price,
  window_count     = l.window_count,
  service_types    = COALESCE(l.service_types, '{}'),
  next_follow_up_at = l.next_touch_at,
  knock_count      = COALESCE(l.touch_count, 0),
  status = CASE l.state
    WHEN 'new'     THEN 'lead'
    WHEN 'nurture' THEN 'lead'
    WHEN 'quoted'  THEN 'quoted'
    WHEN 'won'     THEN 'customer'
    WHEN 'lost'    THEN 'dead'
    ELSE NULL
  END
FROM (
  -- If a house has multiple leads, take the most recent one
  SELECT DISTINCT ON (house_id) *
  FROM public.leads
  ORDER BY house_id, updated_at DESC
) l
WHERE h.id = l.house_id;

-- Backfill last_knock_at from actual knocks
UPDATE public.houses h SET
  last_knock_at = sub.latest,
  knock_count   = GREATEST(h.knock_count, sub.cnt)
FROM (
  SELECT house_id, MAX(created_at) as latest, COUNT(*) as cnt
  FROM public.knocks
  GROUP BY house_id
) sub
WHERE h.id = sub.house_id;

-- Houses with knocks but no lead → status stays null (knocked but no answer)
-- This is correct: null = unvisited or no-answer-only

-- Backfill status from old house_state for houses NOT touched by leads backfill
UPDATE public.houses SET
  status = CASE state
    WHEN 'dead'     THEN 'dead'
    WHEN 'avoid'    THEN 'avoid'
    WHEN 'customer' THEN 'customer'
    WHEN 'working'  THEN 'lead'
    ELSE NULL  -- unknocked, cold → null
  END
WHERE status IS NULL AND state IS NOT NULL AND state NOT IN ('unknocked', 'cold');

-- Migrate is_avoid flag
UPDATE public.houses SET status = 'avoid'
WHERE is_avoid = true AND (status IS NULL OR status != 'avoid');

-- ══════════════════════════════════════════════════════════════════════
-- 3b. DROP get_houses_in_bbox (depends on lead_state + house_state types)
-- ══════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.get_houses_in_bbox(double precision, double precision, double precision, double precision, integer);

-- ══════════════════════════════════════════════════════════════════════
-- 4. DROP OLD TRIGGERS (before dropping tables they reference)
-- ══════════════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS knocks_spawn_lead_trg ON public.knocks;
DROP TRIGGER IF EXISTS knocks_after_insert_trg ON public.knocks;
DROP TRIGGER IF EXISTS leads_after_change_trg ON public.leads;
DROP TRIGGER IF EXISTS leads_touch_updated_at ON public.leads;
DROP TRIGGER IF EXISTS customers_touch_updated_at ON public.customers;

-- ══════════════════════════════════════════════════════════════════════
-- 5. DROP FK COLUMNS ON JOBS (they already have house_id)
-- ══════════════════════════════════════════════════════════════════════

ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_lead_id_fkey;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_customer_id_fkey;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS lead_id;
ALTER TABLE public.jobs DROP COLUMN IF EXISTS customer_id;

-- ══════════════════════════════════════════════════════════════════════
-- 6. DROP LEADS + CUSTOMERS TABLES
-- ══════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- ══════════════════════════════════════════════════════════════════════
-- 7. DROP OLD STATE COLUMN + ENUM ON HOUSES
-- ══════════════════════════════════════════════════════════════════════

-- The old house_state enum column
ALTER TABLE public.houses DROP COLUMN IF EXISTS state;
ALTER TABLE public.houses DROP COLUMN IF EXISTS is_avoid;
ALTER TABLE public.houses DROP COLUMN IF EXISTS avoid_reason;
-- dead_until and dead_reason stay — they're still useful

-- Drop orphaned enums (lead_state is gone, house_state is replaced)
DROP TYPE IF EXISTS public.lead_state;
DROP TYPE IF EXISTS public.house_state;

-- ══════════════════════════════════════════════════════════════════════
-- 8. DROP ORPHANED FUNCTIONS
-- ══════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.knocks_spawn_lead();
DROP FUNCTION IF EXISTS public.leads_after_change();
DROP FUNCTION IF EXISTS public.recompute_house_state(uuid);
DROP FUNCTION IF EXISTS public.calculate_base_price(integer, service_type[]);
DROP FUNCTION IF EXISTS public.calculate_anchor_price(numeric);

-- ══════════════════════════════════════════════════════════════════════
-- 9. NEW TRIGGER: knocks_after_insert → update house directly
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.knocks_after_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Always update tracking fields
  UPDATE public.houses SET
    last_knock_at = NEW.created_at,
    knock_count   = knock_count + 1,
    updated_at    = now()
  WHERE id = NEW.house_id;

  -- Status transitions based on knock outcome
  -- Only upgrade status, never downgrade (customer doesn't become lead)
  CASE NEW.outcome
    WHEN 'come_back', 'quoted' THEN
      UPDATE public.houses SET
        status = CASE
          WHEN status IS NULL OR status = 'dead' THEN 'lead'
          ELSE status  -- don't downgrade quoted/customer
        END,
        next_follow_up_at = COALESCE(NEW.follow_up_at, now() + interval '2 days')
      WHERE id = NEW.house_id AND (status IS NULL OR status IN ('dead', 'lead'));

    WHEN 'appointment_set' THEN
      UPDATE public.houses SET
        status = CASE
          WHEN status IN ('lead', 'quoted') OR status IS NULL THEN 'quoted'
          ELSE status
        END,
        next_follow_up_at = NEW.follow_up_at
      WHERE id = NEW.house_id;

    WHEN 'closed_on_spot' THEN
      UPDATE public.houses SET
        status = 'customer',
        next_follow_up_at = NULL
      WHERE id = NEW.house_id;

    WHEN 'not_interested', 'hard_no', 'have_a_guy', 'tenant' THEN
      UPDATE public.houses SET
        status = CASE
          WHEN status IS NULL THEN 'dead'
          ELSE status  -- don't kill a lead/quoted/customer
        END,
        dead_until = CASE
          WHEN status IS NULL THEN now() + interval '90 days'
          ELSE dead_until
        END,
        dead_reason = NEW.outcome
      WHERE id = NEW.house_id;

    WHEN 'not_home' THEN
      -- No status change. Just schedule a retry.
      UPDATE public.houses SET
        next_follow_up_at = COALESCE(NEW.follow_up_at, now() + interval '1 day')
      WHERE id = NEW.house_id
        AND next_follow_up_at IS NULL;  -- don't overwrite an existing follow-up

    ELSE
      -- Unknown outcome: no status change
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_catalog;

CREATE TRIGGER knocks_after_insert_trg
  AFTER INSERT ON public.knocks
  FOR EACH ROW EXECUTE FUNCTION public.knocks_after_insert();

-- ══════════════════════════════════════════════════════════════════════
-- 10. UPDATE RLS — houses replaces leads+customers policies
-- ══════════════════════════════════════════════════════════════════════

-- Drop old v1 / authenticated_all policies that referenced leads/customers
-- (these were already replaced in migration 005, but just in case)
DROP POLICY IF EXISTS authenticated_all ON public.leads;
DROP POLICY IF EXISTS authenticated_all ON public.customers;

-- Houses already has RLS enabled with authenticated_all from migration 005.
-- That's sufficient for now — any authenticated user can CRUD houses.

-- ══════════════════════════════════════════════════════════════════════
-- 11. INDEXES for the new query patterns
-- ══════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_houses_status ON public.houses(status);
CREATE INDEX IF NOT EXISTS idx_houses_status_follow_up ON public.houses(status, next_follow_up_at)
  WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_houses_reclean ON public.houses(reclean_due_at)
  WHERE status = 'customer' AND reclean_due_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_knocks_house_created ON public.knocks(house_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════
-- 12. DROP OLD VIEWS (they referenced leads)
-- ══════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS public.v_followups_due;
DROP VIEW IF EXISTS public.v_quotes_expiring;
DROP VIEW IF EXISTS public.v_week_booked;

-- ══════════════════════════════════════════════════════════════════════
-- 13. REBUILD get_houses_in_bbox against new schema
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_houses_in_bbox(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
  max_rows integer DEFAULT 2000
)
RETURNS TABLE(
  id uuid,
  full_address text,
  street_number text,
  street_name text,
  city text,
  status text,
  dead_until timestamptz,
  dead_reason knock_outcome,
  notes text,
  lat double precision,
  lng double precision,
  contact_name text,
  contact_phone text,
  quoted_price numeric,
  last_knock_outcome knock_outcome,
  last_knock_at timestamptz,
  next_follow_up_at timestamptz,
  knock_count integer
)
LANGUAGE sql STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT
    h.id,
    h.full_address,
    h.street_number,
    h.street_name,
    h.city,
    h.status,
    h.dead_until,
    h.dead_reason,
    h.notes,
    st_y(h.geom::geometry) AS lat,
    st_x(h.geom::geometry) AS lng,
    h.contact_name,
    h.contact_phone,
    h.quoted_price,
    -- Last knock info (for the bottom sheet header)
    (SELECT k.outcome FROM knocks k WHERE k.house_id = h.id ORDER BY k.created_at DESC LIMIT 1) AS last_knock_outcome,
    h.last_knock_at,
    h.next_follow_up_at,
    h.knock_count
  FROM houses h
  WHERE h.geom && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
  ORDER BY
    CASE h.status
      WHEN 'customer' THEN 1
      WHEN 'quoted'   THEN 2
      WHEN 'lead'     THEN 3
      WHEN 'dead'     THEN 4
      WHEN 'avoid'    THEN 5
      ELSE 6  -- null (unknocked)
    END
  LIMIT max_rows;
$$;

COMMIT;
