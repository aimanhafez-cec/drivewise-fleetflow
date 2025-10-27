-- Phase 1: Financial Settlement - Multi-Payment Method Enhancement
-- Add wallet balance, payment links, and split payments support

-- 1.1 Add wallet_balance to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0.00;

-- Add constraint to prevent negative balance
ALTER TABLE profiles 
ADD CONSTRAINT wallet_balance_non_negative 
CHECK (wallet_balance >= 0);

-- 1.2 Create payment_links table
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  link_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for payment_links
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_links
CREATE POLICY "Staff can manage all payment links"
  ON payment_links
  FOR ALL
  USING (true);

CREATE POLICY "Customers can view their own payment links"
  ON payment_links
  FOR SELECT
  USING (customer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Index for faster link lookups
CREATE INDEX IF NOT EXISTS idx_payment_links_token ON payment_links(link_token);
CREATE INDEX IF NOT EXISTS idx_payment_links_agreement ON payment_links(agreement_id);

-- 1.3 Create agreement_split_payments table
CREATE TABLE IF NOT EXISTS agreement_split_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID REFERENCES agreements(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  loyalty_points_used INTEGER DEFAULT 0 CHECK (loyalty_points_used >= 0),
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for agreement_split_payments
ALTER TABLE agreement_split_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agreement_split_payments
CREATE POLICY "Staff can manage all split payments"
  ON agreement_split_payments
  FOR ALL
  USING (true);

CREATE POLICY "Customers can view their split payments"
  ON agreement_split_payments
  FOR SELECT
  USING (agreement_id IN (
    SELECT id FROM agreements WHERE customer_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_split_payments_agreement ON agreement_split_payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_status ON agreement_split_payments(status);

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON payment_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_split_payments_updated_at
  BEFORE UPDATE ON agreement_split_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();