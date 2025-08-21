-- Comprehensive data population for realistic reports (v3 - simplified approach)
-- This migration adds extensive sample data across all tables

-- Add more customers for diverse scenarios
INSERT INTO customers (full_name, email, phone, license_number, customer_type, total_rentals, total_spent, credit_rating, approval_required, created_at) VALUES
('Ahmed Al-Rashid', 'ahmed.rashid.2024@email.com', '+971501234567', 'DL001234567', 'B2C', 15, 12500.00, 8, false, NOW() - INTERVAL '8 months'),
('Sarah Johnson', 'sarah.johnson.2024@corporate.com', '+971509876543', 'DL002345678', 'B2B', 25, 35000.00, 9, false, NOW() - INTERVAL '6 months'),
('Mohammed Hassan', 'mohammed.hassan.2024@gmail.com', '+971507654321', 'DL003456789', 'B2C', 8, 6800.00, 7, true, NOW() - INTERVAL '4 months'),
('Emirates Airlines Corp', 'fleet.2024@emirates.com', '+971504321987', 'CORP001234', 'B2B', 120, 185000.00, 10, false, NOW() - INTERVAL '12 months'),
('Fatima Al-Zahra', 'fatima.zahra.2024@outlook.com', '+971502468135', 'DL004567890', 'B2C', 22, 18900.00, 8, false, NOW() - INTERVAL '10 months'),
('Ali Hassan', 'ali.hassan.2024@gmail.com', '+971503456789', 'DL005678901', 'B2C', 12, 9800.00, 7, false, NOW() - INTERVAL '7 months'),
('Mariam Al-Zaabi', 'mariam.alzaabi.2024@outlook.com', '+971506789123', 'DL006789012', 'B2C', 18, 15600.00, 9, false, NOW() - INTERVAL '5 months'),
('Dubai Tourism LLC', 'bookings.2024@dubaittourism.com', '+971504567891', 'CORP002345', 'B2B', 85, 125000.00, 9, false, NOW() - INTERVAL '11 months'),
('Omar Al-Mansouri', 'omar.mansouri.2024@yahoo.com', '+971507890234', 'DL007890123', 'B2C', 6, 4200.00, 6, true, NOW() - INTERVAL '3 months'),
('Aisha Khalil', 'aisha.khalil.2024@gmail.com', '+971508901345', 'DL008901234', 'B2C', 20, 17500.00, 8, false, NOW() - INTERVAL '9 months');

-- Add more vehicles for variety
INSERT INTO vehicles (make, model, year, vin, license_plate, category_id, status, daily_rate, weekly_rate, monthly_rate, fuel_level, odometer, location, color, transmission, created_at) VALUES
('Toyota', 'Camry', 2023, 'JT2BF28K0X1234567', 'DXB-A-99991', (SELECT id FROM categories LIMIT 1), 'available', 180.00, 1200.00, 4500.00, 85, 15420, 'DXB-001', 'White', 'Automatic', NOW() - INTERVAL '6 months'),
('BMW', 'X5', 2024, 'WBAFR9C50ED654321', 'DXB-B-99992', (SELECT id FROM categories LIMIT 1), 'rented', 450.00, 3000.00, 11500.00, 70, 8930, 'DXB-002', 'Black', 'Automatic', NOW() - INTERVAL '4 months'),
('Nissan', 'Altima', 2023, 'JN1BV7AR5MM987654', 'SHJ-C-99993', (SELECT id FROM categories LIMIT 1), 'maintenance', 165.00, 1100.00, 4200.00, 45, 22180, 'SHJ-001', 'Silver', 'CVT', NOW() - INTERVAL '8 months'),
('Mercedes', 'C-Class', 2024, 'WDDGF4HB5ER456789', 'AUH-D-99994', (SELECT id FROM categories LIMIT 1), 'available', 380.00, 2550.00, 9800.00, 90, 12050, 'AUH-001', 'Blue', 'Automatic', NOW() - INTERVAL '3 months'),
('Hyundai', 'Elantra', 2022, 'KMHL14JA5MA789123', 'DXB-E-99995', (SELECT id FROM categories LIMIT 1), 'available', 145.00, 980.00, 3750.00, 95, 28760, 'DXB-003', 'Red', 'Automatic', NOW() - INTERVAL '12 months'),
('Audi', 'A4', 2024, 'WAUENAF40PA321654', 'DXB-F-99996', (SELECT id FROM categories LIMIT 1), 'available', 320.00, 2150.00, 8200.00, 80, 9500, 'DXB-001', 'Gray', 'Automatic', NOW() - INTERVAL '2 months'),
('Lexus', 'ES', 2023, 'JTHCA1D29N4987321', 'AUH-G-99997', (SELECT id FROM categories LIMIT 1), 'rented', 280.00, 1890.00, 7250.00, 75, 18200, 'AUH-001', 'Pearl White', 'Automatic', NOW() - INTERVAL '5 months'),
('Kia', 'Optima', 2023, 'KNAGN4A77N5654987', 'SHJ-H-99998', (SELECT id FROM categories LIMIT 1), 'available', 155.00, 1050.00, 4000.00, 90, 12800, 'SHJ-001', 'Blue', 'Automatic', NOW() - INTERVAL '7 months'),
('Volkswagen', 'Passat', 2024, 'WVWZZZ3CZPE789456', 'DXB-I-99999', (SELECT id FROM categories LIMIT 1), 'maintenance', 200.00, 1350.00, 5200.00, 60, 6700, 'DXB-002', 'Black', 'Automatic', NOW() - INTERVAL '1 month'),
('Mazda', 'CX-5', 2023, 'JM3KFBCM5N0456123', 'AUH-J-88888', (SELECT id FROM categories LIMIT 1), 'available', 220.00, 1480.00, 5700.00, 95, 14300, 'AUH-002', 'Red', 'Automatic', NOW() - INTERVAL '9 months'),
('Ford', 'Fusion', 2023, 'JF1VA1A60M9123789', 'DXB-K-77777', (SELECT id FROM categories LIMIT 1), 'available', 170.00, 1150.00, 4400.00, 88, 19500, 'DXB-003', 'Silver', 'Automatic', NOW() - INTERVAL '8 months'),
('Chevrolet', 'Malibu', 2024, '1G1ZD5ST8LF456123', 'SHJ-L-66666', (SELECT id FROM categories LIMIT 1), 'rented', 160.00, 1080.00, 4100.00, 75, 11200, 'SHJ-001', 'White', 'Automatic', NOW() - INTERVAL '3 months');

