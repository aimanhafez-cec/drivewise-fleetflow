-- Add constraint to prevent unrealistic setup fees on corporate_leasing_lines
ALTER TABLE corporate_leasing_lines
ADD CONSTRAINT reasonable_setup_fee 
CHECK (setup_fee_aed >= 0 AND setup_fee_aed < 100000);