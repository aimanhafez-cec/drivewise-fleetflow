-- Insert sample RFQs to make the system visible
INSERT INTO rfqs (rfq_no, customer_id, pickup_at, pickup_loc_id, return_at, return_loc_id, vehicle_type_id, notes, status)
VALUES 
('RFQ-000001', 'e81c69da-e2ee-4b04-a85c-911751dea6ec', '2025-08-20 10:00:00+00', 'Airport Terminal 1', '2025-08-25 15:00:00+00', 'Downtown Office', '21486b88-76af-47d8-85d0-e0d85c0c3572', 'Need a compact car for business trip', 'new'),
('RFQ-000002', 'e81c69da-e2ee-4b04-a85c-911751dea6ec', '2025-09-01 09:00:00+00', 'City Center', '2025-09-03 18:00:00+00', 'City Center', 'dc324aa9-e47d-4534-8334-cb69675e30af', 'Weekend luxury rental for special occasion', 'under_review');