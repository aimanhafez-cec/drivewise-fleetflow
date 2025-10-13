-- Update customer_type enum from B2B/CORPORATE/B2C to Company/Person
-- Handle all tables that use this enum

-- Step 1: Convert all enum columns to text
ALTER TABLE public.customers 
ALTER COLUMN customer_type TYPE text;

ALTER TABLE public.instant_booking_rules 
ALTER COLUMN customer_type TYPE text;

ALTER TABLE public.car_subscriptions 
ALTER COLUMN customer_type TYPE text;

-- Step 2: Update existing records to use new values in all tables
UPDATE public.customers 
SET customer_type = 'Company' 
WHERE customer_type IN ('B2B', 'CORPORATE');

UPDATE public.customers 
SET customer_type = 'Person' 
WHERE customer_type = 'B2C';

UPDATE public.instant_booking_rules 
SET customer_type = 'Company' 
WHERE customer_type IN ('B2B', 'CORPORATE');

UPDATE public.instant_booking_rules 
SET customer_type = 'Person' 
WHERE customer_type = 'B2C';

UPDATE public.car_subscriptions 
SET customer_type = 'Company' 
WHERE customer_type IN ('B2B', 'CORPORATE');

UPDATE public.car_subscriptions 
SET customer_type = 'Person' 
WHERE customer_type = 'B2C';

-- Step 3: Drop old enum type
DROP TYPE IF EXISTS public.customer_type CASCADE;

-- Step 4: Create new enum with only Company and Person
CREATE TYPE public.customer_type AS ENUM ('Company', 'Person');

-- Step 5: Convert all columns back to enum
ALTER TABLE public.customers 
ALTER COLUMN customer_type TYPE customer_type 
USING customer_type::customer_type;

ALTER TABLE public.instant_booking_rules 
ALTER COLUMN customer_type TYPE customer_type 
USING customer_type::customer_type;

ALTER TABLE public.car_subscriptions 
ALTER COLUMN customer_type TYPE customer_type 
USING customer_type::customer_type;

-- Step 6: Set default values
ALTER TABLE public.customers 
ALTER COLUMN customer_type SET DEFAULT 'Person'::customer_type;