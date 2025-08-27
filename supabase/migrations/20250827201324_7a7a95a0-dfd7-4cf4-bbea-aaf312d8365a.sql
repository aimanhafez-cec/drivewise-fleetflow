-- Update vehicles with demo photos based on make/model matches
UPDATE vehicles 
SET photo_url = '/demo-vehicles/toyota-camry.jpg'
WHERE make = 'Toyota' AND model = 'Camry';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/honda-civic.jpg'
WHERE make = 'Honda' AND model IN ('Civic', 'Accord', 'CR-V');

UPDATE vehicles 
SET photo_url = '/demo-vehicles/bmw-x5.jpg'
WHERE make = 'BMW';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/mercedes-c-class.jpg'
WHERE make = 'Mercedes';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/ford-f150.jpg'
WHERE make = 'Ford';

-- Add realistic photo URLs for other vehicle makes/models
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1549399728-8e08c5a4dccf?w=400&h=300&fit=crop'
WHERE make = 'Mazda' AND model = 'Mazda3';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop'
WHERE make = 'Volkswagen' AND model = 'Jetta';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop'
WHERE make = 'Subaru' AND model = 'Impreza';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1617469165786-8007eda739c7?w=400&h=300&fit=crop'
WHERE make = 'Nissan' AND model = 'Altima';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop'
WHERE make = 'Hyundai' AND model = 'Sonata';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop'
WHERE make = 'Buick' AND model = 'LaCrosse';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/toyota-camry.jpg'
WHERE make = 'Toyota' AND model = 'RAV4';