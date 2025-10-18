-- Add monthly insurance cost field to quotes table (default for all vehicles)
ALTER TABLE quotes 
ADD COLUMN monthly_insurance_cost_per_vehicle NUMERIC DEFAULT 300;

COMMENT ON COLUMN quotes.monthly_insurance_cost_per_vehicle IS 'Default monthly insurance cost per vehicle in AED';