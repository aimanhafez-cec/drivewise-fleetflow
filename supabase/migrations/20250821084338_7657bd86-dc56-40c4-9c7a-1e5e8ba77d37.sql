-- Comprehensive data population for realistic reports
-- This migration adds extensive sample data across all tables

-- First, let's add more customers for diverse scenarios
INSERT INTO customers (id, full_name, email, phone, license_number, customer_type, total_rentals, total_spent, credit_rating, approval_required, created_at) VALUES
('123e4567-e89b-12d3-a456-426614174001', 'Ahmed Al-Rashid', 'ahmed.rashid@email.com', '+971501234567', 'DL001234567', 'B2C', 15, 12500.00, 8, false, NOW() - INTERVAL '8 months'),
('123e4567-e89b-12d3-a456-426614174002', 'Sarah Johnson', 'sarah.johnson@corporate.com', '+971509876543', 'DL002345678', 'B2B', 25, 35000.00, 9, false, NOW() - INTERVAL '6 months'),
('123e4567-e89b-12d3-a456-426614174003', 'Mohammed Hassan', 'mohammed.hassan@gmail.com', '+971507654321', 'DL003456789', 'B2C', 8, 6800.00, 7, true, NOW() - INTERVAL '4 months'),
('123e4567-e89b-12d3-a456-426614174004', 'Emirates Airlines Corp', 'fleet@emirates.com', '+971504321987', 'CORP001234', 'B2B', 120, 185000.00, 10, false, NOW() - INTERVAL '12 months'),
('123e4567-e89b-12d3-a456-426614174005', 'Fatima Al-Zahra', 'fatima.zahra@outlook.com', '+971502468135', 'DL004567890', 'B2C', 22, 18900.00, 8, false, NOW() - INTERVAL '10 months');

-- Add more vehicles for variety
INSERT INTO vehicles (id, make, model, year, vin, license_plate, category_id, status, daily_rate, weekly_rate, monthly_rate, fuel_level, odometer, location, color, transmission, created_at) VALUES
('456e7890-e89b-12d3-a456-426614174001', 'Toyota', 'Camry', 2023, 'JT2BF28K0X0123456', 'DXB-A-12345', (SELECT id FROM categories LIMIT 1), 'available', 180.00, 1200.00, 4500.00, 85, 15420, 'DXB-001', 'White', 'Automatic', NOW() - INTERVAL '6 months'),
('456e7890-e89b-12d3-a456-426614174002', 'BMW', 'X5', 2024, 'WBAFR9C50ED123456', 'DXB-B-67890', (SELECT id FROM categories LIMIT 1), 'rented', 450.00, 3000.00, 11500.00, 70, 8930, 'DXB-002', 'Black', 'Automatic', NOW() - INTERVAL '4 months'),
('456e7890-e89b-12d3-a456-426614174003', 'Nissan', 'Altima', 2023, 'JN1BV7AR5MM123456', 'SHJ-C-11111', (SELECT id FROM categories LIMIT 1), 'maintenance', 165.00, 1100.00, 4200.00, 45, 22180, 'SHJ-001', 'Silver', 'CVT', NOW() - INTERVAL '8 months'),
('456e7890-e89b-12d3-a456-426614174004', 'Mercedes', 'C-Class', 2024, 'WDDGF4HB5ER123456', 'AUH-D-22222', (SELECT id FROM categories LIMIT 1), 'available', 380.00, 2550.00, 9800.00, 90, 12050, 'AUH-001', 'Blue', 'Automatic', NOW() - INTERVAL '3 months'),
('456e7890-e89b-12d3-a456-426614174005', 'Hyundai', 'Elantra', 2022, 'KMHL14JA5MA123456', 'DXB-E-33333', (SELECT id FROM categories LIMIT 1), 'available', 145.00, 980.00, 3750.00, 95, 28760, 'DXB-003', 'Red', 'Automatic', NOW() - INTERVAL '12 months');

