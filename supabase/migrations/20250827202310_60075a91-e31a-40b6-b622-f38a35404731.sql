-- Fix photos for the first few vehicles that might not be appearing correctly
-- Using more reliable car photo URLs

-- Line 1: Audi A4
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE license_plate = 'LMN-6789';

-- Line 2: BMW 330i  
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE license_plate = 'FGH-8901';

-- Line 8: Chevrolet Equinox
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE license_plate = 'VWX234';

-- Line 10: Chrysler 300
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1580414629981-16de8c9b81f3?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE license_plate = 'NOP-4567';

-- Also fix any remaining problematic URLs with more reliable ones
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE make = 'BMW' AND model = '430i Convertible';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1599912027806-cfb0c13aba8a?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE make = 'BMW' AND model = '750i';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE make = 'Buick' AND model = 'LaCrosse';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1606152421802-db97b2c92669?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE make = 'Cadillac' AND model = 'CT6';

-- Fix any remaining vehicles with unreliable photos
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop&auto=format&bg=white'
WHERE photo_url IS NULL OR photo_url = '';