-- Comprehensive data population for realistic reports (v2 - with unique constraints)
-- This migration adds extensive sample data across all tables

-- First, let's add more customers for diverse scenarios (using unique emails)
INSERT INTO customers (id, full_name, email, phone, license_number, customer_type, total_rentals, total_spent, credit_rating, approval_required, created_at) VALUES
('123e4567-e89b-12d3-a456-426614174001', 'Ahmed Al-Rashid', 'ahmed.rashid.2024@email.com', '+971501234567', 'DL001234567', 'B2C', 15, 12500.00, 8, false, NOW() - INTERVAL '8 months'),
('123e4567-e89b-12d3-a456-426614174002', 'Sarah Johnson', 'sarah.johnson.2024@corporate.com', '+971509876543', 'DL002345678', 'B2B', 25, 35000.00, 9, false, NOW() - INTERVAL '6 months'),
('123e4567-e89b-12d3-a456-426614174003', 'Mohammed Hassan', 'mohammed.hassan.2024@gmail.com', '+971507654321', 'DL003456789', 'B2C', 8, 6800.00, 7, true, NOW() - INTERVAL '4 months'),
('123e4567-e89b-12d3-a456-426614174004', 'Emirates Airlines Corp', 'fleet.2024@emirates.com', '+971504321987', 'CORP001234', 'B2B', 120, 185000.00, 10, false, NOW() - INTERVAL '12 months'),
('123e4567-e89b-12d3-a456-426614174005', 'Fatima Al-Zahra', 'fatima.zahra.2024@outlook.com', '+971502468135', 'DL004567890', 'B2C', 22, 18900.00, 8, false, NOW() - INTERVAL '10 months')
ON CONFLICT (email) DO NOTHING;

-- Add more vehicles for variety (using unique license plates and VINs)
INSERT INTO vehicles (id, make, model, year, vin, license_plate, category_id, status, daily_rate, weekly_rate, monthly_rate, fuel_level, odometer, location, color, transmission, created_at) VALUES
('456e7890-e89b-12d3-a456-426614174001', 'Toyota', 'Camry', 2023, 'JT2BF28K0X0123456', 'DXB-A-99991', (SELECT id FROM categories LIMIT 1), 'available', 180.00, 1200.00, 4500.00, 85, 15420, 'DXB-001', 'White', 'Automatic', NOW() - INTERVAL '6 months'),
('456e7890-e89b-12d3-a456-426614174002', 'BMW', 'X5', 2024, 'WBAFR9C50ED123456', 'DXB-B-99992', (SELECT id FROM categories LIMIT 1), 'rented', 450.00, 3000.00, 11500.00, 70, 8930, 'DXB-002', 'Black', 'Automatic', NOW() - INTERVAL '4 months'),
('456e7890-e89b-12d3-a456-426614174003', 'Nissan', 'Altima', 2023, 'JN1BV7AR5MM123456', 'SHJ-C-99993', (SELECT id FROM categories LIMIT 1), 'maintenance', 165.00, 1100.00, 4200.00, 45, 22180, 'SHJ-001', 'Silver', 'CVT', NOW() - INTERVAL '8 months'),
('456e7890-e89b-12d3-a456-426614174004', 'Mercedes', 'C-Class', 2024, 'WDDGF4HB5ER123456', 'AUH-D-99994', (SELECT id FROM categories LIMIT 1), 'available', 380.00, 2550.00, 9800.00, 90, 12050, 'AUH-001', 'Blue', 'Automatic', NOW() - INTERVAL '3 months'),
('456e7890-e89b-12d3-a456-426614174005', 'Hyundai', 'Elantra', 2022, 'KMHL14JA5MA123456', 'DXB-E-99995', (SELECT id FROM categories LIMIT 1), 'available', 145.00, 980.00, 3750.00, 95, 28760, 'DXB-003', 'Red', 'Automatic', NOW() - INTERVAL '12 months'),
('456e7890-e89b-12d3-a456-426614174006', 'Audi', 'A4', 2024, 'WAUENAF40PA123456', 'DXB-F-99996', (SELECT id FROM categories LIMIT 1), 'available', 320.00, 2150.00, 8200.00, 80, 9500, 'DXB-001', 'Gray', 'Automatic', NOW() - INTERVAL '2 months'),
('456e7890-e89b-12d3-a456-426614174007', 'Lexus', 'ES', 2023, 'JTHCA1D29N4123456', 'AUH-G-99997', (SELECT id FROM categories LIMIT 1), 'rented', 280.00, 1890.00, 7250.00, 75, 18200, 'AUH-001', 'Pearl White', 'Automatic', NOW() - INTERVAL '5 months'),
('456e7890-e89b-12d3-a456-426614174008', 'Kia', 'Optima', 2023, 'KNAGN4A77N5123456', 'SHJ-H-99998', (SELECT id FROM categories LIMIT 1), 'available', 155.00, 1050.00, 4000.00, 90, 12800, 'SHJ-001', 'Blue', 'Automatic', NOW() - INTERVAL '7 months'),
('456e7890-e89b-12d3-a456-426614174009', 'Volkswagen', 'Passat', 2024, 'WVWZZZ3CZPE123456', 'DXB-I-99999', (SELECT id FROM categories LIMIT 1), 'maintenance', 200.00, 1350.00, 5200.00, 60, 6700, 'DXB-002', 'Black', 'Automatic', NOW() - INTERVAL '1 month'),
('456e7890-e89b-12d3-a456-426614174010', 'Mazda', 'CX-5', 2023, 'JM3KFBCM5N0123456', 'AUH-J-88888', (SELECT id FROM categories LIMIT 1), 'available', 220.00, 1480.00, 5700.00, 95, 14300, 'AUH-002', 'Red', 'Automatic', NOW() - INTERVAL '9 months')
ON CONFLICT (license_plate) DO NOTHING;

