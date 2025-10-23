-- Phase 1: Backfill customer_id, driver_id, vehicle_id for traffic fines

-- Update TF-2024-001
UPDATE traffic_fines_corporate
SET 
  customer_id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec',
  driver_id = '5c445ddc-2b22-459d-9b5a-6be8ce9a0eb1',
  vehicle_id = '750e8400-e29b-41d4-a716-446655440002'
WHERE fine_no = 'TF-2024-001';

-- Update TF-2024-002
UPDATE traffic_fines_corporate
SET 
  customer_id = 'cda0ef0b-eb5a-4081-9ee1-f6aec5e8a46c',
  driver_id = '32bf9695-7b1e-44d2-9f3a-c6995a6348ba',
  vehicle_id = 'f5e214d9-ef73-4ab6-9345-6e3812cab5f4'
WHERE fine_no = 'TF-2024-002';

-- Update TF-2024-003
UPDATE traffic_fines_corporate
SET 
  customer_id = '7f6f7ca2-1eb3-4819-ae4c-bfa048e6bac3',
  driver_id = '2b8fb875-62aa-4bdf-9f50-f1764117a1d2',
  vehicle_id = '750e8400-e29b-41d4-a716-446655440006'
WHERE fine_no = 'TF-2024-003';

-- Update TF-2024-004
UPDATE traffic_fines_corporate
SET 
  customer_id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec',
  driver_id = '1bd2f80a-d5ed-4050-b2de-402d657cb39b',
  vehicle_id = '80e9edc8-b7ed-4fc6-9ee6-6521014720f2'
WHERE fine_no = 'TF-2024-004';

-- Update TF-2024-005
UPDATE traffic_fines_corporate
SET 
  customer_id = 'cda0ef0b-eb5a-4081-9ee1-f6aec5e8a46c',
  driver_id = '932df22a-c0b6-4e6a-aa9e-3dd272a7234a',
  vehicle_id = '783114b6-5d80-40ef-89f0-dafc304a47e3'
WHERE fine_no = 'TF-2024-005';

-- Update TF-2024-006
UPDATE traffic_fines_corporate
SET 
  customer_id = '7f6f7ca2-1eb3-4819-ae4c-bfa048e6bac3',
  driver_id = '829dbfa1-53bf-4176-8e41-4f9138294cce',
  vehicle_id = '0dc43a67-c862-4446-8d33-c70fdb738a5b'
WHERE fine_no = 'TF-2024-006';

-- Update TF-2024-007
UPDATE traffic_fines_corporate
SET 
  customer_id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec',
  driver_id = '5c445ddc-2b22-459d-9b5a-6be8ce9a0eb1',
  vehicle_id = 'a538fcb7-4fd8-454c-9fe0-d3c32401ad13'
WHERE fine_no = 'TF-2024-007';

-- Update TF-2024-008
UPDATE traffic_fines_corporate
SET 
  customer_id = 'cda0ef0b-eb5a-4081-9ee1-f6aec5e8a46c',
  driver_id = '32bf9695-7b1e-44d2-9f3a-c6995a6348ba',
  vehicle_id = '3e4c9e9f-aa9c-4c5d-86e1-4e58c7d9e6c8'
WHERE fine_no = 'TF-2024-008';

-- Update TF-2024-009
UPDATE traffic_fines_corporate
SET 
  customer_id = '7f6f7ca2-1eb3-4819-ae4c-bfa048e6bac3',
  driver_id = '2b8fb875-62aa-4bdf-9f50-f1764117a1d2',
  vehicle_id = '3bb53a48-69f2-42e4-a220-783a393fb03b'
WHERE fine_no = 'TF-2024-009';

-- Update TF-2024-010
UPDATE traffic_fines_corporate
SET 
  customer_id = 'e81c69da-e2ee-4b04-a85c-911751dea6ec',
  driver_id = '1bd2f80a-d5ed-4050-b2de-402d657cb39b',
  vehicle_id = '462bf990-a3d8-460d-a53d-9f8ad8d90bf7'
WHERE fine_no = 'TF-2024-010';