-- Phase 1: UAE Legal Compliance for Driver Management
-- 1. Create verification status enum
CREATE TYPE public.driver_verification_status AS ENUM (
  'unverified',
  'pending_docs',
  'verified',
  'approved',
  'rejected',
  'expired'
);

-- 2. Create document types enum
CREATE TYPE public.driver_document_type AS ENUM (
  'emirates_id_front',
  'emirates_id_back',
  'driving_license_front',
  'driving_license_back',
  'passport_bio_page',
  'visa_page',
  'employment_letter',
  'salary_certificate',
  'other'
);

-- 3. Enhance drivers table with UAE-specific fields
ALTER TABLE public.drivers
  ADD COLUMN emirates_id TEXT UNIQUE,
  ADD COLUMN passport_number TEXT,
  ADD COLUMN nationality TEXT,
  ADD COLUMN license_issued_by TEXT,
  ADD COLUMN license_issue_date DATE,
  ADD COLUMN license_categories TEXT[],
  ADD COLUMN employment_id TEXT,
  ADD COLUMN department TEXT,
  ADD COLUMN verification_status driver_verification_status NOT NULL DEFAULT 'unverified',
  ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN visa_expiry DATE,
  ADD COLUMN address_emirate TEXT,
  ADD COLUMN last_verification_check TIMESTAMP WITH TIME ZONE;

-- Add constraints
ALTER TABLE public.drivers
  ADD CONSTRAINT check_emirates_id_format 
    CHECK (emirates_id IS NULL OR emirates_id ~ '^\d{3}-\d{4}-\d{7}-\d{1}$'),
  ADD CONSTRAINT check_passport_length 
    CHECK (passport_number IS NULL OR LENGTH(passport_number) BETWEEN 6 AND 12);

-- Create indexes
CREATE INDEX idx_drivers_emirates_id ON public.drivers(emirates_id);
CREATE INDEX idx_drivers_verification_status ON public.drivers(verification_status);

-- Add comments
COMMENT ON COLUMN drivers.emirates_id IS 'UAE Emirates ID in format XXX-XXXX-XXXXXXX-X (mandatory for UAE drivers)';
COMMENT ON COLUMN drivers.verification_status IS 'Document verification status. Must be "approved" before vehicle handover.';

-- 4. Create driver_documents table
CREATE TABLE public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  document_type driver_document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  expiry_date DATE,
  expiry_notification_sent BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(driver_id, document_type)
);

-- Create indexes for driver_documents
CREATE INDEX idx_driver_documents_driver ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_expiry ON driver_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_driver_documents_unverified ON driver_documents(driver_id, is_verified) WHERE is_verified = false;

-- RLS for driver_documents
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all driver documents"
  ON driver_documents
  FOR ALL
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_driver_documents_updated_at
  BEFORE UPDATE ON driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE driver_documents IS 'Stores uploaded driver documents (Emirates ID, License, Passport) for UAE compliance';
COMMENT ON COLUMN driver_documents.expiry_date IS 'Expiry date for time-sensitive documents (License, Passport, Visa)';

-- 5. Create validation functions
CREATE OR REPLACE FUNCTION public.driver_has_required_documents(p_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_emirates_id BOOLEAN;
  v_has_license BOOLEAN;
  v_has_passport BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM driver_documents 
    WHERE driver_id = p_driver_id 
      AND document_type IN ('emirates_id_front', 'emirates_id_back')
      AND is_verified = true
    GROUP BY driver_id
    HAVING COUNT(DISTINCT document_type) = 2
  ) INTO v_has_emirates_id;
  
  SELECT EXISTS (
    SELECT 1 FROM driver_documents 
    WHERE driver_id = p_driver_id 
      AND document_type IN ('driving_license_front', 'driving_license_back')
      AND is_verified = true
    GROUP BY driver_id
    HAVING COUNT(DISTINCT document_type) = 2
  ) INTO v_has_license;
  
  SELECT EXISTS (
    SELECT 1 FROM driver_documents 
    WHERE driver_id = p_driver_id 
      AND document_type = 'passport_bio_page'
      AND is_verified = true
  ) INTO v_has_passport;
  
  RETURN v_has_emirates_id AND v_has_license AND v_has_passport;
END;
$$;

