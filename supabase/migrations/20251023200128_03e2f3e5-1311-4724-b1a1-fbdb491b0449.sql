-- Backfill existing inspection to link it with the assignment
UPDATE corporate_leasing_line_assignments
SET 
  inspection_checkout_id = 'e5e7b4b8-8c78-468e-a2d3-5e5caf2fa34d',
  inspection_checkout_completed = true
WHERE id = '70390261-0e8d-40fa-a749-a4a085ee6269';