-- Phase 1: Add item_code and item_description to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS item_code text UNIQUE,
ADD COLUMN IF NOT EXISTS item_description text;

-- Add comments for clarity
COMMENT ON COLUMN vehicles.item_code IS 'Auto-generated code: {MAKE}-{MODEL}-{YEAR}-{COLOR}-{CAT}';
COMMENT ON COLUMN vehicles.item_description IS 'Human-readable: {Make} {Model} {Year} {Color} - {Category}';

-- Phase 2: Add item master fields to corporate_leasing_lines
ALTER TABLE corporate_leasing_lines
ADD COLUMN IF NOT EXISTS item_code text,
ADD COLUMN IF NOT EXISTS item_description text,
ADD COLUMN IF NOT EXISTS make text,
ADD COLUMN IF NOT EXISTS model text,
ADD COLUMN IF NOT EXISTS model_year integer,
ADD COLUMN IF NOT EXISTS exterior_color text,
ADD COLUMN IF NOT EXISTS category_name text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_corporate_leasing_lines_item_code ON corporate_leasing_lines(item_code);

-- Add comments
COMMENT ON COLUMN corporate_leasing_lines.item_code IS 'Reference to vehicles.item_code';
COMMENT ON COLUMN corporate_leasing_lines.item_description IS 'Full description for display';

-- Phase 3: Create item code generation function
CREATE OR REPLACE FUNCTION generate_vehicle_item_code(
  p_make text,
  p_model text,
  p_year integer,
  p_color text,
  p_category text
) RETURNS text AS $$
DECLARE
  make_abbr text;
  model_abbr text;
  color_abbr text;
  category_abbr text;
  item_code text;
BEGIN
  -- Generate abbreviations (first 3 chars, uppercase, remove spaces)
  make_abbr := UPPER(LEFT(REGEXP_REPLACE(p_make, '[^a-zA-Z0-9]', '', 'g'), 3));
  model_abbr := UPPER(LEFT(REGEXP_REPLACE(p_model, '[^a-zA-Z0-9]', '', 'g'), 3));
  color_abbr := UPPER(LEFT(REGEXP_REPLACE(COALESCE(p_color, 'UNK'), '[^a-zA-Z0-9]', '', 'g'), 3));
  category_abbr := UPPER(LEFT(REGEXP_REPLACE(COALESCE(p_category, 'STD'), '[^a-zA-Z0-9]', '', 'g'), 3));
  
  -- Format: MAKE-MODEL-YEAR-COLOR-CATEGORY
  -- Example: TOY-CAM-2023-WHT-ECO
  item_code := make_abbr || '-' || model_abbr || '-' || p_year::text || '-' || color_abbr || '-' || category_abbr;
  
  RETURN item_code;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Phase 4: Create item description generation function
CREATE OR REPLACE FUNCTION generate_vehicle_item_description(
  p_make text,
  p_model text,
  p_year integer,
  p_color text,
  p_category text
) RETURNS text AS $$
BEGIN
  -- Format: "{Make} {Model} {Year} {Color} - {Category}"
  -- Example: "Toyota Camry 2023 White - Economy"
  RETURN p_make || ' ' || p_model || ' ' || p_year::text || ' ' || 
         COALESCE(p_color, 'Unknown Color') || ' - ' || 
         COALESCE(p_category, 'Standard');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Phase 5: Backfill existing vehicles with item codes
UPDATE vehicles v
SET 
  item_code = generate_vehicle_item_code(
    v.make, 
    v.model, 
    v.year, 
    v.color, 
    COALESCE(c.name, 'Standard')
  ),
  item_description = generate_vehicle_item_description(
    v.make,
    v.model,
    v.year,
    v.color,
    COALESCE(c.name, 'Standard')
  )
FROM categories c
WHERE v.category_id = c.id AND v.item_code IS NULL;

-- Handle vehicles without category
UPDATE vehicles v
SET 
  item_code = generate_vehicle_item_code(v.make, v.model, v.year, v.color, 'Standard'),
  item_description = generate_vehicle_item_description(v.make, v.model, v.year, v.color, 'Standard')
WHERE v.item_code IS NULL;

-- Phase 6: Create trigger for auto-generation on insert/update
CREATE OR REPLACE FUNCTION auto_generate_vehicle_item_code()
RETURNS TRIGGER AS $$
DECLARE
  category_name_val text;
BEGIN
  -- Get category name
  SELECT name INTO category_name_val
  FROM categories
  WHERE id = NEW.category_id;
  
  -- Auto-generate if not provided
  IF NEW.item_code IS NULL THEN
    NEW.item_code := generate_vehicle_item_code(
      NEW.make, 
      NEW.model, 
      NEW.year, 
      NEW.color, 
      COALESCE(category_name_val, 'Standard')
    );
  END IF;
  
  IF NEW.item_description IS NULL THEN
    NEW.item_description := generate_vehicle_item_description(
      NEW.make,
      NEW.model,
      NEW.year,
      NEW.color,
      COALESCE(category_name_val, 'Standard')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_vehicle_item_code ON vehicles;
CREATE TRIGGER trigger_auto_generate_vehicle_item_code
  BEFORE INSERT OR UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_vehicle_item_code();