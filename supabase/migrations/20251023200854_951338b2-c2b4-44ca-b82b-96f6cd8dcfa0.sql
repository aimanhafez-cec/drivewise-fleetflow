-- Phase 3: Reopen the incomplete inspection so it can be properly filled in
UPDATE inspection_master
SET status = 'DRAFT'
WHERE id = 'e5e7b4b8-8c78-468e-a2d3-5e5caf2fa34d';