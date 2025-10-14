-- Add default_addons column to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS default_addons jsonb DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN quotes.default_addons IS 'Default add-ons applied to all vehicle lines in the quote';