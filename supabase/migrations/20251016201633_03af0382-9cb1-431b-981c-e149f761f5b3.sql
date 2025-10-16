-- Delete test master agreements that were not created from quote conversions
-- First delete related lines (if foreign key constraint exists)
DELETE FROM corporate_leasing_lines 
WHERE agreement_id IN (
  SELECT id FROM corporate_leasing_agreements WHERE source_quote_id IS NULL
);

-- Then delete the agreements themselves
DELETE FROM corporate_leasing_agreements 
WHERE source_quote_id IS NULL;