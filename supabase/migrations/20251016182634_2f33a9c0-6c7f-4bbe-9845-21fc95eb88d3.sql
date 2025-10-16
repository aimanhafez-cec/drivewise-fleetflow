-- Delete legacy quotes with NULL quote_type
-- These are from the old discontinued quote screen
DELETE FROM quotes 
WHERE quote_type IS NULL;