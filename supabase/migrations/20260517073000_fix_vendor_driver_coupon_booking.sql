-- WayGo production fixes: auth trigger safety, vendor document bucket, coupon visibility, booking support columns/RLS.

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

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
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

  requested_role := case new.raw_user_meta_data ->> 'app_role'
    when 'driver' then 'driver'::public.app_role
    when 'vendor' then 'vendor'::public.app_role
    when 'admin' then 'admin'::public.app_role
    else 'customer'::public.app_role
  end;

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role)
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

-- Vendor signup needs this bucket before createSignedUploadUrl can work.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-documents',
  'vendor-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Coupon wallet visibility: every signed-in user can read active coupons.
drop policy if exists "users read active coupons" on public.coupons;
create policy "users read active coupons" on public.coupons
for select to authenticated
using (active = true);

-- Booking discount fields expected by server action.
alter table public.bookings
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists discount_amount numeric(10,2) not null default 0;

-- Customers read open rides; booking seat update is done with service role in server action.
drop policy if exists "customers_read_open_rides" on public.rides;
create policy "customers_read_open_rides" on public.rides
for select to authenticated
using (status = 'open');
