-- Fix payment_terms_id and default_price_list_id column types
ALTER TABLE quotes 
ALTER COLUMN payment_terms_id TYPE text USING payment_terms_id::text;

ALTER TABLE quotes 
ALTER COLUMN default_price_list_id TYPE text USING default_price_list_id::text;

-- Add comments to document what these columns store
COMMENT ON COLUMN quotes.payment_terms_id IS 'Payment terms identifier (e.g., immediate, net-30, net-60)';
COMMENT ON COLUMN quotes.default_price_list_id IS 'Price list identifier (e.g., standard, premium, corporate)';