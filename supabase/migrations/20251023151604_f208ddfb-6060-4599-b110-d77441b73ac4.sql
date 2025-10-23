-- Add inspection tracking columns to corporate_leasing_line_assignments
ALTER TABLE corporate_leasing_line_assignments
ADD COLUMN IF NOT EXISTS inspection_checkout_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inspection_checkout_id UUID REFERENCES inspection_master(id),
ADD COLUMN IF NOT EXISTS inspection_checkin_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inspection_checkin_id UUID REFERENCES inspection_master(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_line_assignments_checkout_inspection 
  ON corporate_leasing_line_assignments(inspection_checkout_id);
CREATE INDEX IF NOT EXISTS idx_line_assignments_checkin_inspection 
  ON corporate_leasing_line_assignments(inspection_checkin_id);