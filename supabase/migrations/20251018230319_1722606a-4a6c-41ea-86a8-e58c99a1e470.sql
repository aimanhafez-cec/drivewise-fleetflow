-- Phase 1: Database Schema Updates for Driver Management (Revised)

-- Update existing NULL records with demo defaults BEFORE adding constraints
UPDATE drivers 
SET 
  emirates_id = COALESCE(
    emirates_id, 
    '784-' || LPAD((random() * 9999)::int::text, 4, '0') || '-' || LPAD((random() * 9999999)::int::text, 7, '0') || '-' || (random() * 9)::int::text
  ),
  passport_number = COALESCE(
    passport_number, 
    'P' || LPAD((random() * 999999)::int::text, 6, '0')
  ),
  nationality = COALESCE(nationality, 'United Arab Emirates'),
  phone = COALESCE(
    phone, 
    '+971-50-' || LPAD((random() * 9999)::int::text, 4, '0') || LPAD((random() * 99)::int::text, 2, '0')
  )
WHERE emirates_id IS NULL 
   OR passport_number IS NULL 
   OR nationality IS NULL 
   OR phone IS NULL;

-- Normalize existing phone numbers to UAE format
UPDATE drivers 
SET phone = CASE 
  WHEN phone LIKE '+971%' AND phone NOT LIKE '+971-__-____-__' THEN
    -- Already has +971, just needs formatting
    '+971-' || SUBSTRING(REPLACE(REPLACE(phone, '+971', ''), '-', ''), 1, 2) || '-' || 
    SUBSTRING(REPLACE(REPLACE(phone, '+971', ''), '-', ''), 3, 4) || '-' || 
    SUBSTRING(REPLACE(REPLACE(phone, '+971', ''), '-', ''), 7, 2)
  WHEN phone NOT LIKE '+971%' THEN
    -- Add +971 prefix and format
    '+971-50-' || LPAD(SUBSTRING(REPLACE(phone, '-', ''), 1, 4), 4, '0') || '-' || 
    LPAD(SUBSTRING(REPLACE(phone, '-', ''), 5, 2), 2, '0')
  ELSE phone
END
WHERE phone IS NOT NULL AND phone !~ '^\+971-\d{2}-\d{4}-\d{2}$';

-- Add NOT NULL constraints for mandatory identity fields
ALTER TABLE drivers 
  ALTER COLUMN emirates_id SET NOT NULL,
  ALTER COLUMN passport_number SET NOT NULL,
  ALTER COLUMN nationality SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL;

-- Add unique constraint for Emirates ID to prevent duplicates
ALTER TABLE drivers 
  ADD CONSTRAINT unique_emirates_id UNIQUE (emirates_id);

-- Add CHECK constraint for Emirates ID format (XXX-XXXX-XXXXXXX-X)
ALTER TABLE drivers 
  ADD CONSTRAINT emirates_id_format 
  CHECK (emirates_id ~ '^\d{3}-\d{4}-\d{7}-\d{1}$');

-- Add CHECK constraint for UAE phone format
ALTER TABLE drivers 
  ADD CONSTRAINT phone_format 
  CHECK (phone ~ '^\+971-\d{2}-\d{4}-\d{2}$');

COMMENT ON COLUMN drivers.emirates_id IS 'UAE Emirates ID in format XXX-XXXX-XXXXXXX-X (mandatory)';
COMMENT ON COLUMN drivers.passport_number IS 'International passport number (mandatory)';
COMMENT ON COLUMN drivers.nationality IS 'Driver nationality (mandatory for compliance)';
COMMENT ON COLUMN drivers.phone IS 'UAE mobile number in format +971-XX-XXXX-XX (mandatory)';