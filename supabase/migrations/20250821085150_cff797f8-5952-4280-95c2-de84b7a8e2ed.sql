-- Comprehensive data population with correct enum values
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
('Mazda', 'CX-5', 2023, 'JM3KFBCM5N0456123', 'AUH-J-88888', (SELECT id FROM categories LIMIT 1), 'available', 220.00, 1480.00, 5700.00, 95, 14300, 'AUH-002', 'Red', 'Automatic', NOW() - INTERVAL '9 months');

-- Generate realistic reservations over 12 months
DO $$
DECLARE
  reservation_count INTEGER := 0;
  start_date TIMESTAMP;
  end_date TIMESTAMP;
  customer_id UUID;
  vehicle_id UUID;
  amount NUMERIC;
  status_val reservation_status;
  booking_val booking_type;
BEGIN
  -- Create 150 reservations spread over the year
  FOR i IN 1..150 LOOP
    start_date := NOW() - INTERVAL '12 months' + INTERVAL '1 day' * (random() * 365);
    end_date := start_date + INTERVAL '1 day' * (1 + random() * 10);
    
    SELECT id INTO customer_id FROM customers ORDER BY random() LIMIT 1;
    SELECT id INTO vehicle_id FROM vehicles ORDER BY random() LIMIT 1;
    
    amount := (180 + random() * 800)::numeric(10,2);
    status_val := (ARRAY['confirmed', 'completed', 'cancelled', 'pending']::reservation_status[])[floor(random() * 4 + 1)];
    booking_val := (ARRAY['STANDARD', 'INSTANT']::booking_type[])[floor(random() * 2 + 1)];
    
    INSERT INTO reservations (customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, return_location, total_amount, status, booking_type, add_ons, ro_number, created_at)
    VALUES (
      customer_id,
      vehicle_id,
      start_date,
      end_date,
      (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
      (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
      amount,
      status_val,
      booking_val,
      '[{"type": "GPS", "price": 25}, {"type": "Child Seat", "price": 15}]'::jsonb,
      'RES-' || LPAD(i::text, 6, '0'),
      start_date - INTERVAL '1 day'
    );
  END LOOP;
END $$;

-- Generate agreements from reservations using correct enum values
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
    WHEN r.status = 'completed' THEN 'completed'::agreement_status
    WHEN r.status = 'confirmed' AND r.start_datetime < NOW() THEN 'active'::agreement_status
    ELSE 'pending_return'::agreement_status
  END,
  'AGR-' || LPAD((row_number() over())::text, 6, '0'),
  r.created_at
FROM reservations r 
WHERE r.status IN ('confirmed', 'completed')
ORDER BY r.created_at
LIMIT 100;

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

-- Generate damage records
INSERT INTO damage_records (vehicle_id, agreement_id, damage_type, description, severity, repair_cost, repair_status, recorded_at, created_at, photos)
SELECT 
  (SELECT id FROM vehicles ORDER BY random() LIMIT 1),
  CASE WHEN random() < 0.8 THEN (SELECT id FROM agreements ORDER BY random() LIMIT 1) ELSE NULL END,
  (ARRAY['scratch', 'dent', 'mechanical', 'glass'])[floor(random() * 4 + 1)]::damage_type,
  (ARRAY['Minor scratch on door', 'Dent on bumper', 'Engine issue', 'Windshield crack', 'Tire damage', 'Interior stain', 'Mirror damage', 'Brake service', 'AC repair', 'Battery replacement'])[floor(random() * 10 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  (50 + random() * 2000)::numeric(10,2),
  (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 300),
  NOW() - INTERVAL '1 day' * (random() * 300),
  ARRAY['photo1.jpg', 'photo2.jpg']
FROM generate_series(1, 80);

-- Generate invoices
INSERT INTO invoices (agreement_id, customer_id, invoice_number, line_items, subtotal, tax_amount, total_amount, due_date, status, created_at)
SELECT 
  a.id,
  a.customer_id,
  'INV-' || LPAD((row_number() over())::text, 6, '0'),
  jsonb_build_array(
    jsonb_build_object('description', 'Vehicle Rental', 'amount', (a.total_amount * 0.85)::numeric(10,2)),
    jsonb_build_object('description', 'Insurance', 'amount', (a.total_amount * 0.15)::numeric(10,2))
  ),
  a.total_amount * 0.95,
  a.total_amount * 0.05,
  a.total_amount,
  a.created_at + INTERVAL '30 days',
  CASE 
    WHEN random() < 0.7 THEN 'paid'
    WHEN random() < 0.9 THEN 'pending'
    ELSE 'overdue'
  END,
  a.created_at
FROM agreements a;

-- Generate payments
INSERT INTO payments (invoice_id, customer_id, amount, payment_method, payment_type, status, transaction_id, processed_at, created_at)
SELECT 
  i.id,
  i.customer_id,
  CASE 
    WHEN i.status = 'paid' THEN i.total_amount
    WHEN i.status = 'pending' AND random() < 0.5 THEN i.total_amount * 0.6
    ELSE 0
  END,
  (ARRAY['credit_card', 'debit_card', 'bank_transfer', 'cash'])[floor(random() * 4 + 1)],
  'full_payment',
  CASE 
    WHEN i.status = 'paid' THEN 'completed'::payment_status
    ELSE 'pending'::payment_status
  END,
  'TXN-' || LPAD((row_number() over())::text, 8, '0'),
  CASE WHEN i.status = 'paid' THEN i.created_at + INTERVAL '5 days' ELSE NULL END,
  i.created_at
FROM invoices i
WHERE i.total_amount > 0;

-- Generate damage markers
INSERT INTO damage_markers (line_id, x, y, damage_type, severity, side, event, notes, occurred_at, created_at)
SELECT 
  (SELECT id FROM agreement_lines ORDER BY random() LIMIT 1),
  random() * 100,
  random() * 100,
  (ARRAY['scratch', 'dent', 'crack', 'stain'])[floor(random() * 4 + 1)],
  (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
  (ARRAY['front', 'rear', 'left', 'right'])[floor(random() * 4 + 1)],
  'inspection',
  'Damage noted during inspection',
  NOW() - INTERVAL '1 day' * (random() * 120),
  NOW() - INTERVAL '1 day' * (random() * 120)
FROM generate_series(1, 50);

-- Generate traffic tickets
INSERT INTO traffic_tickets (customer_id, vehicle_id, agreement_id, violation_type, ticket_date, fine_amount, status, created_at)
SELECT 
  (SELECT customer_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT vehicle_id FROM agreements ORDER BY random() LIMIT 1),
  (SELECT id FROM agreements ORDER BY random() LIMIT 1),
  (ARRAY['speeding', 'parking', 'red_light', 'improper_lane'])[floor(random() * 4 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 90),
  (100 + random() * 400)::numeric(10,2),
  (ARRAY['pending', 'paid', 'disputed'])[floor(random() * 3 + 1)],
  NOW() - INTERVAL '1 day' * (random() * 90)
FROM generate_series(1, 30);

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