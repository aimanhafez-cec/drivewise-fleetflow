-- Add default PO/BPA number field to customers table
ALTER TABLE public.customers 
ADD COLUMN default_po_bpa_no text;