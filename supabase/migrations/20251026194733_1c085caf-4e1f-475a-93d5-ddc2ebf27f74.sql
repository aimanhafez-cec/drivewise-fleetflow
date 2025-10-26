-- Phase 2: Create Brand New Instant Booking Records (with correct customer IDs)

-- Insert new instant bookings with varied scenarios
INSERT INTO reservations (
  customer_id, vehicle_id, booking_type, reservation_type,
  start_datetime, end_datetime, pickup_location, return_location,
  ro_number, total_amount, status, auto_approved, instant_booking_score,
  down_payment_amount, down_payment_status, special_requests
) VALUES
-- Record 1: Pending payment - Vehicle Class (United Trading Company LLC)
(
  '43644567-fae5-4065-b6d1-80e7ba298b37',
  NULL,
  'INSTANT',
  'vehicle_class',
  NOW() + interval '2 days',
  NOW() + interval '5 days',
  'Dubai Marina',
  'Dubai Marina',
  'IB-2025-' || LPAD((SELECT COUNT(*) + 1 FROM reservations WHERE booking_type = 'INSTANT')::text, 6, '0'),
  1500.00,
  'pending',
  true,
  88,
  450.00,
  'pending',
  'Economy class for business meetings'
),
-- Record 2: Confirmed with payment - Make/Model (mohamed ateyya)
(
  'e81c69da-e2ee-4b04-a85c-911751dea6ec',
  NULL,
  'INSTANT',
  'make_model',
  NOW() + interval '3 days',
  NOW() + interval '7 days',
  'JBR Beach',
  'JBR Beach',
  'IB-2025-' || LPAD((SELECT COUNT(*) + 2 FROM reservations WHERE booking_type = 'INSTANT')::text, 6, '0'),
  1800.00,
  'confirmed',
  true,
  95,
  540.00,
  'paid',
  'Honda Civic preferred for weekend trip'
),
-- Record 3: Active rental - Specific VIN (Emirates Construction Co)
(
  '36981e93-9788-4faf-8b01-930af473ec5b',
  '750e8400-e29b-41d4-a716-446655440002',
  'INSTANT',
  'specific_vin',
  NOW() - interval '2 days',
  NOW() + interval '5 days',
  'Downtown Dubai',
  'Downtown Dubai',
  'IB-2025-' || LPAD((SELECT COUNT(*) + 3 FROM reservations WHERE booking_type = 'INSTANT')::text, 6, '0'),
  3200.00,
  'checked_out',
  false,
  72,
  960.00,
  'paid',
  'Specific vehicle requested for corporate use'
),
-- Record 4: Completed - Vehicle Class (sameh mohsen)
(
  'be788e8c-04b5-466f-b1e1-bd3335bbc7ec',
  NULL,
  'INSTANT',
  'vehicle_class',
  NOW() - interval '10 days',
  NOW() - interval '3 days',
  'Al Barsha',
  'Al Barsha',
  'IB-2025-' || LPAD((SELECT COUNT(*) + 4 FROM reservations WHERE booking_type = 'INSTANT')::text, 6, '0'),
  2100.00,
  'completed',
  true,
  90,
  630.00,
  'paid',
  'Standard sedan for business use'
),
-- Record 5: Cancelled - Make/Model (Arab Engineers Group)
(
  '586f2bdf-b348-4a0e-97c2-cd5e6b517462',
  NULL,
  'INSTANT',
  'make_model',
  NOW() + interval '5 days',
  NOW() + interval '9 days',
  'Business Bay',
  'Business Bay',
  'IB-2025-' || LPAD((SELECT COUNT(*) + 5 FROM reservations WHERE booking_type = 'INSTANT')::text, 6, '0'),
  1900.00,
  'cancelled',
  true,
  82,
  570.00,
  'pending',
  'Customer changed travel plans'
);

-- Update timestamps for realism
UPDATE reservations 
SET 
  created_at = NOW() - interval '3 days',
  updated_at = NOW() - interval '2 hours',
  down_payment_paid_at = NOW() - interval '3 days' + interval '2 hours'
WHERE ro_number LIKE 'IB-2025-%' AND down_payment_status = 'paid';

-- Update completed booking timestamps
UPDATE reservations 
SET 
  created_at = NOW() - interval '10 days',
  updated_at = NOW() - interval '3 days'
WHERE status = 'completed' AND booking_type = 'INSTANT';

-- Update cancelled booking timestamps
UPDATE reservations 
SET 
  created_at = NOW() - interval '5 days',
  updated_at = NOW() - interval '1 day'
WHERE status = 'cancelled' AND booking_type = 'INSTANT';