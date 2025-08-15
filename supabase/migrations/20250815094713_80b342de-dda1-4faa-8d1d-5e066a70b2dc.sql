-- Create function to generate reservation numbers
CREATE OR REPLACE FUNCTION public.generate_reservation_no()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    next_num INTEGER;
    result_reservation_no TEXT;
BEGIN
    -- Get the next number, starting from 1 if no reservations exist
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(reservations.ro_number FROM 'RES-(\d+)') AS INTEGER)) 
         FROM public.reservations 
         WHERE reservations.ro_number IS NOT NULL AND reservations.ro_number ~ '^RES-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    -- Generate the reservation number with zero padding
    result_reservation_no := 'RES-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_reservation_no;
END;
$function$