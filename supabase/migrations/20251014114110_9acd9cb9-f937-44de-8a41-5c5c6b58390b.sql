-- Fix schema reference in set_cost_sheet_no trigger function
CREATE OR REPLACE FUNCTION public.set_cost_sheet_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only set if cost_sheet_no is NULL
  IF NEW.cost_sheet_no IS NULL THEN
    NEW.cost_sheet_no := public.generate_cost_sheet_no(NEW.quote_id, NEW.version);
  END IF;
  
  RETURN NEW;
END;
$$;