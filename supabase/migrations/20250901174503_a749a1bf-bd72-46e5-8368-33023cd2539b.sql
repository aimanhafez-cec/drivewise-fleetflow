-- Add sample default PO/BPA numbers to some customers for testing
UPDATE public.customers 
SET default_po_bpa_no = CASE 
  WHEN full_name = 'Ahmed Mohammed Al-Ali' THEN 'PO-2024-001'
  WHEN full_name = 'Fatima Abdulrahman Al-Salem' THEN 'BPA-2024-CORP-1'
  WHEN full_name = 'mohamed gamal' THEN 'PO-2024-002'
  ELSE default_po_bpa_no
END
WHERE full_name IN ('Ahmed Mohammed Al-Ali', 'Fatima Abdulrahman Al-Salem', 'mohamed gamal');