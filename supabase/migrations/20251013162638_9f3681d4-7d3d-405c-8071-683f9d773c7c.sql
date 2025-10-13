-- Create enum for cost sheet status
CREATE TYPE cost_sheet_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');

-- Create enum for cost sheet approval actions
CREATE TYPE cost_sheet_approval_action AS ENUM ('approved', 'rejected', 'requested_changes');

-- Table: cost_sheet_configurations
-- Stores default cost element values
CREATE TABLE public.cost_sheet_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  financing_rate_percent NUMERIC NOT NULL DEFAULT 6.0,
  overhead_percent NUMERIC NOT NULL DEFAULT 5.0,
  maintenance_per_month_aed NUMERIC NOT NULL DEFAULT 250,
  insurance_per_month_aed NUMERIC NOT NULL DEFAULT 300,
  registration_admin_per_month_aed NUMERIC NOT NULL DEFAULT 100,
  other_costs_per_month_aed NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: quote_cost_sheets
-- One cost sheet per quote
CREATE TABLE public.quote_cost_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL UNIQUE REFERENCES public.quotes(id) ON DELETE CASCADE,
  financing_rate_percent NUMERIC NOT NULL DEFAULT 6.0,
  overhead_percent NUMERIC NOT NULL DEFAULT 5.0,
  target_margin_percent NUMERIC NOT NULL DEFAULT 15.0,
  residual_value_percent NUMERIC NOT NULL DEFAULT 40.0,
  notes_assumptions TEXT,
  status cost_sheet_status NOT NULL DEFAULT 'draft',
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: quote_cost_sheet_lines
-- One line per vehicle in the quote
CREATE TABLE public.quote_cost_sheet_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_sheet_id UUID NOT NULL REFERENCES public.quote_cost_sheets(id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  vehicle_class_id UUID REFERENCES public.categories(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  lease_term_months INTEGER NOT NULL,
  acquisition_cost_aed NUMERIC NOT NULL DEFAULT 0,
  residual_value_percent NUMERIC NOT NULL DEFAULT 40.0,
  maintenance_per_month_aed NUMERIC NOT NULL DEFAULT 250,
  insurance_per_month_aed NUMERIC NOT NULL DEFAULT 300,
  registration_admin_per_month_aed NUMERIC NOT NULL DEFAULT 100,
  other_costs_per_month_aed NUMERIC NOT NULL DEFAULT 50,
  total_cost_per_month_aed NUMERIC NOT NULL DEFAULT 0,
  suggested_rate_per_month_aed NUMERIC NOT NULL DEFAULT 0,
  quoted_rate_per_month_aed NUMERIC NOT NULL DEFAULT 0,
  actual_margin_percent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cost_sheet_id, line_no)
);

-- Table: cost_sheet_approvals
-- Approval workflow tracking
CREATE TABLE public.cost_sheet_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_sheet_id UUID NOT NULL REFERENCES public.quote_cost_sheets(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES auth.users(id),
  action cost_sheet_approval_action NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.cost_sheet_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_cost_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_cost_sheet_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_sheet_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cost_sheet_configurations
CREATE POLICY "Everyone can view active configurations"
  ON public.cost_sheet_configurations
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage configurations"
  ON public.cost_sheet_configurations
  FOR ALL
  USING (true);

-- RLS Policies for quote_cost_sheets
CREATE POLICY "Users can view their own quote cost sheets"
  ON public.quote_cost_sheets
  FOR SELECT
  USING (
    quote_id IN (
      SELECT id FROM public.quotes 
      WHERE customer_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can manage all cost sheets"
  ON public.quote_cost_sheets
  FOR ALL
  USING (true);

-- RLS Policies for quote_cost_sheet_lines
CREATE POLICY "Users can view their own cost sheet lines"
  ON public.quote_cost_sheet_lines
  FOR SELECT
  USING (
    cost_sheet_id IN (
      SELECT id FROM public.quote_cost_sheets
      WHERE quote_id IN (
        SELECT id FROM public.quotes 
        WHERE customer_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Staff can manage all cost sheet lines"
  ON public.quote_cost_sheet_lines
  FOR ALL
  USING (true);

-- RLS Policies for cost_sheet_approvals
CREATE POLICY "Users can view approvals for their cost sheets"
  ON public.cost_sheet_approvals
  FOR SELECT
  USING (
    cost_sheet_id IN (
      SELECT id FROM public.quote_cost_sheets
      WHERE quote_id IN (
        SELECT id FROM public.quotes 
        WHERE customer_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Staff can manage all approvals"
  ON public.cost_sheet_approvals
  FOR ALL
  USING (true);

-- Add trigger for updated_at on new tables
CREATE TRIGGER update_cost_sheet_configurations_updated_at
  BEFORE UPDATE ON public.cost_sheet_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_cost_sheets_updated_at
  BEFORE UPDATE ON public.quote_cost_sheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_cost_sheet_lines_updated_at
  BEFORE UPDATE ON public.quote_cost_sheet_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.cost_sheet_configurations (
  name, 
  financing_rate_percent, 
  overhead_percent,
  maintenance_per_month_aed,
  insurance_per_month_aed,
  registration_admin_per_month_aed,
  other_costs_per_month_aed,
  is_active
) VALUES (
  '2025 Standard Cost Elements',
  6.0,
  5.0,
  250,
  300,
  100,
  50,
  true
);

-- Add indexes for performance
CREATE INDEX idx_quote_cost_sheets_quote_id ON public.quote_cost_sheets(quote_id);
CREATE INDEX idx_quote_cost_sheets_status ON public.quote_cost_sheets(status);
CREATE INDEX idx_quote_cost_sheet_lines_cost_sheet_id ON public.quote_cost_sheet_lines(cost_sheet_id);
CREATE INDEX idx_cost_sheet_approvals_cost_sheet_id ON public.cost_sheet_approvals(cost_sheet_id);