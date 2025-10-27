-- Seed leads table with realistic UAE-based data
-- Omitting duration_days (auto-generated column)

INSERT INTO public.leads (
  lead_no, source_type, source_name, status, priority,
  customer_name, customer_email, customer_phone, customer_nationality, language_preference,
  vehicle_category, alternative_categories,
  pickup_datetime, pickup_location, return_datetime, return_location,
  estimated_value, special_requests,
  created_at, updated_at, sla_response_deadline, sla_breached
)
VALUES
  (
    'LD-2025-0201', 'direct', 'website', 'new', 'high',
    'Ahmed Khan', 'ahmed.khan@example.ae', '+971501112233', 'PK', 'en',
    'SUV', ARRAY['Crossover','Full-Size'],
    '2025-10-28T10:00:00Z', 'Dubai International Airport (DXB) T3', '2025-11-02T10:00:00Z', 'Dubai Marina Branch',
    1850, 'Baby seat, GPS',
    '2025-10-27T08:10:00Z', '2025-10-27T08:10:00Z', '2025-10-27T10:10:00Z', false
  ),
  (
    'LD-2025-0202', 'direct', 'whatsapp', 'contacted', 'medium',
    'Fatima Al Mansoori', 'fatima.m@example.com', '+971502223344', 'AE', 'ar',
    'Economy', ARRAY['Compact'],
    '2025-10-29T09:00:00Z', 'Abu Dhabi Corniche Branch', '2025-11-03T09:00:00Z', 'Abu Dhabi Airport (AUH)',
    950, NULL,
    '2025-10-26T14:25:00Z', '2025-10-26T16:00:00Z', '2025-10-26T16:25:00Z', false
  ),
  (
    'LD-2025-0203', 'aggregator', 'booking_com', 'quoted', 'low',
    'Liam O''Connor', 'liam.oconnor@example.ie', '+353861234567', 'IE', 'en',
    'Luxury', ARRAY['Premium'],
    '2025-11-05T12:00:00Z', 'Dubai Marina Branch', '2025-11-08T12:00:00Z', 'Dubai Marina Branch',
    2800, 'SCDW insurance',
    '2025-10-24T11:05:00Z', '2025-10-24T12:00:00Z', '2025-10-24T13:05:00Z', false
  ),
  (
    'LD-2025-0204', 'tourism', 'hotel_concierge', 'confirmed', 'high',
    'Sophia Rossi', 's.rossi@example.it', '+39 331 1112223', 'IT', 'en',
    'Convertible', ARRAY['Luxury'],
    '2025-10-28T18:00:00Z', 'Burj Al Arab Hotel', '2025-11-01T18:00:00Z', 'Burj Al Arab Hotel',
    5200, 'Airport meet & greet',
    '2025-10-25T19:40:00Z', '2025-10-26T07:00:00Z', '2025-10-25T21:40:00Z', false
  ),
  (
    'LD-2025-0205', 'phone_email', 'email', 'rejected', 'low',
    'Mohamed Salah', 'm.salah@example.eg', '+20 100 5554443', 'EG', 'en',
    'Economy', ARRAY['Compact','Midsize'],
    '2025-11-10T07:00:00Z', 'Sharjah Airport (SHJ)', '2025-11-14T07:00:00Z', 'Sharjah Airport (SHJ)',
    760, NULL,
    '2025-10-20T10:00:00Z', '2025-10-20T11:30:00Z', '2025-10-20T12:00:00Z', false
  ),
  (
    'LD-2025-0206', 'broker', 'mena_broker', 'contacted', 'medium',
    'Noura Al Suwaidi', 'noura.s@example.ae', '+971503336666', 'AE', 'ar',
    'SUV', ARRAY['Midsize'],
    '2025-11-02T08:30:00Z', 'Dubai Mall Branch', '2025-11-07T08:30:00Z', 'Dubai Mall Branch',
    2100, 'Second driver',
    '2025-10-23T09:10:00Z', '2025-10-23T09:30:00Z', '2025-10-23T11:10:00Z', false
  ),
  (
    'LD-2025-0207', 'social', 'instagram', 'new', 'medium',
    'Chen Wei', 'chen.wei@example.cn', '+86 138 0000 1111', 'CN', 'en',
    'Midsize', ARRAY['SUV'],
    '2025-11-03T10:00:00Z', 'Dubai Internet City', '2025-11-05T10:00:00Z', 'Dubai Internet City',
    640, NULL,
    '2025-10-27T06:45:00Z', '2025-10-27T06:45:00Z', '2025-10-27T08:45:00Z', false
  ),
  (
    'LD-2025-0208', 'aggregator', 'rentalcars', 'quoted', 'high',
    'Olivia Brown', 'olivia.b@example.co.uk', '+44 7700 900123', 'UK', 'en',
    'Premium', ARRAY['Luxury'],
    '2025-11-15T09:00:00Z', 'DXB T1', '2025-11-20T09:00:00Z', 'DXB T1',
    3650, 'Child seat',
    '2025-10-22T10:20:00Z', '2025-10-22T10:20:00Z', '2025-10-22T12:20:00Z', false
  ),
  (
    'LD-2025-0209', 'tourism', 'dubai_tourism', 'confirmed', 'medium',
    'Jacob Martin', 'jacob.m@example.com', '+1 415 555 1212', 'US', 'en',
    'SUV', ARRAY['Premium'],
    '2025-10-30T13:00:00Z', 'JBR', '2025-11-04T13:00:00Z', 'JBR',
    2250, 'Late return',
    '2025-10-26T09:00:00Z', '2025-10-26T12:00:00Z', '2025-10-26T11:00:00Z', false
  ),
  (
    'LD-2025-0210', 'phone_email', 'phone', 'expired', 'low',
    'Aisha Rahman', 'aisha.r@example.bd', '+880 1711 222333', 'BD', 'en',
    'Compact', ARRAY['Economy'],
    '2025-10-18T09:00:00Z', 'Ajman City Centre', '2025-10-21T09:00:00Z', 'Ajman City Centre',
    420, NULL,
    '2025-10-18T08:00:00Z', '2025-10-21T10:00:00Z', '2025-10-18T10:00:00Z', true
  ),
  (
    'LD-2025-0211', 'direct', 'mobile_app', 'new', 'high',
    'Hassan Ali', 'h.ali@example.sa', '+966 505 123456', 'SA', 'en',
    'Premium', ARRAY['SUV'],
    '2025-11-06T11:00:00Z', 'Dubai Silicon Oasis', '2025-11-10T11:00:00Z', 'Dubai Silicon Oasis',
    2400, 'Navigation system',
    '2025-10-27T07:30:00Z', '2025-10-27T07:30:00Z', '2025-10-27T09:30:00Z', false
  ),
  (
    'LD-2025-0212', 'broker', 'eu_travel', 'quoted', 'medium',
    'Emily Davis', 'emily.d@example.com', '+1 212 555 9876', 'US', 'en',
    'Midsize', ARRAY['SUV','Economy'],
    '2025-11-12T14:00:00Z', 'Al Barsha Branch', '2025-11-15T14:00:00Z', 'Al Barsha Branch',
    900, NULL,
    '2025-10-21T15:00:00Z', '2025-10-21T16:00:00Z', '2025-10-21T17:00:00Z', false
  );