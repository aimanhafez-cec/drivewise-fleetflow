-- Drop existing function if it exists
DROP FUNCTION IF EXISTS generate_expense_no() CASCADE;

-- Create vehicle_expenses table
CREATE TABLE IF NOT EXISTS public.vehicle_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_no TEXT UNIQUE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'fuel', 'maintenance', 'insurance', 'registration', 'tolls', 
    'parking', 'cleaning', 'repairs', 'tires', 'accessories', 
    'depreciation', 'other'
  )),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'AED',
  expense_date DATE NOT NULL,
  vendor_name TEXT,
  vendor_invoice_no TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'rejected', 'paid'
  )),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  attachment_url TEXT,
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Staff can manage all expenses" ON public.vehicle_expenses;
CREATE POLICY "Staff can manage all expenses"
  ON public.vehicle_expenses
  FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_vehicle_id ON public.vehicle_expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_status ON public.vehicle_expenses(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_expense_date ON public.vehicle_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_category ON public.vehicle_expenses(category);
CREATE INDEX IF NOT EXISTS idx_vehicle_expenses_created_at ON public.vehicle_expenses(created_at DESC);

-- Create sequence for expense numbers
CREATE SEQUENCE IF NOT EXISTS vehicle_expenses_seq;

-- Auto-generate expense number function
CREATE OR REPLACE FUNCTION generate_expense_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expense_no IS NULL THEN
    NEW.expense_no := 'EXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('vehicle_expenses_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for expense number
DROP TRIGGER IF EXISTS set_expense_no ON public.vehicle_expenses;
CREATE TRIGGER set_expense_no
  BEFORE INSERT ON public.vehicle_expenses
  FOR EACH ROW
  EXECUTE FUNCTION generate_expense_no();

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_vehicle_expenses_updated_at ON public.vehicle_expenses;
CREATE TRIGGER update_vehicle_expenses_updated_at
  BEFORE UPDATE ON public.vehicle_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();