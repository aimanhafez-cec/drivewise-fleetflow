-- Quick data fix: Populate missing fields in CLA-000001 from source quote
UPDATE corporate_leasing_agreements
SET 
  business_unit_id = '0b7ffbad-31ab-4ed9-b769-b4a9ceced161',
  sales_office_id = 'f2d7d59a-81ae-4d2d-9d5f-2be9778f4863',
  sales_rep_id = '175a33cc-922c-4c3b-b6df-6a2292333200',
  legal_entity_id = '4046abab-6a2b-43b8-b777-cf2c412727a5',
  account_name = 'Arab Engineers Group',
  updated_at = now()
WHERE id = '403cd557-5a85-4497-8944-4fad65036c8f';