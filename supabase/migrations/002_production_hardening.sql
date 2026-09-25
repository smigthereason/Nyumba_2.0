-- Nyumba production hardening
-- Run after 001_init.sql. Safe to run more than once where noted.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Dashboard-owned fields and stronger uniqueness guarantees.
alter table public.agencies
  add column if not exists bank_account jsonb,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists agencies_email_unique_idx
  on public.agencies (lower(email));

create index if not exists agencies_featured_rating_idx
  on public.agencies (featured, rating desc);
create index if not exists agencies_counties_gin_idx
  on public.agencies using gin (counties);
create index if not exists agencies_name_trgm_idx
  on public.agencies using gin (name gin_trgm_ops);
create index if not exists agencies_bio_trgm_idx
  on public.agencies using gin (bio gin_trgm_ops);

-- Credentials are server-only. RLS is intentionally enabled without client policies;
-- the service-role backend bypasses RLS.
create table if not exists public.agency_accounts (
  agency_id text primary key references public.agencies(id) on delete cascade,
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists agency_accounts_email_unique_idx
  on public.agency_accounts (lower(email));
alter table public.agency_accounts enable row level security;

-- Upcoming projects were previously mock-only.
create table if not exists public.upcoming_projects (
  id text primary key,
  agency_id text not null references public.agencies(id) on delete cascade,
  name text not null,
  description text not null default '',
  county text not null,
  estate text not null,
  image_url text not null,
  price_from_kes bigint not null check (price_from_kes > 0),
  completion_label text not null,
  units_left integer check (units_left is null or units_left >= 0),
  property_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists upcoming_projects_agency_idx
  on public.upcoming_projects (agency_id, created_at desc);
create index if not exists upcoming_projects_county_idx
  on public.upcoming_projects (county, created_at desc);
alter table public.upcoming_projects enable row level security;

drop policy if exists "upcoming_projects_public_read" on public.upcoming_projects;
create policy "upcoming_projects_public_read"
  on public.upcoming_projects for select
  using (true);

-- Lead type is required by the dashboard.
alter table public.leads
  add column if not exists type text not null default 'viewing'
    check (type in ('viewing', 'purchase')),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists leads_agency_status_created_idx
  on public.leads (agency_id, status, created_at desc);
create index if not exists leads_property_idx on public.leads (property_id);
create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

-- Bound the most common catalogue access patterns.
create index if not exists properties_active_featured_created_idx
  on public.properties (status, featured desc, created_at desc);
create index if not exists properties_active_county_tx_price_idx
  on public.properties (status, county, transaction_type, price_kes);
create index if not exists properties_agency_status_created_idx
  on public.properties (agency_id, status, created_at desc);
create index if not exists properties_title_trgm_idx
  on public.properties using gin (title gin_trgm_ops);
create index if not exists properties_estate_trgm_idx
  on public.properties using gin (estate gin_trgm_ops);
create index if not exists properties_city_trgm_idx
  on public.properties using gin (city gin_trgm_ops);
create index if not exists properties_county_trgm_idx
  on public.properties using gin (county gin_trgm_ops);
create index if not exists properties_description_trgm_idx
  on public.properties using gin (description gin_trgm_ops);

-- Database-side listing count prevents fetching every property row in the client.
create or replace function public.agencies_with_listing_count(
  p_county text default null,
  p_featured_only boolean default false,
  p_verified_only boolean default false,
  p_search text default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id text,
  name text,
  slug text,
  logo_url text,
  cover_url text,
  bio text,
  verified boolean,
  rating numeric,
  review_count integer,
  phone text,
  whatsapp text,
  email text,
  counties text[],
  years_active integer,
  response_rate integer,
  featured boolean,
  created_at timestamptz,
  listing_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id, a.name, a.slug, a.logo_url, a.cover_url, a.bio, a.verified,
    a.rating, a.review_count, a.phone, a.whatsapp, a.email, a.counties,
    a.years_active, a.response_rate, a.featured, a.created_at,
    count(p.id) filter (where p.status = 'active') as listing_count
  from public.agencies a
  left join public.properties p on p.agency_id = a.id
  where (p_county is null or a.counties @> array[p_county]::text[])
    and (not p_featured_only or a.featured)
    and (not p_verified_only or a.verified)
    and (
      p_search is null
      or a.name ilike '%' || p_search || '%'
      or a.bio ilike '%' || p_search || '%'
    )
  group by a.id
  order by a.rating desc, a.id
  limit greatest(1, least(coalesce(p_limit, 24), 100))
  offset least(greatest(coalesce(p_offset, 0), 0), 10000);
$$;

grant execute on function public.agencies_with_listing_count(text, boolean, boolean, text, integer, integer)
  to anon, authenticated;


-- Authenticated buyers should not automatically see pending/sold/rented inventory.
drop policy if exists "properties_public_read_active" on public.properties;
create policy "properties_public_read_active"
  on public.properties for select
  using (status = 'active');

-- Guest leads should enter through the server API where validation, origin checks,
-- request limits and abuse controls are applied. Authenticated users can still create
-- a lead for themselves directly if needed.
drop policy if exists "leads_insert_all" on public.leads;
drop policy if exists "leads_insert_authenticated_own" on public.leads;
create policy "leads_insert_authenticated_own"
  on public.leads for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.properties p
      where p.id = property_id
        and p.agency_id = agency_id
        and p.status = 'active'
    )
  );

-- Keep updated_at accurate.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agencies_set_updated_at on public.agencies;
create trigger agencies_set_updated_at
before update on public.agencies
for each row execute function public.set_updated_at();

drop trigger if exists agency_accounts_set_updated_at on public.agency_accounts;
create trigger agency_accounts_set_updated_at
before update on public.agency_accounts
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.upcoming_projects;
create trigger projects_set_updated_at
before update on public.upcoming_projects
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Cross-instance rate limit primitive for sensitive public endpoints.
create table if not exists public.api_rate_limits (
  key text primary key,
  window_start timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.api_rate_limits enable row level security;
create index if not exists api_rate_limits_updated_idx on public.api_rate_limits (updated_at);

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.api_rate_limits%rowtype;
  v_window interval := make_interval(secs => greatest(1, p_window_seconds));
begin
  insert into public.api_rate_limits as r (key, window_start, request_count, updated_at)
  values (p_key, v_now, 1, v_now)
  on conflict (key) do update
    set window_start = case
          when r.window_start + v_window <= v_now then v_now
          else r.window_start
        end,
        request_count = case
          when r.window_start + v_window <= v_now then 1
          else r.request_count + 1
        end,
        updated_at = v_now
  returning * into v_row;

  allowed := v_row.request_count <= greatest(1, p_limit);
  remaining := greatest(0, greatest(1, p_limit) - v_row.request_count);
  reset_at := v_row.window_start + v_window;
  return next;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- Atomic dashboard account registration: agency + credentials succeed or fail together.
create or replace function public.register_agency_account(
  p_agency jsonb,
  p_password_hash text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := p_agency->>'id';
begin
  insert into public.agencies (
    id, name, slug, logo_url, cover_url, bio, verified, rating, review_count,
    phone, whatsapp, email, counties, years_active, response_rate, featured, bank_account
  ) values (
    v_id,
    p_agency->>'name',
    p_agency->>'slug',
    coalesce(p_agency->>'logo_url', ''),
    coalesce(p_agency->>'cover_url', ''),
    coalesce(p_agency->>'bio', ''),
    coalesce((p_agency->>'verified')::boolean, false),
    coalesce((p_agency->>'rating')::numeric, 0),
    coalesce((p_agency->>'review_count')::integer, 0),
    coalesce(p_agency->>'phone', ''),
    coalesce(p_agency->>'whatsapp', ''),
    lower(p_agency->>'email'),
    coalesce(array(select jsonb_array_elements_text(p_agency->'counties')), '{}'::text[]),
    coalesce((p_agency->>'years_active')::integer, 0),
    coalesce((p_agency->>'response_rate')::integer, 0),
    coalesce((p_agency->>'featured')::boolean, false),
    p_agency->'bank_account'
  );

  insert into public.agency_accounts (agency_id, email, password_hash)
  values (v_id, lower(p_agency->>'email'), p_password_hash);

  return v_id;
end;
$$;

revoke all on function public.register_agency_account(jsonb, text) from public, anon, authenticated;
grant execute on function public.register_agency_account(jsonb, text) to service_role;

-- Keep agency profile and login email synchronized atomically.
create or replace function public.update_agency_profile(
  p_agency_id text,
  p_profile jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.agencies
  set name = p_profile->>'name',
      email = lower(p_profile->>'email'),
      phone = p_profile->>'phone',
      whatsapp = p_profile->>'whatsapp',
      bio = p_profile->>'bio',
      counties = coalesce(array(select jsonb_array_elements_text(p_profile->'counties')), '{}'::text[]),
      logo_url = p_profile->>'logo_url',
      cover_url = p_profile->>'cover_url',
      bank_account = p_profile->'bank_account'
  where id = p_agency_id;

  if not found then
    raise exception 'agency_not_found' using errcode = 'P0002';
  end if;

  update public.agency_accounts
  set email = lower(p_profile->>'email')
  where agency_id = p_agency_id;
end;
$$;

revoke all on function public.update_agency_profile(text, jsonb) from public, anon, authenticated;
grant execute on function public.update_agency_profile(text, jsonb) to service_role;
