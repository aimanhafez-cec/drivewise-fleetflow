-- Phase 1: Complete Quote to Master Agreement Conversion Schema

-- 1.1 Add conversion tracking fields to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS converted_to_agreement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS agreement_id UUID REFERENCES corporate_leasing_agreements(id),
ADD COLUMN IF NOT EXISTS agreement_no TEXT,
ADD COLUMN IF NOT EXISTS conversion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS converted_by UUID;

CREATE INDEX IF NOT EXISTS idx_quotes_agreement_id ON quotes(agreement_id);
CREATE INDEX IF NOT EXISTS idx_quotes_converted ON quotes(converted_to_agreement);

-- 1.2 Add contract number and additional fields to corporate_leasing_lines
ALTER TABLE corporate_leasing_lines
ADD COLUMN IF NOT EXISTS contract_no TEXT,
ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS contract_months INTEGER,
ADD COLUMN IF NOT EXISTS mileage_allowance_km_month INTEGER,
ADD COLUMN IF NOT EXISTS excess_km_rate_aed NUMERIC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_corporate_leasing_lines_contract_no ON corporate_leasing_lines(contract_no) WHERE contract_no IS NOT NULL;

-- 1.3 Add source quote reference to corporate_leasing_agreements
ALTER TABLE corporate_leasing_agreements
ADD COLUMN IF NOT EXISTS source_quote_id UUID REFERENCES quotes(id),
ADD COLUMN IF NOT EXISTS source_quote_no TEXT;

CREATE INDEX IF NOT EXISTS idx_corporate_leasing_source_quote ON corporate_leasing_agreements(source_quote_id);

-- 1.4 Create contract number generation function
CREATE OR REPLACE FUNCTION public.generate_contract_no(p_agreement_no TEXT, p_line_number INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN p_agreement_no || '-' || LPAD(p_line_number::TEXT, 2, '0');
END;
$$;