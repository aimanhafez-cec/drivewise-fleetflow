-- Drop unique constraint on item_code to allow multiple vehicles per item_code
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_item_code_key;

-- Create regular index for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_item_code ON vehicles(item_code);

-- Add duplicate vehicles for Toyota RAV4 2024 Green (target: 4 total)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'JTDBF4K16HJ678902', make, model, year, 'ABC902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'TOY-RAV-2024-GRE-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'JTDBF4K16HJ678903', make, model, year, 'ABC903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'TOY-RAV-2024-GRE-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'JTDBF4K16HJ678904', make, model, year, 'ABC904', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'TOY-RAV-2024-GRE-SUV' LIMIT 1;

-- Add duplicate vehicles for BMW 750i 2024 Black (target: 5 total)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'WBAGH8306MDS12902', make, model, year, 'DEF902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'BMW-750-2024-BLA-STA' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'WBAGH8306MDS12903', make, model, year, 'DEF903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'BMW-750-2024-BLA-STA' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'WBAGH8306MDS12904', make, model, year, 'DEF904', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'BMW-750-2024-BLA-STA' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT 'WBAGH8306MDS12905', make, model, year, 'DEF905', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'BMW-750-2024-BLA-STA' LIMIT 1;

-- Add duplicate vehicles for Honda CR-V 2022 Gray (target: 6 total, 2 rented)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRM4H76NH567902', make, model, year, 'GHI902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2022-GRA-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRM4H76NH567903', make, model, year, 'GHI903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2022-GRA-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRM4H76NH567904', make, model, year, 'GHI904', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2022-GRA-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRM4H76NH567905', make, model, year, 'GHI905', category_id, 'rented', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2022-GRA-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRM4H76NH567906', make, model, year, 'GHI906', category_id, 'rented', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2022-GRA-SUV' LIMIT 1;

-- Add duplicate vehicles for Ford Mustang 2023 Red (target: 3 total)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1FATP8UH5N5123902', make, model, year, 'JKL902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'FOR-MUS-2023-RED-CON' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1FATP8UH5N5123903', make, model, year, 'JKL903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'FOR-MUS-2023-RED-CON' LIMIT 1;

-- Add duplicate vehicles for Honda CR-V 2023 Silver (target: 4 total)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRS3H84NH678902', make, model, year, 'MNO902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2023-SIL-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRS3H84NH678903', make, model, year, 'MNO903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2023-SIL-SUV' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '2HKRS3H84NH678904', make, model, year, 'MNO904', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'HON-CRV-2023-SIL-SUV' LIMIT 1;

-- Add duplicate vehicles for Nissan Altima 2024 Black (target: 7 total)
INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234902', make, model, year, 'PQR902', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234903', make, model, year, 'PQR903', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234904', make, model, year, 'PQR904', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234905', make, model, year, 'PQR905', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234906', make, model, year, 'PQR906', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;

INSERT INTO vehicles (vin, make, model, year, license_plate, category_id, status, location, fuel_level, odometer, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate)
SELECT '1N4BL4DV8PC234907', make, model, year, 'PQR907', category_id, 'available', location, 100, 0, color, transmission, engine_size, item_code, item_description, daily_rate, weekly_rate, monthly_rate
FROM vehicles WHERE item_code = 'NIS-ALT-2024-BLA-INT' LIMIT 1;