-- Insert demo vehicles with realistic data across all categories
-- First, let's get the category IDs and insert vehicles for each category

-- Economy Cars (4 vehicles)
INSERT INTO public.vehicles (
  make, model, year, vin, license_plate, color, transmission, engine_size, 
  subtype, ownership_type, features, location, odometer, fuel_level, status,
  daily_rate, weekly_rate, monthly_rate, license_expiry, insurance_expiry,
  category_id
) VALUES
-- Economy vehicles
('Toyota', 'Corolla', 2023, '1NXBR32E03Z123456', 'ABC-1234', 'Silver', 'Automatic', '1.8L', 'Sedan', 'Owned', 
 ARRAY['Air Conditioning', 'Bluetooth', 'Backup Camera'], 'Downtown Location', 15420, 85, 'available',
 45.00, 270.00, 1080.00, '2025-12-31', '2025-06-30',
 (SELECT id FROM categories WHERE name = 'Economy' LIMIT 1)),

('Nissan', 'Versa', 2022, '3N1CN7AP8JL123457', 'DEF-5678', 'White', 'CVT', '1.6L', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth'], 'Airport Location', 22340, 92, 'available',
 42.00, 252.00, 1008.00, '2025-11-15', '2025-07-15',
 (SELECT id FROM categories WHERE name = 'Economy' LIMIT 1)),

('Hyundai', 'Elantra', 2023, '5NPF34AF8JH123458', 'GHI-9012', 'Blue', 'Automatic', '2.0L', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto'], 'Downtown Location', 8750, 78, 'rented',
 48.00, 288.00, 1152.00, '2026-01-20', '2025-08-20',
 (SELECT id FROM categories WHERE name = 'Economy' LIMIT 1)),

('Kia', 'Rio', 2021, '3KPA24AD8ME123459', 'JKL-3456', 'Red', 'Manual', '1.6L', 'Hatchback', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth'], 'Northside Branch', 35670, 60, 'maintenance',
 40.00, 240.00, 960.00, '2025-09-10', '2025-05-10',
 (SELECT id FROM categories WHERE name = 'Economy' LIMIT 1)),

-- Compact Cars (4 vehicles)
('Honda', 'Civic', 2024, '19XFC2F59PE123460', 'MNO-7890', 'Black', 'CVT', '2.0L', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Lane Keeping Assist'], 'Downtown Location', 5200, 95, 'available',
 52.00, 312.00, 1248.00, '2026-03-15', '2025-09-15',
 (SELECT id FROM categories WHERE name = 'Compact' LIMIT 1)),

('Mazda', 'Mazda3', 2023, 'JM1BP1SF8P1123461', 'PQR-2345', 'Gray', 'Automatic', '2.5L', 'Hatchback', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Premium Audio', 'Sunroof'], 'Airport Location', 12400, 88, 'available',
 55.00, 330.00, 1320.00, '2025-12-05', '2025-06-05',
 (SELECT id FROM categories WHERE name = 'Compact' LIMIT 1)),

('Volkswagen', 'Jetta', 2022, '3VWD17AJ8JM123462', 'STU-6789', 'White', 'Automatic', '1.4L Turbo', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Heated Seats'], 'Westside Office', 18900, 72, 'rented',
 50.00, 300.00, 1200.00, '2025-10-20', '2025-04-20',
 (SELECT id FROM categories WHERE name = 'Compact' LIMIT 1)),

('Subaru', 'Impreza', 2023, '4S3GKAB64P3123463', 'VWX-0123', 'Blue', 'CVT', '2.0L', 'Hatchback', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'All-Wheel Drive', 'EyeSight Safety'], 'Downtown Location', 9850, 82, 'available',
 54.00, 324.00, 1296.00, '2026-02-28', '2025-08-28',
 (SELECT id FROM categories WHERE name = 'Compact' LIMIT 1)),

-- Midsize Cars (4 vehicles)
('Toyota', 'Camry', 2024, '4T1G11AK8RU123464', 'YZA-4567', 'Silver', 'Automatic', '2.5L', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Toyota Safety Sense', 'Wireless Charging'], 'Airport Location', 3400, 90, 'available',
 68.00, 408.00, 1632.00, '2026-05-15', '2025-11-15',
 (SELECT id FROM categories WHERE name = 'Midsize' LIMIT 1)),

