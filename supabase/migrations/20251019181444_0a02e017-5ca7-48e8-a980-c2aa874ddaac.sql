-- Phase 1: Database & Core Structure for Enhanced Reservations System
-- Add reservation type and payment tracking columns to reservations table

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS reservation_type TEXT CHECK (reservation_type IN ('vehicle_class', 'make_model', 'specific_vin')),
ADD COLUMN IF NOT EXISTS vehicle_class_id UUID REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS make_model TEXT,
ADD COLUMN IF NOT EXISTS down_payment_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS down_payment_status TEXT CHECK (down_payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS down_payment_method TEXT,
ADD COLUMN IF NOT EXISTS down_payment_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS down_payment_paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0;

-- Create reservation_payments table for detailed payment tracking
CREATE TABLE IF NOT EXISTS reservation_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('down_payment', 'balance', 'refund')),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reservation_payments
ALTER TABLE reservation_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Staff can manage all reservation payments
CREATE POLICY "Staff can manage all reservation payments"
ON reservation_payments
FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_type ON reservations(reservation_type);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(down_payment_status);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_class ON reservations(vehicle_class_id);
CREATE INDEX IF NOT EXISTS idx_reservation_payments_reservation ON reservation_payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_payments_status ON reservation_payments(payment_status);

-- Function: Calculate down payment (30% of total)
CREATE OR REPLACE FUNCTION calculate_down_payment(p_total_amount NUMERIC)
RETURNS NUMERIC 
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN ROUND(p_total_amount * 0.30, 2);
END;
$$;

-- Function: Update reservation payment status based on payments
CREATE OR REPLACE FUNCTION update_reservation_payment_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_paid NUMERIC;
  v_down_payment_required NUMERIC;
BEGIN
  -- Calculate total paid for this reservation
  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM reservation_payments
  WHERE reservation_id = COALESCE(NEW.reservation_id, OLD.reservation_id)
    AND payment_status = 'completed'
    AND payment_type IN ('down_payment', 'balance');
  
  -- Get required down payment
  SELECT down_payment_amount INTO v_down_payment_required
  FROM reservations
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  -- Update reservation status
  UPDATE reservations
  SET 
    down_payment_status = CASE
      WHEN v_total_paid = 0 THEN 'pending'
      WHEN v_total_paid >= v_down_payment_required THEN 'paid'
      ELSE 'partial'
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.reservation_id, OLD.reservation_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger: Update payment status on reservation_payments changes
DROP TRIGGER IF EXISTS trg_update_payment_status ON reservation_payments;
CREATE TRIGGER trg_update_payment_status
AFTER INSERT OR UPDATE OR DELETE ON reservation_payments
FOR EACH ROW
EXECUTE FUNCTION update_reservation_payment_status();

-- Add updated_at trigger for reservation_payments
CREATE OR REPLACE FUNCTION update_reservation_payments_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reservation_payments_updated_at ON reservation_payments;
CREATE TRIGGER trg_reservation_payments_updated_at
BEFORE UPDATE ON reservation_payments
FOR EACH ROW
EXECUTE FUNCTION update_reservation_payments_updated_at();