-- Update customer names to Arabic names in Latin letters
UPDATE customers 
SET full_name = CASE 
  WHEN id = '550e8400-e29b-41d4-a716-446655440001' THEN 'Ahmed Mohammed Al-Ali'
  WHEN id = '550e8400-e29b-41d4-a716-446655440002' THEN 'Fatima Abdulrahman Al-Salem'
  WHEN id = '550e8400-e29b-41d4-a716-446655440003' THEN 'Mahmoud Ibrahim Al-Hassan'
  WHEN id = '550e8400-e29b-41d4-a716-446655440004' THEN 'Aisha Saad Al-Khalid'
  WHEN id = '550e8400-e29b-41d4-a716-446655440005' THEN 'Yusuf Omar Al-Tamimi'
  ELSE full_name
END
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005'
);