-- =============================================================================
-- GIRAFFE CRM — SCHEMA v1
-- Field sales + service operating system for window cleaning
-- Apply to Supabase via: Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- =============================================================================
-- Design notes for future-you (or the next developer):
--
-- THREE CORE OBJECTS, NEVER COLLAPSED:
--   houses  = physical address. One row per door. State is DERIVED from knocks.
--   knocks  = immutable event log. Every door tap creates one row, forever.
--   leads   = a human with intent. Spawned by knocks with real outcomes.
--
-- A house can have many knocks over years. A house can have many leads over
-- years (2024 lead went cold, 2025 lead closed). Leads are the revenue object.
-- Knocks are the history. Houses are the map pins.
--
-- MULTI-USER READY, SINGLE-USER TODAY:
--   Every table has created_by / assigned_to (or equivalent). RLS policies
--   are written for a real auth.uid() but v1 seeds a single owner user and
--   everything belongs to them. When rep #2 joins, flip on Supabase Auth and
--   the existing rows just work.
--
-- AUTO-REAWAKEN:
--   Houses that die from "have_a_guy" or "tenant" automatically return to
--   "unknocked" after 365 days. Implemented as a pg_cron job that runs nightly.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";
create extension if not exists "pg_cron";

-- -----------------------------------------------------------------------------
-- Enums — the locked state vocabulary from the design conversation
-- -----------------------------------------------------------------------------

-- The nine knock outcomes. Every tap on a door writes one of these.
create type knock_outcome as enum (
  'not_home',          -- nobody answered
  'not_interested',    -- polite no
  'hard_no',           -- rude / do-not-return
  'have_a_guy',        -- competitor lock, reawakens in 12 months
  'tenant',            -- renter, move on, reawakens in 12 months
  'come_back',         -- interested but not now, spawns lead
  'quoted',            -- price given at the door, spawns lead
  'appointment_set',   -- scheduled return visit, spawns lead
  'closed_on_spot'     -- sold and scheduled right then, spawns lead + job
);

-- The six house states. DERIVED from knock history — never set manually
-- except 'avoid' which is the one safety override.
create type house_state as enum (
  'unknocked',  -- never touched
  'cold',       -- knocked, no contact yet (not_home only)
  'working',    -- active lead in progress
  'customer',   -- at least one closed job
  'dead',       -- killed by hard_no / have_a_guy / tenant / repeated not_interested
  'avoid'       -- manual flag: dog, angry, unsafe
);

-- The five lead states. Powers the Today screen's follow-up queue.
create type lead_state as enum (
  'new',        -- just captured, not yet quoted
  'quoted',     -- price given, waiting on answer
  'won',        -- signed / scheduled
  'lost',       -- bought elsewhere or ghosted after N touches
  'nurture'     -- long-horizon "call me in spring", auto-wakes on date
);

-- Service tiers — multi-select at quote time.
create type service_type as enum (
  'exterior',
  'interior_exterior',
  'screens',
  'tracks'
);

-- Job lifecycle.
create type job_status as enum (
  'scheduled',
  'en_route',
  'in_progress',
  'completed',
  'cancelled'
);

-- -----------------------------------------------------------------------------
-- Users (owner + future reps)
-- -----------------------------------------------------------------------------
-- In v1 we seed a single owner row. When Supabase Auth is enabled, this table
-- mirrors auth.users via a trigger. For now it's a plain table so the app
-- works without auth.
create table if not exists users (
  id           uuid primary key default uuid_generate_v4(),
  email        text unique,
  full_name    text not null,
  role         text not null default 'owner' check (role in ('owner','rep','admin')),
  phone        text,
  created_at   timestamptz not null default now()
);