-- Generate comprehensive reservations data
WITH RECURSIVE date_series AS (
  SELECT NOW() - INTERVAL '12 months' AS reservation_date
  UNION ALL
  SELECT reservation_date + INTERVAL '2 days'
  FROM date_series
  WHERE reservation_date < NOW() + INTERVAL '1 month'
),
reservation_base AS (
  SELECT 
    row_number() OVER() as rn,
    reservation_date,
    (SELECT id FROM customers ORDER BY random() LIMIT 1) as customer_id,
    (SELECT id FROM vehicles ORDER BY random() LIMIT 1) as vehicle_id
  FROM date_series
  WHERE random() < 0.35 -- 35% chance of reservation
)
INSERT INTO reservations (customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, return_location, total_amount, status, booking_type, add_ons, ro_number, created_at)
SELECT 
  customer_id,
  vehicle_id,
  reservation_date,
  reservation_date + INTERVAL '1 day' * (1 + random() * 10),
  (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
  (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
  (180 + random() * 1000)::numeric(10,2),
  (ARRAY['confirmed', 'completed', 'cancelled', 'pending'])[floor(random() * 4 + 1)]::reservation_status,
  (ARRAY['STANDARD', 'INSTANT'])[floor(random() * 2 + 1)]::booking_type,
  CASE 
    WHEN random() < 0.6 THEN '[{"type": "GPS", "price": 25}, {"type": "Child Seat", "price": 15}]'::jsonb
    ELSE '[{"type": "Insurance", "price": 45}, {"type": "GPS", "price": 25}, {"type": "Extra Driver", "price": 30}]'::jsonb
  END,
  'RES-' || LPAD(rn::text, 6, '0'),
  reservation_date - INTERVAL '1 day' * (random() * 5)
FROM reservation_base
LIMIT 180;

-- Generate agreements from reservations
INSERT INTO agreements (reservation_id, customer_id, vehicle_id, agreement_date, checkout_datetime, return_datetime, total_amount, status, agreement_no, created_at)
SELECT 
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
ORDER BY r.created_at
LIMIT 120;

-- Generate agreement lines
INSERT INTO agreement_lines (agreement_id, vehicle_id, line_net, line_total, out_location_id, in_location_id, created_at)
SELECT 
  a.id,
  a.vehicle_id,
  a.total_amount * 0.9,
  a.total_amount,
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  (ARRAY['DXB-001', 'DXB-002', 'SHJ-001', 'AUH-001'])[floor(random() * 4 + 1)],
  a.created_at
FROM agreements a;

-- Generate comprehensive damage records
INSERT INTO damage_records (vehicle_id, agreement_id, damage_type, description, severity, repair_cost, repair_status, recorded_at, created_at, photos)
SELECT 
  (SELECT id FROM vehicles ORDER BY random() LIMIT 1),
  CASE WHEN random() < 0.8 THEN (SELECT id FROM agreements ORDER BY random() LIMIT 1) ELSE NULL END,
  (ARRAY['scratch', 'dent', 'mechanical', 'glass'])[floor(random() * 4 + 1)]::damage_type,
  (ARRAY['Minor scratch on door panel', 'Dent on rear bumper', 'Engine oil leak', 'Windshield crack', 'Tire puncture', 'Interior stain', 'Mirror damage', 'Brake pad replacement', 'Air conditioning issue', 'Battery replacement', 'Paint touch-up required', 'Seat tear repair', 'Headlight replacement', 'Transmission service', 'Clutch repair'])[floor(random() * 15 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  CASE 
    WHEN random() < 0.3 THEN (50 + random() * 300)::numeric(10,2)   -- Minor: 50-350 AED
    WHEN random() < 0.7 THEN (350 + random() * 1150)::numeric(10,2) -- Moderate: 350-1500 AED  
    ELSE (1500 + random() * 3500)::numeric(10,2)                     -- Major: 1500-5000 AED
  END,
  (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 365),
  NOW() - INTERVAL '1 day' * (random() * 365),
  ARRAY['damage_photo_1.jpg', 'damage_photo_2.jpg']
FROM generate_series(1, 95);

-- Generate invoices for agreements
INSERT INTO invoices (agreement_id, customer_id, invoice_number, line_items, subtotal, tax_amount, total_amount, due_date, status, created_at)
SELECT 
  a.id,
  a.customer_id,
  'INV-' || LPAD((row_number() over())::text, 6, '0'),
  jsonb_build_array(
    jsonb_build_object('description', 'Vehicle Rental', 'amount', (a.total_amount * 0.85)::numeric(10,2)),
    jsonb_build_object('description', 'Insurance Coverage', 'amount', (a.total_amount * 0.1)::numeric(10,2)),
    jsonb_build_object('description', 'Additional Services', 'amount', (a.total_amount * 0.05)::numeric(10,2))
  ),
  a.total_amount * 0.95,
  a.total_amount * 0.05,
  a.total_amount,
  a.created_at + INTERVAL '30 days',
  CASE 
    WHEN random() < 0.65 THEN 'paid'
    WHEN random() < 0.85 THEN 'pending'
    ELSE 'overdue'
  END,
  a.created_at
FROM agreements a;

-- Generate realistic payment records
INSERT INTO payments (invoice_id, customer_id, amount, payment_method, payment_type, status, transaction_id, processed_at, created_at)
SELECT 
  i.id,
  i.customer_id,
  CASE 
    WHEN i.status = 'paid' THEN i.total_amount
    WHEN i.status = 'pending' AND random() < 0.6 THEN i.total_amount * (0.4 + random() * 0.4)
    WHEN i.status = 'overdue' AND random() < 0.3 THEN i.total_amount * (0.2 + random() * 0.5)
    ELSE 0
  END,
  (ARRAY['credit_card', 'debit_card', 'bank_transfer', 'cash', 'online_payment'])[floor(random() * 5 + 1)],
  CASE 
    WHEN i.status = 'paid' THEN (ARRAY['full_payment', 'deposit'])[floor(random() * 2 + 1)]
    ELSE 'partial_payment'
  END,
  CASE 
    WHEN i.status = 'paid' THEN 'completed'::payment_status
    WHEN i.status = 'pending' THEN (ARRAY['pending', 'completed'])[floor(random() * 2 + 1)]::payment_status
    ELSE (ARRAY['pending', 'failed'])[floor(random() * 2 + 1)]::payment_status
  END,
  'TXN-' || LPAD((row_number() over())::text, 8, '0'),
  CASE 
    WHEN i.status = 'paid' THEN i.created_at + INTERVAL '1 day' * (random() * 25)
    WHEN i.status = 'pending' AND random() < 0.5 THEN i.created_at + INTERVAL '1 day' * (random() * 15)
    ELSE NULL 
  END,
  i.created_at + INTERVAL '1 hour' * (random() * 48)
FROM invoices i
WHERE i.total_amount > 0;

-- Generate damage markers for visual damage tracking
INSERT INTO damage_markers (line_id, x, y, damage_type, severity, side, event, notes, occurred_at, created_at)
SELECT 
  (SELECT id FROM agreement_lines ORDER BY random() LIMIT 1),
  random() * 100,
  random() * 100,
  (ARRAY['scratch', 'dent', 'crack', 'stain', 'burn', 'tear'])[floor(random() * 6 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  (ARRAY['front', 'rear', 'left', 'right', 'top', 'interior'])[floor(random() * 6 + 1)],
  (ARRAY['checkout', 'return', 'inspection', 'maintenance'])[floor(random() * 4 + 1)],
  'Damage documented during vehicle inspection',
  NOW() - INTERVAL '1 day' * (random() * 180),
  NOW() - INTERVAL '1 day' * (random() * 180)
FROM generate_series(1, 70);

-- Add traffic tickets for realistic scenarios
INSERT INTO traffic_tickets (customer_id, vehicle_id, agreement_id, violation_type, ticket_date, fine_amount, status, created_at)
SELECT 
  (SELECT customer_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT vehicle_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT id FROM agreements ORDER BY random() LIMIT 1),
  (ARRAY['speeding', 'parking', 'red_light', 'improper_lane', 'mobile_phone', 'seat_belt'])[floor(random() * 6 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 120),
  (100 + random() * 500)::numeric(10,2),
  (ARRAY['pending', 'paid', 'disputed', 'dismissed'])[floor(random() * 4 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 120)
FROM generate_series(1, 45);

-- Update customer statistics based on actual reservation data
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