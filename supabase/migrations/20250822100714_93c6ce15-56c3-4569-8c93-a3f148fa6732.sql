-- Create enum types for corporate leasing
CREATE TYPE public.rental_type AS ENUM ('Corporate Leasing');
CREATE TYPE public.customer_segment AS ENUM ('SME', 'Enterprise', 'Government');
CREATE TYPE public.credit_terms AS ENUM ('Net 15', 'Net 30', 'Net 45', 'Custom');
CREATE TYPE public.framework_model AS ENUM ('Rate Card by Class', 'Fixed Rate per VIN');
CREATE TYPE public.contract_term AS ENUM ('12 months', '24 months', '36 months', '48 months', 'Open-ended');
CREATE TYPE public.billing_cycle AS ENUM ('Monthly');
CREATE TYPE public.billing_day AS ENUM ('1st', '15th', 'Month-End', 'Anniversary');
CREATE TYPE public.invoice_format AS ENUM ('Consolidated', 'Per Vehicle', 'Per Cost Center');
CREATE TYPE public.line_item_granularity AS ENUM ('Base Rent', 'Base Rent + Add-ons', 'Base Rent + Add-ons + Variable');
CREATE TYPE public.cost_allocation_mode AS ENUM ('Per Vehicle', 'Per Cost Center', 'Project');
CREATE TYPE public.insurance_responsibility AS ENUM ('Included (Lessor)', 'Customer Own Policy');
CREATE TYPE public.maintenance_policy AS ENUM ('Basic PM', 'Full (PM+wear)', 'Customer');
CREATE TYPE public.security_instrument AS ENUM ('None', 'Deposit per Vehicle', 'Bank Guarantee');
CREATE TYPE public.corporate_lease_status AS ENUM ('draft', 'pending_approval', 'active', 'suspended', 'terminated', 'expired');

-- Legal Entities table
CREATE TABLE public.legal_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  tax_registration_no TEXT,
  country_code TEXT DEFAULT 'AE',
  currency TEXT DEFAULT 'AED',
  vat_rate NUMERIC DEFAULT 5.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer Sites table
CREATE TABLE public.customer_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  site_name TEXT NOT NULL,
  site_code TEXT,
  site_type TEXT CHECK (site_type IN ('Bill-to', 'Ship-to', 'Both')),
  address JSONB,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost Centers table
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  manager_name TEXT,
  budget_limit NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Corporate Leasing Agreements table
