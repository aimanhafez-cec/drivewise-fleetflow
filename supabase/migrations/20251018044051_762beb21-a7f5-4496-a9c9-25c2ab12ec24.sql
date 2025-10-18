-- Safely update drivers with UAE-realistic data
-- Using a subquery to identify the first 6 drivers and update them

WITH driver_updates AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM drivers
  LIMIT 6
)
UPDATE drivers d
SET 
  full_name = CASE 
    WHEN du.rn = 1 THEN 'Ahmed Mohammed Al Maktoum'
    WHEN du.rn = 2 THEN 'Priya Sharma'
    WHEN du.rn = 3 THEN 'Muhammad Hassan Khan'
    WHEN du.rn = 4 THEN 'Maria Santos'
    WHEN du.rn = 5 THEN 'James Wilson'
    WHEN du.rn = 6 THEN 'Fatima El-Sayed'
  END,
  license_no = CASE 
    WHEN du.rn = 1 THEN '12345678'
    WHEN du.rn = 2 THEN '23456789'
    WHEN du.rn = 3 THEN 'AD3456789'
    WHEN du.rn = 4 THEN 'SH234567'
    WHEN du.rn = 5 THEN '34567890'
    WHEN du.rn = 6 THEN 'AJ123456'
  END,
  emirates_id = CASE 
    WHEN du.rn = 1 THEN '784-2015-1234567-1'
    WHEN du.rn = 2 THEN '784-2019-2345678-2'
    WHEN du.rn = 3 THEN '784-2020-3456789-3'
    WHEN du.rn = 4 THEN '784-2021-4567890-4'
    WHEN du.rn = 5 THEN '784-2017-5678901-5'
    WHEN du.rn = 6 THEN '784-2022-6789012-6'
  END,
  phone = CASE 
    WHEN du.rn = 1 THEN '+971-50-123-4567'
    WHEN du.rn = 2 THEN '+971-52-234-5678'
    WHEN du.rn = 3 THEN '+971-54-345-6789'
    WHEN du.rn = 4 THEN '+971-55-456-7890'
    WHEN du.rn = 5 THEN '+971-56-567-8901'
    WHEN du.rn = 6 THEN '+971-58-678-9012'
  END,
  email = CASE 
    WHEN du.rn = 1 THEN 'ahmed.almaktoum@email.ae'
    WHEN du.rn = 2 THEN 'priya.sharma@email.com'
    WHEN du.rn = 3 THEN 'hassan.khan@email.com'
    WHEN du.rn = 4 THEN 'maria.santos@email.com'
    WHEN du.rn = 5 THEN 'james.wilson@email.com'
    WHEN du.rn = 6 THEN 'fatima.elsayed@email.com'
  END,
  nationality = CASE 
    WHEN du.rn = 1 THEN 'Emirati'
    WHEN du.rn = 2 THEN 'Indian'
    WHEN du.rn = 3 THEN 'Pakistani'
    WHEN du.rn = 4 THEN 'Filipino'
    WHEN du.rn = 5 THEN 'British'
    WHEN du.rn = 6 THEN 'Egyptian'
  END,
  passport_number = CASE 
    WHEN du.rn = 1 THEN NULL
    WHEN du.rn = 2 THEN 'L9876543'
    WHEN du.rn = 3 THEN 'AB1234567'
    WHEN du.rn = 4 THEN 'P3456789'
    WHEN du.rn = 5 THEN 'GB7654321'
    WHEN du.rn = 6 THEN 'EG9876543'
  END,
  license_issued_by = CASE 
    WHEN du.rn = 1 THEN 'RTA Dubai'
    WHEN du.rn = 2 THEN 'RTA Dubai'
    WHEN du.rn = 3 THEN 'Abu Dhabi Police'
    WHEN du.rn = 4 THEN 'Sharjah Police'
    WHEN du.rn = 5 THEN 'RTA Dubai'
    WHEN du.rn = 6 THEN 'Ajman Police'
  END,
  license_issue_date = CASE 
    WHEN du.rn = 1 THEN '2015-01-15'::date
    WHEN du.rn = 2 THEN '2019-06-10'::date
    WHEN du.rn = 3 THEN '2020-03-22'::date
    WHEN du.rn = 4 THEN '2021-08-14'::date
    WHEN du.rn = 5 THEN '2017-02-20'::date
    WHEN du.rn = 6 THEN '2022-09-05'::date
  END,
  license_expiry = CASE 
    WHEN du.rn = 1 THEN '2026-01-15'::date
    WHEN du.rn = 2 THEN '2025-06-10'::date
    WHEN du.rn = 3 THEN '2025-03-22'::date
    WHEN du.rn = 4 THEN '2026-08-14'::date
    WHEN du.rn = 5 THEN '2027-02-20'::date
    WHEN du.rn = 6 THEN '2027-09-05'::date
  END,
  date_of_birth = CASE 
    WHEN du.rn = 1 THEN '1988-03-20'::date
    WHEN du.rn = 2 THEN '1992-07-15'::date
    WHEN du.rn = 3 THEN '1990-11-08'::date
    WHEN du.rn = 4 THEN '1995-05-30'::date
    WHEN du.rn = 5 THEN '1985-01-10'::date
    WHEN du.rn = 6 THEN '1998-12-03'::date
  END,
  address_emirate = CASE 
    WHEN du.rn = 1 THEN 'Dubai'
    WHEN du.rn = 2 THEN 'Dubai'
    WHEN du.rn = 3 THEN 'Abu Dhabi'
    WHEN du.rn = 4 THEN 'Sharjah'
    WHEN du.rn = 5 THEN 'Dubai'
    WHEN du.rn = 6 THEN 'Ajman'
  END
FROM driver_updates du
WHERE d.id = du.id;