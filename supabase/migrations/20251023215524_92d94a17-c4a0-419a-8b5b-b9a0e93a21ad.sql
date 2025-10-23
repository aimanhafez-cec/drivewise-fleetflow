-- Create toll_transactions_corporate table with realistic Salik/Darb data
CREATE TABLE IF NOT EXISTS public.toll_transactions_corporate (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Raw toll gate data (what we actually receive from Salik/Darb)
  transaction_no TEXT NOT NULL UNIQUE,
  plate_number TEXT NOT NULL,
  gate_id TEXT NOT NULL,
  gate_name TEXT NOT NULL,
  crossing_date DATE NOT NULL,
  crossing_time TIME NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  toll_authority TEXT NOT NULL CHECK (toll_authority IN ('Salik', 'Darb')),
  emirate TEXT NOT NULL CHECK (emirate IN ('Dubai', 'Abu Dhabi')),
  payment_status TEXT NOT NULL DEFAULT 'charged' CHECK (payment_status IN ('charged', 'pending', 'failed', 'exempt')),
  
  -- Corporate enrichment (matched by plate_number after import)
  contract_id UUID REFERENCES public.agreements(id) ON DELETE SET NULL,
  vehicle_id UUID,
  customer_id UUID,
  driver_id UUID,
  
  -- Reconciliation tracking
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID,
  
  -- Billing linkage
  billing_cycle_id UUID REFERENCES public.contract_billing_cycles(id) ON DELETE SET NULL,
  billable_to_customer BOOLEAN DEFAULT true,
  
  -- Integration metadata
  integration_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  integration_source TEXT DEFAULT 'manual',
  integration_batch_id TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_toll_trans_corp_plate ON public.toll_transactions_corporate(plate_number);
CREATE INDEX idx_toll_trans_corp_crossing_date ON public.toll_transactions_corporate(crossing_date DESC);
CREATE INDEX idx_toll_trans_corp_contract ON public.toll_transactions_corporate(contract_id);
CREATE INDEX idx_toll_trans_corp_status ON public.toll_transactions_corporate(payment_status);
CREATE INDEX idx_toll_trans_corp_authority ON public.toll_transactions_corporate(toll_authority);
CREATE INDEX idx_toll_trans_corp_emirate ON public.toll_transactions_corporate(emirate);
CREATE INDEX idx_toll_trans_corp_reconciled ON public.toll_transactions_corporate(reconciled);

-- RLS Policies
ALTER TABLE public.toll_transactions_corporate ENABLE ROW LEVEL SECURITY;

-- Staff can manage all records
CREATE POLICY "Staff can manage toll transactions"
ON public.toll_transactions_corporate
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Customers can view their linked transactions
CREATE POLICY "Customers can view their toll transactions"
ON public.toll_transactions_corporate
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Insert realistic sample data (20 toll transactions)
INSERT INTO public.toll_transactions_corporate (
  transaction_no, plate_number, gate_id, gate_name, crossing_date, crossing_time, 
  amount, toll_authority, emirate, payment_status, integration_source, integration_batch_id
) VALUES
  -- Dubai Salik transactions
  ('SAL-2025-001234', 'D-12345', 'SAL-01', 'Al Garhoud Bridge', '2025-01-15', '08:15:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-15-01'),
  ('SAL-2025-001235', 'D-12345', 'SAL-02', 'Al Maktoum Bridge', '2025-01-15', '18:30:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-15-01'),
  ('SAL-2025-001236', 'D-67890', 'SAL-03', 'Floating Bridge', '2025-01-16', '07:45:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-16-01'),
  ('SAL-2025-001237', 'D-67890', 'SAL-04', 'Airport Tunnel', '2025-01-16', '08:00:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-16-01'),
  ('SAL-2025-001238', 'D-12345', 'SAL-05', 'Al Safa South', '2025-01-17', '09:20:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-17-01'),
  ('SAL-2025-001239', 'D-45678', 'SAL-06', 'Al Mamzar', '2025-01-17', '14:15:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-17-01'),
  ('SAL-2025-001240', 'D-45678', 'SAL-01', 'Al Garhoud Bridge', '2025-01-18', '08:10:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-18-01'),
  ('SAL-2025-001241', 'D-12345', 'SAL-07', 'Business Bay Crossing', '2025-01-18', '17:45:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-18-01'),
  ('SAL-2025-001242', 'D-67890', 'SAL-08', 'Al Khail Road', '2025-01-19', '07:30:00', 4.00, 'Salik', 'Dubai', 'pending', 'api_sync', 'BATCH-2025-01-19-01'),
  ('SAL-2025-001243', 'D-99999', 'SAL-02', 'Al Maktoum Bridge', '2025-01-19', '19:00:00', 4.00, 'Salik', 'Dubai', 'charged', 'api_sync', 'BATCH-2025-01-19-01'),
  
  -- Abu Dhabi Darb transactions
  ('DRB-2025-005678', 'AD-54321', 'DRB-01', 'Mussafah Bridge', '2025-01-15', '08:25:00', 4.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-15-02'),
  ('DRB-2025-005679', 'AD-54321', 'DRB-02', 'Sheikh Zayed Bridge', '2025-01-15', '18:40:00', 4.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-15-02'),
  ('DRB-2025-005680', 'AD-98765', 'DRB-03', 'Al Maqta Bridge', '2025-01-16', '07:55:00', 2.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-16-02'),
  ('DRB-2025-005681', 'AD-98765', 'DRB-04', 'Saadiyat Highway', '2025-01-16', '08:10:00', 2.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-16-02'),
  ('DRB-2025-005682', 'AD-54321', 'DRB-01', 'Mussafah Bridge', '2025-01-17', '09:30:00', 4.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-17-02'),
  ('DRB-2025-005683', 'AD-11111', 'DRB-05', 'Yas Highway', '2025-01-17', '14:20:00', 2.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-17-02'),
  ('DRB-2025-005684', 'AD-11111', 'DRB-02', 'Sheikh Zayed Bridge', '2025-01-18', '08:15:00', 4.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-18-02'),
  ('DRB-2025-005685', 'AD-54321', 'DRB-03', 'Al Maqta Bridge', '2025-01-18', '17:50:00', 2.00, 'Darb', 'Abu Dhabi', 'pending', 'api_sync', 'BATCH-2025-01-18-02'),
  ('DRB-2025-005686', 'AD-98765', 'DRB-04', 'Saadiyat Highway', '2025-01-19', '07:35:00', 2.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-19-02'),
  ('DRB-2025-005687', 'AD-22222', 'DRB-01', 'Mussafah Bridge', '2025-01-19', '19:10:00', 4.00, 'Darb', 'Abu Dhabi', 'charged', 'api_sync', 'BATCH-2025-01-19-02');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_toll_transactions_corporate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_toll_transactions_corporate_updated_at
  BEFORE UPDATE ON public.toll_transactions_corporate
  FOR EACH ROW
  EXECUTE FUNCTION public.update_toll_transactions_corporate_updated_at();