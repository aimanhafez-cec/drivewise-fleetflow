-- Check current foreign key constraints on agreements table
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='agreements';

-- Drop the existing foreign key constraint that references profiles
ALTER TABLE public.agreements DROP CONSTRAINT IF EXISTS agreements_customer_id_fkey;

-- Add correct foreign key constraint to reference customers table
ALTER TABLE public.agreements 
ADD CONSTRAINT agreements_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

-- Ensure reservations also references customers (should already be correct)
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_customer_id_fkey;
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);