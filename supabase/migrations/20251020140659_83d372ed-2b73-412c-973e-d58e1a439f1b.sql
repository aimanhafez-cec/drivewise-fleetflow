-- Fix security definer view warning
-- Remove the security definer view and replace with a function-based approach

DROP VIEW IF EXISTS public.custody_transactions_secure;

-- Create a function to get custody transactions with masked data
CREATE OR REPLACE FUNCTION public.get_custody_transaction_masked(p_custody_id UUID)
RETURNS TABLE (
  id UUID,
  custody_no TEXT,
  status custody_status,
  customer_id UUID,
  custodian_name TEXT,
  custodian_contact_masked JSONB,
  effective_from TIMESTAMP WITH TIME ZONE,
  expected_return_date TIMESTAMP WITH TIME ZONE,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.custody_no,
    ct.status,
    ct.customer_id,
    ct.custodian_name,
    CASE 
      WHEN public.is_staff_or_admin(auth.uid()) THEN ct.custodian_contact
      ELSE jsonb_build_object(
        'phone', public.mask_phone(ct.custodian_contact->>'phone', auth.uid()),
        'email', public.mask_email(ct.custodian_contact->>'email', auth.uid())
      )
    END as custodian_contact_masked,
    ct.effective_from,
    ct.expected_return_date,
    ct.actual_return_date,
    ct.created_at
  FROM public.custody_transactions ct
  WHERE ct.id = p_custody_id
    AND (
      -- Staff can view all
      public.is_staff_or_admin(auth.uid())
      -- Customers can view their own
      OR ct.customer_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    );
END;
$$;