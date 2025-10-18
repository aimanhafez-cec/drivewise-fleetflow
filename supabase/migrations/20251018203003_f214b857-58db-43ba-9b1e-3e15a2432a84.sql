-- Add base vehicle rate and insurance package tracking to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS base_vehicle_rate_per_month NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS insurance_package_type TEXT DEFAULT 'comprehensive';

COMMENT ON COLUMN quotes.base_vehicle_rate_per_month IS 'The actual vehicle rental rate from price list, before adding insurance and services';
COMMENT ON COLUMN quotes.insurance_package_type IS 'Insurance package selected: basic, comprehensive, or full';