-- Create tolls_fines table
CREATE TABLE IF NOT EXISTS public.tolls_fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toll_fine_no TEXT UNIQUE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  driver_id UUID REFERENCES public.drivers(id),
  customer_id UUID REFERENCES public.profiles(id),
  contract_id UUID,
  
  -- Type and classification
  type TEXT NOT NULL CHECK (type IN ('toll', 'fine')),
  category TEXT NOT NULL,
  
  -- Financial details
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AED',
  penalty_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Incident details
  incident_date DATE NOT NULL,
  incident_time TIME,
  location TEXT,
  gate_id TEXT,
  plate_number TEXT,
  
  -- Status and workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'paid', 'disputed', 'closed')),
  
  -- External reference
  external_reference_no TEXT,
  issuing_authority TEXT NOT NULL,
  violation_code TEXT,
  
  -- Payment tracking
  due_date DATE,
  paid_date DATE,
  payment_reference TEXT,
  
  -- Responsibility and billing
  responsibility TEXT CHECK (responsibility IN ('customer', 'company', 'driver')),
  billable_to_contract BOOLEAN DEFAULT false,
  
  -- Integration tracking
  integration_source TEXT,
  sync_status TEXT DEFAULT 'manual' CHECK (sync_status IN ('manual', 'synced', 'pending', 'failed')),
  last_sync_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create index for common queries
CREATE INDEX idx_tolls_fines_vehicle ON public.tolls_fines(vehicle_id);
CREATE INDEX idx_tolls_fines_customer ON public.tolls_fines(customer_id);
CREATE INDEX idx_tolls_fines_contract ON public.tolls_fines(contract_id);
CREATE INDEX idx_tolls_fines_status ON public.tolls_fines(status);
CREATE INDEX idx_tolls_fines_incident_date ON public.tolls_fines(incident_date);
CREATE INDEX idx_tolls_fines_type ON public.tolls_fines(type);

-- Enable RLS
ALTER TABLE public.tolls_fines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage all tolls and fines"
  ON public.tolls_fines
  FOR ALL
  USING (true);

CREATE POLICY "Customers can view their own tolls and fines"
  ON public.tolls_fines
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Create compliance_exceptions table
CREATE TABLE IF NOT EXISTS public.compliance_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exception_no TEXT UNIQUE NOT NULL,
  
  -- Source tracking
  source_module TEXT NOT NULL CHECK (source_module IN ('expense', 'toll_fine', 'other')),
  source_record_id UUID NOT NULL,
  
  -- Exception classification
  exception_type TEXT NOT NULL,
  exception_reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Status and workflow
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  
  -- Related entities
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID REFERENCES public.profiles(id),
  contract_id UUID,
  amount_involved NUMERIC(10,2),
  
  -- Detection and assignment
  auto_detected BOOLEAN DEFAULT false,
  detection_rule TEXT,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  flagged_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  
  -- Resolution tracking
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_exceptions_source ON public.compliance_exceptions(source_module, source_record_id);
CREATE INDEX idx_exceptions_status ON public.compliance_exceptions(status);
CREATE INDEX idx_exceptions_severity ON public.compliance_exceptions(severity);
CREATE INDEX idx_exceptions_assigned ON public.compliance_exceptions(assigned_to);
CREATE INDEX idx_exceptions_customer ON public.compliance_exceptions(customer_id);

-- Enable RLS
ALTER TABLE public.compliance_exceptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage all exceptions"
  ON public.compliance_exceptions
  FOR ALL
  USING (true);

-- Create toll_integration_config table
CREATE TABLE IF NOT EXISTS public.toll_integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  api_endpoint TEXT NOT NULL,
  
  -- Authentication
  auth_type TEXT NOT NULL CHECK (auth_type IN ('api_key', 'oauth', 'basic', 'none')),
  credentials_encrypted TEXT,
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'manual')),
  last_sync_at TIMESTAMPTZ,
  sync_mode TEXT DEFAULT 'pull' CHECK (sync_mode IN ('push', 'pull', 'webhook')),
  
  -- Mapping configuration
  mapping_config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.toll_integration_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage integration config"
  ON public.toll_integration_config
  FOR ALL
  USING (true);

-- Create contract_billing_cycles table
CREATE TABLE IF NOT EXISTS public.contract_billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL,
  billing_cycle_no TEXT NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'preview', 'finalized', 'invoiced')),
  
  -- Totals
  total_expenses NUMERIC(10,2) DEFAULT 0,
  total_tolls NUMERIC(10,2) DEFAULT 0,
  total_fines NUMERIC(10,2) DEFAULT 0,
  total_exceptions NUMERIC(10,2) DEFAULT 0,
  
  -- Generation tracking
  generated_at TIMESTAMPTZ,
  generated_by UUID REFERENCES public.profiles(id),
  finalized_at TIMESTAMPTZ,
  invoice_id UUID,
  
  -- Export
  export_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(contract_id, billing_cycle_no)
);

-- Create indexes
CREATE INDEX idx_billing_cycles_contract ON public.contract_billing_cycles(contract_id);
CREATE INDEX idx_billing_cycles_status ON public.contract_billing_cycles(status);
CREATE INDEX idx_billing_cycles_period ON public.contract_billing_cycles(period_start, period_end);

-- Enable RLS
ALTER TABLE public.contract_billing_cycles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage billing cycles"
  ON public.contract_billing_cycles
  FOR ALL
  USING (true);

-- Create function to generate toll/fine numbers
CREATE OR REPLACE FUNCTION public.generate_toll_fine_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(toll_fine_no FROM 'TF-(\d+)') AS INTEGER))
     FROM public.tolls_fines
     WHERE toll_fine_no ~ '^TF-\d+$'),
    0
  ) + 1 INTO next_num;
  
  result_no := 'TF-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

-- Create function to generate exception numbers
CREATE OR REPLACE FUNCTION public.generate_exception_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  next_num INTEGER;
  result_no TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT MAX(CAST(SUBSTRING(exception_no FROM 'EXC-(\d+)') AS INTEGER))
     FROM public.compliance_exceptions
     WHERE exception_no ~ '^EXC-\d+$'),
    0
  ) + 1 INTO next_num;
  
  result_no := 'EXC-' || LPAD(next_num::TEXT, 6, '0');
  RETURN result_no;
END;
$$;

-- Create trigger to auto-generate toll/fine numbers
CREATE OR REPLACE FUNCTION public.set_toll_fine_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.toll_fine_no IS NULL THEN
    NEW.toll_fine_no := public.generate_toll_fine_no();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_toll_fine_no
  BEFORE INSERT ON public.tolls_fines
  FOR EACH ROW
  EXECUTE FUNCTION public.set_toll_fine_no();

-- Create trigger to auto-generate exception numbers
CREATE OR REPLACE FUNCTION public.set_exception_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.exception_no IS NULL THEN
    NEW.exception_no := public.generate_exception_no();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_exception_no
  BEFORE INSERT ON public.compliance_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_exception_no();

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_tolls_fines_updated_at
  BEFORE UPDATE ON public.tolls_fines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_exceptions_updated_at
  BEFORE UPDATE ON public.compliance_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_billing_cycles_updated_at
  BEFORE UPDATE ON public.contract_billing_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_integration_config_updated_at
  BEFORE UPDATE ON public.toll_integration_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();