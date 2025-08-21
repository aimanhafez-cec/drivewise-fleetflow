-- Final data population with correct enum values

-- Add customers
INSERT INTO customers (full_name, email, phone, license_number, customer_type, credit_rating, created_at) 
SELECT 
  (ARRAY['Ahmed Al-Rashid', 'Sarah Johnson', 'Mohammed Hassan', 'Fatima Al-Zahra', 'Ali Hassan', 'Mariam Al-Zaabi', 'Omar Al-Mansouri', 'Aisha Khalil'])[floor(random() * 8 + 1)] || ' ' || i::text,
  'customer' || i::text || '@example.com',
  '+97150' || LPAD(i::text, 7, '0'),
  'DL' || LPAD(i::text, 9, '0'),
  CASE WHEN random() < 0.8 THEN 'B2C'::customer_type ELSE 'B2B'::customer_type END,
  (5 + random() * 5)::integer,
  NOW() - INTERVAL '1 day' * (random() * 300)
FROM generate_series(1, 15) i;

-- Add vehicles
INSERT INTO vehicles (make, model, year, vin, license_plate, status, daily_rate, fuel_level, odometer, location, color, transmission, created_at)
SELECT 
  (ARRAY['Toyota', 'BMW', 'Nissan', 'Mercedes', 'Hyundai', 'Audi', 'Lexus', 'Kia'])[floor(random() * 8 + 1)],
  (ARRAY['Camry', 'X5', 'Altima', 'C-Class', 'Elantra', 'A4', 'ES', 'Optima'])[floor(random() * 8 + 1)],
  2022 + (random() * 3)::integer,
  'VIN' || LPAD(i::text, 14, '0'),
  'DXB-' || chr(65 + (i % 26)) || '-' || LPAD((1000 + i)::text, 5, '0'),
  (ARRAY['available', 'rented', 'maintenance'])[floor(random() * 3 + 1)]::vehicle_status,
  (150 + random() * 300)::numeric(10,2),
  (50 + random() * 50)::integer,
  (random() * 50000)::integer,
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  (ARRAY['White', 'Black', 'Silver', 'Blue', 'Red'])[floor(random() * 5 + 1)],
  'Automatic',
  NOW() - INTERVAL '1 day' * (random() * 200)
FROM generate_series(1, 12) i;

-- Generate reservations
INSERT INTO reservations (customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, return_location, total_amount, status, booking_type, ro_number, created_at)
SELECT 
  (SELECT id FROM customers ORDER BY random() LIMIT 1),
  (SELECT id FROM vehicles ORDER BY random() LIMIT 1),
  NOW() - INTERVAL '1 day' * (random() * 200) + INTERVAL '1 hour' * i,
  NOW() - INTERVAL '1 day' * (random() * 200) + INTERVAL '1 hour' * i + INTERVAL '1 day' * (1 + random() * 7),
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  (200 + random() * 600)::numeric(10,2),
  (ARRAY['confirmed', 'completed', 'cancelled', 'pending'])[floor(random() * 4 + 1)]::reservation_status,
  (ARRAY['STANDARD', 'INSTANT'])[floor(random() * 2 + 1)]::booking_type,
  generate_reservation_no(),
  NOW() - INTERVAL '1 day' * (random() * 200)
FROM generate_series(1, 50) i;

-- Generate agreements
INSERT INTO agreements (reservation_id, customer_id, vehicle_id, agreement_date, total_amount, status, agreement_no, created_at)
SELECT 
  r.id,
  r.customer_id,
  r.vehicle_id,
  r.start_datetime,
  r.total_amount,
  CASE 
    WHEN r.status = 'completed' THEN 'completed'::agreement_status
    WHEN r.status = 'confirmed' THEN 'active'::agreement_status
    ELSE 'pending_return'::agreement_status
  END,
  generate_agreement_no(),
  r.created_at
FROM reservations r 
WHERE r.status IN ('confirmed', 'completed')
LIMIT 30;

-- Add damage records with correct enum values
INSERT INTO damage_records (vehicle_id, damage_type, description, severity, repair_cost, repair_status, recorded_at, created_at)
SELECT 
  (SELECT id FROM vehicles ORDER BY random() LIMIT 1),
  (ARRAY['scratch', 'dent', 'crack', 'missing_part', 'interior_damage', 'other'])[floor(random() * 6 + 1)]::damage_type,
  (ARRAY['Minor scratch on door', 'Dent on bumper', 'Windshield crack', 'Missing hubcap', 'Seat stain', 'Various damages'])[floor(random() * 6 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  (100 + random() * 1500)::numeric(10,2),
  (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 150),
  NOW() - INTERVAL '1 day' * (random() * 150)
FROM generate_series(1, 35) i;

-- Add invoices
INSERT INTO invoices (agreement_id, customer_id, invoice_number, line_items, subtotal, tax_amount, total_amount, due_date, status, created_at)
SELECT 
  a.id,
  a.customer_id,
  'INV-' || LPAD(nextval('invoices_id_seq')::text, 6, '0'),
  '[{"description": "Vehicle Rental", "amount": ' || (a.total_amount * 0.9)::text || '}]'::jsonb,
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
FROM agreements a
LIMIT 25;

-- Add payments
INSERT INTO payments (invoice_id, customer_id, amount, payment_method, payment_type, status, transaction_id, created_at)
SELECT 
  i.id,
  i.customer_id,
  i.total_amount,
  (ARRAY['credit_card', 'debit_card', 'bank_transfer', 'cash'])[floor(random() * 4 + 1)],
  'full_payment',
  CASE 
    WHEN i.status = 'paid' THEN 'completed'::payment_status
    ELSE 'pending'::payment_status
  END,
  'TXN-' || LPAD(nextval('payments_id_seq')::text, 8, '0'),
  i.created_at
FROM invoices i
WHERE i.status = 'paid';

-- Update customer statistics
UPDATE customers SET 
  total_rentals = COALESCE((
    SELECT COUNT(*) 
    FROM reservations r 
    WHERE r.customer_id = customers.id AND r.status = 'completed'
  ), 0),
  total_spent = COALESCE((
    SELECT SUM(r.total_amount)
    FROM reservations r 
    WHERE r.customer_id = customers.id AND r.status = 'completed'
  ), 0);