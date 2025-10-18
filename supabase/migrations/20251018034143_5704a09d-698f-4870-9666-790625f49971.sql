-- Phase 1: Add pricing display mode to quotes and agreements
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  pricing_display_mode TEXT DEFAULT 'itemized' 
  CHECK (pricing_display_mode IN ('bundled', 'itemized'));

ALTER TABLE corporate_leasing_agreements ADD COLUMN IF NOT EXISTS
  pricing_display_mode TEXT DEFAULT 'itemized'
  CHECK (pricing_display_mode IN ('bundled', 'itemized'));

-- Phase 3: Add service cost columns to cost sheet lines
ALTER TABLE quote_cost_sheet_lines ADD COLUMN IF NOT EXISTS
  roadside_assistance_per_month_aed NUMERIC DEFAULT 0;

ALTER TABLE quote_cost_sheet_lines ADD COLUMN IF NOT EXISTS
  replacement_vehicle_per_month_aed NUMERIC DEFAULT 0;