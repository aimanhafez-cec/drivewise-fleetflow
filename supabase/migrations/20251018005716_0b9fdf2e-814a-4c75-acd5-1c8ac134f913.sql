-- Create junction table for drivers assigned to corporate leasing lines
CREATE TABLE IF NOT EXISTS public.corporate_leasing_line_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.corporate_leasing_agreements(id) ON DELETE CASCADE,
  line_id UUID NOT NULL REFERENCES public.corporate_leasing_lines(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE RESTRICT,
  
  -- Assignment details
  assignment_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assignment_end_date DATE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  
  -- Audit trail
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  removed_by UUID REFERENCES auth.users(id),
  removed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_line_drivers_agreement ON corporate_leasing_line_drivers(agreement_id);
CREATE INDEX idx_line_drivers_line ON corporate_leasing_line_drivers(line_id);
CREATE INDEX idx_line_drivers_driver ON corporate_leasing_line_drivers(driver_id);
CREATE INDEX idx_line_drivers_active ON corporate_leasing_line_drivers(line_id, removed_at) WHERE removed_at IS NULL;

-- RLS Policies
ALTER TABLE corporate_leasing_line_drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all line drivers"
  ON corporate_leasing_line_drivers
  FOR ALL
  USING (true);

-- Update timestamp trigger
CREATE TRIGGER update_line_drivers_updated_at
  BEFORE UPDATE ON corporate_leasing_line_drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE corporate_leasing_line_drivers IS 'Authorized drivers for corporate leasing vehicle lines with audit trail';
COMMENT ON COLUMN corporate_leasing_line_drivers.is_primary IS 'Primary driver responsible for the vehicle. Only one primary per line allowed.';
COMMENT ON COLUMN corporate_leasing_line_drivers.assignment_end_date IS 'Optional end date for driver assignment. NULL means ongoing.';