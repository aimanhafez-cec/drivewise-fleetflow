-- Phase 3 Step 1: Database & API Setup
-- Add enhanced columns to agreements table for improved tracking and UAE-specific features

-- Add source tracking columns
ALTER TABLE agreements 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) CHECK (source_type IN ('reservation', 'instant_booking', 'direct')),
ADD COLUMN IF NOT EXISTS source_id UUID;

-- Add agreement classification columns
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS agreement_type VARCHAR(20) CHECK (agreement_type IN ('daily', 'weekly', 'monthly', 'long_term')),
ADD COLUMN IF NOT EXISTS rental_purpose VARCHAR(20) CHECK (rental_purpose IN ('business', 'personal', 'tourism'));

-- Add UAE-specific columns
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS salik_account_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS darb_account_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS cross_border_allowed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cross_border_countries TEXT[];

-- Add mileage package columns
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS mileage_package VARCHAR(20) CHECK (mileage_package IN ('unlimited', 'limited')),
ADD COLUMN IF NOT EXISTS included_km INTEGER,
ADD COLUMN IF NOT EXISTS excess_km_rate NUMERIC(10,2);

-- Create agreement_documents table for document management
CREATE TABLE IF NOT EXISTS agreement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('emirates_id', 'passport', 'license', 'visa', 'additional_driver', 'other')),
  document_side VARCHAR(10) CHECK (document_side IN ('front', 'back', 'bio_page', 'visa_page')),
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  extracted_data JSONB DEFAULT '{}',
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreement_documents_agreement_id ON agreement_documents(agreement_id);
CREATE INDEX IF NOT EXISTS idx_agreement_documents_type ON agreement_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_agreement_documents_status ON agreement_documents(verification_status);

-- Create agreement_payments table for payment tracking
CREATE TABLE IF NOT EXISTS agreement_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('advance', 'security_deposit', 'monthly', 'final', 'refund')),
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'cheque', 'corporate_account', 'digital_wallet')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_ref TEXT,
  authorization_ref TEXT,
  card_last_4 VARCHAR(4),
  card_token TEXT,
  receipt_url TEXT,
  processed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agreement_payments_agreement_id ON agreement_payments(agreement_id);
CREATE INDEX IF NOT EXISTS idx_agreement_payments_type ON agreement_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_agreement_payments_status ON agreement_payments(status);

-- Enhance inspection_out table with additional fields
ALTER TABLE inspection_out
ADD COLUMN IF NOT EXISTS pre_handover_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fuel_level NUMERIC(3,2) CHECK (fuel_level >= 0 AND fuel_level <= 1),
ADD COLUMN IF NOT EXISTS odometer_reading INTEGER,
ADD COLUMN IF NOT EXISTS odometer_photo_url TEXT,
ADD COLUMN IF NOT EXISTS fuel_gauge_photo_url TEXT,
ADD COLUMN IF NOT EXISTS inspection_checklist JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update trigger for agreement_documents
CREATE OR REPLACE FUNCTION update_agreement_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agreement_documents_updated_at
  BEFORE UPDATE ON agreement_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_agreement_documents_updated_at();

-- Update trigger for agreement_payments
CREATE OR REPLACE FUNCTION update_agreement_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agreement_payments_updated_at
  BEFORE UPDATE ON agreement_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_agreement_payments_updated_at();

-- RLS Policies for agreement_documents
ALTER TABLE agreement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all agreement documents"
  ON agreement_documents
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Customers can view their agreement documents"
  ON agreement_documents
  FOR SELECT
  TO authenticated
  USING (
    agreement_id IN (
      SELECT id FROM agreements 
      WHERE customer_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for agreement_payments
ALTER TABLE agreement_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all agreement payments"
  ON agreement_payments
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Customers can view their agreement payments"
  ON agreement_payments
  FOR SELECT
  TO authenticated
  USING (
    agreement_id IN (
      SELECT id FROM agreements 
      WHERE customer_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );