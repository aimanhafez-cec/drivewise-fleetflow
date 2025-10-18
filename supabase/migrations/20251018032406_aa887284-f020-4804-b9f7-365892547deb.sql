-- Add service policy fields to quotes table (nullable for backward compatibility)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  roadside_assistance_included BOOLEAN DEFAULT NULL;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  replacement_vehicle_included BOOLEAN DEFAULT NULL;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  replacement_sla_hours INTEGER DEFAULT NULL;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  roadside_assistance_cost_monthly NUMERIC DEFAULT NULL;

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  replacement_vehicle_cost_monthly NUMERIC DEFAULT NULL;

-- Add invoice format display preference to corporate_leasing_agreements
COMMENT ON COLUMN quotes.roadside_assistance_included IS 'Whether roadside assistance is included in the quote';
COMMENT ON COLUMN quotes.replacement_vehicle_included IS 'Whether replacement vehicle service is included';
COMMENT ON COLUMN quotes.replacement_sla_hours IS 'SLA in hours for replacement vehicle delivery';
COMMENT ON COLUMN quotes.roadside_assistance_cost_monthly IS 'Monthly cost for roadside assistance service';
COMMENT ON COLUMN quotes.replacement_vehicle_cost_monthly IS 'Monthly cost for replacement vehicle service';