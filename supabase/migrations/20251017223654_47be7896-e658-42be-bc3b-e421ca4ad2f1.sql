-- Add missing agreement_type to CLA-000001
UPDATE corporate_leasing_agreements
SET 
  agreement_type = 'Corporate lease',
  updated_at = now()
WHERE id = '403cd557-5a85-4497-8944-4fad65036c8f';