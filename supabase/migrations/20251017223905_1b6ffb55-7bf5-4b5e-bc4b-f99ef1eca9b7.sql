-- Complete fix for CLA-000001: Add all missing data from Quote Q-2025-4789
UPDATE corporate_leasing_agreements
SET 
  customer_segment = 'Enterprise',
  billing_start_date = '2025-12-01',
  annual_escalation_percentage = 5,
  default_price_list_id = 'standard',
  payment_terms_id = 'immediate',
  pickup_type = 'customer_site',
  pickup_customer_site_id = 'b12a295c-5520-40bb-b3d3-53fb68a3c526',
  return_type = 'customer_site',
  return_customer_site_id = 'b12a295c-5520-40bb-b3d3-53fb68a3c526',
  initial_fees = '[
    {"fee_type": "processing", "amount": 1000, "description": ""},
    {"fee_type": "delivery", "amount": 100, "description": ""}
  ]'::jsonb,
  updated_at = now()
WHERE id = '403cd557-5a85-4497-8944-4fad65036c8f';