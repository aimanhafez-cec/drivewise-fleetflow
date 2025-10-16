-- =============================================
-- STEP 1: Add acquisition_cost column to vehicles table
-- =============================================
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS acquisition_cost NUMERIC DEFAULT NULL;

COMMENT ON COLUMN vehicles.acquisition_cost IS 'Vehicle purchase/acquisition cost in AED for cost sheet calculations';

-- =============================================
-- STEP 2: Update vehicles with realistic UAE market values
-- =============================================

-- ECONOMY SEDANS (95K - 110K AED) - Monthly Rate: 2,800 - 3,200 AED
UPDATE vehicles SET acquisition_cost = 100000, monthly_rate = 3000, daily_rate = 120, weekly_rate = 720 WHERE make = 'Honda' AND model = 'Civic' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 105000, monthly_rate = 3100, daily_rate = 125, weekly_rate = 750 WHERE make = 'Nissan' AND model = 'Altima' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 95000, monthly_rate = 2900, daily_rate = 115, weekly_rate = 690 WHERE make = 'Nissan' AND model = 'Sentra' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 98000, monthly_rate = 2950, daily_rate = 118, weekly_rate = 705 WHERE make = 'Toyota' AND model = 'Corolla' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 102000, monthly_rate = 3050, daily_rate = 122, weekly_rate = 730 WHERE make = 'Chevrolet' AND model = 'Malibu';
UPDATE vehicles SET acquisition_cost = 108000, monthly_rate = 3200, daily_rate = 128, weekly_rate = 765 WHERE make = 'Chrysler' AND model = '300';
UPDATE vehicles SET acquisition_cost = 110000, monthly_rate = 3250, daily_rate = 130, weekly_rate = 780 WHERE make = 'Buick' AND model = 'LaCrosse';

-- MID-SIZE SEDANS (110K - 130K AED) - Monthly Rate: 3,500 - 4,200 AED
UPDATE vehicles SET acquisition_cost = 118000, monthly_rate = 3800, daily_rate = 152, weekly_rate = 912 WHERE make = 'Toyota' AND model = 'Camry' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 122000, monthly_rate = 3900, daily_rate = 156, weekly_rate = 936 WHERE make = 'Honda' AND model = 'Accord' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 128000, monthly_rate = 4100, daily_rate = 164, weekly_rate = 984 WHERE make = 'Nissan' AND model = 'Maxima' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 115000, monthly_rate = 3700, daily_rate = 148, weekly_rate = 888 WHERE make = 'Mazda' AND model = 'Mazda6' AND year >= 2023;

-- COMPACT SUVs (130K - 145K AED) - Monthly Rate: 4,200 - 4,800 AED
UPDATE vehicles SET acquisition_cost = 135000, monthly_rate = 4500, daily_rate = 180, weekly_rate = 1080 WHERE make = 'Honda' AND model = 'CR-V' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 138000, monthly_rate = 4600, daily_rate = 184, weekly_rate = 1104 WHERE make = 'Toyota' AND model = 'RAV4' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 132000, monthly_rate = 4400, daily_rate = 176, weekly_rate = 1056 WHERE make = 'Nissan' AND model = 'Rogue' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 130000, monthly_rate = 4350, daily_rate = 174, weekly_rate = 1044 WHERE make = 'Hyundai' AND model = 'Tucson' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 133000, monthly_rate = 4450, daily_rate = 178, weekly_rate = 1068 WHERE make = 'Chevrolet' AND model = 'Equinox';
UPDATE vehicles SET acquisition_cost = 136000, monthly_rate = 4550, daily_rate = 182, weekly_rate = 1092 WHERE make = 'Mazda' AND model = 'CX-5' AND year >= 2023;

-- MID-SIZE SUVs (160K - 185K AED) - Monthly Rate: 5,200 - 6,000 AED
UPDATE vehicles SET acquisition_cost = 175000, monthly_rate = 5800, daily_rate = 232, weekly_rate = 1392 WHERE make = 'Toyota' AND model = 'Highlander' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 172000, monthly_rate = 5700, daily_rate = 228, weekly_rate = 1368 WHERE make = 'Honda' AND model = 'Pilot' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 168000, monthly_rate = 5600, daily_rate = 224, weekly_rate = 1344 WHERE make = 'Nissan' AND model = 'Pathfinder' AND year >= 2023;
UPDATE vehicles SET acquisition_cost = 165000, monthly_rate = 5500, daily_rate = 220, weekly_rate = 1320 WHERE make = 'Chevrolet' AND model = 'Traverse';
UPDATE vehicles SET acquisition_cost = 170000, monthly_rate = 5650, daily_rate = 226, weekly_rate = 1356 WHERE make = 'Ford' AND model = 'Explorer';

