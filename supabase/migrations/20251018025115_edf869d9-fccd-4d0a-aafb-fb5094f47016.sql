-- Create enhanced driver search function for multi-field searching
CREATE OR REPLACE FUNCTION public.search_drivers_enhanced(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  license_no TEXT,
  emirates_id TEXT,
  passport_number TEXT,
  phone TEXT,
  email TEXT,
  verification_status TEXT,
  date_of_birth DATE,
  license_expiry DATE,
  visa_expiry DATE,
  nationality TEXT,
  status TEXT,
  additional_driver_fee NUMERIC,
  match_field TEXT,
  label TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.full_name,
    d.license_no,
    d.emirates_id,
    d.passport_number,
    d.phone,
    d.email,
    d.verification_status::TEXT,
    d.date_of_birth,
    d.license_expiry,
    d.visa_expiry,
    d.nationality,
    d.status::TEXT,
    d.additional_driver_fee,
    CASE
      WHEN d.full_name ILIKE '%' || p_search_term || '%' THEN 'name'
      WHEN d.license_no ILIKE '%' || p_search_term || '%' THEN 'license'
      WHEN d.emirates_id ILIKE '%' || p_search_term || '%' THEN 'emirates_id'
      WHEN d.passport_number ILIKE '%' || p_search_term || '%' THEN 'passport'
      WHEN d.phone ILIKE '%' || p_search_term || '%' THEN 'phone'
      WHEN d.email ILIKE '%' || p_search_term || '%' THEN 'email'
      ELSE 'other'
    END as match_field,
    d.full_name || ' - ' || COALESCE(d.license_no, 'No License') as label
  FROM drivers d
  WHERE 
    d.full_name ILIKE '%' || p_search_term || '%'
    OR d.license_no ILIKE '%' || p_search_term || '%'
    OR d.emirates_id ILIKE '%' || p_search_term || '%'
    OR d.passport_number ILIKE '%' || p_search_term || '%'
    OR d.phone ILIKE '%' || p_search_term || '%'
    OR d.email ILIKE '%' || p_search_term || '%'
  ORDER BY 
    CASE WHEN d.full_name ILIKE p_search_term || '%' THEN 1 ELSE 2 END,
    d.full_name
  LIMIT p_limit;
END;
$$;