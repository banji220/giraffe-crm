-- Extend allowlist to accept email OR phone.

alter table public.allowed_phones
  add column if not exists email text;

alter table public.allowed_phones
  add column if not exists id uuid default gen_random_uuid();

-- Swap primary key from phone to id (so phone can be null for email-only rows)
do $$
declare
  pk_cols text[];
begin
  select array_agg(a.attname::text order by a.attnum)
    into pk_cols
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
   where c.conname = 'allowed_phones_pkey'
     and c.conrelid = 'public.allowed_phones'::regclass;

  if pk_cols = array['phone']::text[] then
    alter table public.allowed_phones drop constraint allowed_phones_pkey;
    alter table public.allowed_phones add primary key (id);
    create unique index if not exists allowed_phones_phone_idx
      on public.allowed_phones (phone) where phone is not null;
  end if;
end$$;

create unique index if not exists allowed_phones_email_idx
  on public.allowed_phones (lower(email))
  where email is not null;

alter table public.allowed_phones
  drop constraint if exists allowed_phones_has_identifier;
alter table public.allowed_phones
  add constraint allowed_phones_has_identifier
  check (phone is not null or email is not null);

alter table public.allowed_phones
  alter column phone drop not null;

create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.allowed_phones ap
    join auth.users u on u.id = auth.uid()
    where (ap.phone is not null and ap.phone = u.phone)
       or (ap.email is not null and lower(ap.email) = lower(u.email))
  );
$$;

-- TODO: set to your actual Gmail before running.
-- insert into public.allowed_phones (email, label)
--   values ('khanjani1997@gmail.com', 'Tyler (owner)')
--   on conflict do nothing;
