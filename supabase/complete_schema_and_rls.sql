-- WayGo complete Supabase schema + role-based RLS
-- Paste this whole file into the Supabase SQL Editor for the new project.
-- It is designed for a fresh Supabase project.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('customer', 'driver', 'vendor', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vehicle_type as enum ('taxi', 'bus', 'sharing');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vendor_approval_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.driver_account_status as enum ('active', 'suspended', 'pending_verification');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.driver_document_status as enum ('verified', 'rejected', 'pending');
exception when duplicate_object then null;
end $$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text,
  contact_email text,
  contact_phone text,
  address text,
  city text,
  state text,
  gst_number text,
  aadhaar_number text,
  pan_number text,
  business_registration_url text,
  aadhaar_upload_url text,
  pan_upload_url text,
  approval_status public.vendor_approval_status not null default 'pending',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_auth (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  mobile_number text not null,
  approval_status public.vendor_approval_status not null default 'pending',
  last_login_at timestamptz,
  remember_me boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null unique references public.vendors(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text not null,
  business_email text not null unique,
  mobile_number text not null,
  business_address text not null,
  city text not null,
  state text not null,
  gst_number text,
  aadhaar_number text,
  pan_number text,
  business_registration_url text,
  aadhaar_upload_url text,
  pan_upload_url text,
  approval_status public.vendor_approval_status not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  full_name text,
  email text,
  phone text,
  profile_photo_url text,
  license_number text not null,
  license_expiry_date date,
  license_upload_url text,
  license_verification_status public.driver_document_status not null default 'pending',
  aadhaar_number text,
  aadhaar_upload_url text,
  aadhaar_verification_status public.driver_document_status not null default 'pending',
  pan_number text,
  pan_upload_url text,
  pan_verification_status public.driver_document_status not null default 'pending',
  assigned_vehicle text,
  vehicle_number text,
  vehicle_type text,
  rating numeric(3,2) not null default 5.0,
  is_online boolean not null default false,
  verified boolean not null default false,
  status public.driver_account_status not null default 'pending_verification',
  suspended_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.taxis (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  model text not null,
  plate_number text not null unique,
  capacity integer not null default 4,
  taxi_type text not null default 'sedan',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.buses (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  model text not null,
  plate_number text not null unique,
  total_seats integer not null default 40,
  bus_type text not null default 'ac_seater',
  amenities text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null,
  from_city text not null,
  to_city text not null,
  distance_km numeric(8,2),
  duration_minutes integer,
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sharing_rides (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references public.routes(id) on delete set null,
  taxi_id uuid references public.taxis(id) on delete set null,
  driver_id uuid references public.drivers(id) on delete set null,
  from_city text not null,
  to_city text not null,
  departure_at timestamptz not null,
  seats_total integer not null default 4,
  seats_booked integer not null default 0,
  price_per_seat numeric(10,2) not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percent',
  discount_value numeric(10,2) not null,
  max_uses integer,
  used_count integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vehicle_type public.vehicle_type not null,
  operator_name text not null,
  from_city text not null,
  to_city text not null,
  travel_date date not null,
  return_date date,
  trip_type text not null default 'one-way',
  departure_time text not null,
  passenger_name text not null,
  passenger_phone text not null,
  pickup_address text,
  drop_address text,
  seats integer not null default 1,
  price_per_seat numeric(10,2) not null,
  total_price numeric(10,2) not null,
  status text not null default 'confirmed',
  driver_name text,
  driver_phone text,
  vehicle_plate text,
  route_id uuid references public.routes(id) on delete set null,
  taxi_id uuid references public.taxis(id) on delete set null,
  bus_id uuid references public.buses(id) on delete set null,
  sharing_ride_id uuid references public.sharing_rides(id) on delete set null,
  coupon_id uuid references public.coupons(id) on delete set null,
  discount_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_trip_type_check check (trip_type in ('one-way', 'round-trip')),
  constraint bookings_status_check check (status in ('pending', 'confirmed', 'driver_assigned', 'en_route', 'completed', 'cancelled'))
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  method text not null default 'card',
  status text not null default 'pending',
  transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null default 'topup',
  reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_vendors_user_id on public.vendors(user_id);
create index if not exists idx_vendor_auth_user_id on public.vendor_auth(user_id);
create index if not exists idx_vendor_auth_status on public.vendor_auth(approval_status);
create index if not exists idx_vendor_profiles_status on public.vendor_profiles(approval_status);
create index if not exists idx_vendor_profiles_city_state on public.vendor_profiles(city, state);
create index if not exists idx_drivers_user_id on public.drivers(user_id);
create index if not exists idx_drivers_vendor_id on public.drivers(vendor_id);
create index if not exists idx_drivers_status on public.drivers(status);
create index if not exists idx_drivers_vehicle_number on public.drivers(vehicle_number);
create index if not exists idx_drivers_email on public.drivers(email);
create unique index if not exists idx_drivers_license_unique on public.drivers(license_number);
create unique index if not exists idx_drivers_aadhaar_unique on public.drivers(aadhaar_number) where aadhaar_number is not null;
create unique index if not exists idx_drivers_pan_unique on public.drivers(pan_number) where pan_number is not null;
create index if not exists idx_taxis_vendor_id on public.taxis(vendor_id);
create index if not exists idx_taxis_driver_id on public.taxis(driver_id);
create index if not exists idx_buses_vendor_id on public.buses(vendor_id);
create index if not exists idx_routes_from_to on public.routes(from_city, to_city);
create index if not exists idx_routes_vendor_id on public.routes(vendor_id);
create index if not exists idx_sharing_from_to_dep on public.sharing_rides(from_city, to_city, departure_at);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_bookings_user_id on public.bookings(user_id);
create index if not exists idx_bookings_user_created on public.bookings(user_id, created_at desc);
create index if not exists idx_bookings_route_id on public.bookings(route_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_payments_booking_id on public.payments(booking_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_wallet_tx_wallet_id on public.wallet_transactions(wallet_id);
create index if not exists idx_wallet_tx_user_id on public.wallet_transactions(user_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);

do $$ declare
  t text;
begin
  foreach t in array array[
    'user_roles', 'profiles', 'vendors', 'vendor_auth', 'vendor_profiles',
    'drivers', 'taxis', 'buses', 'routes', 'sharing_rides', 'coupons',
    'bookings', 'payments', 'wallets', 'wallet_transactions', 'notifications'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_vendors_updated on public.vendors;
create trigger trg_vendors_updated before update on public.vendors
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_vendor_auth_updated on public.vendor_auth;
create trigger trg_vendor_auth_updated before update on public.vendor_auth
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_vendor_profiles_updated on public.vendor_profiles;
create trigger trg_vendor_profiles_updated before update on public.vendor_profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_drivers_updated on public.drivers;
create trigger trg_drivers_updated before update on public.drivers
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_taxis_updated on public.taxis;
create trigger trg_taxis_updated before update on public.taxis
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_buses_updated on public.buses;
create trigger trg_buses_updated before update on public.buses
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_routes_updated on public.routes;
create trigger trg_routes_updated before update on public.routes
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_sharing_updated on public.sharing_rides;
create trigger trg_sharing_updated before update on public.sharing_rides
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_coupons_updated on public.coupons;
create trigger trg_coupons_updated before update on public.coupons
for each row execute function public.update_updated_at_column();

drop trigger if exists update_bookings_updated_at on public.bookings;
create trigger update_bookings_updated_at before update on public.bookings
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_payments_updated on public.payments;
create trigger trg_payments_updated before update on public.payments
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_wallets_updated on public.wallets;
create trigger trg_wallets_updated before update on public.wallets
for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.phone
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      phone = coalesce(public.profiles.phone, excluded.phone);

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS policies
do $$ declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

create policy "admin all user_roles" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users read own roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "admin all profiles" on public.profiles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users own profile" on public.profiles
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "admin all vendors" on public.vendors
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "vendors own vendor record" on public.vendors
for all to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'));

create policy "admin all vendor_auth" on public.vendor_auth
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "vendors own vendor_auth" on public.vendor_auth
for select to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'));

create policy "vendors update own login metadata" on public.vendor_auth
for update to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'));

create policy "admin all vendor_profiles" on public.vendor_profiles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "vendors own vendor_profiles" on public.vendor_profiles
for all to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'vendor'));

create policy "admin all drivers" on public.drivers
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "drivers own driver record" on public.drivers
for select to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'driver'));

create policy "drivers update own online state" on public.drivers
for update to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'driver'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'driver'));

create policy "vendors manage own drivers" on public.drivers
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = drivers.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = drivers.vendor_id
      and v.user_id = auth.uid()
  )
);

create policy "admin all taxis" on public.taxis
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers read active taxis" on public.taxis
for select to authenticated
using (active = true and public.has_role(auth.uid(), 'customer'));

create policy "drivers read assigned taxis" on public.taxis
for select to authenticated
using (
  public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and d.id = taxis.driver_id
  )
);

