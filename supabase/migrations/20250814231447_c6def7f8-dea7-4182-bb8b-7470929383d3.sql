-- Fix function search path security issue
CREATE OR REPLACE FUNCTION generate_agreement_no()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    agreement_no TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(agreement_no FROM 'AGR-(\d+)') AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM agreements 
    WHERE agreement_no IS NOT NULL;
    
    agreement_no := 'AGR-' || LPAD(next_num::TEXT, 6, '0');
    RETURN agreement_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';