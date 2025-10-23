-- Add contract_no column to toll_transactions_corporate table
ALTER TABLE toll_transactions_corporate 
ADD COLUMN contract_no TEXT;

-- Add index for filtering and searching by contract number
CREATE INDEX idx_toll_transactions_corporate_contract_no 
ON toll_transactions_corporate(contract_no);

-- Add comment
COMMENT ON COLUMN toll_transactions_corporate.contract_no IS 'Contract number as text reference (not a foreign key)';