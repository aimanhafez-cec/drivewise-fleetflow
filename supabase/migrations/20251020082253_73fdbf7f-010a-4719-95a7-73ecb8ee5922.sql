-- Add new billing configuration columns to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS billing_day TEXT DEFAULT 'Anniversary',
ADD COLUMN IF NOT EXISTS line_item_granularity TEXT DEFAULT 'base_rent_addons',
ADD COLUMN IF NOT EXISTS billing_start_trigger TEXT DEFAULT 'vehicle_delivery';

-- Add billing_start_trigger to corporate_leasing_agreements table
-- (billing_day and line_item_granularity may already exist based on existing code)
ALTER TABLE corporate_leasing_agreements
ADD COLUMN IF NOT EXISTS billing_day TEXT DEFAULT 'Anniversary',
ADD COLUMN IF NOT EXISTS line_item_granularity TEXT DEFAULT 'base_rent_addons',
ADD COLUMN IF NOT EXISTS billing_start_trigger TEXT DEFAULT 'vehicle_delivery';

-- Add helpful comments for these columns
COMMENT ON COLUMN quotes.billing_day IS 'Reference day for invoice generation: 1st, 15th, EOM, or Anniversary';
COMMENT ON COLUMN quotes.line_item_granularity IS 'Level of detail on invoice: base_rent_addons, one_total, or detailed_category';
COMMENT ON COLUMN quotes.billing_start_trigger IS 'Activation event that starts billing: vehicle_delivery, contract_effective, or custom_date';

COMMENT ON COLUMN corporate_leasing_agreements.billing_day IS 'Reference day for invoice generation: 1st, 15th, EOM, or Anniversary';
COMMENT ON COLUMN corporate_leasing_agreements.line_item_granularity IS 'Level of detail on invoice: base_rent_addons, one_total, or detailed_category';
COMMENT ON COLUMN corporate_leasing_agreements.billing_start_trigger IS 'Activation event that starts billing: vehicle_delivery, contract_effective, or custom_date';