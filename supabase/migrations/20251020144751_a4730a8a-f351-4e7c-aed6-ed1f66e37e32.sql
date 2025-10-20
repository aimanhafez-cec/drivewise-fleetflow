-- Fix security warnings: Add search_path to trigger functions
-- This prevents potential SQL injection through search_path manipulation

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix log_vehicle_status_change function  
CREATE OR REPLACE FUNCTION log_vehicle_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.operational_status IS DISTINCT FROM NEW.operational_status THEN
    INSERT INTO vehicle_status_history (
      vehicle_id,
      from_status,
      to_status,
      reason_code,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.operational_status,
      NEW.operational_status,
      'manual_change',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;