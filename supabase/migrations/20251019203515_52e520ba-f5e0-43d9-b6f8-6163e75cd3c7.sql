-- =====================================================
-- Phase 9: Database Schema Updates (Fixed)
-- =====================================================

-- Drop existing policies if they exist to recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active business units" ON public.business_units;
  DROP POLICY IF EXISTS "Staff can manage business units" ON public.business_units;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies for business_units
CREATE POLICY "Everyone can view active business units"
  ON public.business_units FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage business units"
  ON public.business_units FOR ALL
  USING (true);

-- =====================================================
-- 2. Reservation Methods Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reservation_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reservation_methods ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active reservation methods" ON public.reservation_methods;
  DROP POLICY IF EXISTS "Staff can manage reservation methods" ON public.reservation_methods;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active reservation methods"
  ON public.reservation_methods FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage reservation methods"
  ON public.reservation_methods FOR ALL
  USING (true);

-- Insert default reservation methods
INSERT INTO public.reservation_methods (code, name, description, display_order) VALUES
  ('WALK_IN', 'Walk-in', 'Customer walk-in booking', 1),
  ('PHONE', 'Phone', 'Phone reservation', 2),
  ('ONLINE', 'Online', 'Online booking portal', 3),
  ('MOBILE_APP', 'Mobile App', 'Mobile application booking', 4),
  ('AGENT', 'Agent/Partner', 'Travel agent or partner booking', 5),
  ('CORPORATE', 'Corporate', 'Corporate account booking', 6)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. Price Lists Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'AED',
  effective_from DATE,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active price lists" ON public.price_lists;
  DROP POLICY IF EXISTS "Staff can manage price lists" ON public.price_lists;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active price lists"
  ON public.price_lists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage price lists"
  ON public.price_lists FOR ALL
  USING (true);

