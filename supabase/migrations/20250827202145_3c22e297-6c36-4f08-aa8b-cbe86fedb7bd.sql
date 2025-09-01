-- Fix the Chevrolet Malibu photo that shows bicycles
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop&bg=white'
WHERE license_plate = 'KLM-0123';

-- Update all Chevrolet vehicles with better, car-specific photos
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&bg=white'
WHERE make = 'Chevrolet' AND model = 'Camaro Convertible';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop&bg=white'
WHERE make = 'Chevrolet' AND model = 'Malibu';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1617469165786-8007eda739c7?w=400&h=300&fit=crop&bg=white'
WHERE make = 'Chevrolet' AND model = 'Equinox';

-- Also fix any other potentially problematic photos
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1580414629981-16de8c9b81f3?w=400&h=300&fit=crop&bg=white'
WHERE make = 'Audi' AND model = 'A4';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1606152421802-db97b2c92669?w=400&h=300&fit=crop&bg=white'
WHERE make = 'BMW' AND model = '330i';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&bg=white'
WHERE make = 'BMW' AND model = '430i Convertible';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&bg=white'
WHERE make = 'BMW' AND model = '750i';