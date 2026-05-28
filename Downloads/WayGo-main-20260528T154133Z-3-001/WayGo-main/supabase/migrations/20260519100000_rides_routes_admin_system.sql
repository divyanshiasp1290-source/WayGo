-- Routes category, published taxi rides, admin fleet, section seen tracking

do $$ begin
  create type public.route_category as enum ('normal', 'religious');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.fleet_owner_type as enum ('vendor', 'admin');
exception when duplicate_object then null;
end $$;

alter table public.routes
  add column if not exists route_category public.route_category not null default 'normal',
  add column if not exists owner_type public.fleet_owner_type not null default 'vendor';

alter table public.taxis
  add column if not exists owner_type public.fleet_owner_type not null default 'vendor';

alter table public.sharing_rides
  add column if not exists owner_type public.fleet_owner_type not null default 'vendor',
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null,
  add column if not exists travel_date date;

create table if not exists public.taxi_rides (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  owner_type public.fleet_owner_type not null default 'vendor',
  taxi_id uuid not null references public.taxis(id) on delete cascade,
  route_id uuid references public.routes(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  from_city text not null,
  to_city text not null,
  travel_date date not null,
  departure_time text not null,
  price numeric(10,2) not null,
  seats_available integer not null default 4,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint taxi_rides_status_check check (status in ('open', 'full', 'cancelled', 'completed'))
);

create table if not exists public.admin_section_seen (
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  section text not null,
  last_seen_at timestamptz not null default now(),
  primary key (admin_user_id, section),
  constraint admin_section_seen_section_check check (
    section in ('vendors', 'users', 'drivers', 'bookings', 'refunds')
  )
);

create index if not exists idx_routes_category on public.routes(route_category);
create index if not exists idx_routes_owner on public.routes(owner_type);
create index if not exists idx_taxi_rides_search on public.taxi_rides(from_city, to_city, travel_date, status);
create index if not exists idx_taxi_rides_owner on public.taxi_rides(owner_type, vendor_id);
create index if not exists idx_sharing_rides_owner on public.sharing_rides(owner_type, vendor_id);

drop trigger if exists trg_taxi_rides_updated_at on public.taxi_rides;
create trigger trg_taxi_rides_updated_at
  before update on public.taxi_rides
  for each row execute function public.update_updated_at_column();

alter table public.taxi_rides enable row level security;
alter table public.admin_section_seen enable row level security;

-- Public read for open published rides (customer search)
drop policy if exists taxi_rides_select_open on public.taxi_rides;
create policy taxi_rides_select_open on public.taxi_rides
  for select using (status = 'open');

drop policy if exists taxi_rides_vendor_manage on public.taxi_rides;
create policy taxi_rides_vendor_manage on public.taxi_rides
  for all using (
    public.has_role(auth.uid(), 'admin')
    or (
      owner_type = 'vendor'
      and vendor_id in (select id from public.vendors where user_id = auth.uid())
    )
  )
  with check (
    public.has_role(auth.uid(), 'admin')
    or (
      owner_type = 'vendor'
      and vendor_id in (select id from public.vendors where user_id = auth.uid())
    )
  );

drop policy if exists taxi_rides_admin_manage on public.taxi_rides;
create policy taxi_rides_admin_manage on public.taxi_rides
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists admin_section_seen_own on public.admin_section_seen;
create policy admin_section_seen_own on public.admin_section_seen
  for all using (admin_user_id = auth.uid())
  with check (admin_user_id = auth.uid());

-- Admin fleet: routes/taxis with null vendor_id
drop policy if exists routes_admin_insert on public.routes;
create policy routes_admin_insert on public.routes
  for insert with check (
    public.has_role(auth.uid(), 'admin')
    or vendor_id in (select id from public.vendors where user_id = auth.uid())
  );
