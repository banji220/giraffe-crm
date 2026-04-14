-- ─────────────────────────────────────────────────────────────────────────────
-- 002_auth.sql — SMS OTP auth + phone-based allowlist
--
-- Philosophy:
--   Auth is controlled by a plain table `allowed_phones`. If your phone number
--   is in this table, you can read/write. If not, the API returns empty rows.
--   No roles, no groups, no complexity. Tyler adds a friend = one INSERT.
--
-- To run: Supabase Dashboard → SQL Editor → paste → run.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Allowlist table
create table if not exists public.allowed_phones (
  phone       text primary key,              -- E.164 format: +1XXXXXXXXXX
  label       text,                           -- friendly name: "Tyler", "Mike the closer"
  invited_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- 2. Seed the owner. REPLACE with your E.164 phone number before running.
--    Format: +1 followed by 10 digits, no spaces or dashes.
insert into public.allowed_phones (phone, label)
values ('+17752649898', 'Tyler (owner)')
on conflict (phone) do nothing;

-- 3. Helper function: is the current session's phone allowed?
create or replace function public.is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.allowed_phones ap
    where ap.phone = (select phone from auth.users where id = auth.uid())
  );
$$;

grant execute on function public.is_allowed() to anon, authenticated;

-- 4. RLS — lock everything down. Only allowed phones can see data.
alter table public.houses       enable row level security;
alter table public.knocks       enable row level security;
alter table public.leads        enable row level security;
alter table public.customers    enable row level security;
alter table public.jobs         enable row level security;
alter table public.allowed_phones enable row level security;

-- Drop old open policies if they exist (idempotent)
drop policy if exists "public read houses"    on public.houses;
drop policy if exists "public write houses"   on public.houses;
drop policy if exists "public read knocks"    on public.knocks;
drop policy if exists "public write knocks"   on public.knocks;
drop policy if exists "public read leads"     on public.leads;
drop policy if exists "public write leads"    on public.leads;
drop policy if exists "public read customers" on public.customers;
drop policy if exists "public write customers"on public.customers;
drop policy if exists "public read jobs"      on public.jobs;
drop policy if exists "public write jobs"     on public.jobs;

-- One policy per table: allowed phones can do everything.
create policy "allowed full access houses"    on public.houses       for all using (public.is_allowed()) with check (public.is_allowed());
create policy "allowed full access knocks"    on public.knocks       for all using (public.is_allowed()) with check (public.is_allowed());
create policy "allowed full access leads"     on public.leads        for all using (public.is_allowed()) with check (public.is_allowed());
create policy "allowed full access customers" on public.customers    for all using (public.is_allowed()) with check (public.is_allowed());
create policy "allowed full access jobs"      on public.jobs         for all using (public.is_allowed()) with check (public.is_allowed());

-- Allowlist itself: only allowed users can see it; anyone allowed can invite.
create policy "allowed read list"    on public.allowed_phones for select using (public.is_allowed());
create policy "allowed insert list"  on public.allowed_phones for insert with check (public.is_allowed());
create policy "allowed delete list"  on public.allowed_phones for delete using (public.is_allowed());
