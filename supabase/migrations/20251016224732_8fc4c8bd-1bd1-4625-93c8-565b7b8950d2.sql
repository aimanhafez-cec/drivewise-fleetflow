-- Create win_loss_reasons table
CREATE TABLE IF NOT EXISTS public.win_loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('WIN', 'LOSS')),
  reason_code TEXT NOT NULL UNIQUE,
  reason_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.win_loss_reasons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active reasons"
  ON public.win_loss_reasons
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage reasons"
  ON public.win_loss_reasons
  FOR ALL
  USING (true);

-- Seed WIN reasons
INSERT INTO public.win_loss_reasons (category, reason_code, reason_label, sort_order) VALUES
('WIN', 'COMPETITIVE_PRICING', 'Competitive Pricing', 1),
('WIN', 'FLEXIBLE_PAYMENT_TERMS', 'Flexible Payment Terms', 2),
('WIN', 'VALUE_FOR_MONEY', 'Value for Money', 3),
('WIN', 'VOLUME_DISCOUNT', 'Volume Discount Accepted', 4),
('WIN', 'EXISTING_RELATIONSHIP', 'Existing Relationship', 5),
('WIN', 'SUPERIOR_SERVICE', 'Superior Service Level', 6),
('WIN', 'ACCOUNT_MANAGEMENT', 'Dedicated Account Management', 7),
('WIN', 'QUICK_RESPONSE', 'Quick Response Time', 8),
('WIN', 'VEHICLE_AVAILABILITY', 'Vehicle Availability', 9),
('WIN', 'NEWER_FLEET', 'Newer/Better Fleet', 10),
('WIN', 'VEHICLE_VARIETY', 'Vehicle Variety', 11),
('WIN', 'SPECIFIC_VEHICLE', 'Specific Vehicle Required', 12),
('WIN', 'FLEXIBLE_CONTRACT', 'Flexible Contract Terms', 13),
('WIN', 'CUSTOMIZED_SOLUTION', 'Customized Solution', 14),
('WIN', 'INSURANCE_PACKAGE', 'Insurance/Maintenance Package', 15),
('WIN', 'GEOGRAPHIC_COVERAGE', 'Geographic Coverage', 16),
('WIN', 'APPROVED_VENDOR', 'Approved Vendor Status', 17),
('WIN', 'CORPORATE_PARTNERSHIP', 'Corporate Partnership', 18),
('WIN', 'REFERRAL', 'Referral/Recommendation', 19),
('WIN', 'TENDER_WINNER', 'Tender/RFP Winner', 20);

-- Seed LOSS reasons
INSERT INTO public.win_loss_reasons (category, reason_code, reason_label, sort_order) VALUES
('LOSS', 'PRICE_TOO_HIGH', 'Price Too High', 1),
('LOSS', 'BUDGET_CONSTRAINTS', 'Budget Constraints', 2),
('LOSS', 'NO_BUDGET', 'No Budget Approved', 3),
('LOSS', 'PAYMENT_TERMS', 'Payment Terms Unacceptable', 4),
('LOSS', 'HIDDEN_COSTS', 'Hidden Costs Concern', 5),
('LOSS', 'COMPETITOR_PRICE', 'Lost to Competitor - Price', 6),
('LOSS', 'COMPETITOR_SERVICE', 'Lost to Competitor - Service', 7),
('LOSS', 'COMPETITOR_RELATIONSHIP', 'Lost to Competitor - Relationship', 8),
('LOSS', 'COMPETITOR_FLEET', 'Lost to Competitor - Fleet', 9),
('LOSS', 'INCUMBENT_ADVANTAGE', 'Incumbent Advantage', 10),
('LOSS', 'VEHICLE_UNAVAILABLE', 'Vehicle Not Available', 11),
('LOSS', 'DELIVERY_TIMELINE', 'Delivery Timeline Too Long', 12),
('LOSS', 'SEASONAL_UNAVAILABLE', 'Seasonal Unavailability', 13),
('LOSS', 'QUOTE_EXPIRED', 'Quote Expired', 14),
('LOSS', 'PROJECT_CANCELLED', 'Project Cancelled/Postponed', 15),
('LOSS', 'DECIDED_NOT_RENT', 'Decided Not to Rent', 16),
('LOSS', 'REQUIREMENTS_CHANGED', 'Requirements Changed', 17),
('LOSS', 'INTERNAL_DECISION', 'Internal Decision', 18),
('LOSS', 'NO_RESPONSE', 'No Response', 19),
('LOSS', 'CONTRACT_TERMS', 'Contract Terms Unacceptable', 20),
('LOSS', 'INSURANCE_LIABILITY', 'Insurance/Liability Concerns', 21),
('LOSS', 'GEOGRAPHIC_RESTRICTIONS', 'Geographic Restrictions', 22),
('LOSS', 'MAINTENANCE_TERMS', 'Maintenance Terms Unclear', 23),
('LOSS', 'NOT_QUALIFIED', 'Customer Not Qualified', 24),
('LOSS', 'COMPLIANCE_ISSUES', 'Compliance Issues', 25),
('LOSS', 'DOCUMENTATION_INCOMPLETE', 'Documentation Incomplete', 26),
('LOSS', 'NO_REASON_GIVEN', 'No Reason Given', 27),
('LOSS', 'MARKET_CONDITIONS', 'Market Conditions', 28),
('LOSS', 'OTHER', 'Other', 29);

-- Add new columns to quotes table
ALTER TABLE public.quotes 
  ADD COLUMN IF NOT EXISTS win_reason_id UUID REFERENCES public.win_loss_reasons(id),
  ADD COLUMN IF NOT EXISTS loss_reason_id UUID REFERENCES public.win_loss_reasons(id),
  ADD COLUMN IF NOT EXISTS win_loss_notes TEXT;

-- Update trigger for win_loss_reasons
CREATE TRIGGER update_win_loss_reasons_updated_at
  BEFORE UPDATE ON public.win_loss_reasons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate specific quotes
-- Q-2025-4789: "Good Price" -> Competitive Pricing
UPDATE public.quotes 
SET win_reason_id = (SELECT id FROM public.win_loss_reasons WHERE reason_code = 'COMPETITIVE_PRICING'),
    win_loss_notes = win_loss_reason
WHERE quote_number = 'Q-2025-4789';

-- Q-2025-8475: "Prices are High" -> Price Too High
UPDATE public.quotes 
SET loss_reason_id = (SELECT id FROM public.win_loss_reasons WHERE reason_code = 'PRICE_TOO_HIGH'),
    win_loss_notes = customer_rejection_reason
WHERE quote_number = 'Q-2025-8475';