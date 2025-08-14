-- Create profile for the authenticated user
INSERT INTO profiles (
  user_id,
  full_name,
  email
) VALUES (
  'c7cca152-9e09-4d55-b87b-afc6065e26cd',
  'Aiman hafez',
  'aimanhafez88@gmail.com'
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email;

-- Create a real reservation
INSERT INTO reservations (
  customer_id,
  start_datetime,
  end_datetime,
  pickup_location,
  return_location,
  status,
  total_amount
) SELECT 
  p.id,
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '3 days',
  'Downtown Location',
  'Downtown Location', 
  'pending',
  299.99
FROM profiles p 
WHERE p.user_id = 'c7cca152-9e09-4d55-b87b-afc6065e26cd';