-- Phase 2: Create Demo Vehicles for Toll Transactions
-- Using existing profiles and drivers, only creating missing vehicles

-- Insert vehicles matching toll transaction plate numbers
INSERT INTO vehicles (id, license_plate, make, model, year, color, vin, status)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'AD-11111', 'Toyota', 'Camry', 2023, 'White', 'DEMO1VIN111111111', 'rented'),
  ('10000000-0000-0000-0000-000000000002', 'AD-22222', 'Honda', 'Accord', 2023, 'Silver', 'DEMO2VIN222222222', 'rented'),
  ('10000000-0000-0000-0000-000000000003', 'AD-54321', 'Nissan', 'Altima', 2024, 'Black', 'DEMO3VIN333333333', 'rented'),
  ('10000000-0000-0000-0000-000000000004', 'AD-98765', 'Hyundai', 'Sonata', 2023, 'Blue', 'DEMO4VIN444444444', 'rented'),
  ('10000000-0000-0000-0000-000000000005', 'D-12345', 'Toyota', 'Corolla', 2024, 'White', 'DEMO5VIN555555555', 'rented'),
  ('10000000-0000-0000-0000-000000000006', 'D-45678', 'Mazda', 'CX-5', 2023, 'Red', 'DEMO6VIN666666666', 'rented'),
  ('10000000-0000-0000-0000-000000000007', 'D-67890', 'Kia', 'K5', 2024, 'Gray', 'DEMO7VIN777777777', 'rented'),
  ('10000000-0000-0000-0000-000000000008', 'D-99999', 'Honda', 'CR-V', 2023, 'Black', 'DEMO8VIN888888888', 'rented')
ON CONFLICT (id) DO NOTHING;