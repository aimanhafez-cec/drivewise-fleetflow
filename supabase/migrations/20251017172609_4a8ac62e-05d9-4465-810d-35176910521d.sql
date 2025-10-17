-- Add "Immediate" to the credit_terms enum
ALTER TYPE public.credit_terms ADD VALUE IF NOT EXISTS 'Immediate';