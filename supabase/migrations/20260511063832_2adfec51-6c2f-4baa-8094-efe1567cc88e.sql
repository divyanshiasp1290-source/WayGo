ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS trip_type text NOT NULL DEFAULT 'one-way',
  ADD COLUMN IF NOT EXISTS return_date date,
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS driver_phone text,
  ADD COLUMN IF NOT EXISTS vehicle_plate text,
  ADD COLUMN IF NOT EXISTS pickup_address text,
  ADD COLUMN IF NOT EXISTS drop_address text;

ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_trip_type_check;
ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_trip_type_check CHECK (trip_type IN ('one-way','round-trip'));

ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending','confirmed','driver_assigned','en_route','completed','cancelled'));

CREATE INDEX IF NOT EXISTS idx_bookings_user_created ON public.bookings(user_id, created_at DESC);