-- Add 'signed' as a valid value for customer_acceptance_status
ALTER TABLE corporate_leasing_agreements 
DROP CONSTRAINT IF EXISTS corporate_leasing_agreements_customer_acceptance_status_check;

ALTER TABLE corporate_leasing_agreements 
ADD CONSTRAINT corporate_leasing_agreements_customer_acceptance_status_check 
CHECK (customer_acceptance_status IN ('pending', 'accepted', 'rejected', 'signed'));