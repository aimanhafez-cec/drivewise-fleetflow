-- Fix corrupted setup fees for agreement CLA-000001
-- Should be 550 AED per line (1,100 total / 2 lines), not 500,050 per line

UPDATE corporate_leasing_lines
SET setup_fee_aed = 550
WHERE agreement_id = '403cd557-5a85-4497-8944-4fad65036c8f';