-- Add mileage pooling configuration columns to quotes table
ALTER TABLE quotes
ADD COLUMN mileage_pooling_enabled boolean DEFAULT false,
ADD COLUMN pooled_mileage_allowance_km integer,
ADD COLUMN pooled_excess_km_rate numeric(10,2);