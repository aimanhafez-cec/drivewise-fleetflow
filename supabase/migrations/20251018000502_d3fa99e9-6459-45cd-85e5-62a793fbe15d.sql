-- Fix schema inconsistency: quote_id should be nullable to allow agreement cost sheets
ALTER TABLE quote_cost_sheets 
ALTER COLUMN quote_id DROP NOT NULL;

-- Copy missing cost sheets from quotes to Master Agreements
INSERT INTO quote_cost_sheets (
  corporate_leasing_agreement_id,
  quote_id,
  version,
  cost_sheet_no,
  financing_rate_percent,
  overhead_percent,
  target_margin_percent,
  residual_value_percent,
  status,
  submitted_by,
  submitted_at,
  approved_by,
  approved_at,
  source_cost_sheet_id,
  created_at,
  updated_at
)
SELECT 
  cla.id as corporate_leasing_agreement_id,
  NULL as quote_id,
  qcs.version,
  REPLACE(qcs.cost_sheet_no, 'Q-', 'A-') as cost_sheet_no,
  qcs.financing_rate_percent,
  qcs.overhead_percent,
  qcs.target_margin_percent,
  qcs.residual_value_percent,
  'approved' as status,
  qcs.submitted_by,
  qcs.submitted_at,
  qcs.approved_by,
  qcs.approved_at,
  qcs.id as source_cost_sheet_id,
  now() as created_at,
  now() as updated_at
FROM corporate_leasing_agreements cla
INNER JOIN quote_cost_sheets qcs ON qcs.quote_id = cla.source_quote_id AND qcs.status = 'approved'
WHERE 
  cla.source_quote_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM quote_cost_sheets existing
    WHERE existing.corporate_leasing_agreement_id = cla.id
  );

-- Copy cost sheet lines with correct column names
INSERT INTO quote_cost_sheet_lines (
  cost_sheet_id,
  line_no,
  vehicle_class_id,
  vehicle_id,
  lease_term_months,
  acquisition_cost_aed,
  residual_value_percent,
  maintenance_per_month_aed,
  insurance_per_month_aed,
  registration_admin_per_month_aed,
  other_costs_per_month_aed,
  total_cost_per_month_aed,
  suggested_rate_per_month_aed,
  quoted_rate_per_month_aed,
  actual_margin_percent,
  created_at,
  updated_at
)
SELECT 
  new_cs.id as cost_sheet_id,
  qcsl.line_no,
  qcsl.vehicle_class_id,
  qcsl.vehicle_id,
  qcsl.lease_term_months,
  qcsl.acquisition_cost_aed,
  qcsl.residual_value_percent,
  qcsl.maintenance_per_month_aed,
  qcsl.insurance_per_month_aed,
  qcsl.registration_admin_per_month_aed,
  qcsl.other_costs_per_month_aed,
  qcsl.total_cost_per_month_aed,
  qcsl.suggested_rate_per_month_aed,
  qcsl.quoted_rate_per_month_aed,
  qcsl.actual_margin_percent,
  now() as created_at,
  now() as updated_at
FROM quote_cost_sheets new_cs
INNER JOIN quote_cost_sheet_lines qcsl ON qcsl.cost_sheet_id = new_cs.source_cost_sheet_id
WHERE 
  new_cs.corporate_leasing_agreement_id IS NOT NULL
  AND new_cs.source_cost_sheet_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM quote_cost_sheet_lines existing
    WHERE existing.cost_sheet_id = new_cs.id
  );