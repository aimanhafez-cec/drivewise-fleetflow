-- Add agreement support to quote_cost_sheets table
ALTER TABLE quote_cost_sheets
  ADD COLUMN IF NOT EXISTS corporate_leasing_agreement_id UUID REFERENCES corporate_leasing_agreements(id),
  ADD COLUMN IF NOT EXISTS source_cost_sheet_id UUID REFERENCES quote_cost_sheets(id);

-- Add constraint to ensure cost sheet belongs to only one parent
ALTER TABLE quote_cost_sheets
  DROP CONSTRAINT IF EXISTS check_single_parent;

ALTER TABLE quote_cost_sheets
  ADD CONSTRAINT check_single_parent CHECK (
    (quote_id IS NOT NULL AND corporate_leasing_agreement_id IS NULL) OR
    (quote_id IS NULL AND corporate_leasing_agreement_id IS NOT NULL)
  );

-- Create index for agreement lookups
CREATE INDEX IF NOT EXISTS idx_cost_sheets_agreement ON quote_cost_sheets(corporate_leasing_agreement_id);

-- Update RLS policies to include agreements
DROP POLICY IF EXISTS "Everyone can view approved cost sheets" ON quote_cost_sheets;
CREATE POLICY "Everyone can view approved cost sheets" ON quote_cost_sheets
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Staff can manage cost sheets" ON quote_cost_sheets;
CREATE POLICY "Staff can manage cost sheets" ON quote_cost_sheets
  FOR ALL USING (true);