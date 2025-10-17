-- Add all missing fields to corporate_leasing_agreements table for Quote parity

-- Step 1 - Header fields
ALTER TABLE corporate_leasing_agreements
ADD COLUMN IF NOT EXISTS business_unit_id uuid REFERENCES business_units(id),
ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES opportunities(id),
ADD COLUMN IF NOT EXISTS agreement_description text,
ADD COLUMN IF NOT EXISTS account_name text,
ADD COLUMN IF NOT EXISTS project text,
ADD COLUMN IF NOT EXISTS sales_office_id uuid REFERENCES sales_offices(id),
ADD COLUMN IF NOT EXISTS sales_rep_id uuid REFERENCES sales_representatives(id),
ADD COLUMN IF NOT EXISTS agreement_entry_date date,
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS agreement_date date,
ADD COLUMN IF NOT EXISTS agreement_type text,
ADD COLUMN IF NOT EXISTS validity_date_to date,
ADD COLUMN IF NOT EXISTS duration_days integer,
ADD COLUMN IF NOT EXISTS win_loss_reason text,
ADD COLUMN IF NOT EXISTS fx_rate_type text DEFAULT 'corporate',
ADD COLUMN IF NOT EXISTS pickup_type text DEFAULT 'company_location',
ADD COLUMN IF NOT EXISTS pickup_location_id text,
ADD COLUMN IF NOT EXISTS pickup_customer_site_id uuid REFERENCES customer_sites(id),
ADD COLUMN IF NOT EXISTS return_type text DEFAULT 'company_location',
ADD COLUMN IF NOT EXISTS return_location_id text,
ADD COLUMN IF NOT EXISTS return_customer_site_id uuid REFERENCES customer_sites(id),

-- Step 2 - Financials fields
ADD COLUMN IF NOT EXISTS payment_terms_id text,
ADD COLUMN IF NOT EXISTS billing_plan text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS billing_start_date date,
ADD COLUMN IF NOT EXISTS proration_rule text DEFAULT 'first-last',
ADD COLUMN IF NOT EXISTS vat_percentage numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS default_price_list_id text,
ADD COLUMN IF NOT EXISTS withholding_tax_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_type text DEFAULT 'refundable',
ADD COLUMN IF NOT EXISTS default_deposit_amount numeric DEFAULT 2500,
ADD COLUMN IF NOT EXISTS default_advance_rent_months integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_delivery_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS default_collection_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS annual_escalation_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_fees jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grace_period_days integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS late_fee_percentage numeric DEFAULT 2,
ADD COLUMN IF NOT EXISTS email_invoice_to_contact boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS invoice_contact_person_id uuid,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank-transfer',
ADD COLUMN IF NOT EXISTS payment_instructions text,

-- Step 3 - Coverage & Services fields
ADD COLUMN IF NOT EXISTS insurance_coverage_package text DEFAULT 'comprehensive',
ADD COLUMN IF NOT EXISTS insurance_glass_tire_cover boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS insurance_pai_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_territorial_coverage text DEFAULT 'uae-only',
ADD COLUMN IF NOT EXISTS insurance_coverage_summary text,
ADD COLUMN IF NOT EXISTS maintenance_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_package_type text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS monthly_maintenance_cost_per_vehicle numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS maintenance_plan_source text DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS show_maintenance_separate_line boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS maintenance_coverage_summary text,
ADD COLUMN IF NOT EXISTS mileage_pooling_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pooled_mileage_allowance_km integer,
ADD COLUMN IF NOT EXISTS pooled_excess_km_rate numeric,
ADD COLUMN IF NOT EXISTS default_addons jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS default_addons_summary text,

-- Step 4 - Vehicles (agreement_items JSONB stores all vehicle lines)
ADD COLUMN IF NOT EXISTS agreement_items jsonb DEFAULT '[]'::jsonb;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agreement_items_gin ON corporate_leasing_agreements USING gin(agreement_items);
CREATE INDEX IF NOT EXISTS idx_ma_customer_id ON corporate_leasing_agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_ma_status ON corporate_leasing_agreements(status);
CREATE INDEX IF NOT EXISTS idx_ma_source_quote_id ON corporate_leasing_agreements(source_quote_id);

-- Create master_agreement_attachments table for Step 5
CREATE TABLE IF NOT EXISTS master_agreement_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES corporate_leasing_agreements(id) ON DELETE CASCADE,
  attachment_type text NOT NULL,
  description text,
  file_name text,
  file_path text,
  file_url text,
  mime_type text,
  file_size integer,
  entered_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ma_attachments_agreement_id ON master_agreement_attachments(agreement_id);

-- RLS policies for attachments
ALTER TABLE master_agreement_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all master agreement attachments" 
ON master_agreement_attachments FOR ALL TO authenticated USING (true);