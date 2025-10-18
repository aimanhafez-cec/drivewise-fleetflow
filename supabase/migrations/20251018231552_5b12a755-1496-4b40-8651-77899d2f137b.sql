-- Phase 1: Remove NOT NULL constraint from passport_number
-- UAE nationals may not have passports, so passport should be optional

ALTER TABLE drivers 
  ALTER COLUMN passport_number DROP NOT NULL;

-- Update column comments to reflect optional nature
COMMENT ON COLUMN drivers.passport_number IS 'International passport number (optional - not all UAE nationals have passports)';
COMMENT ON COLUMN drivers.emirates_id IS 'UAE Emirates ID in format XXX-XXXX-XXXXXXX-X (mandatory for all drivers)';
COMMENT ON COLUMN drivers.nationality IS 'Nationality (mandatory for all drivers)';
COMMENT ON COLUMN drivers.phone IS 'Contact phone number in UAE format +971-XX-XXXX-XX (mandatory for all drivers)';