-- Create customers table for customer data (separate from user profiles)
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  license_number text,
  license_expiry date,
  date_of_birth date,
  address jsonb,
  emergency_contact jsonb,
  credit_rating integer,
  total_rentals integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  profile_photo_url text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated staff to manage all customers
CREATE POLICY "customers_staff_all" ON public.customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing tables to reference customers table instead of profiles for customer_id
ALTER TABLE public.reservations 
  ADD CONSTRAINT fk_reservations_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.agreements 
  ADD CONSTRAINT fk_agreements_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.quotes 
  ADD CONSTRAINT fk_quotes_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.invoices 
  ADD CONSTRAINT fk_invoices_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.traffic_tickets 
  ADD CONSTRAINT fk_traffic_tickets_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);

ALTER TABLE public.payments 
  ADD CONSTRAINT fk_payments_customer 
  FOREIGN KEY (customer_id) REFERENCES public.customers(id);