-- Generate comprehensive reservations data (200+ records over 12 months)
WITH date_series AS (
  SELECT generate_series(
    NOW() - INTERVAL '12 months',
    NOW() + INTERVAL '2 months',
    INTERVAL '2 days'
  )::timestamp AS reservation_date
),
reservation_data AS (
  SELECT 
    gen_random_uuid() as id,
    (ARRAY['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174005'])[floor(random() * 5 + 1)] as customer_id,
    (ARRAY['456e7890-e89b-12d3-a456-426614174001', '456e7890-e89b-12d3-a456-426614174002', '456e7890-e89b-12d3-a456-426614174003', '456e7890-e89b-12d3-a456-426614174004', '456e7890-e89b-12d3-a456-426614174005'])[floor(random() * 5 + 1)] as vehicle_id,
    reservation_date as start_datetime,
    reservation_date + INTERVAL '1 day' * (1 + random() * 14) as end_datetime,
    (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001'])[floor(random() * 5 + 1)] as pickup_location,
    (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001'])[floor(random() * 5 + 1)] as return_location,
    (150 + random() * 800)::numeric(10,2) as total_amount,
    (ARRAY['confirmed', 'completed', 'cancelled', 'pending'])[floor(random() * 4 + 1)]::reservation_status as status,
    (ARRAY['STANDARD', 'INSTANT'])[floor(random() * 2 + 1)]::booking_type as booking_type,
    reservation_date as created_at,
    '[{"type": "GPS", "price": 25}, {"type": "Child Seat", "price": 15}]'::jsonb as add_ons,
    'RES-' || LPAD((row_number() over())::text, 6, '0') as ro_number
  FROM date_series
  WHERE random() < 0.4 -- 40% chance of reservation on any given day
)
INSERT INTO reservations (id, customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, return_location, total_amount, status, booking_type, add_ons, ro_number, created_at)
SELECT * FROM reservation_data LIMIT 200;

-- Generate agreements from some reservations
INSERT INTO agreements (id, reservation_id, customer_id, vehicle_id, agreement_date, checkout_datetime, return_datetime, total_amount, status, agreement_no, created_at)
SELECT 
  gen_random_uuid(),
  r.id,
  r.customer_id,
  r.vehicle_id,
  r.start_datetime,
  r.start_datetime,
  CASE WHEN r.status = 'completed' THEN r.end_datetime ELSE NULL END,
  r.total_amount,
  CASE 
    WHEN r.status = 'completed' THEN 'returned'::agreement_status
    WHEN r.status = 'confirmed' AND r.start_datetime < NOW() THEN 'active'::agreement_status
    ELSE 'pending_checkout'::agreement_status
  END,
  'AGR-' || LPAD((row_number() over())::text, 6, '0'),
  r.created_at
FROM reservations r 
WHERE r.status IN ('confirmed', 'completed')
LIMIT 100;

-- Generate comprehensive damage records
INSERT INTO damage_records (id, vehicle_id, agreement_id, damage_type, description, severity, repair_cost, repair_status, recorded_at, created_at, photos)
SELECT 
  gen_random_uuid(),
  (ARRAY['456e7890-e89b-12d3-a456-426614174001', '456e7890-e89b-12d3-a456-426614174002', '456e7890-e89b-12d3-a456-426614174003', '456e7890-e89b-12d3-a456-426614174004', '456e7890-e89b-12d3-a456-426614174005'])[floor(random() * 5 + 1)],
  (SELECT id FROM agreements ORDER BY random() LIMIT 1),
  (ARRAY['scratch', 'dent', 'mechanical', 'glass'])[floor(random() * 4 + 1)]::damage_type,
  (ARRAY['Minor scratch on door panel', 'Dent on rear bumper', 'Engine oil leak', 'Windshield crack', 'Tire puncture', 'Interior stain', 'Mirror damage', 'Brake pad replacement needed'])[floor(random() * 8 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  CASE 
    WHEN random() < 0.3 THEN (50 + random() * 200)::numeric(10,2)  -- Minor: 50-250 AED
    WHEN random() < 0.7 THEN (250 + random() * 750)::numeric(10,2) -- Moderate: 250-1000 AED
    ELSE (1000 + random() * 4000)::numeric(10,2) -- Major: 1000-5000 AED
  END,
  (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 365),
  NOW() - INTERVAL '1 day' * (random() * 365),
  ARRAY['photo1.jpg', 'photo2.jpg']
FROM generate_series(1, 75);

-- Generate invoices for agreements
INSERT INTO invoices (id, agreement_id, customer_id, invoice_number, line_items, subtotal, tax_amount, total_amount, due_date, status, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  a.customer_id,
  'INV-' || LPAD((row_number() over())::text, 6, '0'),
  '[{"description": "Vehicle Rental", "amount": ' || (a.total_amount * 0.9)::text || '}, {"description": "Insurance", "amount": ' || (a.total_amount * 0.1)::text || '}]'::jsonb,
  a.total_amount * 0.95,
  a.total_amount * 0.05,
  a.total_amount,
  a.created_at + INTERVAL '30 days',
  CASE 
    WHEN random() < 0.6 THEN 'paid'
    WHEN random() < 0.8 THEN 'pending'
    ELSE 'overdue'
  END,
  a.created_at
FROM agreements a;

-- Generate payment records
INSERT INTO payments (id, invoice_id, customer_id, amount, payment_method, payment_type, status, transaction_id, processed_at, created_at)
SELECT 
  gen_random_uuid(),
  i.id,
  i.customer_id,
  CASE 
    WHEN i.status = 'paid' THEN i.total_amount
    WHEN i.status = 'pending' AND random() < 0.5 THEN i.total_amount * (0.3 + random() * 0.4) -- Partial payments
    ELSE 0
  END,
  (ARRAY['credit_card', 'debit_card', 'bank_transfer', 'cash'])[floor(random() * 4 + 1)],
  (ARRAY['full_payment', 'partial_payment', 'deposit'])[floor(random() * 3 + 1)],
  CASE 
    WHEN i.status = 'paid' THEN 'completed'::payment_status
    WHEN i.status = 'pending' THEN 'pending'::payment_status
    ELSE 'failed'::payment_status
  END,
  'TXN-' || LPAD((row_number() over())::text, 8, '0'),
  CASE WHEN i.status = 'paid' THEN i.created_at + INTERVAL '1 day' * (random() * 45) ELSE NULL END,
  i.created_at
FROM invoices i;

-- Generate damage markers for visual damage tracking
INSERT INTO damage_markers (id, line_id, x, y, damage_type, severity, side, event, notes, occurred_at, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM agreement_lines ORDER BY random() LIMIT 1),
  random() * 100,
  random() * 100,
  (ARRAY['scratch', 'dent', 'crack', 'stain'])[floor(random() * 4 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  (ARRAY['front', 'rear', 'left', 'right', 'top'])[floor(random() * 5 + 1)],
  (ARRAY['checkout', 'return', 'inspection'])[floor(random() * 3 + 1)],
  'Damage noted during inspection',
  NOW() - INTERVAL '1 day' * (random() * 180),
  NOW() - INTERVAL '1 day' * (random() * 180)
FROM generate_series(1, 50);

-- Update customer totals based on actual data
UPDATE customers SET 
  total_rentals = (
    SELECT COUNT(*) 
    FROM reservations r 
    WHERE r.customer_id = customers.id AND r.status = 'completed'
  ),
  total_spent = (
    SELECT COALESCE(SUM(r.total_amount), 0)
    FROM reservations r 
    WHERE r.customer_id = customers.id AND r.status = 'completed'
  );

-- Add some traffic tickets
INSERT INTO traffic_tickets (id, customer_id, vehicle_id, agreement_id, violation_type, ticket_date, fine_amount, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT customer_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT vehicle_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT id FROM agreements ORDER BY random() LIMIT 1),
  (ARRAY['speeding', 'parking', 'red_light', 'improper_lane'])[floor(random() * 4 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 90),
  (100 + random() * 400)::numeric(10,2),
  (ARRAY['pending', 'paid', 'disputed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 90)
FROM generate_series(1, 25);

-- Generate some agreement lines for detailed tracking
INSERT INTO agreement_lines (id, agreement_id, vehicle_id, line_net, line_total, out_location_id, in_location_id, created_at)
SELECT 
  gen_random_uuid(),
  a.id,
  a.vehicle_id,
  a.total_amount * 0.9,
  a.total_amount,
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  a.created_at
FROM agreements a;