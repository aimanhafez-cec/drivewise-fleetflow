-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enums for various status types
CREATE TYPE public.vehicle_status AS ENUM (
  'available','rented','maintenance','out_of_service','reserved'
);
CREATE TYPE public.reservation_status AS ENUM (
  'pending','confirmed','checked_out','completed','cancelled'
);
CREATE TYPE public.agreement_status AS ENUM (
  'active','completed','terminated','pending_return'
);
CREATE TYPE public.payment_status AS ENUM (
  'pending','processing','completed','failed','refunded'
);
CREATE TYPE public.damage_type AS ENUM (
  'scratch','dent','crack','missing_part','interior_damage','other'
);
CREATE TYPE public.user_role AS ENUM (
  'admin','fleet_manager','rental_agent','customer','maintenance','finance'
);

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.report_templates CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.traffic_tickets CASCADE;
DROP TABLE IF EXISTS public.damage_records CASCADE;
DROP TABLE IF EXISTS public.agreements CASCADE;
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  example_models TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  subtype TEXT,
  status public.vehicle_status NOT NULL DEFAULT 'available',
  location TEXT,
  fuel_level INTEGER DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
  odometer INTEGER DEFAULT 0,
  color TEXT,
  transmission TEXT,
  engine_size TEXT,
  features TEXT[],
  ownership_type TEXT,
  license_expiry DATE,
  insurance_expiry DATE,
  daily_rate DECIMAL(10,2),
  weekly_rate DECIMAL(10,2),
  monthly_rate DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles table (extending Supabase auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  license_number TEXT,
  license_expiry DATE,
  date_of_birth DATE,
  emergency_contact JSONB,
  profile_photo_url TEXT,
  notes TEXT[],
  credit_rating INTEGER,
  total_rentals INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.user_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Reservations table
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  return_location TEXT NOT NULL,
  rate_plan JSONB,
  taxes JSONB DEFAULT '[]',
  add_ons JSONB DEFAULT '[]',
  referral_code TEXT,
  billing_address JSONB,
  airport_info JSONB,
  po_number TEXT,
  ro_number TEXT,
  special_requests TEXT,
  total_amount DECIMAL(12,2),
  status public.reservation_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rental agreements table
CREATE TABLE public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  agreement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  signed_timestamp TIMESTAMPTZ,
  checkout_datetime TIMESTAMPTZ,
  return_datetime TIMESTAMPTZ,
  checkout_fuel INTEGER,
  checkout_odometer INTEGER,
  return_fuel INTEGER,
  return_odometer INTEGER,
  vehicle_condition_checkout JSONB,
  vehicle_condition_return JSONB,
  rate_overrides JSONB,
  add_ons JSONB DEFAULT '[]',
  notes TEXT,
  total_amount DECIMAL(12,2),
  status public.agreement_status NOT NULL DEFAULT 'pending_return',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Damage records table
CREATE TABLE public.damage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  agreement_id UUID REFERENCES public.agreements(id),
  damage_type public.damage_type NOT NULL,
  description TEXT NOT NULL,
  severity TEXT,
  location_on_vehicle TEXT,
  diagram_coordinates JSONB,
  photos TEXT[],
  repair_cost DECIMAL(10,2),
  repair_status TEXT DEFAULT 'pending',
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Traffic tickets table
CREATE TABLE public.traffic_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  agreement_id UUID REFERENCES public.agreements(id),
  ticket_date DATE NOT NULL,
  violation_type TEXT NOT NULL,
  fine_amount DECIMAL(10,2) NOT NULL,
  court_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES public.agreements(id),
  reservation_id UUID REFERENCES public.reservations(id),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  line_items JSONB NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  reservation_id UUID REFERENCES public.reservations(id),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  gateway_response JSONB,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Report templates table
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  columns JSONB NOT NULL,
  filters JSONB DEFAULT '{}',
  group_by TEXT[],
  sort_by JSONB DEFAULT '[]',
  schedule_rule TEXT,
  email_recipients TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_category ON public.vehicles(category_id);
CREATE INDEX idx_reservations_dates ON public.reservations(start_datetime, end_datetime);
CREATE INDEX idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX idx_reservations_vehicle ON public.reservations(vehicle_id);
CREATE INDEX idx_agreements_vehicle ON public.agreements(vehicle_id);
CREATE INDEX idx_agreements_customer ON public.agreements(customer_id);
CREATE INDEX idx_damage_records_vehicle ON public.damage_records(vehicle_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_reservation ON public.payments(reservation_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);

-- Enable Row Level Security
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_all"    ON public.categories FOR ALL    TO authenticated USING (true);

CREATE POLICY "vehicles_select"   ON public.vehicles   FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicles_all"      ON public.vehicles   FOR ALL    TO authenticated USING (true);

CREATE POLICY "profiles_own"      ON public.profiles   FOR ALL    TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_staff_select"    ON public.profiles   FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_roles_own"    ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_all"    ON public.user_roles FOR ALL    TO authenticated USING (true);

CREATE POLICY "reservations_customer" ON public.reservations FOR ALL TO authenticated USING (
  customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "reservations_staff" ON public.reservations FOR ALL TO authenticated USING (true);

CREATE POLICY "agreements_customer"   ON public.agreements   FOR SELECT TO authenticated USING (
  customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "agreements_staff"  ON public.agreements   FOR ALL    TO authenticated USING (true);

CREATE POLICY "damage_records_all" ON public.damage_records FOR ALL    TO authenticated USING (true);
CREATE POLICY "traffic_tickets_all" ON public.traffic_tickets FOR ALL  TO authenticated USING (true);
CREATE POLICY "invoices_all"       ON public.invoices     FOR ALL    TO authenticated USING (true);
CREATE POLICY "payments_all"       ON public.payments     FOR ALL    TO authenticated USING (true);
CREATE POLICY "report_templates_all" ON public.report_templates FOR ALL TO authenticated USING (true);

-- Triggers for automatic updated_at
CREATE TRIGGER update_categories_updated_at     BEFORE UPDATE ON public.categories     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at       BEFORE UPDATE ON public.vehicles       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at       BEFORE UPDATE ON public.profiles       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at   BEFORE UPDATE ON public.reservations   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at     BEFORE UPDATE ON public.agreements     FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_damage_records_updated_at BEFORE UPDATE ON public.damage_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_traffic_tickets_updated_at BEFORE UPDATE ON public.traffic_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at       BEFORE UPDATE ON public.invoices       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at       BEFORE UPDATE ON public.payments       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sample categories
INSERT INTO public.categories (name, description, icon, example_models) VALUES
  ('Economy',     'Fuel-efficient and budget-friendly vehicles', '🚗', ARRAY['Nissan Versa','Hyundai Accent','Mitsubishi Mirage']),
  ('Compact',     'Small cars perfect for city driving',        '🚙', ARRAY['Nissan Sentra','Hyundai Elantra','Toyota Corolla']),
  ('Intermediate','Mid-size vehicles with comfort and efficiency','🚘', ARRAY['Nissan Altima','Toyota Camry','Honda Accord']),
  ('Standard',    'Full-size cars with spacious interiors',      '🚖', ARRAY['Chevrolet Impala','Ford Fusion','Chrysler 300']),
  ('Full Size',   'Large vehicles for maximum comfort',          '🚐', ARRAY['Chevrolet Tahoe','Ford Explorer','GMC Yukon']),
  ('Premium',     'Luxury vehicles with premium features',       '🏎️', ARRAY['BMW 3 Series','Mercedes C-Class','Audi A4']),
  ('SUV',         'Sport Utility Vehicles for versatility',      '🚙', ARRAY['Toyota RAV4','Honda CR-V','Ford Escape']),
  ('Convertible', 'Open-air driving experience',                '🏁', ARRAY['Ford Mustang Convertible','Chevrolet Camaro Convertible']);