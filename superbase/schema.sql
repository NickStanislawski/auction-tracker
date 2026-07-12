-- Run this in the Supabase SQL editor (or via `supabase db push`) once per project.
-- It sets up two tables:
--   days     — one row per auction day a user has data for. Kept lightweight
--              (no vehicle data) so the calendar view can fetch all of a
--              user's days in a single cheap query.
--   vehicles — one row per vehicle, linked to a day. Only fetched when a
--              specific day is opened.
-- Row Level Security is enabled on both so a user can only ever read or write
-- their own rows — Supabase enforces this at the database level regardless of
-- what the client sends.

create extension if not exists pgcrypto;

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists vehicles (
  id text primary key, -- matches the client-generated Vehicle.id (e.g. "v-abc123")
  day_id uuid not null references days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lane text,
  run text,
  year text,
  make text,
  model text,
  miles text,
  cr text,
  mmr text,
  flag text,
  color text,
  vin text,
  cf text,
  bb text,
  ret text,
  buy text,
  went_down_line boolean not null default false,
  final_bid_price text,
  purchase_status text not null default 'not_purchased',
  updated_at timestamptz not null default now()
);

create index if not exists vehicles_day_id_idx on vehicles (day_id);
create index if not exists vehicles_user_id_idx on vehicles (user_id);

alter table days enable row level security;
alter table vehicles enable row level security;

create policy "days_owner_all" on days
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "vehicles_owner_all" on vehicles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at current on every write, useful later if you want
-- last-write-wins conflict handling across devices.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists vehicles_set_updated_at on vehicles;
create trigger vehicles_set_updated_at
  before update on vehicles
  for each row
  execute function set_updated_at();
