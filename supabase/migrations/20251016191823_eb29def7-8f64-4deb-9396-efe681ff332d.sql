-- Update cost sheet configuration with UAE market values
UPDATE cost_sheet_configurations
SET 
  financing_rate_percent = 5.5,
  overhead_percent = 8.0,
  maintenance_per_month_aed = 350,
  insurance_per_month_aed = 450,
  registration_admin_per_month_aed = 125,
  other_costs_per_month_aed = 75,
  updated_at = now()
WHERE is_active = true;