-- Remove instant bookings for company customers (B2C only)
-- Instant booking feature is exclusively for individual customers (Person type)

DELETE FROM reservations 
WHERE booking_type = 'INSTANT' 
AND customer_id IN (
  SELECT id FROM customers WHERE customer_type = 'Company'
);