('Honda', 'Accord', 2023, '1HGCV1F30PA123465', 'BCD-8901', 'Black', 'CVT', '1.5L Turbo', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Honda Sensing', 'Heated Seats'], 'Downtown Location', 11200, 76, 'available',
 65.00, 390.00, 1560.00, '2025-11-30', '2025-05-30',
 (SELECT id FROM categories WHERE name = 'Midsize' LIMIT 1)),

('Nissan', 'Altima', 2022, '1N4BL4DV8NC123466', 'EFG-2345', 'White', 'CVT', '2.5L', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'ProPILOT Assist'], 'Northside Branch', 24600, 68, 'rented',
 62.00, 372.00, 1488.00, '2025-08-15', '2025-02-15',
 (SELECT id FROM categories WHERE name = 'Midsize' LIMIT 1)),

('Hyundai', 'Sonata', 2023, '5NPG34AF7PH123467', 'HIJ-6789', 'Red', 'Automatic', '2.5L', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'SmartSense', 'Panoramic Sunroof'], 'Westside Office', 7800, 84, 'available',
 66.00, 396.00, 1584.00, '2026-01-10', '2025-07-10',
 (SELECT id FROM categories WHERE name = 'Midsize' LIMIT 1)),

-- Full-size Cars (3 vehicles)
('Chevrolet', 'Malibu', 2023, '1G1ZE5ST2PF123468', 'KLM-0123', 'Gray', 'Automatic', '1.5L Turbo', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Teen Driver Technology'], 'Airport Location', 14500, 88, 'available',
 75.00, 450.00, 1800.00, '2025-12-20', '2025-06-20',
 (SELECT id FROM categories WHERE name = 'Full-size' LIMIT 1)),

('Chrysler', '300', 2022, '2C3CCAAG8NH123469', 'NOP-4567', 'Black', 'Automatic', '3.6L V6', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio'], 'Downtown Location', 19800, 70, 'available',
 82.00, 492.00, 1968.00, '2025-09-25', '2025-03-25',
 (SELECT id FROM categories WHERE name = 'Full-size' LIMIT 1)),

('Buick', 'LaCrosse', 2021, '1G4ZP5SS8MU123470', 'QRS-8901', 'White', 'Automatic', '3.6L V6', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Heated/Cooled Seats'], 'Northside Branch', 28400, 65, 'maintenance',
 78.00, 468.00, 1872.00, '2025-07-30', '2025-01-30',
 (SELECT id FROM categories WHERE name = 'Full-size' LIMIT 1)),

-- SUV Cars (4 vehicles)
('Toyota', 'RAV4', 2024, '2T3F1RFV8RW123471', 'TUV-2345', 'Blue', 'AWD Automatic', '2.5L', 'Compact SUV', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'All-Wheel Drive', 'Toyota Safety Sense'], 'Downtown Location', 6200, 92, 'available',
 85.00, 510.00, 2040.00, '2026-04-10', '2025-10-10',
 (SELECT id FROM categories WHERE name = 'SUV' LIMIT 1)),

('Honda', 'CR-V', 2023, '7FARW2H51PE123472', 'WXY-6789', 'Silver', 'AWD CVT', '1.5L Turbo', 'Compact SUV', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'All-Wheel Drive', 'Honda Sensing'], 'Airport Location', 13700, 86, 'available',
 82.00, 492.00, 1968.00, '2025-11-05', '2025-05-05',
 (SELECT id FROM categories WHERE name = 'SUV' LIMIT 1)),

('Mazda', 'CX-5', 2023, 'JM3KFACM1P0123473', 'ZAB-0123', 'Red', 'AWD Automatic', '2.5L', 'Compact SUV', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'All-Wheel Drive', 'Premium Interior'], 'Westside Office', 16800, 74, 'rented',
 80.00, 480.00, 1920.00, '2025-10-15', '2025-04-15',
 (SELECT id FROM categories WHERE name = 'SUV' LIMIT 1)),

('Subaru', 'Outback', 2022, '4S4BTANC2N3123474', 'CDE-4567', 'Green', 'AWD CVT', '2.5L', 'Crossover', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'All-Wheel Drive', 'EyeSight Safety', 'Roof Rails'], 'Downtown Location', 21500, 80, 'available',
 78.00, 468.00, 1872.00, '2025-08-20', '2025-02-20',
 (SELECT id FROM categories WHERE name = 'SUV' LIMIT 1)),

