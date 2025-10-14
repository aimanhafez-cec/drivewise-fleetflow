-- Remove unique constraint on quote_id to allow multiple cost sheets per quote
ALTER TABLE quote_cost_sheets DROP CONSTRAINT IF EXISTS quote_cost_sheets_quote_id_key;

-- Add version column (defaults to 1 for existing records)
ALTER TABLE quote_cost_sheets ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Add cost_sheet_no column for display purposes
ALTER TABLE quote_cost_sheets ADD COLUMN IF NOT EXISTS cost_sheet_no TEXT;

-- Add unique constraint on (quote_id, version) combination
ALTER TABLE quote_cost_sheets ADD CONSTRAINT quote_cost_sheets_quote_id_version_key UNIQUE (quote_id, version);

-- Add index for performance when querying cost sheets by quote
CREATE INDEX IF NOT EXISTS idx_quote_cost_sheets_quote_version ON quote_cost_sheets (quote_id, version DESC);

-- Function to generate cost sheet number
CREATE OR REPLACE FUNCTION generate_cost_sheet_no(p_quote_id UUID, p_version INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_quote_number TEXT;
  v_cost_sheet_no TEXT;
BEGIN
  -- Get the quote number
  SELECT quote_number INTO v_quote_number
  FROM public.quotes
  WHERE id = p_quote_id;
  
  -- Generate cost sheet number: {quote_number}-CS-V{version}
  v_cost_sheet_no := v_quote_number || '-CS-V' || p_version::TEXT;
  
  RETURN v_cost_sheet_no;
END;
$$;

-- Trigger function to auto-generate cost_sheet_no on insert
CREATE OR REPLACE FUNCTION set_cost_sheet_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only set if cost_sheet_no is NULL
  IF NEW.cost_sheet_no IS NULL THEN
    NEW.cost_sheet_no := generate_cost_sheet_no(NEW.quote_id, NEW.version);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically set cost_sheet_no
DROP TRIGGER IF EXISTS trigger_set_cost_sheet_no ON quote_cost_sheets;
CREATE TRIGGER trigger_set_cost_sheet_no
  BEFORE INSERT ON quote_cost_sheets
  FOR EACH ROW
  EXECUTE FUNCTION set_cost_sheet_no();