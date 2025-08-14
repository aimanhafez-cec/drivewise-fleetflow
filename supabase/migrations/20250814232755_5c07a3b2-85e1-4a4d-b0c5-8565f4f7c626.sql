-- Insert a test profile for the current user
INSERT INTO profiles (
  user_id,
  full_name,
  email
) 
SELECT 
  auth.uid(),
  'Test User',
  'test@example.com'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE user_id = auth.uid()
);

-- Insert a test reservation
INSERT INTO reservations (
  customer_id,
  start_datetime,
  end_datetime,
  pickup_location,
  return_location,
  status,
  total_amount
)
SELECT 
  p.id,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '3 days', 
  'Downtown Location',
  'Downtown Location',
  'pending',
  299.99
FROM profiles p
WHERE p.user_id = auth.uid()
AND NOT EXISTS (
  SELECT 1 FROM reservations WHERE customer_id = p.id
);