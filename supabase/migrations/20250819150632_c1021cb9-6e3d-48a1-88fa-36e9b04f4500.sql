-- Create instant booking profiles table for customer preferences
CREATE TABLE public.instant_booking_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  preferred_locations TEXT[],
  preferred_vehicle_categories UUID[],
  default_rental_duration INTERVAL DEFAULT '1 day',
  auto_approve_limit NUMERIC DEFAULT 500.00,
  saved_payment_methods JSONB DEFAULT '[]',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id)
);

-- Create booking type enum and add to reservations
CREATE TYPE public.booking_type AS ENUM ('INSTANT', 'STANDARD');

ALTER TABLE public.reservations 
ADD COLUMN booking_type booking_type DEFAULT 'STANDARD',
ADD COLUMN instant_booking_score INTEGER DEFAULT NULL,
ADD COLUMN auto_approved BOOLEAN DEFAULT FALSE;

-- Create customer type enum and add to customers
CREATE TYPE public.customer_type AS ENUM ('B2B', 'B2C', 'CORPORATE');

ALTER TABLE public.customers 
ADD COLUMN customer_type customer_type DEFAULT 'B2C',
ADD COLUMN corporate_account_id UUID DEFAULT NULL,
ADD COLUMN credit_limit NUMERIC DEFAULT 1000.00,
ADD COLUMN approval_required BOOLEAN DEFAULT FALSE;

-- Create instant booking rules table
CREATE TABLE public.instant_booking_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_type customer_type NOT NULL,
  location_id TEXT,
  vehicle_category_id UUID,
  max_auto_approve_amount NUMERIC NOT NULL DEFAULT 500.00,
  requires_approval BOOLEAN DEFAULT FALSE,
  advance_booking_hours INTEGER DEFAULT 2,
  blackout_dates JSONB DEFAULT '[]',
  business_rules JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.instant_booking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_booking_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for instant booking profiles
CREATE POLICY "Users can view their own booking profiles"
ON public.instant_booking_profiles
FOR SELECT
USING (customer_id IN (
  SELECT id FROM public.customers WHERE id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
));

CREATE POLICY "Staff can manage all booking profiles"
ON public.instant_booking_profiles
FOR ALL
USING (true);

CREATE POLICY "Users can manage their own booking profiles"
ON public.instant_booking_profiles
FOR ALL
USING (customer_id IN (
  SELECT id FROM public.customers WHERE id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
));

-- Create RLS policies for instant booking rules
CREATE POLICY "Booking rules are viewable by all authenticated users"
ON public.instant_booking_rules
FOR SELECT
USING (true);

CREATE POLICY "Staff can manage booking rules"
ON public.instant_booking_rules
FOR ALL
USING (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_instant_booking_profiles_updated_at
BEFORE UPDATE ON public.instant_booking_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instant_booking_rules_updated_at
BEFORE UPDATE ON public.instant_booking_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default instant booking rules
INSERT INTO public.instant_booking_rules (customer_type, max_auto_approve_amount, requires_approval, advance_booking_hours, business_rules)
VALUES 
  ('B2C', 500.00, FALSE, 2, '{"max_rental_days": 7, "allow_upgrades": true}'),
  ('B2B', 1500.00, FALSE, 1, '{"max_rental_days": 30, "allow_upgrades": true, "corporate_rates": true}'),
  ('CORPORATE', 5000.00, TRUE, 24, '{"max_rental_days": 90, "allow_upgrades": true, "corporate_rates": true, "approval_workflow": true}');