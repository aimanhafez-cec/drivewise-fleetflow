-- Insert Autostrad Rent a Car legal entity
INSERT INTO public.legal_entities (name, code, tax_registration_no, country_code, currency, vat_rate, is_active)
VALUES ('Autostrad Rent a Car', 'AUTOSTRAD', 'TRN-123456789', 'AE', 'AED', 5.0, true);

-- Insert B2B (Organization) customers
INSERT INTO public.customers (full_name, email, phone, customer_type, credit_limit, approval_required)
VALUES 
  ('United Trading Company LLC', 'info@unitedtrading.ae', '+971-50-123-4567', 'B2B', 50000.00, false),
  ('Arab Engineers Group', 'contact@arabengineergroup.ae', '+971-50-234-5678', 'B2B', 75000.00, false),
  ('Emirates Construction Co', 'admin@emiratesconstruction.ae', '+971-50-345-6789', 'CORPORATE', 100000.00, true);

-- Insert contact persons for organizations
INSERT INTO public.contact_persons (customer_id, full_name, email, phone, position, is_primary)
SELECT 
  c.id,
  'Ahmed Al Mansoori',
  'ahmed.almansoori@unitedtrading.ae',
  '+971-50-111-2222',
  'Fleet Manager',
  true
FROM public.customers c
WHERE c.full_name = 'United Trading Company LLC';

INSERT INTO public.contact_persons (customer_id, full_name, email, phone, position, is_primary)
SELECT 
  c.id,
  'Fatima Hassan',
  'fatima.hassan@unitedtrading.ae',
  '+971-50-222-3333',
  'Operations Manager',
  false
FROM public.customers c
WHERE c.full_name = 'United Trading Company LLC';

INSERT INTO public.contact_persons (customer_id, full_name, email, phone, position, is_primary)
SELECT 
  c.id,
  'Mohammed Rashid',
  'mohammed.rashid@arabengineergroup.ae',
  '+971-50-333-4444',
  'Procurement Director',
  true
FROM public.customers c
WHERE c.full_name = 'Arab Engineers Group';

-- Insert sample opportunities
INSERT INTO public.opportunities (customer_id, opportunity_no, status, notes_assumptions)
SELECT 
  c.id,
  'OPP-000001',
  'active',
  'Long-term corporate fleet requirement for construction projects. Customer needs reliable SUVs and sedans with comprehensive maintenance packages.'
FROM public.customers c
WHERE c.full_name = 'United Trading Company LLC';

INSERT INTO public.opportunities (customer_id, opportunity_no, status, notes_assumptions)
SELECT 
  c.id,
  'OPP-000002',
  'active',
  'Executive car lease program for senior management team. Preference for luxury sedans with premium features.'
FROM public.customers c
WHERE c.full_name = 'Arab Engineers Group';

-- Insert opportunity packages for OPP-000001
INSERT INTO public.opportunity_packages (opportunity_id, package_name, qty, uom, description)
SELECT 
  o.id,
  'SUV - Corporate Lease Package (36 Months)',
  5,
  'units',
  'Full-service lease including maintenance, insurance, and roadside assistance'
FROM public.opportunities o
WHERE o.opportunity_no = 'OPP-000001';

INSERT INTO public.opportunity_packages (opportunity_id, package_name, qty, uom, description)
SELECT 
  o.id,
  'Sedan - Standard Package (24 Months)',
  10,
  'units',
  'Basic lease with insurance and registration'
FROM public.opportunities o
WHERE o.opportunity_no = 'OPP-000001';

-- Insert opportunity packages for OPP-000002
INSERT INTO public.opportunity_packages (opportunity_id, package_name, qty, uom, description)
SELECT 
  o.id,
  'Luxury Sedan - Executive Package (48 Months)',
  3,
  'units',
  'Premium lease with chauffeur option and concierge services'
FROM public.opportunities o
WHERE o.opportunity_no = 'OPP-000002';