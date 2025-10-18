-- Fix incorrect contract_months values caused by double-rounding bug
-- Recalculate duration using proper date arithmetic

UPDATE corporate_leasing_lines
SET contract_months = (
  EXTRACT(YEAR FROM AGE(lease_end_date, lease_start_date)) * 12 + 
  EXTRACT(MONTH FROM AGE(lease_end_date, lease_start_date))
)
WHERE lease_start_date IS NOT NULL 
  AND lease_end_date IS NOT NULL
  AND contract_months != (
    EXTRACT(YEAR FROM AGE(lease_end_date, lease_start_date)) * 12 + 
    EXTRACT(MONTH FROM AGE(lease_end_date, lease_start_date))
  );