-- Drop the existing foreign key constraint that references profiles
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_customer_id_fkey;

-- Add new foreign key constraint that references customers
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);