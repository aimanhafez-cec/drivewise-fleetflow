-- Update existing vehicles with demo photos
UPDATE vehicles 
SET photo_url = '/src/assets/demo-vehicles/toyota-camry.jpg'
WHERE make = 'Toyota' AND model = 'Corolla' AND id = '31e58d7b-fb8a-4ec5-860c-fceba278e73f';

UPDATE vehicles 
SET photo_url = '/src/assets/nissan-versa.jpg'
WHERE make = 'Nissan' AND model = 'Versa' AND id = 'f5e214d9-ef73-4ab6-9345-6e3812cab5f4';

UPDATE vehicles 
SET photo_url = '/src/assets/demo-vehicles/honda-civic.jpg'
WHERE make = 'Honda' AND model = 'Civic' AND id = '12b2e04f-ace4-4b64-8904-3affdd281d40';