-- Extend allowlist to accept email OR phone.
-- Existing rows keep their phone. New column `email` is optional.
-- At least one of (phone, email) must be present per row.

-- Add a surrogate id and email column; keep phone as a plain (nullable) field.
alter table public.allowed_phones
  add column if not exists email text;

alter table public.allowed_phones
  add column if not exists id uuid default gen_random_uuid();

-- Swap primary key from phone to id (so phone can be null for email-only rows)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.allowed_phones'::regclass
      and contype = 'p'
      and conname = 'allowed_phones_pkey'
  ) then
    -- Only drop if current PK is on phone
    if (select array_agg(a.attname order by a.attnum)
          from pg_constraint c
          join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
         where c.conname = 'allowed_phones_pkey'
           and c.conrelid = 'public.allowed_phones'::regclass) = array['phone'] then
      alter table public.allowed_phones drop constraint allowed_phones_pkey;
      alter table public.allowed_phones add primary key (id);
      create unique index if not exists allowed_phones_phone_idx
        on public.allowed_phones (phone) where phone is not null;
    end if;
  end if;
end$$;

-- Case-insensitive uniqueness on email
create unique index if not exists allowed_phones_email_idx
  on public.allowed_phones (lower(email))
  where email is not null;

-- Require at least one identifier
alter table public.allowed_phones
  drop constraint if exists allowed_phones_has_identifier;
alter table public.allowed_phones
  add constraint allowed_phones_has_identifier
  check (phone is not null or email is not null);

-- Make phone nullable so email-only rows are valid
alter table public.allowed_phones
  alter column phone drop not null;

-- Update is_allowed() to accept either identifier
create or replace function public.is_allowed() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.allowed_phones ap
    join auth.users u on u.id = auth.uid()
    where (ap.phone is not null and ap.phone = u.phone)
       or (ap.email is not null and lower(ap.email) = lower(u.email))
  );
$$;

-- TODO: replace with your actual Gmail address before running.
-- insert into public.allowed_phones (email, label)
--   values ('you@gmail.com', 'Tyler (owner)')
--   on conflict do nothing;
