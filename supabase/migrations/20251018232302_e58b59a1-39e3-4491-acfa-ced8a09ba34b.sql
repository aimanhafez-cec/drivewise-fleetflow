-- Make all identity fields nullable for free-form data entry
ALTER TABLE drivers 
  ALTER COLUMN emirates_id DROP NOT NULL,
  ALTER COLUMN nationality DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Remove unique constraint on emirates_id (allow duplicates or empty)
ALTER TABLE drivers 
  DROP CONSTRAINT IF EXISTS unique_emirates_id;

-- Remove format check constraint if exists
ALTER TABLE drivers 
  DROP CONSTRAINT IF EXISTS emirates_id_format;

-- Update comments
COMMENT ON TABLE drivers IS 'Driver information with optional validation for flexible data entry';
COMMENT ON COLUMN drivers.emirates_id IS 'UAE Emirates ID (optional, format validated only if provided)';
COMMENT ON COLUMN drivers.passport_number IS 'International passport number (optional)';
COMMENT ON COLUMN drivers.nationality IS 'Driver nationality (optional)';
COMMENT ON COLUMN drivers.phone IS 'Contact phone number (optional)';