-- Generate comprehensive reservations data (using existing + new customers/vehicles)
DO $$
DECLARE
    customer_ids uuid[];
    vehicle_ids uuid[];
BEGIN
    -- Get all customer IDs
    SELECT array_agg(id) INTO customer_ids FROM customers;
    
    -- Get all vehicle IDs  
    SELECT array_agg(id) INTO vehicle_ids FROM vehicles;
    
    -- Generate reservations
    INSERT INTO reservations (id, customer_id, vehicle_id, start_datetime, end_datetime, pickup_location, return_location, total_amount, status, booking_type, add_ons, ro_number, created_at)
    SELECT 
        gen_random_uuid(),
        customer_ids[1 + (random() * (array_length(customer_ids, 1) - 1))::int],
        vehicle_ids[1 + (random() * (array_length(vehicle_ids, 1) - 1))::int],
        NOW() - INTERVAL '1 day' * (random() * 365) + INTERVAL '1 day' * i,
        NOW() - INTERVAL '1 day' * (random() * 365) + INTERVAL '1 day' * (i + 1 + random() * 7),
        (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
        (ARRAY['DXB-001', 'DXB-002', 'DXB-003', 'SHJ-001', 'AUH-001', 'AUH-002'])[floor(random() * 6 + 1)],
        (150 + random() * 1200)::numeric(10,2),
        (ARRAY['confirmed', 'completed', 'cancelled', 'pending'])[floor(random() * 4 + 1)]::reservation_status,
        (ARRAY['STANDARD', 'INSTANT'])[floor(random() * 2 + 1)]::booking_type,
        CASE 
            WHEN random() < 0.7 THEN '[{"type": "GPS", "price": 25}, {"type": "Child Seat", "price": 15}]'::jsonb
            ELSE '[{"type": "Insurance", "price": 45}, {"type": "GPS", "price": 25}, {"type": "Extra Driver", "price": 30}]'::jsonb
        END,
        'RES-' || LPAD(i::text, 6, '0'),
        NOW() - INTERVAL '1 day' * (random() * 365)
    FROM generate_series(1, 150) i;
END $$;

-- Generate agreements from reservations
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
ORDER BY r.created_at
LIMIT 80;

-- Generate agreement lines for detailed tracking
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

-- Generate comprehensive damage records
DO $$
DECLARE
    vehicle_ids uuid[];
    agreement_ids uuid[];
BEGIN
    SELECT array_agg(id) INTO vehicle_ids FROM vehicles;
    SELECT array_agg(id) INTO agreement_ids FROM agreements;
    
    INSERT INTO damage_records (id, vehicle_id, agreement_id, damage_type, description, severity, repair_cost, repair_status, recorded_at, created_at, photos)
    SELECT 
        gen_random_uuid(),
        vehicle_ids[1 + (random() * (array_length(vehicle_ids, 1) - 1))::int],
        CASE WHEN random() < 0.8 THEN agreement_ids[1 + (random() * (array_length(agreement_ids, 1) - 1))::int] ELSE NULL END,
        (ARRAY['scratch', 'dent', 'mechanical', 'glass'])[floor(random() * 4 + 1)]::damage_type,
        (ARRAY['Minor scratch on door panel', 'Dent on rear bumper', 'Engine oil leak', 'Windshield crack', 'Tire puncture', 'Interior stain', 'Mirror damage', 'Brake pad replacement', 'Air conditioning issue', 'Battery replacement', 'Paint touch-up required', 'Seat tear repair'])[floor(random() * 12 + 1)],
        (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
        CASE 
            WHEN random() < 0.4 THEN (50 + random() * 300)::numeric(10,2)   -- Minor: 50-350 AED
            WHEN random() < 0.8 THEN (350 + random() * 1150)::numeric(10,2) -- Moderate: 350-1500 AED  
            ELSE (1500 + random() * 3500)::numeric(10,2)                     -- Major: 1500-5000 AED
        END,
        (ARRAY['pending', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
        NOW() - INTERVAL '1 day' * (random() * 365),
        NOW() - INTERVAL '1 day' * (random() * 365),
        ARRAY['damage_photo_1.jpg', 'damage_photo_2.jpg']
    FROM generate_series(1, 85);
END $$;

-- Generate invoices for agreements
INSERT INTO invoices (id, agreement_id, customer_id, invoice_number, line_items, subtotal, tax_amount, total_amount, due_date, status, created_at)
SELECT 
    gen_random_uuid(),
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
INSERT INTO payments (id, invoice_id, customer_id, amount, payment_method, payment_type, status, transaction_id, processed_at, created_at)
SELECT 
    gen_random_uuid(),
    i.id,
    i.customer_id,
    CASE 
        WHEN i.status = 'paid' THEN i.total_amount
        WHEN i.status = 'pending' AND random() < 0.6 THEN i.total_amount * (0.4 + random() * 0.4) -- Partial payments
        WHEN i.status = 'overdue' AND random() < 0.3 THEN i.total_amount * (0.2 + random() * 0.5) -- Some overdue partial payments
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
DO $$
DECLARE
    line_ids uuid[];
BEGIN
    SELECT array_agg(id) INTO line_ids FROM agreement_lines;
    
    IF array_length(line_ids, 1) > 0 THEN
        INSERT INTO damage_markers (id, line_id, x, y, damage_type, severity, side, event, notes, occurred_at, created_at)
        SELECT 
            gen_random_uuid(),
            line_ids[1 + (random() * (array_length(line_ids, 1) - 1))::int],
            random() * 100,
            random() * 100,
            (ARRAY['scratch', 'dent', 'crack', 'stain', 'burn', 'tear'])[floor(random() * 6 + 1)],
            (ARRAY['minor', 'moderate', 'major'])[floor(random() * 3 + 1)],
            (ARRAY['front', 'rear', 'left', 'right', 'top', 'interior'])[floor(random() * 6 + 1)],
            (ARRAY['checkout', 'return', 'inspection', 'maintenance'])[floor(random() * 4 + 1)],
            'Damage documented during vehicle inspection',
            NOW() - INTERVAL '1 day' * (random() * 180),
            NOW() - INTERVAL '1 day' * (random() * 180)
        FROM generate_series(1, 60);
    END IF;
END $$;

-- Add traffic tickets for realistic scenarios
DO $$
DECLARE
    customer_ids uuid[];
    vehicle_ids uuid[];
    agreement_ids uuid[];
BEGIN
    SELECT array_agg(id) INTO customer_ids FROM customers;
    SELECT array_agg(id) INTO vehicle_ids FROM vehicles;
    SELECT array_agg(id) INTO agreement_ids FROM agreements;
    
    INSERT INTO traffic_tickets (id, customer_id, vehicle_id, agreement_id, violation_type, ticket_date, fine_amount, status, created_at)
    SELECT 
        gen_random_uuid(),
        customer_ids[1 + (random() * (array_length(customer_ids, 1) - 1))::int],
        vehicle_ids[1 + (random() * (array_length(vehicle_ids, 1) - 1))::int],
        agreement_ids[1 + (random() * (array_length(agreement_ids, 1) - 1))::int],
        (ARRAY['speeding', 'parking', 'red_light', 'improper_lane', 'mobile_phone', 'seat_belt'])[floor(random() * 6 + 1)],
        NOW() - INTERVAL '1 day' * (random() * 120),
        (100 + random() * 500)::numeric(10,2),
        (ARRAY['pending', 'paid', 'disputed', 'dismissed'])[floor(random() * 4 + 1)],
        NOW() - INTERVAL '1 day' * (random() * 120)
    FROM generate_series(1, 35);
END $$;

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

-- Final data integrity check and summary
DO $$
BEGIN
    RAISE NOTICE 'Data population completed successfully!';
    RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM customers);
    RAISE NOTICE 'Vehicles: %', (SELECT COUNT(*) FROM vehicles);
    RAISE NOTICE 'Reservations: %', (SELECT COUNT(*) FROM reservations);
    RAISE NOTICE 'Agreements: %', (SELECT COUNT(*) FROM agreements);
    RAISE NOTICE 'Damage Records: %', (SELECT COUNT(*) FROM damage_records);
    RAISE NOTICE 'Invoices: %', (SELECT COUNT(*) FROM invoices);
    RAISE NOTICE 'Payments: %', (SELECT COUNT(*) FROM payments);
    RAISE NOTICE 'Traffic Tickets: %', (SELECT COUNT(*) FROM traffic_tickets);
END $$;