-- Create inspection_master table
CREATE TABLE IF NOT EXISTS inspection_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_no TEXT UNIQUE NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN (
    'RENTAL_CHECKOUT', 'RENTAL_CHECKIN', 'PERIODIC', 'RANDOM'
  )),
  
  -- Vehicle & Agreement references
  vehicle_id UUID REFERENCES vehicles(id),
  vin TEXT,
  agreement_id UUID REFERENCES corporate_leasing_agreements(id),
  line_id UUID,
  item_code TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'APPROVED')),
  entry_date TIMESTAMPTZ DEFAULT NOW(),
  completed_date TIMESTAMPTZ,
  
  -- Inspection data
  checklist JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  damage_marker_ids UUID[] DEFAULT '{}',
  media JSONB DEFAULT '[]',
  
  -- Personnel & location
  performed_by_user_id UUID,
  inspector_name TEXT,
  location_id UUID,
  device_info TEXT,
  
  -- Signature & attachments
  signature JSONB,
  attachments JSONB DEFAULT '[]',
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_inspection_master_type ON inspection_master(inspection_type);
CREATE INDEX idx_inspection_master_status ON inspection_master(status);
CREATE INDEX idx_inspection_master_vin ON inspection_master(vin);
CREATE INDEX idx_inspection_master_agreement ON inspection_master(agreement_id);
CREATE INDEX idx_inspection_master_vehicle ON inspection_master(vehicle_id);
CREATE INDEX idx_inspection_master_entry_date ON inspection_master(entry_date DESC);

-- Function to auto-generate inspection_no
CREATE OR REPLACE FUNCTION generate_inspection_no()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  new_inspection_no TEXT;
BEGIN
  -- Get the next number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(inspection_no FROM 'INS-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM inspection_master
  WHERE inspection_no LIKE 'INS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-%';
  
  -- Generate new inspection number
  new_inspection_no := 'INS-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(next_num::TEXT, 4, '0');
  
  NEW.inspection_no := new_inspection_no;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate inspection_no on insert
CREATE TRIGGER trigger_generate_inspection_no
BEFORE INSERT ON inspection_master
FOR EACH ROW
WHEN (NEW.inspection_no IS NULL OR NEW.inspection_no = '')
EXECUTE FUNCTION generate_inspection_no();

-- Auto-update updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON inspection_master
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE inspection_master ENABLE ROW LEVEL SECURITY;

-- RLS Policies (demo mode - allow all for authenticated users)
CREATE POLICY "Anyone can view inspections" ON inspection_master
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create inspections" ON inspection_master
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update inspections" ON inspection_master
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete draft inspections" ON inspection_master
  FOR DELETE USING (auth.uid() IS NOT NULL AND status = 'DRAFT');