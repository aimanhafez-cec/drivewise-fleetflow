-- Fix security warnings: Set search_path for new trigger functions

-- Update trigger function for agreement_documents with secure search_path
CREATE OR REPLACE FUNCTION update_agreement_documents_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger function for agreement_payments with secure search_path
CREATE OR REPLACE FUNCTION update_agreement_payments_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;