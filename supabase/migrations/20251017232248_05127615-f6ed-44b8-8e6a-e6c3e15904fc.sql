-- Add delivery/collection columns to corporate_leasing_lines table
ALTER TABLE corporate_leasing_lines
  ADD COLUMN IF NOT EXISTS pickup_type text,
  ADD COLUMN IF NOT EXISTS pickup_location_id text,
  ADD COLUMN IF NOT EXISTS pickup_customer_site_id uuid,
  ADD COLUMN IF NOT EXISTS return_type text,
  ADD COLUMN IF NOT EXISTS return_location_id text,
  ADD COLUMN IF NOT EXISTS return_customer_site_id uuid,
  ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS collection_fee numeric DEFAULT 0;

COMMENT ON COLUMN corporate_leasing_lines.pickup_type IS 'Pickup type: company_location, customer_site, etc.';
COMMENT ON COLUMN corporate_leasing_lines.return_type IS 'Return type: company_location, customer_site, etc.';
COMMENT ON COLUMN corporate_leasing_lines.delivery_fee IS 'Delivery fee for this line if pickup at customer site';
COMMENT ON COLUMN corporate_leasing_lines.collection_fee IS 'Collection fee for this line if return at customer site';