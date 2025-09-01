-- Update all vehicles with appropriate photos
-- First, use local demo images where available
UPDATE vehicles SET photo_url = '/demo-vehicles/toyota-camry.jpg' WHERE make = 'Toyota' AND model IN ('Camry', 'Corolla', 'RAV4');
UPDATE vehicles SET photo_url = '/demo-vehicles/honda-civic.jpg' WHERE make = 'Honda' AND model IN ('Civic', 'Accord', 'CR-V');
UPDATE vehicles SET photo_url = '/demo-vehicles/bmw-x5.jpg' WHERE make = 'BMW';
UPDATE vehicles SET photo_url = '/demo-vehicles/mercedes-c-class.jpg' WHERE make = 'Mercedes-Benz';
UPDATE vehicles SET photo_url = '/demo-vehicles/ford-f150.jpg' WHERE make = 'Ford';

-- Add photos for all other makes/models using Unsplash
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1549399728-8e08c5a4dccf?w=400&h=300&fit=crop' WHERE make = 'Mazda';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop' WHERE make = 'Volkswagen';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop' WHERE make = 'Subaru';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1617469165786-8007eda739c7?w=400&h=300&fit=crop' WHERE make = 'Nissan';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop' WHERE make = 'Hyundai';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop' WHERE make = 'Buick';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1580414629981-16de8c9b81f3?w=400&h=300&fit=crop' WHERE make = 'Audi';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop' WHERE make = 'Chevrolet';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop' WHERE make = 'Kia';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop' WHERE make = 'Cadillac';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1606016159991-4c72c0354c49?w=400&h=300&fit=crop' WHERE make = 'Chrysler';

-- Set a default car image for any remaining vehicles without photos
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1549399728-8e08c5a4dccf?w=400&h=300&fit=crop' WHERE photo_url IS NULL;