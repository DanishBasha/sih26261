-- SIH26261 Auth, Users & Institution Verification Schema

CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  institution_type TEXT,
  aicte_permanent_id TEXT,
  state TEXT,
  district TEXT,
  official_email TEXT,
  website TEXT,
  contact_number TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (verification_status IN (
      'draft',
      'pending_verification',
      'additional_information_required',
      'verified',
      'rejected_with_reason'
    )),
  verification_remarks TEXT,
  submitted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  role TEXT NOT NULL DEFAULT 'institution_user'
    CHECK (role IN ('institution_user', 'official', 'admin')),
  account_status TEXT NOT NULL DEFAULT 'pending_email_verification'
    CHECK (account_status IN (
      'invited',
      'pending_email_verification',
      'active',
      'suspended',
      'disabled'
    )),
  verification_code TEXT,
  reset_code TEXT,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Foreign key linking submitted_by to user_profiles
ALTER TABLE public.institutions 
  DROP CONSTRAINT IF EXISTS fk_institutions_submitted_by,
  ADD CONSTRAINT fk_institutions_submitted_by FOREIGN KEY (submitted_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL;

-- Link applications to institutions if column doesn't exist
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL;
