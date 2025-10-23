-- Create corporate_leasing_line_assignments table for tracking VIN assignments
CREATE TABLE IF NOT EXISTS public.corporate_leasing_line_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES public.corporate_leasing_agreements(id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  contract_no TEXT NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  vin TEXT NOT NULL,
  item_code TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  checkout_location_id TEXT,
  checkin_location_id TEXT,
  checkout_fuel_level INTEGER,
  checkout_odometer INTEGER,
  checkout_notes TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'checked_out', 'checked_in', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_corporate_line_assignments_unique 
  ON public.corporate_leasing_line_assignments(agreement_id, line_no) 
  WHERE status != 'cancelled';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_corporate_line_assignments_vehicle 
  ON public.corporate_leasing_line_assignments(vehicle_id);

CREATE INDEX IF NOT EXISTS idx_corporate_line_assignments_status 
  ON public.corporate_leasing_line_assignments(status);

CREATE INDEX IF NOT EXISTS idx_corporate_line_assignments_agreement 
  ON public.corporate_leasing_line_assignments(agreement_id);

-- Enable RLS
ALTER TABLE public.corporate_leasing_line_assignments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view assignments
CREATE POLICY "Authenticated users can view assignments"
  ON public.corporate_leasing_line_assignments
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create assignments
CREATE POLICY "Authenticated users can create assignments"
  ON public.corporate_leasing_line_assignments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update assignments
CREATE POLICY "Authenticated users can update assignments"
  ON public.corporate_leasing_line_assignments
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_corporate_line_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corporate_line_assignments_updated_at
  BEFORE UPDATE ON public.corporate_leasing_line_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_corporate_line_assignments_updated_at();