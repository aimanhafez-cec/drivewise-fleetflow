-- Fix search_path for trigger functions
CREATE OR REPLACE FUNCTION public.validate_custody_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_overlap RECORD;
  v_vehicle_status TEXT;
BEGIN
  -- Check for overlapping custody periods
  IF NEW.replacement_vehicle_id IS NOT NULL THEN
    SELECT * INTO v_overlap
    FROM public.check_custody_overlap(
      NEW.replacement_vehicle_id,
      NEW.effective_from,
      NEW.expected_return_date,
      NEW.id
    );
    
    IF v_overlap.has_overlap THEN
      RAISE EXCEPTION 'Vehicle is already in custody during this period (Custody: %)', v_overlap.overlapping_custody_no;
    END IF;
    
    -- Check vehicle eligibility
    SELECT status INTO v_vehicle_status
    FROM public.vehicles
    WHERE id = NEW.replacement_vehicle_id;
    
    IF v_vehicle_status IN ('out_of_service', 'sold', 'written_off') THEN
      RAISE EXCEPTION 'Vehicle is not eligible for custody (Status: %)', v_vehicle_status;
    END IF;
  END IF;
  
  -- Validate date logic
  IF NEW.expected_return_date IS NOT NULL AND NEW.expected_return_date <= NEW.effective_from THEN
    RAISE EXCEPTION 'Expected return date must be after effective date';
  END IF;
  
  IF NEW.actual_return_date IS NOT NULL AND NEW.actual_return_date < NEW.effective_from THEN
    RAISE EXCEPTION 'Actual return date cannot be before effective date';
  END IF;
  
  -- Validate incident date
  IF NEW.incident_date > NOW() THEN
    RAISE EXCEPTION 'Incident date cannot be in the future';
  END IF;
  
  -- Validate special rate code requirement
  IF NEW.rate_policy = 'special_code' AND (NEW.special_rate_code IS NULL OR NEW.special_rate_code = '') THEN
    RAISE EXCEPTION 'Special rate code is required when rate policy is "special_code"';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_custody_charge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_custody_status TEXT;
BEGIN
  -- Check custody status
  SELECT status INTO v_custody_status
  FROM public.custody_transactions
  WHERE id = NEW.custody_id;
  
  IF v_custody_status = 'voided' THEN
    RAISE EXCEPTION 'Cannot add charges to a voided custody transaction';
  END IF;
  
  -- Validate amounts
  IF NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Charge quantity must be greater than 0';
  END IF;
  
  IF NEW.unit_price < 0 THEN
    RAISE EXCEPTION 'Charge unit price cannot be negative';
  END IF;
  
  -- Calculate totals if not provided
  IF NEW.tax_amount IS NULL AND NEW.tax_rate IS NOT NULL THEN
    NEW.tax_amount := ROUND((NEW.quantity * NEW.unit_price * NEW.tax_rate / 100), 2);
  END IF;
  
  IF NEW.total_amount IS NULL THEN
    NEW.total_amount := ROUND((NEW.quantity * NEW.unit_price) + COALESCE(NEW.tax_amount, 0), 2);
  END IF;
  
  -- Prevent posting charges for draft custodies
  IF NEW.status = 'posted' AND v_custody_status = 'draft' THEN
    RAISE EXCEPTION 'Cannot post charges for a draft custody transaction';
  END IF;
  
  RETURN NEW;
END;
$$;