create policy "vendors manage own taxis" on public.taxis
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = taxis.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = taxis.vendor_id
      and v.user_id = auth.uid()
  )
);

create policy "admin all buses" on public.buses
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers read active buses" on public.buses
for select to authenticated
using (active = true and public.has_role(auth.uid(), 'customer'));

create policy "vendors manage own buses" on public.buses
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = buses.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = buses.vendor_id
      and v.user_id = auth.uid()
  )
);

create policy "admin all routes" on public.routes
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers read active routes" on public.routes
for select to authenticated
using (active = true and public.has_role(auth.uid(), 'customer'));

create policy "drivers read active routes" on public.routes
for select to authenticated
using (active = true and public.has_role(auth.uid(), 'driver'));

create policy "vendors manage own routes" on public.routes
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = routes.vendor_id
      and v.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.id = routes.vendor_id
      and v.user_id = auth.uid()
  )
);

create policy "admin all sharing_rides" on public.sharing_rides
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers read open sharing rides" on public.sharing_rides
for select to authenticated
using (status = 'open' and public.has_role(auth.uid(), 'customer'));

create policy "drivers manage assigned sharing rides" on public.sharing_rides
for all to authenticated
using (
  public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and d.id = sharing_rides.driver_id
  )
)
with check (
  public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and d.id = sharing_rides.driver_id
  )
);

