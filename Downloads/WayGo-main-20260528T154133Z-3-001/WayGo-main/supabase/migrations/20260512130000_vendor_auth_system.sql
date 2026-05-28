DO $$ BEGIN
  CREATE TYPE public.vendor_approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.vendor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  mobile_number TEXT NOT NULL,
  approval_status public.vendor_approval_status NOT NULL DEFAULT 'pending',
  last_login_at TIMESTAMPTZ,
  remember_me BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  business_email TEXT NOT NULL UNIQUE,
  mobile_number TEXT NOT NULL,
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  gst_number TEXT,
  aadhaar_number TEXT,
  pan_number TEXT,
  business_registration_url TEXT,
  aadhaar_upload_url TEXT,
  pan_upload_url TEXT,
  approval_status public.vendor_approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_auth_user_id ON public.vendor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_auth_status ON public.vendor_auth(approval_status);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_status ON public.vendor_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_city_state ON public.vendor_profiles(city, state);

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS approval_status public.vendor_approval_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS business_registration_url TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_upload_url TEXT,
  ADD COLUMN IF NOT EXISTS pan_upload_url TEXT;

UPDATE public.vendors
SET approval_status = CASE WHEN verified THEN 'approved'::public.vendor_approval_status ELSE 'pending'::public.vendor_approval_status END
WHERE approval_status IS NULL;

ALTER TABLE public.vendor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendor auth owner or admin select" ON public.vendor_auth;
DROP POLICY IF EXISTS "Vendor auth owner update login metadata" ON public.vendor_auth;
DROP POLICY IF EXISTS "Vendor auth admin update" ON public.vendor_auth;
DROP POLICY IF EXISTS "Vendor profiles owner or admin select" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Vendor profiles owner update pending" ON public.vendor_profiles;
DROP POLICY IF EXISTS "Vendor profiles admin update" ON public.vendor_profiles;

CREATE POLICY "Vendor auth owner or admin select" ON public.vendor_auth
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendor auth owner update login metadata" ON public.vendor_auth
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendor auth admin update" ON public.vendor_auth
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendor profiles owner or admin select" ON public.vendor_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendor profiles owner update pending" ON public.vendor_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND approval_status = 'pending')
  WITH CHECK (auth.uid() = user_id AND approval_status = 'pending');

CREATE POLICY "Vendor profiles admin update" ON public.vendor_profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Vendors viewable by owner or admin" ON public.vendors;
DROP POLICY IF EXISTS "Users insert own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Vendor owner updates" ON public.vendors;
DROP POLICY IF EXISTS "Admin deletes vendor" ON public.vendors;

CREATE POLICY "Vendors viewable by owner or admin" ON public.vendors
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own pending vendor" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND approval_status = 'pending' AND verified = false);

CREATE POLICY "Vendor owner updates pending profile" ON public.vendors
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND approval_status = 'pending')
  WITH CHECK (auth.uid() = user_id AND approval_status = 'pending' AND verified = false);

CREATE POLICY "Admin updates vendors" ON public.vendors
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin deletes vendor" ON public.vendors
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendor-documents',
  'vendor-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

CREATE POLICY "Vendor owners read vendor documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'vendor-documents'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.user_id = auth.uid()
        AND v.id::text = (storage.foldername(name))[1]
      )
    )
  );

CREATE TRIGGER trg_vendor_auth_updated
  BEFORE UPDATE ON public.vendor_auth
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_vendor_profiles_updated
  BEFORE UPDATE ON public.vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