-- Seed the owner. You.
insert into users (id, email, full_name, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'tyler@holygiraffe.com',
  'Tyler Khanjani',
  'owner'
) on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Houses — one row per physical address
-- -----------------------------------------------------------------------------
create table if not exists houses (
  id              uuid primary key default uuid_generate_v4(),

  -- Address fields. Populated on first knock via reverse geocoding from GPS.
  -- Kept as plain text for display; the geom column is what territory queries hit.
  street_number   text,
  street_name     text,
  unit            text,
  city            text,
  addr_state      text,
  postal_code     text,
  full_address    text,  -- denormalized for display, e.g. "1119 E Balboa Blvd, Newport Beach, CA 92661"

  -- PostGIS point — this is what the map queries. SRID 4326 = WGS84 lat/lng.
  geom            geography(point, 4326) not null,

  -- Derived state. Never set this manually except via the 'avoid' override.
  -- A trigger recomputes state after every knock/job change.
  state           house_state not null default 'unknocked',

  -- Override flag — only set manually for safety concerns (dog, angry, unsafe).
  -- When true, state is forced to 'avoid' regardless of knock history.
  is_avoid        boolean not null default false,
  avoid_reason    text,

  -- Reawaken tracking. When state flips to 'dead' from have_a_guy/tenant,
  -- we stamp dead_until with now() + 365 days. The nightly cron job flips
  -- eligible houses back to 'unknocked'.
  dead_until      timestamptz,
  dead_reason     knock_outcome,

  -- Soft metadata
  notes           text,
  tags            text[] default '{}',

  -- Audit
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid not null default '00000000-0000-0000-0000-000000000001' references users(id),
  assigned_to     uuid references users(id)
);

-- Spatial index — mandatory for any "houses near me" query.
create index if not exists houses_geom_idx on houses using gist (geom);
create index if not exists houses_state_idx on houses (state);
create index if not exists houses_dead_until_idx on houses (dead_until) where dead_until is not null;
create index if not exists houses_assigned_to_idx on houses (assigned_to);

-- -----------------------------------------------------------------------------
-- Knocks — append-only event log. NEVER UPDATE, NEVER DELETE.
-- -----------------------------------------------------------------------------
create table if not exists knocks (
  id              uuid primary key default uuid_generate_v4(),
  house_id        uuid not null references houses(id) on delete cascade,
  outcome         knock_outcome not null,

  -- Free-text context captured at the door. Optional.
  note            text,

  -- For 'come_back' and 'appointment_set' — when to come back.
  follow_up_at    timestamptz,

  -- Where the rep was standing when they tapped. Useful for accuracy debugging
  -- and for computing knock-to-door distance for sanity checks.
  knocked_from    geography(point, 4326),

  -- Audit. created_at is the knock timestamp, full stop.
  created_at      timestamptz not null default now(),
  created_by      uuid not null default '00000000-0000-0000-0000-000000000001' references users(id)
);

create index if not exists knocks_house_id_idx on knocks (house_id);
create index if not exists knocks_created_at_idx on knocks (created_at desc);
create index if not exists knocks_created_by_idx on knocks (created_by);
create index if not exists knocks_outcome_idx on knocks (outcome);

-- -----------------------------------------------------------------------------
-- Leads — a human with intent. Spawned by intent-carrying knocks.
-- -----------------------------------------------------------------------------
create table if not exists leads (
  id              uuid primary key default uuid_generate_v4(),
  house_id        uuid not null references houses(id),

  -- The human.
  full_name       text,
  phone           text,
  email           text,

  -- Lifecycle.
  state           lead_state not null default 'new',

  -- Quote fields. Null until a price is given.
  window_count    int,
  service_types   service_type[] default '{}',

  -- Pricing — the three-number model we agreed on.
  base_price      numeric(10,2),  -- formula output: max(229, window_count * rate)
  anchor_price    numeric(10,2),  -- what we SHOW the customer as "normally"
  discount_type   text check (discount_type in ('flat','percent','promo')),
  discount_value  numeric(10,2),  -- dollars off or percent off
  discount_code   text,
  final_price     numeric(10,2),  -- what they actually pay

  -- Follow-up engine. The Today screen reads these.
  next_touch_at   timestamptz,    -- when to touch this lead next
  last_touch_at   timestamptz,
  touch_count     int not null default 0,

  -- For nurture leads: when to auto-wake.
  nurture_wake_at timestamptz,

  -- Source knock — which door tap spawned this lead.
  source_knock_id uuid references knocks(id),

  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid not null default '00000000-0000-0000-0000-000000000001' references users(id),
  assigned_to     uuid references users(id) default '00000000-0000-0000-0000-000000000001'
);

