-- Update search_drivers_enhanced function to ensure phone is included in CASE
-- and improve result ordering for better relevance

DROP FUNCTION IF EXISTS public.search_drivers_enhanced(text, integer);

CREATE OR REPLACE FUNCTION public.search_drivers_enhanced(p_search_term text, p_limit integer DEFAULT 50)
 RETURNS TABLE(
   id uuid, 
   full_name text, 
   license_no text, 
   emirates_id text, 
   passport_number text, 
   phone text, 
   email text, 
   verification_status text, 
   date_of_birth date, 
   license_expiry date, 
   visa_expiry date, 
   nationality text, 
   status text, 
   additional_driver_fee numeric, 
   match_field text, 
   label text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      WHEN d.license_no ILIKE '%' || p_search_term || '%' THEN 'license'
      WHEN d.phone ILIKE '%' || p_search_term || '%' THEN 'phone'
      WHEN d.full_name ILIKE '%' || p_search_term || '%' THEN 'name'
      WHEN d.email ILIKE '%' || p_search_term || '%' THEN 'email'
      WHEN d.emirates_id ILIKE '%' || p_search_term || '%' THEN 'emirates_id'
      WHEN d.passport_number ILIKE '%' || p_search_term || '%' THEN 'passport'
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
    -- Priority: exact matches at start come first
    CASE 
      WHEN d.license_no ILIKE p_search_term || '%' THEN 1
      WHEN d.phone ILIKE p_search_term || '%' THEN 2
      WHEN d.full_name ILIKE p_search_term || '%' THEN 3
      WHEN d.license_no ILIKE '%' || p_search_term || '%' THEN 4
      WHEN d.phone ILIKE '%' || p_search_term || '%' THEN 5
      WHEN d.full_name ILIKE '%' || p_search_term || '%' THEN 6
      ELSE 7
    END,
    d.full_name
  LIMIT p_limit;
END;
$function$;