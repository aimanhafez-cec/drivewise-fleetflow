-- Create traffic_fines_corporate table
CREATE TABLE IF NOT EXISTS public.traffic_fines_corporate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_no TEXT NOT NULL UNIQUE,
  
  -- Authority & Source
  emirate TEXT NOT NULL,
  authority_source TEXT NOT NULL,
  integration_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Violation Details
  violation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  violation_description TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  
  -- Amounts
  amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  final_amount NUMERIC(10,2) NOT NULL,
  
  -- Black Points & Confiscation
  black_points INTEGER DEFAULT 0,
  confiscation_days INTEGER DEFAULT 0,
  
  -- Status & Payment
  status TEXT NOT NULL DEFAULT 'unpaid',
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  
  -- Contract Linkage
  agreement_id UUID REFERENCES public.agreements(id),
  contract_no TEXT,
  customer_id UUID REFERENCES public.profiles(id),
  driver_id UUID REFERENCES public.drivers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID REFERENCES public.profiles(id),
  
  -- Admin
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_traffic_fines_corporate_fine_no ON public.traffic_fines_corporate(fine_no);
CREATE INDEX idx_traffic_fines_corporate_emirate ON public.traffic_fines_corporate(emirate);
CREATE INDEX idx_traffic_fines_corporate_status ON public.traffic_fines_corporate(status);
CREATE INDEX idx_traffic_fines_corporate_agreement ON public.traffic_fines_corporate(agreement_id);
CREATE INDEX idx_traffic_fines_corporate_customer ON public.traffic_fines_corporate(customer_id);
CREATE INDEX idx_traffic_fines_corporate_vehicle ON public.traffic_fines_corporate(vehicle_id);
CREATE INDEX idx_traffic_fines_corporate_violation_date ON public.traffic_fines_corporate(violation_date DESC);

-- Enable RLS
ALTER TABLE public.traffic_fines_corporate ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can manage all fines
CREATE POLICY "Staff can manage all traffic fines"
ON public.traffic_fines_corporate
FOR ALL
USING (true);

-- RLS Policy: Customers can view their own fines
CREATE POLICY "Customers can view their own traffic fines"
ON public.traffic_fines_corporate
FOR SELECT
USING (customer_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));

-- Insert demo data (10 records)
INSERT INTO public.traffic_fines_corporate (
  fine_no, emirate, authority_source, integration_timestamp,
  violation_date, violation_description, plate_number,
  amount, discount_amount, final_amount,
  black_points, confiscation_days, status,
  payment_date, payment_reference, contract_no, notes
) VALUES
  -- Record 1: Unpaid speeding fine
  ('TF-2024-001', 'Dubai', 'Dubai Police', now() - interval '2 hours',
   now() - interval '5 days', 'Exceeding maximum speed limit by 20-30 km/h', 'A-12345',
   600, 0, 600, 4, 0, 'unpaid', NULL, NULL, 'CLA-000001-01', 'High priority - customer notified'),
   
  -- Record 2: Paid parking violation
  ('TF-2024-002', 'Abu Dhabi', 'Abu Dhabi Police', now() - interval '3 hours',
   now() - interval '10 days', 'Parking in prohibited area', 'B-67890',
   200, 50, 150, 0, 0, 'paid', now() - interval '3 days', 'PAY-AUH-20240115', 'CLA-000001-02', 'Payment received'),
   
  -- Record 3: Disputed red light
  ('TF-2024-003', 'Sharjah', 'Sharjah Police', now() - interval '1 hour',
   now() - interval '15 days', 'Crossing red traffic signal', 'C-11111',
   1000, 0, 1000, 12, 0, 'disputed', NULL, NULL, 'CLA-000002-01', 'Customer claims signal malfunction - under review'),
   
  -- Record 4: Unpaid mobile phone usage
  ('TF-2024-004', 'Dubai', 'Dubai Police', now() - interval '4 hours',
   now() - interval '7 days', 'Using mobile phone while driving', 'A-22222',
   400, 0, 400, 4, 0, 'unpaid', NULL, NULL, 'CLA-000001-03', 'Follow up required'),
   
  -- Record 5: Paid speeding with confiscation
  ('TF-2024-005', 'Abu Dhabi', 'Abu Dhabi Police', now() - interval '5 hours',
   now() - interval '20 days', 'Exceeding maximum speed limit by 60+ km/h', 'B-33333',
   3000, 0, 3000, 23, 30, 'paid', now() - interval '15 days', 'PAY-AUH-20240110', 'CLA-000003-01', 'Vehicle confiscated - released after payment'),
   
  -- Record 6: Cancelled - duplicate
  ('TF-2024-006', 'Ajman', 'Ajman Police', now() - interval '6 hours',
   now() - interval '12 days', 'Sudden swerving', 'D-44444',
   500, 500, 0, 4, 0, 'cancelled', NULL, NULL, 'CLA-000002-02', 'Duplicate entry - cancelled'),
   
  -- Record 7: Unpaid seat belt violation
  ('TF-2024-007', 'Ras Al Khaimah', 'RAK Police', now() - interval '7 hours',
   now() - interval '8 days', 'Not wearing seat belt', 'E-55555',
   400, 0, 400, 4, 0, 'unpaid', NULL, NULL, 'CLA-000001-04', 'Pending customer acknowledgment'),
   
  -- Record 8: Paid lane violation
  ('TF-2024-008', 'Umm Al Quwain', 'UAQ Police', now() - interval '8 hours',
   now() - interval '18 days', 'Changing lanes without ensuring clear path', 'F-66666',
   400, 100, 300, 4, 0, 'paid', now() - interval '10 days', 'PAY-UAQ-20240112', 'CLA-000003-02', 'Early payment discount applied'),
   
  -- Record 9: Unpaid parking meter
  ('TF-2024-009', 'Fujairah', 'Fujairah Municipality', now() - interval '9 hours',
   now() - interval '6 days', 'Failure to pay parking fees', 'G-77777',
   150, 0, 150, 0, 0, 'unpaid', NULL, NULL, 'CLA-000002-03', 'Minor violation'),
   
  -- Record 10: Disputed dangerous driving
  ('TF-2024-010', 'Dubai', 'Dubai Police', now() - interval '10 hours',
   now() - interval '25 days', 'Reckless driving endangering lives', 'A-88888',
   2000, 0, 2000, 12, 15, 'disputed', NULL, NULL, 'CLA-000001-05', 'Legal team reviewing - customer provided dashcam footage');