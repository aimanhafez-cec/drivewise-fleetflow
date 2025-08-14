-- Fix the generate_agreement_no function with proper variable names
CREATE OR REPLACE FUNCTION public.generate_agreement_no()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    next_num INTEGER;
    result_agreement_no TEXT;
BEGIN
    -- Get the next number, starting from 1 if no agreements exist
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(agreements.agreement_no FROM 'AGR-(\d+)') AS INTEGER)) 
         FROM public.agreements 
         WHERE agreements.agreement_no IS NOT NULL AND agreements.agreement_no ~ '^AGR-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    -- Generate the agreement number with zero padding
    result_agreement_no := 'AGR-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_agreement_no;
END;
$$;