create policy "vendors manage own sharing rides" on public.sharing_rides
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1
    from public.taxis t
    join public.vendors v on v.id = t.vendor_id
    where t.id = sharing_rides.taxi_id
      and v.user_id = auth.uid()
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1
    from public.taxis t
    join public.vendors v on v.id = t.vendor_id
    where t.id = sharing_rides.taxi_id
      and v.user_id = auth.uid()
  )
);

create policy "admin all coupons" on public.coupons
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users read active coupons" on public.coupons
for select to authenticated
using (
  active = true
  and (
    public.has_role(auth.uid(), 'customer')
    or public.has_role(auth.uid(), 'vendor')
    or public.has_role(auth.uid(), 'driver')
  )
);

create policy "admin all bookings" on public.bookings
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers manage own bookings" on public.bookings
for all to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'customer'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'customer'));

create policy "drivers manage assigned bookings" on public.bookings
for all to authenticated
using (
  public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and (
        d.id in (select t.driver_id from public.taxis t where t.id = bookings.taxi_id)
        or d.id = (select sr.driver_id from public.sharing_rides sr where sr.id = bookings.sharing_ride_id)
        or d.phone = bookings.driver_phone
      )
  )
)
with check (
  public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and (
        d.id in (select t.driver_id from public.taxis t where t.id = bookings.taxi_id)
        or d.id = (select sr.driver_id from public.sharing_rides sr where sr.id = bookings.sharing_ride_id)
        or d.phone = bookings.driver_phone
      )
  )
);

create policy "vendors manage own fleet bookings" on public.bookings
for all to authenticated
using (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1
    from public.vendors v
    where v.user_id = auth.uid()
      and (
        exists (select 1 from public.taxis t where t.id = bookings.taxi_id and t.vendor_id = v.id)
        or exists (select 1 from public.buses b where b.id = bookings.bus_id and b.vendor_id = v.id)
        or exists (select 1 from public.routes r where r.id = bookings.route_id and r.vendor_id = v.id)
      )
  )
)
with check (
  public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1
    from public.vendors v
    where v.user_id = auth.uid()
      and (
        exists (select 1 from public.taxis t where t.id = bookings.taxi_id and t.vendor_id = v.id)
        or exists (select 1 from public.buses b where b.id = bookings.bus_id and b.vendor_id = v.id)
        or exists (select 1 from public.routes r where r.id = bookings.route_id and r.vendor_id = v.id)
      )
  )
);

create policy "admin all payments" on public.payments
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "customers own payments" on public.payments
for all to authenticated
using (auth.uid() = user_id and public.has_role(auth.uid(), 'customer'))
with check (auth.uid() = user_id and public.has_role(auth.uid(), 'customer'));

create policy "admin all wallets" on public.wallets
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users own wallet" on public.wallets
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "admin all wallet_transactions" on public.wallet_transactions
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users own wallet transactions" on public.wallet_transactions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "admin all notifications" on public.notifications
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "users own notifications" on public.notifications
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vendor-documents', 'vendor-documents', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('driver-documents', 'driver-documents', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin all storage objects" on storage.objects;
drop policy if exists "vendors manage vendor documents" on storage.objects;
drop policy if exists "vendors manage driver documents" on storage.objects;
drop policy if exists "drivers read own driver documents" on storage.objects;

create policy "admin all storage objects" on storage.objects
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "vendors manage vendor documents" on storage.objects
for all to authenticated
using (
  bucket_id = 'vendor-documents'
  and public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.user_id = auth.uid()
      and v.id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'vendor-documents'
  and public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.user_id = auth.uid()
      and v.id::text = (storage.foldername(name))[1]
  )
);

create policy "vendors manage driver documents" on storage.objects
for all to authenticated
using (
  bucket_id = 'driver-documents'
  and public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.user_id = auth.uid()
      and v.id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'driver-documents'
  and public.has_role(auth.uid(), 'vendor')
  and exists (
    select 1 from public.vendors v
    where v.user_id = auth.uid()
      and v.id::text = (storage.foldername(name))[1]
  )
);

create policy "drivers read own driver documents" on storage.objects
for select to authenticated
using (
  bucket_id = 'driver-documents'
  and public.has_role(auth.uid(), 'driver')
  and exists (
    select 1 from public.drivers d
    where d.user_id = auth.uid()
      and d.vendor_id::text = (storage.foldername(name))[1]
  )
);

alter table public.bookings replica identity full;
alter table public.notifications replica identity full;
alter table public.sharing_rides replica identity full;
alter table public.wallet_transactions replica identity full;

do $$ begin
  begin alter publication supabase_realtime add table public.bookings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.sharing_rides; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.wallet_transactions; exception when duplicate_object then null; end;
end $$;
