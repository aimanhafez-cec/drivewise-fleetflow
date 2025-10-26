-- Phase 1: Convert existing reservations to instant bookings

-- Convert 3 reservations to instant bookings with different types
UPDATE reservations 
SET 
  booking_type = 'INSTANT',
  reservation_type = 'vehicle_class',
  auto_approved = true,
  instant_booking_score = 85,
  down_payment_amount = total_amount * 0.3,
  down_payment_status = 'paid',
  down_payment_paid_at = created_at + interval '1 hour'
WHERE ro_number IN ('RO-2025-001235', 'RO-2025-001236');

UPDATE reservations 
SET 
  booking_type = 'INSTANT',
  reservation_type = 'make_model',
  auto_approved = true,
  instant_booking_score = 92,
  make_model = 'Toyota Camry',
  down_payment_amount = total_amount * 0.3,
  down_payment_status = 'pending'
WHERE ro_number = 'RO-2025-001237';

UPDATE reservations 
SET 
  booking_type = 'INSTANT',
  reservation_type = 'specific_vin',
  auto_approved = false,
  instant_booking_score = 68
WHERE ro_number = 'RO-2025-001238';