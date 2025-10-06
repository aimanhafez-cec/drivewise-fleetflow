-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_no TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  notes_assumptions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunity_packages table
CREATE TABLE public.opportunity_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  description TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  uom TEXT NOT NULL DEFAULT 'each',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_units table
CREATE TABLE public.business_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  legal_entity_id UUID REFERENCES public.legal_entities(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_persons table
CREATE TABLE public.contact_persons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_offices table
CREATE TABLE public.sales_offices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_representatives table
CREATE TABLE public.sales_representatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  sales_office_id UUID REFERENCES public.sales_offices(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to quotes table
ALTER TABLE public.quotes
ADD COLUMN legal_entity_id UUID REFERENCES public.legal_entities(id),
ADD COLUMN business_unit_id UUID REFERENCES public.business_units(id),
ADD COLUMN opportunity_id UUID REFERENCES public.opportunities(id),
ADD COLUMN quote_description TEXT,
ADD COLUMN customer_type TEXT,
ADD COLUMN account_name TEXT,
ADD COLUMN customer_bill_to TEXT,
ADD COLUMN contact_person_id UUID REFERENCES public.contact_persons(id),
ADD COLUMN project TEXT,
ADD COLUMN sales_office_id UUID REFERENCES public.sales_offices(id),
ADD COLUMN sales_rep_id UUID REFERENCES public.sales_representatives(id),
ADD COLUMN quote_entry_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN win_loss_reason TEXT,
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN quote_date DATE,
ADD COLUMN quote_type TEXT,
ADD COLUMN currency TEXT DEFAULT 'AED',
ADD COLUMN validity_date_to DATE,
ADD COLUMN contract_effective_from DATE,
ADD COLUMN contract_effective_to DATE,
ADD COLUMN duration_days INTEGER;

-- Enable RLS on all new tables
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_representatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities
CREATE POLICY "Staff can manage all opportunities" ON public.opportunities FOR ALL USING (true);

-- RLS Policies for opportunity_packages
CREATE POLICY "Staff can manage all packages" ON public.opportunity_packages FOR ALL USING (true);

-- RLS Policies for business_units
CREATE POLICY "Everyone can view business units" ON public.business_units FOR SELECT USING (true);
CREATE POLICY "Staff can manage business units" ON public.business_units FOR ALL USING (true);

-- RLS Policies for contact_persons
CREATE POLICY "Everyone can view contact persons" ON public.contact_persons FOR SELECT USING (true);
CREATE POLICY "Staff can manage contact persons" ON public.contact_persons FOR ALL USING (true);

-- RLS Policies for sales_offices
CREATE POLICY "Everyone can view sales offices" ON public.sales_offices FOR SELECT USING (true);
CREATE POLICY "Staff can manage sales offices" ON public.sales_offices FOR ALL USING (true);

-- RLS Policies for sales_representatives
CREATE POLICY "Everyone can view sales reps" ON public.sales_representatives FOR SELECT USING (true);
CREATE POLICY "Staff can manage sales reps" ON public.sales_representatives FOR ALL USING (true);

-- Insert seed data for business_units
INSERT INTO public.business_units (name, code, is_active) VALUES
('Autostrad Rent a Car', 'AUTOSTRAD', true);

-- Insert seed data for sales_offices
INSERT INTO public.sales_offices (name, code, is_active) VALUES
('Dubai', 'DXB', true),
('Abu Dhabi', 'AUH', true),
('Sharjah', 'SHJ', true);

-- Insert seed data for sales_representatives
INSERT INTO public.sales_representatives (full_name, email, sales_office_id, is_active)
SELECT 'Ahmed Ali', 'ahmed.ali@autostrad.com', id, true FROM public.sales_offices WHERE code = 'DXB'
UNION ALL
SELECT 'Sara Mohammed', 'sara.mohammed@autostrad.com', id, true FROM public.sales_offices WHERE code = 'DXB'
UNION ALL
SELECT 'Omar Hassan', 'omar.hassan@autostrad.com', id, true FROM public.sales_offices WHERE code = 'AUH'
UNION ALL
SELECT 'Fatima Abdullah', 'fatima.abdullah@autostrad.com', id, true FROM public.sales_offices WHERE code = 'AUH'
UNION ALL
SELECT 'Khalid Salem', 'khalid.salem@autostrad.com', id, true FROM public.sales_offices WHERE code = 'SHJ';