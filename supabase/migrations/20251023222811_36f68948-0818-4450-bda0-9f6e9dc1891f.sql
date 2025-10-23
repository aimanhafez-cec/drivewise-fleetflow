-- Phase 3: Populate Toll Transactions with Static Data (UUID Cast Fixed)

UPDATE toll_transactions_corporate
SET 
  contract_no = CASE 
    WHEN plate_number = 'AD-11111' THEN 'CL-DEMO-2025-001'
    WHEN plate_number = 'AD-22222' THEN 'CL-DEMO-2025-002'
    WHEN plate_number = 'AD-54321' THEN 'CL-DEMO-2025-003'
    WHEN plate_number = 'AD-98765' THEN 'CL-DEMO-2025-004'
    WHEN plate_number = 'D-12345' THEN 'CL-DEMO-2025-005'
    WHEN plate_number = 'D-45678' THEN 'CL-DEMO-2025-006'
    WHEN plate_number = 'D-67890' THEN 'CL-DEMO-2025-007'
    WHEN plate_number = 'D-99999' THEN 'CL-DEMO-2025-008'
    ELSE 'CL-DEMO-2025-001'
  END,
  customer_id = CASE 
    WHEN plate_number IN ('AD-11111', 'D-12345') THEN 'e81c69da-e2ee-4b04-a85c-911751dea6ec'::uuid
    WHEN plate_number IN ('AD-22222', 'D-45678') THEN 'cda0ef0b-eb5a-4081-9ee1-f6aec5e8a46c'::uuid
    WHEN plate_number IN ('AD-54321', 'D-67890') THEN '7f6f7ca2-1eb3-4819-ae4c-bfa048e6bac3'::uuid
    ELSE 'e81c69da-e2ee-4b04-a85c-911751dea6ec'::uuid
  END,
  driver_id = CASE 
    WHEN plate_number IN ('AD-11111', 'D-67890') THEN '5c445ddc-2b22-459d-9b5a-6be8ce9a0eb1'::uuid
    WHEN plate_number IN ('AD-22222', 'AD-98765') THEN '32bf9695-7b1e-44d2-9f3a-c6995a6348ba'::uuid
    WHEN plate_number IN ('AD-54321', 'D-45678') THEN '2b8fb875-62aa-4bdf-9f50-f1764117a1d2'::uuid
    WHEN plate_number IN ('D-12345') THEN '1bd2f80a-d5ed-4050-b2de-402d657cb39b'::uuid
    ELSE '932df22a-c0b6-4e6a-aa9e-3dd272a7234a'::uuid
  END,
  vehicle_id = CASE 
    WHEN plate_number = 'AD-11111' THEN '10000000-0000-0000-0000-000000000001'::uuid
    WHEN plate_number = 'AD-22222' THEN '10000000-0000-0000-0000-000000000002'::uuid
    WHEN plate_number = 'AD-54321' THEN '10000000-0000-0000-0000-000000000003'::uuid
    WHEN plate_number = 'AD-98765' THEN '10000000-0000-0000-0000-000000000004'::uuid
    WHEN plate_number = 'D-12345' THEN '10000000-0000-0000-0000-000000000005'::uuid
    WHEN plate_number = 'D-45678' THEN '10000000-0000-0000-0000-000000000006'::uuid
    WHEN plate_number = 'D-67890' THEN '10000000-0000-0000-0000-000000000007'::uuid
    WHEN plate_number = 'D-99999' THEN '10000000-0000-0000-0000-000000000008'::uuid
    ELSE vehicle_id
  END,
  reconciled = CASE 
    WHEN id IN (
      SELECT id FROM toll_transactions_corporate 
      ORDER BY crossing_date DESC 
      LIMIT 3
    ) THEN NULL
    ELSE true
  END,
  reconciled_at = CASE 
    WHEN id NOT IN (
      SELECT id FROM toll_transactions_corporate 
      ORDER BY crossing_date DESC 
      LIMIT 3
    ) THEN NOW() - INTERVAL '2 days'
    ELSE NULL
  END
WHERE plate_number IN ('AD-11111', 'AD-22222', 'AD-54321', 'AD-98765', 'D-12345', 'D-45678', 'D-67890', 'D-99999');