CREATE OR REPLACE FUNCTION public.driver_has_expired_documents(p_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM driver_documents
    WHERE driver_id = p_driver_id
      AND expiry_date IS NOT NULL
      AND expiry_date < CURRENT_DATE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_driver_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF public.driver_has_required_documents(COALESCE(NEW.driver_id, OLD.driver_id)) THEN
    UPDATE drivers 
    SET verification_status = 'verified',
        last_verification_check = now()
    WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  ELSE
    IF EXISTS (SELECT 1 FROM driver_documents WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id)) THEN
      UPDATE drivers 
      SET verification_status = 'pending_docs',
          last_verification_check = now()
      WHERE id = COALESCE(NEW.driver_id, OLD.driver_id)
        AND verification_status = 'unverified';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_driver_verification
  AFTER INSERT OR UPDATE OR DELETE ON driver_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_driver_verification_status();

CREATE OR REPLACE FUNCTION public.validate_driver_for_checkout(
  p_driver_id UUID,
  OUT is_valid BOOLEAN,
  OUT error_message TEXT,
  OUT warnings TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver RECORD;
  v_has_docs BOOLEAN;
  v_has_expired_docs BOOLEAN;
  v_warnings TEXT[] := '{}';
BEGIN
  SELECT * INTO v_driver FROM drivers WHERE id = p_driver_id;
  
  IF v_driver IS NULL THEN
    is_valid := false;
    error_message := 'Driver not found';
    RETURN;
  END IF;
  
  IF v_driver.status != 'active' THEN
    is_valid := false;
    error_message := 'Driver status is not active: ' || v_driver.status;
    RETURN;
  END IF;
  
  IF v_driver.verification_status NOT IN ('verified', 'approved') THEN
    is_valid := false;
    error_message := 'Driver verification incomplete. Status: ' || v_driver.verification_status || '. All required documents (Emirates ID, Driving License, Passport) must be uploaded and verified before vehicle handover.';
    RETURN;
  END IF;
  
  v_has_docs := public.driver_has_required_documents(p_driver_id);
  IF NOT v_has_docs THEN
    is_valid := false;
    error_message := 'Driver missing required documents. Please upload Emirates ID (front & back), Driving License (front & back), and Passport.';
    RETURN;
  END IF;
  
  v_has_expired_docs := public.driver_has_expired_documents(p_driver_id);
  IF v_has_expired_docs THEN
    is_valid := false;
    error_message := 'Driver has expired documents. Please update expired documents before proceeding.';
    RETURN;
  END IF;
  
  IF v_driver.license_expiry IS NOT NULL THEN
    IF v_driver.license_expiry < CURRENT_DATE THEN
      is_valid := false;
      error_message := 'Driver license has expired on ' || v_driver.license_expiry::TEXT;
      RETURN;
    ELSIF v_driver.license_expiry < CURRENT_DATE + INTERVAL '30 days' THEN
      v_warnings := array_append(v_warnings, 
        'Driver license expires soon on ' || v_driver.license_expiry::TEXT || '. Consider renewal.');
    END IF;
  END IF;
  
  IF v_driver.visa_expiry IS NOT NULL THEN
    IF v_driver.visa_expiry < CURRENT_DATE THEN
      v_warnings := array_append(v_warnings, 
        'Driver visa has expired. Verify current visa status.');
    ELSIF v_driver.visa_expiry < CURRENT_DATE + INTERVAL '60 days' THEN
      v_warnings := array_append(v_warnings, 
        'Driver visa expires soon on ' || v_driver.visa_expiry::TEXT);
    END IF;
  END IF;
  
  IF v_driver.date_of_birth IS NOT NULL THEN
    IF EXTRACT(YEAR FROM AGE(v_driver.date_of_birth)) < 25 THEN
      v_warnings := array_append(v_warnings, 
        'Driver is under 25 years old. Additional fees may apply: AED ' || v_driver.additional_driver_fee::TEXT);
    END IF;
  END IF;
  
  is_valid := true;
  warnings := v_warnings;
  error_message := NULL;
END;
$$;

-- 6. Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver-documents',
  'driver-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "Staff can upload driver documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'driver-documents');

CREATE POLICY "Staff can view driver documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'driver-documents');

CREATE POLICY "Staff can update driver documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'driver-documents');

CREATE POLICY "Staff can delete driver documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'driver-documents');