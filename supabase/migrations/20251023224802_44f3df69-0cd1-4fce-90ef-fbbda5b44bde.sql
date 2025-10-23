-- Phase 1: Add company_name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Phase 2: Update customer profiles with corporate names
UPDATE profiles 
SET company_name = 'Emirates Fleet Solutions LLC'
WHERE id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec';

UPDATE profiles 
SET company_name = 'Dubai Transport Group'
WHERE id = 'cda0ef0b-eb5a-4081-9ee1-f6aec5e8a46c';

UPDATE profiles 
SET company_name = 'Gulf Logistics Services'
WHERE id = '7f6f7ca2-1eb3-4819-ae4c-bfa048e6bac3';