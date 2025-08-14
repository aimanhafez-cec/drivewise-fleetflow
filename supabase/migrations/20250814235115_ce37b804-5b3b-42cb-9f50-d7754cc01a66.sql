-- Make vehicle_id nullable in agreements table
-- since reservations might not have vehicles assigned yet
ALTER TABLE public.agreements 
ALTER COLUMN vehicle_id DROP NOT NULL;