-- Add new status values to corporate_lease_status enum
ALTER TYPE corporate_lease_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE corporate_lease_status ADD VALUE IF NOT EXISTS 'sent_to_customer';
ALTER TYPE corporate_lease_status ADD VALUE IF NOT EXISTS 'customer_accepted';
ALTER TYPE corporate_lease_status ADD VALUE IF NOT EXISTS 'customer_rejected';

-- Add new columns for approval and customer acceptance workflow
ALTER TABLE corporate_leasing_agreements
ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approval_notes text,
ADD COLUMN IF NOT EXISTS sent_to_customer_at timestamptz,
ADD COLUMN IF NOT EXISTS sent_to_customer_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS public_token text UNIQUE,
ADD COLUMN IF NOT EXISTS public_token_expires_at timestamptz,
ADD COLUMN IF NOT EXISTS customer_acceptance_status text CHECK (customer_acceptance_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS customer_signed_at timestamptz,
ADD COLUMN IF NOT EXISTS customer_signature_data jsonb,
ADD COLUMN IF NOT EXISTS customer_rejection_reason text,
ADD COLUMN IF NOT EXISTS customer_comments text;

-- Add index on public_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_corporate_leasing_agreements_public_token ON corporate_leasing_agreements(public_token);

-- Add helpful comments
COMMENT ON COLUMN corporate_leasing_agreements.status IS 'Master agreement lifecycle status';
COMMENT ON COLUMN corporate_leasing_agreements.customer_acceptance_status IS 'Customer acceptance status after sending to customer';
COMMENT ON COLUMN corporate_leasing_agreements.public_token IS 'Public token for customer review link';
COMMENT ON COLUMN corporate_leasing_agreements.customer_signature_data IS 'Stores customer digital signature and metadata';