-- Add approval tracking fields to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Create quote approvals audit trail table
CREATE TABLE IF NOT EXISTS quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  approver_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quote_approvals ENABLE ROW LEVEL SECURITY;

-- Policies for quote_approvals
CREATE POLICY "Staff can manage quote approvals" ON quote_approvals
  FOR ALL USING (true);