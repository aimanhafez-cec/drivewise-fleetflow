-- Add maintenance package fields to quotes table
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS maintenance_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_package_type text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS maintenance_coverage_summary text,
ADD COLUMN IF NOT EXISTS monthly_maintenance_cost_per_vehicle numeric DEFAULT 250,
ADD COLUMN IF NOT EXISTS maintenance_plan_source text DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS show_maintenance_separate_line boolean DEFAULT true;

COMMENT ON COLUMN public.quotes.maintenance_included IS 'Whether maintenance package is included in the quote';
COMMENT ON COLUMN public.quotes.maintenance_package_type IS 'Type of maintenance package: none, basic, full, comprehensive';
COMMENT ON COLUMN public.quotes.maintenance_coverage_summary IS 'Auto-generated summary of what the maintenance package covers';
COMMENT ON COLUMN public.quotes.monthly_maintenance_cost_per_vehicle IS 'Default monthly maintenance cost per vehicle in AED';
COMMENT ON COLUMN public.quotes.maintenance_plan_source IS 'Source of maintenance: internal or third_party';
COMMENT ON COLUMN public.quotes.show_maintenance_separate_line IS 'Whether to show maintenance as separate line item in quote or bundle with base rate';