CREATE TABLE public.corporate_leasing_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_no TEXT UNIQUE,
  
  -- A1: Parties & Commercials
  rental_type rental_type NOT NULL DEFAULT 'Corporate Leasing',
  legal_entity_id UUID REFERENCES public.legal_entities(id),
  customer_id UUID NOT NULL,
  customer_segment customer_segment,
  bill_to_site_id UUID REFERENCES public.customer_sites(id),
  contract_manager_id UUID,
  customer_po_no TEXT,
  credit_terms credit_terms NOT NULL DEFAULT 'Net 30',
  credit_limit NUMERIC,
  approver_customer_name TEXT,
  approver_customer_email TEXT,
  cost_allocation_mode cost_allocation_mode NOT NULL,
  
  -- A2: Contract Scope & Term
  framework_model framework_model NOT NULL,
  committed_fleet_size INTEGER,
  master_term contract_term NOT NULL,
  co_terminus_lines BOOLEAN NOT NULL DEFAULT false,
  off_hire_notice_period INTEGER NOT NULL DEFAULT 30, -- in days
  early_termination_allowed BOOLEAN NOT NULL DEFAULT false,
  early_termination_rule TEXT,
  renewal_option TEXT,
  
  -- A3: Billing & Invoicing
  billing_cycle billing_cycle NOT NULL DEFAULT 'Monthly',
  billing_day billing_day NOT NULL DEFAULT 'Anniversary',
  invoice_format invoice_format NOT NULL DEFAULT 'Consolidated',
  line_item_granularity line_item_granularity NOT NULL DEFAULT 'Base Rent + Add-ons',
  currency TEXT NOT NULL DEFAULT 'AED',
  vat_code TEXT NOT NULL DEFAULT 'UAE 5%',
  discount_schema JSONB,
  
  -- A4: Responsibilities & Inclusions
  insurance_responsibility insurance_responsibility NOT NULL DEFAULT 'Included (Lessor)',
  insurance_excess_aed NUMERIC,
  maintenance_policy maintenance_policy NOT NULL DEFAULT 'Full (PM+wear)',
  tyres_policy TEXT,
  tyres_included_after_km INTEGER,
  roadside_assistance_included BOOLEAN NOT NULL DEFAULT true,
  registration_responsibility TEXT NOT NULL DEFAULT 'Lessor',
  replacement_vehicle_included BOOLEAN NOT NULL DEFAULT true,
  replacement_sla_hours INTEGER,
  workshop_preference TEXT NOT NULL DEFAULT 'OEM',
  
  -- A5: Tolls, Fines & Fuel
  salik_darb_handling TEXT NOT NULL DEFAULT 'Rebill Actual (monthly)',
  tolls_admin_fee_model TEXT NOT NULL DEFAULT 'Per-invoice',
  traffic_fines_handling TEXT NOT NULL DEFAULT 'Auto Rebill + Admin Fee',
  admin_fee_per_fine_aed NUMERIC DEFAULT 25,
  fuel_handling TEXT NOT NULL DEFAULT 'Customer Fuel',
  
  -- A6: Financial Security & Compliance
  security_instrument security_instrument DEFAULT 'None',
  deposit_amount_aed NUMERIC,
  sla_credits_enabled BOOLEAN DEFAULT false,
  sla_credits_percentage NUMERIC,
  telematics_consent BOOLEAN DEFAULT false,
  
  -- Status and tracking
  status corporate_lease_status NOT NULL DEFAULT 'draft',
  contract_start_date DATE,
  contract_end_date DATE,
  signed_date DATE,
  signed_by_customer TEXT,
  signed_by_lessor TEXT,
  
  -- Audit fields
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Corporate Leasing Lines table (individual vehicles within agreement)
CREATE TABLE public.corporate_leasing_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.corporate_leasing_agreements(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  
  -- Vehicle assignment
  vehicle_class_id UUID,
  vehicle_id UUID,
  vin TEXT,
  
  -- Cost allocation
  cost_center_id UUID REFERENCES public.cost_centers(id),
  project_code TEXT,
  
  -- Dates and locations
  lease_start_date DATE NOT NULL,
  lease_end_date DATE,
  pickup_location_id TEXT,
  return_location_id TEXT,
  
  -- Pricing
  monthly_rate_aed NUMERIC NOT NULL,
  setup_fee_aed NUMERIC DEFAULT 0,
  security_deposit_aed NUMERIC DEFAULT 0,
  
  -- Add-ons and services
  included_services JSONB DEFAULT '[]',
  additional_services JSONB DEFAULT '[]',
  
  -- Usage limits
  monthly_km_allowance INTEGER,
  excess_km_rate_aed NUMERIC,
  
  -- Status
  line_status TEXT NOT NULL DEFAULT 'active',
  actual_pickup_date DATE,
  actual_return_date DATE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(agreement_id, line_number)
);

-- Service Level Agreements table
CREATE TABLE public.sla_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.corporate_leasing_agreements(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'replacement_vehicle', 'maintenance_response', etc.
  sla_hours INTEGER NOT NULL,
  penalty_percentage NUMERIC,
  measurement_criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_leasing_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_leasing_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_definitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage all legal entities" ON public.legal_entities FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage all customer sites" ON public.customer_sites FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage all cost centers" ON public.cost_centers FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage all corporate leasing agreements" ON public.corporate_leasing_agreements FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage all corporate leasing lines" ON public.corporate_leasing_lines FOR ALL TO authenticated USING (true);

CREATE POLICY "Staff can manage all SLA definitions" ON public.sla_definitions FOR ALL TO authenticated USING (true);

-- Function to generate corporate lease agreement numbers
CREATE OR REPLACE FUNCTION public.generate_corporate_lease_no()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    next_num INTEGER;
    result_agreement_no TEXT;
BEGIN
    -- Get the next number, starting from 1 if no agreements exist
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(corporate_leasing_agreements.agreement_no FROM 'CLA-(\d+)') AS INTEGER)) 
         FROM public.corporate_leasing_agreements 
         WHERE corporate_leasing_agreements.agreement_no IS NOT NULL AND corporate_leasing_agreements.agreement_no ~ '^CLA-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    -- Generate the agreement number with zero padding
    result_agreement_no := 'CLA-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_agreement_no;
END;
$function$

-- Trigger for updated_at
CREATE TRIGGER update_legal_entities_updated_at
  BEFORE UPDATE ON public.legal_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_sites_updated_at
  BEFORE UPDATE ON public.customer_sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON public.cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_corporate_leasing_agreements_updated_at
  BEFORE UPDATE ON public.corporate_leasing_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_corporate_leasing_lines_updated_at
  BEFORE UPDATE ON public.corporate_leasing_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();