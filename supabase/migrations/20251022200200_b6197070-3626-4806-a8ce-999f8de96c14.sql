-- Add admin_fee_per_toll_aed column to all relevant tables
-- This field stores the administration fee charged per toll/Salik crossing (default: 1.00 AED)
-- Separate from admin_fee_per_fine_aed which is for traffic fines (default: 55.00 AED)

-- Add to quotes table
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS admin_fee_per_toll_aed DECIMAL(10,2) DEFAULT 1.00;

-- Add to agreements table
ALTER TABLE public.agreements
ADD COLUMN IF NOT EXISTS admin_fee_per_toll_aed DECIMAL(10,2) DEFAULT 1.00;

-- Add to corporate_leasing_agreements table
ALTER TABLE public.corporate_leasing_agreements
ADD COLUMN IF NOT EXISTS admin_fee_per_toll_aed DECIMAL(10,2) DEFAULT 1.00;

-- Add to car_subscriptions table
ALTER TABLE public.car_subscriptions
ADD COLUMN IF NOT EXISTS admin_fee_per_toll_aed DECIMAL(10,2) DEFAULT 1.00;

-- Add to reservations table
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS admin_fee_per_toll_aed DECIMAL(10,2) DEFAULT 1.00;

-- Add helpful comments
COMMENT ON COLUMN public.quotes.admin_fee_per_toll_aed IS 'Administration fee charged per toll/Salik crossing in AED (default: 1.00)';
COMMENT ON COLUMN public.agreements.admin_fee_per_toll_aed IS 'Administration fee charged per toll/Salik crossing in AED (default: 1.00)';
COMMENT ON COLUMN public.corporate_leasing_agreements.admin_fee_per_toll_aed IS 'Administration fee charged per toll/Salik crossing in AED (default: 1.00)';
COMMENT ON COLUMN public.car_subscriptions.admin_fee_per_toll_aed IS 'Administration fee charged per toll/Salik crossing in AED (default: 1.00)';
COMMENT ON COLUMN public.reservations.admin_fee_per_toll_aed IS 'Administration fee charged per toll/Salik crossing in AED (default: 1.00)';