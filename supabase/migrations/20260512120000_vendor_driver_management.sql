DO $$ BEGIN
  CREATE TYPE public.driver_account_status AS ENUM ('active', 'suspended', 'pending_verification');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.driver_document_status AS ENUM ('verified', 'rejected', 'pending');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS license_upload_url TEXT,
  ADD COLUMN IF NOT EXISTS license_verification_status public.driver_document_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_upload_url TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_verification_status public.driver_document_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS pan_upload_url TEXT,
  ADD COLUMN IF NOT EXISTS pan_verification_status public.driver_document_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS assigned_vehicle TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT,
  ADD COLUMN IF NOT EXISTS status public.driver_account_status NOT NULL DEFAULT 'pending_verification',
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE public.drivers
SET status = CASE WHEN verified THEN 'active'::public.driver_account_status ELSE 'pending_verification'::public.driver_account_status END
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_drivers_status ON public.drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_number ON public.drivers(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON public.drivers(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_license_unique ON public.drivers(license_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_aadhaar_unique ON public.drivers(aadhaar_number) WHERE aadhaar_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_drivers_pan_unique ON public.drivers(pan_number) WHERE pan_number IS NOT NULL;

DROP POLICY IF EXISTS "Drivers viewable by owner or admin" ON public.drivers;
DROP POLICY IF EXISTS "Users insert own driver" ON public.drivers;
DROP POLICY IF EXISTS "Driver owner or admin updates" ON public.drivers;
DROP POLICY IF EXISTS "Admin deletes driver" ON public.drivers;

CREATE POLICY "Drivers view own vendor or admin" ON public.drivers
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = drivers.vendor_id AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendor or admin inserts drivers" ON public.drivers
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = vendor_id AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Driver vendor or admin updates" ON public.drivers
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = drivers.vendor_id AND v.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = drivers.vendor_id AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Driver vendor or admin deletes" ON public.drivers
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = drivers.vendor_id AND v.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver-documents',
  'driver-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

CREATE POLICY "Vendor owners upload driver documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'driver-documents'
    AND EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id::text = (storage.foldername(name))[1]
      AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendor owners read driver documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'driver-documents'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id::text = (storage.foldername(name))[1]
        AND v.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.drivers d
        WHERE d.user_id = auth.uid()
        AND d.vendor_id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE POLICY "Vendor owners update driver documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'driver-documents'
    AND EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id::text = (storage.foldername(name))[1]
      AND v.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendor owners delete driver documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'driver-documents'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id::text = (storage.foldername(name))[1]
        AND v.user_id = auth.uid()
      )
    )
  );
