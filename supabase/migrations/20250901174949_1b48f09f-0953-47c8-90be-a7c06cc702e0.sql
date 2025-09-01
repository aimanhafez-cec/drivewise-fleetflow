-- Add customer sites with correct site_type values
INSERT INTO public.customer_sites (customer_id, site_name, site_code, site_type, contact_person, contact_email, contact_phone) VALUES
-- Sites for Ahmed Mohammed Al-Ali
('550e8400-e29b-41d4-a716-446655440001', 'Head Office', 'HQ001', 'Both', 'Ahmed Al-Ali', 'ahmed.alali@company.com', '+971501234567'),
('550e8400-e29b-41d4-a716-446655440001', 'Dubai Branch', 'DB001', 'Bill-to', 'Sara Ahmed', 'sara.ahmed@company.com', '+971502345678'),

-- Sites for Fatima Abdulrahman Al-Salem  
('550e8400-e29b-41d4-a716-446655440002', 'Corporate Center', 'CC001', 'Both', 'Fatima Al-Salem', 'fatima.salem@corp.com', '+971503456789'),
('550e8400-e29b-41d4-a716-446655440002', 'Finance Department', 'FD001', 'Bill-to', 'Omar Hassan', 'omar.hassan@corp.com', '+971504567890'),

-- Sites for mohamed gamal
('4fbdc306-566d-464b-8683-791c7809b22a', 'Main Office', 'MO001', 'Both', 'Mohamed Gamal', 'mohamedgamal@gmail.com', '01026564635'),
('4fbdc306-566d-464b-8683-791c7809b22a', 'Warehouse', 'WH001', 'Ship-to', 'Ali Ahmed', 'ali.ahmed@company.com', '+971505678901');