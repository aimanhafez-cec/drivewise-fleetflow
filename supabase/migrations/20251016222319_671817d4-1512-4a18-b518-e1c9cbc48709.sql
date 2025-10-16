-- Backfill missing cost_sheet_no values for existing records
-- This updates all cost sheets that were created before the auto-generation trigger was added

UPDATE public.quote_cost_sheets
SET cost_sheet_no = public.generate_cost_sheet_no(quote_id, version)
WHERE cost_sheet_no IS NULL;