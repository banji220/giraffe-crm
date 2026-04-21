-- 005_lock_down_rls.sql
--
-- Second round of Supabase linter fixes:
--
-- 1. function_search_path_mutable (11 functions)
--    Pin search_path so functions can't be hijacked by session-level
--    schema shims.
--
-- 2. rls_policy_always_true (6 tables)
--    The v1_open_* policies allow anon + authenticated unrestricted
--    access. Replace with authenticated-only policies. Real per-user
--    scoping will come later — for now we at least cut the anon role
--    off the public tables.
--
-- Notes:
-- * extension_in_public (postgis): NOT fixed here. Moving PostGIS out
--   of public is risky (breaks every ST_* call site, spatial_ref_sys
--   FKs, etc). Dismiss in the dashboard.
-- * auth_leaked_password_protection: Dashboard → Authentication →
--   Providers → Email → "Leaked password protection" toggle. Not SQL.

-- ── 1. Pin function search_path ──────────────────────────────────────────
-- Use ALTER FUNCTION ... SET search_path. We guard each with a DO block
-- so missing functions don't blow up the whole migration.

do $$
declare
  fn text;
  sig text;
  funcs text[][] := array[
    ['calculate_anchor_price',   ''],
    ['calculate_base_price',     ''],
    ['jobs_after_change',        ''],
    ['knocks_spawn_lead',        ''],
    ['knocks_after_insert',      ''],
    ['leads_after_change',       ''],
    ['touch_updated_at',         ''],
    ['get_houses_in_bbox',       ''],
    ['reawaken_dead_houses',     ''],
    ['find_nearby_house',        ''],
    ['recompute_house_state',    '']
  ];
  i int;
  rec record;
begin
  for i in 1 .. array_length(funcs, 1) loop
    fn := funcs[i][1];
    for rec in
      select p.oid::regprocedure::text as full_sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and p.proname = fn
    loop
      execute format('alter function %s set search_path = public, pg_catalog', rec.full_sig);
    end loop;
  end loop;
end $$;

-- ── 2. Replace permissive v1_open_* policies ─────────────────────────────
-- Drop the always-true policies and add authenticated-only SELECT/INSERT/
-- UPDATE/DELETE policies. This is still permissive inside the app (any
-- signed-in user sees everything), but anon is now blocked.

do $$
declare
  t text;
  tables text[] := array['customers','houses','jobs','knocks','leads','users'];
  pol record;
begin
  foreach t in array tables loop
    -- drop every v1_open_* policy on this table
    for pol in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = t and policyname like 'v1_open_%'
    loop
      execute format('drop policy if exists %I on public.%I', pol.policyname, t);
    end loop;

    -- ensure RLS is on
    execute format('alter table public.%I enable row level security', t);

    -- authenticated-only ALL policy
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t
        and policyname = 'authenticated_all'
    ) then
      execute format($f$
        create policy authenticated_all
          on public.%I
          for all
          to authenticated
          using (true)
          with check (true)
      $f$, t);
    end if;
  end loop;
end $$;