-- Premium Cars (3 vehicles)
('BMW', '330i', 2023, 'WBA5R1C02PD123475', 'FGH-8901', 'Black', 'Automatic', '2.0L Turbo', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Sunroof'], 'Downtown Location', 8900, 88, 'available',
 125.00, 750.00, 3000.00, '2026-02-15', '2025-08-15',
 (SELECT id FROM categories WHERE name = 'Premium' LIMIT 1)),

('Mercedes-Benz', 'C-Class', 2024, 'W1KZF8DB8PA123476', 'IJK-2345', 'Silver', 'Automatic', '2.0L Turbo', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Navigation', 'Heated Seats'], 'Airport Location', 4200, 94, 'available',
 135.00, 810.00, 3240.00, '2026-06-30', '2025-12-30',
 (SELECT id FROM categories WHERE name = 'Premium' LIMIT 1)),

('Audi', 'A4', 2022, 'WAUANAF42MN123477', 'LMN-6789', 'White', 'Automatic', '2.0L Turbo', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Virtual Cockpit'], 'Northside Branch', 17300, 72, 'rented',
 128.00, 768.00, 3072.00, '2025-09-05', '2025-03-05',
 (SELECT id FROM categories WHERE name = 'Premium' LIMIT 1)),

-- Luxury Cars (3 vehicles)
('BMW', '750i', 2024, 'WBA7U2C04PG123478', 'OPQ-0123', 'Black', 'Automatic', '4.4L V8 Twin Turbo', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Navigation', 'Massaging Seats', 'Executive Package'], 'Downtown Location', 2800, 96, 'available',
 250.00, 1500.00, 6000.00, '2026-07-20', '2026-01-20',
 (SELECT id FROM categories WHERE name = 'Luxury' LIMIT 1)),

('Mercedes-Benz', 'S-Class', 2023, 'W1KZG8EB9PA123479', 'RST-4567', 'Silver', 'Automatic', '3.0L I6 Turbo', 'Sedan', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Navigation', 'Air Suspension', 'Executive Rear Seating'], 'Airport Location', 5600, 90, 'available',
 275.00, 1650.00, 6600.00, '2026-05-25', '2025-11-25',
 (SELECT id FROM categories WHERE name = 'Luxury' LIMIT 1)),

('Cadillac', 'CT6', 2022, '1G6KN5RS4MU123480', 'UVW-8901', 'Gray', 'Automatic', '3.6L V6', 'Sedan', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Navigation', 'Magnetic Ride Control'], 'Westside Office', 15400, 78, 'maintenance',
 220.00, 1320.00, 5280.00, '2025-10-30', '2025-04-30',
 (SELECT id FROM categories WHERE name = 'Luxury' LIMIT 1)),

-- Convertible Cars (3 vehicles)
('Ford', 'Mustang Convertible', 2023, '1FA6P8CF1P5123481', 'XYZ-2345', 'Red', 'Automatic', '5.0L V8', 'Convertible', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Premium Audio', 'Performance Package'], 'Downtown Location', 7200, 85, 'available',
 165.00, 990.00, 3960.00, '2026-03-10', '2025-09-10',
 (SELECT id FROM categories WHERE name = 'Convertible' LIMIT 1)),

('BMW', '430i Convertible', 2024, 'WBA4J1C04PG123482', 'ABC-6789', 'White', 'Automatic', '2.0L Turbo', 'Convertible', 'Leased',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Leather Seats', 'Premium Audio', 'Navigation'], 'Airport Location', 3900, 92, 'available',
 185.00, 1110.00, 4440.00, '2026-08-15', '2026-02-15',
 (SELECT id FROM categories WHERE name = 'Convertible' LIMIT 1)),

('Chevrolet', 'Camaro Convertible', 2022, '1G1FE1R70N0123483', 'DEF-0123', 'Yellow', 'Automatic', '6.2L V8', 'Convertible', 'Owned',
 ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Premium Audio', 'Performance Exhaust'], 'Northside Branch', 12800, 68, 'rented',
 175.00, 1050.00, 4200.00, '2025-12-10', '2025-06-10',
 (SELECT id FROM categories WHERE name = 'Convertible' LIMIT 1));