-- Insert default price lists
INSERT INTO public.price_lists (code, name, description, is_default, display_order) VALUES
  ('STANDARD', 'Standard Rates', 'Standard pricing for all customers', true, 1),
  ('PREMIUM', 'Premium Rates', 'Premium pricing tier', false, 2),
  ('CORPORATE', 'Corporate Rates', 'Negotiated corporate rates', false, 3),
  ('SEASONAL', 'Seasonal Rates', 'Seasonal promotional rates', false, 4),
  ('WEEKEND', 'Weekend Special', 'Weekend special pricing', false, 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 4. Tax Levels Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tax_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_levels ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active tax levels" ON public.tax_levels;
  DROP POLICY IF EXISTS "Staff can manage tax levels" ON public.tax_levels;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active tax levels"
  ON public.tax_levels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage tax levels"
  ON public.tax_levels FOR ALL
  USING (true);

-- Insert default tax levels
INSERT INTO public.tax_levels (code, name, description, display_order) VALUES
  ('STANDARD', 'Standard VAT', 'Standard 5% VAT rate', 1),
  ('ZERO', 'Zero Rated', 'Zero-rated transactions', 2),
  ('EXEMPT', 'Exempt', 'Tax-exempt transactions', 3),
  ('REVERSE', 'Reverse Charge', 'Reverse charge mechanism', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. Tax Codes Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tax_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_level_id UUID REFERENCES public.tax_levels(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tax_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active tax codes" ON public.tax_codes;
  DROP POLICY IF EXISTS "Staff can manage tax codes" ON public.tax_codes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active tax codes"
  ON public.tax_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage tax codes"
  ON public.tax_codes FOR ALL
  USING (true);

-- Insert default tax codes
INSERT INTO public.tax_codes (tax_level_id, code, name, rate, display_order)
SELECT 
  (SELECT id FROM public.tax_levels WHERE code = 'STANDARD'),
  'VAT_5',
  'UAE VAT 5%',
  5.00,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.tax_codes WHERE code = 'VAT_5');

INSERT INTO public.tax_codes (tax_level_id, code, name, rate, display_order)
SELECT 
  (SELECT id FROM public.tax_levels WHERE code = 'ZERO'),
  'VAT_0',
  'Zero Rated',
  0.00,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.tax_codes WHERE code = 'VAT_0');

-- =====================================================
-- 6. Discount Types Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.discount_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_types ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active discount types" ON public.discount_types;
  DROP POLICY IF EXISTS "Staff can manage discount types" ON public.discount_types;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active discount types"
  ON public.discount_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage discount types"
  ON public.discount_types FOR ALL
  USING (true);

-- Insert default discount types
INSERT INTO public.discount_types (code, name, description, discount_type, display_order) VALUES
  ('EARLY_BIRD', 'Early Bird Discount', 'Discount for early bookings', 'percentage', 1),
  ('LOYALTY', 'Loyalty Discount', 'Discount for loyal customers', 'percentage', 2),
  ('CORPORATE', 'Corporate Discount', 'Corporate account discount', 'percentage', 3),
  ('SEASONAL', 'Seasonal Promotion', 'Seasonal promotional discount', 'percentage', 4),
  ('VOUCHER', 'Voucher/Coupon', 'Fixed amount voucher', 'fixed_amount', 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 7. Insurance Levels Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_levels ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active insurance levels" ON public.insurance_levels;
  DROP POLICY IF EXISTS "Staff can manage insurance levels" ON public.insurance_levels;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active insurance levels"
  ON public.insurance_levels FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage insurance levels"
  ON public.insurance_levels FOR ALL
  USING (true);

-- Insert default insurance levels
INSERT INTO public.insurance_levels (code, name, description, display_order) VALUES
  ('BASIC', 'Basic Coverage', 'Third-party liability only', 1),
  ('STANDARD', 'Standard Coverage', 'Standard comprehensive coverage', 2),
  ('PREMIUM', 'Premium Coverage', 'Premium coverage with reduced excess', 3),
  ('FULL', 'Full Coverage', 'Full coverage with zero excess', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 8. Insurance Groups Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_level_id UUID REFERENCES public.insurance_levels(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  excess_amount NUMERIC(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_groups ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active insurance groups" ON public.insurance_groups;
  DROP POLICY IF EXISTS "Staff can manage insurance groups" ON public.insurance_groups;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active insurance groups"
  ON public.insurance_groups FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage insurance groups"
  ON public.insurance_groups FOR ALL
  USING (true);

-- Insert default insurance groups
INSERT INTO public.insurance_groups (insurance_level_id, code, name, excess_amount, display_order)
SELECT 
  (SELECT id FROM public.insurance_levels WHERE code = 'STANDARD'),
  'STD_1500',
  'Standard - AED 1500 Excess',
  1500.00,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.insurance_groups WHERE code = 'STD_1500');

-- =====================================================
-- 9. Insurance Providers Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Everyone can view active insurance providers" ON public.insurance_providers;
  DROP POLICY IF EXISTS "Staff can manage insurance providers" ON public.insurance_providers;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Everyone can view active insurance providers"
  ON public.insurance_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage insurance providers"
  ON public.insurance_providers FOR ALL
  USING (true);

-- Insert default insurance providers
INSERT INTO public.insurance_providers (code, name, description, display_order) VALUES
  ('INTERNAL', 'Internal Insurance', 'Company internal insurance', 1),
  ('AXA', 'AXA Insurance', 'AXA Insurance Gulf', 2),
  ('ORIENT', 'Orient Insurance', 'Orient Insurance PJSC', 3),
  ('DUBAI_INS', 'Dubai Insurance', 'Dubai Insurance Company', 4)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 10. Update Reservations Table
-- =====================================================
ALTER TABLE public.reservations 
  ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES public.business_units(id),
  ADD COLUMN IF NOT EXISTS reservation_method_id UUID REFERENCES public.reservation_methods(id),
  ADD COLUMN IF NOT EXISTS price_list_id UUID REFERENCES public.price_lists(id),
  ADD COLUMN IF NOT EXISTS bill_to_type TEXT,
  ADD COLUMN IF NOT EXISTS bill_to_meta JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_level_id UUID REFERENCES public.tax_levels(id),
  ADD COLUMN IF NOT EXISTS tax_code_id UUID REFERENCES public.tax_codes(id),
  ADD COLUMN IF NOT EXISTS discount_type_id UUID REFERENCES public.discount_types(id),
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS validity_date_to DATE,
  ADD COLUMN IF NOT EXISTS lease_to_own BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_level_id UUID REFERENCES public.insurance_levels(id),
  ADD COLUMN IF NOT EXISTS insurance_group_id UUID REFERENCES public.insurance_groups(id),
  ADD COLUMN IF NOT EXISTS insurance_provider_id UUID REFERENCES public.insurance_providers(id),
  ADD COLUMN IF NOT EXISTS airport_pickup BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pickup_flight_no TEXT,
  ADD COLUMN IF NOT EXISTS pickup_flight_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS airport_return BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS return_flight_no TEXT,
  ADD COLUMN IF NOT EXISTS return_flight_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS referral_details TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS customer_notes TEXT,
  ADD COLUMN IF NOT EXISTS deposit_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS deposit_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS advance_payment NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS security_deposit_paid NUMERIC(10,2) DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservations_business_unit ON public.reservations(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_reservations_method ON public.reservations(reservation_method_id);
CREATE INDEX IF NOT EXISTS idx_reservations_price_list ON public.reservations(price_list_id);
CREATE INDEX IF NOT EXISTS idx_tax_codes_level ON public.tax_codes(tax_level_id);
CREATE INDEX IF NOT EXISTS idx_insurance_groups_level ON public.insurance_groups(insurance_level_id);

-- Create triggers (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reservation_methods_updated_at') THEN
    CREATE TRIGGER update_reservation_methods_updated_at
      BEFORE UPDATE ON public.reservation_methods
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_price_lists_updated_at') THEN
    CREATE TRIGGER update_price_lists_updated_at
      BEFORE UPDATE ON public.price_lists
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tax_levels_updated_at') THEN
    CREATE TRIGGER update_tax_levels_updated_at
      BEFORE UPDATE ON public.tax_levels
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tax_codes_updated_at') THEN
    CREATE TRIGGER update_tax_codes_updated_at
      BEFORE UPDATE ON public.tax_codes
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_discount_types_updated_at') THEN
    CREATE TRIGGER update_discount_types_updated_at
      BEFORE UPDATE ON public.discount_types
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_insurance_levels_updated_at') THEN
    CREATE TRIGGER update_insurance_levels_updated_at
      BEFORE UPDATE ON public.insurance_levels
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_insurance_groups_updated_at') THEN
    CREATE TRIGGER update_insurance_groups_updated_at
      BEFORE UPDATE ON public.insurance_groups
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_insurance_providers_updated_at') THEN
    CREATE TRIGGER update_insurance_providers_updated_at
      BEFORE UPDATE ON public.insurance_providers
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;