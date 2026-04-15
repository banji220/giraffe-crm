-- 004_security_lints.sql
--
-- Fix Supabase database linter warnings:
--
-- 1. SECURITY DEFINER views (v_quotes_expiring, v_week_booked, v_followups_due)
--    These views currently run with the creator's privileges, which bypasses
--    per-user RLS. Flip them to SECURITY INVOKER so the querying user's
--    policies are enforced.
--
-- 2. RLS disabled on public.spatial_ref_sys (PostGIS reference table)
--    Enable RLS and add a permissive SELECT policy so authenticated users
--    can still resolve spatial references but the table isn't wide open
--    to anonymous role via PostgREST.

-- ── 1. Switch views to SECURITY INVOKER ──────────────────────────────────
alter view if exists public.v_quotes_expiring  set (security_invoker = on);
alter view if exists public.v_week_booked      set (security_invoker = on);
alter view if exists public.v_followups_due    set (security_invoker = on);

-- ── 2. Lock down spatial_ref_sys ─────────────────────────────────────────
alter table if exists public.spatial_ref_sys enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'spatial_ref_sys'
      and policyname = 'spatial_ref_sys read for authenticated'
  ) then
    create policy "spatial_ref_sys read for authenticated"
      on public.spatial_ref_sys
      for select
      to authenticated
      using (true);
  end if;
end
$$;
