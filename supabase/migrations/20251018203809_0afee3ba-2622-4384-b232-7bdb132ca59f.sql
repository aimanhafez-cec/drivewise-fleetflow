-- Add pricing component fields to agreements table (backwards-compatible)
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS base_vehicle_rate_per_month NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_package_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_insurance_cost_per_vehicle NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_maintenance_cost_per_vehicle NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS roadside_assistance_cost_monthly NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS replacement_vehicle_cost_monthly NUMERIC DEFAULT NULL;

-- Add pricing component fields to agreement_lines table (backwards-compatible)
ALTER TABLE agreement_lines
ADD COLUMN IF NOT EXISTS base_vehicle_rate_per_month NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_package_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_insurance_cost_per_vehicle NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_maintenance_cost_per_vehicle NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS roadside_assistance_cost_monthly NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS replacement_vehicle_cost_monthly NUMERIC DEFAULT NULL;

-- Add helpful comments
COMMENT ON COLUMN agreements.base_vehicle_rate_per_month IS 'Base vehicle rental rate from price list (excluding services)';
COMMENT ON COLUMN agreements.insurance_package_type IS 'Insurance package: basic, comprehensive, or full';
COMMENT ON COLUMN agreement_lines.base_vehicle_rate_per_month IS 'Base vehicle rental rate for this line';
COMMENT ON COLUMN agreement_lines.insurance_package_type IS 'Insurance package: basic, comprehensive, or full';