-- PREMIUM SEDANS (180K - 220K AED) - Monthly Rate: 6,500 - 8,000 AED
UPDATE vehicles SET acquisition_cost = 195000, monthly_rate = 7200, daily_rate = 288, weekly_rate = 1728 WHERE make = 'BMW' AND model = '330i';
UPDATE vehicles SET acquisition_cost = 190000, monthly_rate = 7000, daily_rate = 280, weekly_rate = 1680 WHERE make = 'Audi' AND model = 'A4';
UPDATE vehicles SET acquisition_cost = 200000, monthly_rate = 7400, daily_rate = 296, weekly_rate = 1776 WHERE make = 'Mercedes-Benz' AND model = 'C-Class';
UPDATE vehicles SET acquisition_cost = 210000, monthly_rate = 7700, daily_rate = 308, weekly_rate = 1848 WHERE make = 'Cadillac' AND model = 'CT6';

-- PREMIUM SUVs (240K - 300K AED) - Monthly Rate: 8,500 - 11,000 AED
UPDATE vehicles SET acquisition_cost = 280000, monthly_rate = 10200, daily_rate = 408, weekly_rate = 2448 WHERE make = 'BMW' AND model = 'X5';
UPDATE vehicles SET acquisition_cost = 290000, monthly_rate = 10500, daily_rate = 420, weekly_rate = 2520 WHERE make = 'Mercedes-Benz' AND model = 'GLE';
UPDATE vehicles SET acquisition_cost = 275000, monthly_rate = 10000, daily_rate = 400, weekly_rate = 2400 WHERE make = 'Audi' AND model = 'Q7';
UPDATE vehicles SET acquisition_cost = 310000, monthly_rate = 11200, daily_rate = 448, weekly_rate = 2688 WHERE make = 'Porsche' AND model = 'Cayenne';

-- LUXURY SEDANS (380K - 450K AED) - Monthly Rate: 12,000 - 15,000 AED
UPDATE vehicles SET acquisition_cost = 420000, monthly_rate = 14000, daily_rate = 560, weekly_rate = 3360 WHERE make = 'BMW' AND model = '750i';
UPDATE vehicles SET acquisition_cost = 450000, monthly_rate = 14800, daily_rate = 592, weekly_rate = 3552 WHERE make = 'Mercedes-Benz' AND model = 'S-Class';
UPDATE vehicles SET acquisition_cost = 410000, monthly_rate = 13700, daily_rate = 548, weekly_rate = 3288 WHERE make = 'Audi' AND model = 'A8';

-- SPORTS CARS / CONVERTIBLES (200K - 250K AED) - Monthly Rate: 9,500 - 12,000 AED
UPDATE vehicles SET acquisition_cost = 220000, monthly_rate = 10500, daily_rate = 420, weekly_rate = 2520 WHERE make = 'Ford' AND model = 'Mustang Convertible';
UPDATE vehicles SET acquisition_cost = 215000, monthly_rate = 10300, daily_rate = 412, weekly_rate = 2472 WHERE make = 'Chevrolet' AND model = 'Camaro Convertible';
UPDATE vehicles SET acquisition_cost = 240000, monthly_rate = 11200, daily_rate = 448, weekly_rate = 2688 WHERE make = 'BMW' AND model = '430i Convertible';

-- PICKUP TRUCKS (140K - 160K AED) - Monthly Rate: 4,500 - 5,500 AED
UPDATE vehicles SET acquisition_cost = 155000, monthly_rate = 5200, daily_rate = 208, weekly_rate = 1248 WHERE make = 'Ford' AND model = 'F-150';
UPDATE vehicles SET acquisition_cost = 150000, monthly_rate = 5100, daily_rate = 204, weekly_rate = 1224 WHERE make = 'Chevrolet' AND model = 'Silverado';
UPDATE vehicles SET acquisition_cost = 142000, monthly_rate = 4900, daily_rate = 196, weekly_rate = 1176 WHERE make = 'Toyota' AND model = 'Hilux';
UPDATE vehicles SET acquisition_cost = 148000, monthly_rate = 5000, daily_rate = 200, weekly_rate = 1200 WHERE make = 'Nissan' AND model = 'Titan';

-- Apply depreciation for older models (2020-2022)
UPDATE vehicles SET 
  acquisition_cost = acquisition_cost * 0.90,
  monthly_rate = monthly_rate * 0.90,
  daily_rate = daily_rate * 0.90,
  weekly_rate = weekly_rate * 0.90
WHERE year = 2022 AND acquisition_cost IS NOT NULL;

UPDATE vehicles SET 
  acquisition_cost = acquisition_cost * 0.80,
  monthly_rate = monthly_rate * 0.80,
  daily_rate = daily_rate * 0.80,
  weekly_rate = weekly_rate * 0.80
WHERE year = 2021 AND acquisition_cost IS NOT NULL;

UPDATE vehicles SET 
  acquisition_cost = acquisition_cost * 0.70,
  monthly_rate = monthly_rate * 0.70,
  daily_rate = daily_rate * 0.70,
  weekly_rate = weekly_rate * 0.70
WHERE year <= 2020 AND acquisition_cost IS NOT NULL;

-- =============================================
-- STEP 3: Update cost sheet configuration with UAE market values
-- =============================================
UPDATE cost_sheet_configurations
SET 
  financing_rate_percent = 5.5,
  maintenance_per_month_aed = 350,
  insurance_per_month_aed = 450,
  registration_admin_per_month_aed = 125,
  other_costs_per_month_aed = 75,
  overhead_percent = 8.0,
  updated_at = NOW()
WHERE is_active = true;