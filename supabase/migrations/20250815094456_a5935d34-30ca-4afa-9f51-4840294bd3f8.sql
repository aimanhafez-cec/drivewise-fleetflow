-- Migrate the missing customer from profiles to customers
INSERT INTO public.customers (
  id, full_name, email, phone, license_number, date_of_birth, 
  license_expiry, notes, address, emergency_contact, credit_rating, 
  total_rentals, total_spent, profile_photo_url, created_at, updated_at
)
SELECT 
  id, full_name, email, phone, license_number, date_of_birth,
  license_expiry, 
  CASE WHEN notes IS NOT NULL THEN array_to_string(notes, '\n') ELSE NULL END as notes,
  address, emergency_contact, credit_rating, total_rentals, total_spent, 
  profile_photo_url, created_at, updated_at
FROM public.profiles 
WHERE id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec'
ON CONFLICT (id) DO NOTHING;

-- Now drop the existing foreign key constraint that references profiles
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_customer_id_fkey;

-- Add new foreign key constraint that references customers
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);