create index if not exists leads_house_id_idx on leads (house_id);
create index if not exists leads_state_idx on leads (state);
create index if not exists leads_next_touch_at_idx on leads (next_touch_at) where state in ('new','quoted','nurture');
create index if not exists leads_assigned_to_idx on leads (assigned_to);

-- -----------------------------------------------------------------------------
-- Customers — promoted from leads on 'won'.
-- -----------------------------------------------------------------------------
-- A customer is a lead that closed at least one job. Separate table because
-- customers have their own lifecycle (LTV, reclean cadence, review status)
-- distinct from leads (which can be lost forever).
create table if not exists customers (
  id              uuid primary key default uuid_generate_v4(),
  house_id        uuid not null references houses(id),
  source_lead_id  uuid references leads(id),

  full_name       text not null,
  phone           text,
  email           text,

  -- Retention engine
  first_job_at    timestamptz,
  last_job_at     timestamptz,
  total_jobs      int not null default 0,
  lifetime_value  numeric(10,2) not null default 0,
  reclean_due_at  timestamptz,   -- for seasonal reminders

  -- Review tracking
  review_requested_at timestamptz,
  review_left_at      timestamptz,

  notes           text,
  tags            text[] default '{}',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists customers_house_id_idx on customers (house_id);
create index if not exists customers_reclean_due_at_idx on customers (reclean_due_at);

-- -----------------------------------------------------------------------------
-- Jobs — scheduled/completed work.
-- -----------------------------------------------------------------------------
create table if not exists jobs (
  id              uuid primary key default uuid_generate_v4(),
  house_id        uuid not null references houses(id),
  lead_id         uuid references leads(id),
  customer_id     uuid references customers(id),

  scheduled_at    timestamptz not null,
  completed_at    timestamptz,
  status          job_status not null default 'scheduled',

  -- Snapshot of price at time of job (leads.final_price may drift later).
  price           numeric(10,2) not null,
  paid_amount     numeric(10,2),
  payment_method  text check (payment_method in ('cash','venmo','zelle','card','check','other')),

  service_types   service_type[] default '{}',
  window_count    int,

  notes           text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  assigned_to     uuid references users(id) default '00000000-0000-0000-0000-000000000001'
);

create index if not exists jobs_house_id_idx on jobs (house_id);
create index if not exists jobs_scheduled_at_idx on jobs (scheduled_at);
create index if not exists jobs_status_idx on jobs (status);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at auto-touch
-- -----------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger houses_touch_updated_at before update on houses
  for each row execute function touch_updated_at();
create trigger leads_touch_updated_at before update on leads
  for each row execute function touch_updated_at();
create trigger customers_touch_updated_at before update on customers
  for each row execute function touch_updated_at();
create trigger jobs_touch_updated_at before update on jobs
  for each row execute function touch_updated_at();

-- -----------------------------------------------------------------------------
-- Price calculator: the $229 floor + $7/window rule
-- -----------------------------------------------------------------------------
-- Given window_count and service_types, returns base_price.
-- Floors at $229. Multiplies by 1.5x if interior+exterior is included.
create or replace function calculate_base_price(
  p_window_count int,
  p_service_types service_type[]
) returns numeric language plpgsql immutable as $$
declare
  rate numeric := 7.00;       -- default exterior rate
  floor_price numeric := 229; -- minimum charge
  multiplier numeric := 1.0;
  calculated numeric;
begin
  if p_window_count is null or p_window_count <= 0 then
    return floor_price;
  end if;

  -- Interior + exterior roughly doubles the labor
  if 'interior_exterior' = any(p_service_types) then
    multiplier := multiplier * 1.8;
  end if;
  if 'screens' = any(p_service_types) then
    multiplier := multiplier + 0.25;
  end if;
  if 'tracks' = any(p_service_types) then
    multiplier := multiplier + 0.15;
  end if;

  calculated := p_window_count * rate * multiplier;
  return greatest(calculated, floor_price);
end $$;

-- -----------------------------------------------------------------------------
-- Anchor price calculator: the $299 minimum anchor rule
-- -----------------------------------------------------------------------------
-- The anchor is what we SHOW the customer as "normally $X".
-- For small jobs where base_price equals the floor, anchor at $299 so the
-- customer sees "Normally $299, today $229" instead of no discount at all.
create or replace function calculate_anchor_price(
  p_base_price numeric
) returns numeric language plpgsql immutable as $$
begin
  if p_base_price is null then
    return 299;
  end if;
  -- Minimum anchor is $299, and anchors are always at least the base price.
  return greatest(p_base_price, 299);
end $$;

-- -----------------------------------------------------------------------------
-- House state recomputation
-- -----------------------------------------------------------------------------
-- Called after every knock insert and every job insert/update. Walks the
-- knock history for a house and sets house.state accordingly.
--
-- Priority order (highest wins):
--   1. is_avoid = true            -> avoid
--   2. has a completed job        -> customer
--   3. has an open lead           -> working
--   4. last knock is a killer AND not yet reawakened -> dead
--   5. has any knock              -> cold
--   6. otherwise                  -> unknocked
create or replace function recompute_house_state(p_house_id uuid)
returns void language plpgsql as $$
declare
  v_is_avoid boolean;
  v_has_customer boolean;
  v_has_working_lead boolean;
  v_last_killer knock_outcome;
  v_last_killer_at timestamptz;
  v_has_any_knock boolean;
  v_dead_until timestamptz;
  v_not_interested_count int;
begin
  select is_avoid into v_is_avoid from houses where id = p_house_id;

  if v_is_avoid then
    update houses set state = 'avoid' where id = p_house_id;
    return;
  end if;

  select exists(
    select 1 from jobs where house_id = p_house_id and status = 'completed'
  ) into v_has_customer;

  if v_has_customer then
    update houses set state = 'customer', dead_until = null, dead_reason = null
      where id = p_house_id;
    return;
  end if;

  select exists(
    select 1 from leads where house_id = p_house_id and state in ('new','quoted','nurture')
  ) into v_has_working_lead;

  if v_has_working_lead then
    update houses set state = 'working', dead_until = null, dead_reason = null
      where id = p_house_id;
    return;
  end if;

  -- Count "not interested" knocks. Two of these kill the house.
  select count(*) into v_not_interested_count
    from knocks
    where house_id = p_house_id and outcome = 'not_interested';

  -- Find the most recent killer outcome.
  select outcome, created_at into v_last_killer, v_last_killer_at
    from knocks
    where house_id = p_house_id
      and outcome in ('hard_no','have_a_guy','tenant','not_interested')
    order by created_at desc
    limit 1;

  if v_last_killer is not null then
    -- hard_no is permanent. have_a_guy and tenant reawaken in 365 days.
    -- not_interested kills only after the second one.
    if v_last_killer = 'hard_no' then
      update houses set state = 'dead', dead_until = null, dead_reason = 'hard_no'
        where id = p_house_id;
      return;
    elsif v_last_killer in ('have_a_guy','tenant') then
      v_dead_until := v_last_killer_at + interval '365 days';
      if v_dead_until > now() then
        update houses
          set state = 'dead',
              dead_until = v_dead_until,
              dead_reason = v_last_killer
          where id = p_house_id;
        return;
      end if;
      -- else fall through — reawaken window passed, treat as cold
    elsif v_last_killer = 'not_interested' and v_not_interested_count >= 2 then
      v_dead_until := v_last_killer_at + interval '180 days';
      if v_dead_until > now() then
        update houses
          set state = 'dead',
              dead_until = v_dead_until,
              dead_reason = 'not_interested'
          where id = p_house_id;
        return;
      end if;
    end if;
  end if;

  select exists(select 1 from knocks where house_id = p_house_id)
    into v_has_any_knock;

  if v_has_any_knock then
    update houses set state = 'cold', dead_until = null, dead_reason = null
      where id = p_house_id;
  else
    update houses set state = 'unknocked', dead_until = null, dead_reason = null
      where id = p_house_id;
  end if;
end $$;

-- Trigger wrappers
create or replace function knocks_after_insert() returns trigger
language plpgsql as $$
begin
  perform recompute_house_state(new.house_id);
  return new;
end $$;

create trigger knocks_after_insert_trg after insert on knocks
  for each row execute function knocks_after_insert();

create or replace function leads_after_change() returns trigger
language plpgsql as $$
begin
  perform recompute_house_state(coalesce(new.house_id, old.house_id));
  return coalesce(new, old);
end $$;

create trigger leads_after_change_trg after insert or update or delete on leads
  for each row execute function leads_after_change();

create or replace function jobs_after_change() returns trigger
language plpgsql as $$
begin
  perform recompute_house_state(coalesce(new.house_id, old.house_id));
  return coalesce(new, old);
end $$;

create trigger jobs_after_change_trg after insert or update or delete on jobs
  for each row execute function jobs_after_change();

-- -----------------------------------------------------------------------------
-- Lead spawning — when a knock has real intent, spawn a lead automatically.
-- -----------------------------------------------------------------------------
create or replace function knocks_spawn_lead() returns trigger
language plpgsql as $$
declare
  v_lead_id uuid;
  v_state lead_state;
  v_next_touch timestamptz;
begin
  if new.outcome not in ('come_back','quoted','appointment_set','closed_on_spot') then
    return new;
  end if;

  -- Don't spawn a duplicate if there's already an open lead on this house.
  select id into v_lead_id from leads
    where house_id = new.house_id
      and state in ('new','quoted','nurture')
    limit 1;

  if v_lead_id is not null then
    -- Attach this knock as a touch on the existing lead.
    update leads
      set last_touch_at = new.created_at,
          touch_count = touch_count + 1,
          source_knock_id = coalesce(source_knock_id, new.id)
      where id = v_lead_id;
    return new;
  end if;

  -- Decide initial lead state and next-touch schedule from the outcome.
  if new.outcome = 'quoted' then
    v_state := 'quoted';
    v_next_touch := now() + interval '48 hours'; -- quote goes stale at 72h, nudge at 48h
  elsif new.outcome = 'closed_on_spot' then
    v_state := 'won';
    v_next_touch := null;
  elsif new.outcome = 'appointment_set' then
    v_state := 'new';
    v_next_touch := coalesce(new.follow_up_at, now() + interval '24 hours');
  else -- come_back
    v_state := 'nurture';
    v_next_touch := coalesce(new.follow_up_at, now() + interval '7 days');
  end if;

  insert into leads (house_id, state, next_touch_at, last_touch_at, touch_count, source_knock_id, created_by, assigned_to)
  values (new.house_id, v_state, v_next_touch, new.created_at, 1, new.id, new.created_by, new.created_by);

  return new;
end $$;

create trigger knocks_spawn_lead_trg after insert on knocks
  for each row execute function knocks_spawn_lead();

-- -----------------------------------------------------------------------------
-- Nightly reawaken job — flips dead houses back to unknocked on their anniversary
-- -----------------------------------------------------------------------------
create or replace function reawaken_dead_houses() returns int
language plpgsql as $$
declare
  v_count int := 0;
begin
  with reawakened as (
    update houses
      set state = 'unknocked',
          dead_until = null,
          dead_reason = null
      where state = 'dead'
        and dead_until is not null
        and dead_until <= now()
      returning id
  )
  select count(*) into v_count from reawakened;
  return v_count;
end $$;

-- Schedule it nightly at 3am UTC. Supabase pg_cron runs in the cron schema.
-- Safe to re-run: unschedule if already exists.
do $$ begin
  perform cron.unschedule('giraffe-reawaken-nightly');
exception when others then null;
end $$;
select cron.schedule(
  'giraffe-reawaken-nightly',
  '0 3 * * *',
  $$ select reawaken_dead_houses(); $$
);

-- =============================================================================
-- VIEWS — the queries the Today screen and Map live on
-- =============================================================================

-- Follow-ups due today or overdue. Sorted by urgency.
create or replace view v_followups_due as
select
  l.id as lead_id,
  l.full_name,
  l.phone,
  l.state as lead_state,
  l.final_price,
  l.next_touch_at,
  l.touch_count,
  h.id as house_id,
  h.full_address,
  h.state as house_state,
  st_y(h.geom::geometry) as lat,
  st_x(h.geom::geometry) as lng,
  case
    when l.next_touch_at < now() - interval '24 hours' then 'overdue'
    when l.next_touch_at < now() then 'due_now'
    when l.next_touch_at < now() + interval '24 hours' then 'due_today'
    else 'upcoming'
  end as urgency
from leads l
join houses h on h.id = l.house_id
where l.state in ('new','quoted','nurture')
  and l.next_touch_at is not null
order by l.next_touch_at asc;

-- Quotes going stale (sent >48h ago, no movement)
create or replace view v_quotes_expiring as
select
  l.id as lead_id,
  l.full_name,
  l.phone,
  l.final_price,
  l.anchor_price,
  l.last_touch_at,
  extract(epoch from (now() - l.last_touch_at)) / 3600 as hours_since_touch,
  h.full_address
from leads l
join houses h on h.id = l.house_id
where l.state = 'quoted'
  and l.last_touch_at < now() - interval '48 hours'
order by l.last_touch_at asc;

-- Week-to-date booked revenue
create or replace view v_week_booked as
select
  coalesce(sum(price), 0) as booked,
  count(*) as jobs_count
from jobs
where scheduled_at >= date_trunc('week', now())
  and scheduled_at <  date_trunc('week', now()) + interval '7 days'
  and status in ('scheduled','en_route','in_progress','completed');

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- v1: permissive policies that allow the seed owner to do everything.
-- v2: tighten to auth.uid() = created_by / assigned_to.
-- All policies are written so the v2 migration is a one-line UPDATE per policy.

alter table users       enable row level security;
alter table houses      enable row level security;
alter table knocks      enable row level security;
alter table leads       enable row level security;
alter table customers   enable row level security;
alter table jobs        enable row level security;

-- v1 open policies (single-user mode). The `anon` role in Supabase is what the
-- publishable key uses. We grant full access here because v1 has no auth.
-- CRITICAL: before inviting rep #2, replace these with auth.uid()-based policies.
create policy "v1_open_users"      on users      for all to anon, authenticated using (true) with check (true);
create policy "v1_open_houses"     on houses     for all to anon, authenticated using (true) with check (true);
create policy "v1_open_knocks"     on knocks     for all to anon, authenticated using (true) with check (true);
create policy "v1_open_leads"      on leads      for all to anon, authenticated using (true) with check (true);
create policy "v1_open_customers"  on customers  for all to anon, authenticated using (true) with check (true);
create policy "v1_open_jobs"       on jobs       for all to anon, authenticated using (true) with check (true);

-- =============================================================================
-- DONE
-- =============================================================================
-- Next steps after running this:
--   1. Verify the cron job exists: select * from cron.job;
--   2. Test a knock insert: see BUILD_SPEC.docx
--   3. Point the Next.js app at this database via .env.local
-- =============================================================================
