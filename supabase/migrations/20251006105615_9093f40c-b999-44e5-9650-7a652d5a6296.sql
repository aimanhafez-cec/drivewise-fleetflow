-- Add sample customer sites for B2B customers
INSERT INTO customer_sites (customer_id, site_name, site_code, contact_person, contact_email, contact_phone, is_active)
VALUES
  -- United Trading Company LLC sites
  ((SELECT id FROM customers WHERE full_name = 'United Trading Company LLC'), 'Head Office', 'HQ', 'Ahmed Al Mansoori', 'ahmed.almansoori@unitedtrading.ae', '+971-50-111-2222', true),
  ((SELECT id FROM customers WHERE full_name = 'United Trading Company LLC'), 'Dubai Branch', 'DXB-BR', 'Fatima Hassan', 'fatima.hassan@unitedtrading.ae', '+971-50-222-3333', true),
  ((SELECT id FROM customers WHERE full_name = 'United Trading Company LLC'), 'Abu Dhabi Site', 'AUH-SITE', 'Ali Mohammed', 'ali.mohammed@unitedtrading.ae', '+971-50-333-4444', true),
  
  -- Arab Engineers Group sites
  ((SELECT id FROM customers WHERE full_name = 'Arab Engineers Group'), 'Main Office', 'MAIN', 'Mohammed Rashid', 'mohammed.rashid@arabengineergroup.ae', '+971-50-333-4444', true),
  ((SELECT id FROM customers WHERE full_name = 'Arab Engineers Group'), 'Project Site - Marina', 'MARINA', 'Khalid Ahmed', 'khalid.ahmed@arabengineergroup.ae', '+971-50-444-5555', true),
  ((SELECT id FROM customers WHERE full_name = 'Arab Engineers Group'), 'Warehouse - Jebel Ali', 'JAFZ', 'Omar Ali', 'omar.ali@arabengineergroup.ae', '+971-50-555-6666', true);