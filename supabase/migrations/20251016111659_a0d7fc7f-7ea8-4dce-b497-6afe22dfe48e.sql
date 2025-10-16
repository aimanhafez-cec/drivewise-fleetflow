-- Add columns to quotes table for customer link tracking
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS public_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_to_customer_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sent_to_customer_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS customer_acceptance_status TEXT CHECK (customer_acceptance_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS customer_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS customer_signature JSONB,
ADD COLUMN IF NOT EXISTS customer_rejection_reason TEXT;