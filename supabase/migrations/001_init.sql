-- Nyumba production schema (run in Supabase SQL editor or via CLI)

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'agent', 'admin')),
  created_at timestamptz not null default now()
);

-- Agencies (storefronts)
create table if not exists public.agencies (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo_url text not null default '',
  cover_url text not null default '',
  bio text not null default '',
  verified boolean not null default false,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  counties text[] not null default '{}',
  years_active int not null default 0,
  response_rate int not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- Properties
create table if not exists public.properties (
  id text primary key,
  agency_id text not null references public.agencies (id) on delete cascade,
  title text not null,
  description text not null default '',
  transaction_type text not null check (transaction_type in ('rent', 'sale')),
  property_type text not null,
  price_kes bigint not null,
  rent_period text check (rent_period is null or rent_period in ('month', 'year')),
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  sqm int,
  parking int,
  county text not null,
  city text not null,
  estate text not null,
  lat double precision not null default 0,
  lng double precision not null default 0,
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'active'
    check (status in ('active', 'pending', 'sold', 'rented')),
  created_at timestamptz not null default now()
);

create index if not exists properties_county_idx on public.properties (county);
create index if not exists properties_agency_idx on public.properties (agency_id);
create index if not exists properties_tx_idx on public.properties (transaction_type);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_price_idx on public.properties (price_kes);

-- Favorites
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id text not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- Leads / viewing requests
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id text not null references public.properties (id) on delete cascade,
  agency_id text not null references public.agencies (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text,
  phone text,
  message text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'buyer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.properties enable row level security;
alter table public.favorites enable row level security;
alter table public.leads enable row level security;

-- Public read agencies
create policy "agencies_public_read"
  on public.agencies for select
  using (true);

-- Public read active properties
create policy "properties_public_read_active"
  on public.properties for select
  using (status = 'active' or auth.role() = 'authenticated');

-- Profiles: users read/update own
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Favorites: own only
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Leads: anyone can insert (guest ok); users see own
create policy "leads_insert_all"
  on public.leads for insert
  with check (true);

create policy "leads_select_own"
  on public.leads for select
  using (auth.uid() = user_id);
