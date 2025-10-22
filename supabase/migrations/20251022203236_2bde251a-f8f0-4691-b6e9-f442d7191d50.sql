-- Add Toll & Fines configuration fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS salik_darb_handling TEXT,
ADD COLUMN IF NOT EXISTS salik_darb_allowance_cap NUMERIC,
ADD COLUMN IF NOT EXISTS tolls_admin_fee_model TEXT,
ADD COLUMN IF NOT EXISTS traffic_fines_handling TEXT,
ADD COLUMN IF NOT EXISTS admin_fee_per_fine_aed NUMERIC DEFAULT 55;

-- Add helpful comment
COMMENT ON COLUMN public.quotes.salik_darb_handling IS 'How Salik/Darb toll charges are handled: Rebill Actual (monthly), Included Allowance, Included in Lease Rate';
COMMENT ON COLUMN public.quotes.salik_darb_allowance_cap IS 'Monthly allowance cap for tolls when using Included Allowance option';
COMMENT ON COLUMN public.quotes.tolls_admin_fee_model IS 'Admin fee model for tolls: None, Per-event, Per-invoice';
COMMENT ON COLUMN public.quotes.admin_fee_per_toll_aed IS 'Administrative fee charged per toll transaction or per invoice';
COMMENT ON COLUMN public.quotes.traffic_fines_handling IS 'How traffic fines are processed: Auto Rebill + Admin Fee';
COMMENT ON COLUMN public.quotes.admin_fee_per_fine_aed IS 'Administrative fee charged per traffic fine (default 55 AED)';