-- Fix existing agreement CLA-000001 with missing fields
UPDATE corporate_leasing_agreements
SET 
  invoice_contact_person_id = '713eaeef-3e97-48dc-b7f3-6d7a4c9e48ca',
  invoice_format = 'Per Vehicle',
  duration_days = 365,
  agreement_date = '2025-10-16',
  agreement_entry_date = '2025-10-14',
  updated_at = now()
WHERE id = '403cd557-5a85-4497-8944-4fad65036c8f';