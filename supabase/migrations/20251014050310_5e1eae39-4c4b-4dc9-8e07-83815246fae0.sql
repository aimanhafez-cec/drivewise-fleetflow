-- Add Step 2 fields (Financial Terms)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS payment_terms_id uuid,
ADD COLUMN IF NOT EXISTS billing_plan text,
ADD COLUMN IF NOT EXISTS billing_start_date date,
ADD COLUMN IF NOT EXISTS proration_rule text,
ADD COLUMN IF NOT EXISTS default_price_list_id uuid,
ADD COLUMN IF NOT EXISTS annual_escalation_percentage numeric,
ADD COLUMN IF NOT EXISTS vat_percentage numeric DEFAULT 5,
ADD COLUMN IF NOT EXISTS withholding_tax_percentage numeric,
ADD COLUMN IF NOT EXISTS deposit_type text DEFAULT 'refundable',
ADD COLUMN IF NOT EXISTS default_deposit_amount numeric DEFAULT 2500,
ADD COLUMN IF NOT EXISTS default_advance_rent_months integer,
ADD COLUMN IF NOT EXISTS initial_fees jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS grace_period_days integer,
ADD COLUMN IF NOT EXISTS late_fee_percentage numeric,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bank-transfer',
ADD COLUMN IF NOT EXISTS invoice_format text,
ADD COLUMN IF NOT EXISTS email_invoice_to_contact boolean,
ADD COLUMN IF NOT EXISTS invoice_contact_person_id uuid,
ADD COLUMN IF NOT EXISTS customer_po_number text,
ADD COLUMN IF NOT EXISTS payment_instructions text;

-- Add Step 3 fields (Insurance)
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS insurance_coverage_package text DEFAULT 'comprehensive',
ADD COLUMN IF NOT EXISTS insurance_excess_aed numeric DEFAULT 1500,
ADD COLUMN IF NOT EXISTS insurance_territorial_coverage text DEFAULT 'uae-only',
ADD COLUMN IF NOT EXISTS insurance_glass_tire_cover boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_pai_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_damage_waiver boolean,
ADD COLUMN IF NOT EXISTS insurance_theft_protection boolean,
ADD COLUMN IF NOT EXISTS insurance_third_party_liability boolean,
ADD COLUMN IF NOT EXISTS insurance_personal_accident boolean,
ADD COLUMN IF NOT EXISTS insurance_additional_driver boolean,
ADD COLUMN IF NOT EXISTS insurance_cross_border boolean,
ADD COLUMN IF NOT EXISTS insurance_coverage_summary text,
ADD COLUMN IF NOT EXISTS insurance_notes text;

-- Add Step 4 fields (Vehicles) and pickup/return configuration
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS quote_items jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS vehicle_type_id uuid,
ADD COLUMN IF NOT EXISTS pickup_type text,
ADD COLUMN IF NOT EXISTS pickup_location_id text,
ADD COLUMN IF NOT EXISTS pickup_customer_site_id uuid,
ADD COLUMN IF NOT EXISTS return_type text,
ADD COLUMN IF NOT EXISTS return_location_id text,
ADD COLUMN IF NOT EXISTS return_customer_site_id uuid;

-- Add comments for documentation
COMMENT ON COLUMN quotes.vat_percentage IS 'VAT percentage applied to the quote (default 5%)';
COMMENT ON COLUMN quotes.deposit_type IS 'Type of deposit: refundable, non-refundable, or waived';
COMMENT ON COLUMN quotes.payment_method IS 'Payment method: bank-transfer, card, cheque, etc.';
COMMENT ON COLUMN quotes.insurance_coverage_package IS 'Insurance package: comprehensive, third-party, full-zero-excess';
COMMENT ON COLUMN quotes.quote_items IS 'Array of vehicle line items with detailed configuration';