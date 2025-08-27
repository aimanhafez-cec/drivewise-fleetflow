-- Update vehicle photo URLs to point to public folder
UPDATE vehicles 
SET photo_url = '/demo-vehicles/toyota-camry.jpg'
WHERE make = 'Toyota' AND model = 'Corolla' AND id = '31e58d7b-fb8a-4ec5-860c-fceba278e73f';

UPDATE vehicles 
SET photo_url = '/nissan-versa.jpg'
WHERE make = 'Nissan' AND model = 'Versa' AND id = 'f5e214d9-ef73-4ab6-9345-6e3812cab5f4';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/honda-civic.jpg'
WHERE make = 'Honda' AND model = 'Civic' AND id = '12b2e04f-ace4-4b64-8904-3affdd281d40';

-- Add more demo photos to other vehicles
UPDATE vehicles 
SET photo_url = '/demo-vehicles/bmw-x5.jpg'
WHERE make = 'Hyundai' AND model = 'Elantra' AND id = '80e9edc8-b7ed-4fc6-9ee6-6521014720f2';

UPDATE vehicles 
SET photo_url = '/demo-vehicles/ford-f150.jpg'
WHERE make = 'Kia' AND model = 'Rio' AND id = '65a9ee52-f6be-432c-b43a-671b9ab7254f';