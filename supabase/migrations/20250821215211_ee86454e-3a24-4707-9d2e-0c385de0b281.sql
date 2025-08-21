-- Add missing identification fields to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS national_id TEXT,
ADD COLUMN IF NOT EXISTS passport_number TEXT;

-- Add helpful indexes for searching by identification numbers
CREATE INDEX IF NOT EXISTS idx_customers_national_id ON public.customers(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_passport_number ON public.customers(passport_number) WHERE passport_number IS NOT NULL;