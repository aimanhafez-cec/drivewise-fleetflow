-- Use the local demo images that we know work for rows 4 and 6
-- Row 4: BMW 750i (OPQ-0123) - use local BMW demo image
UPDATE vehicles 
SET photo_url = '/demo-vehicles/bmw-x5.jpg'
WHERE license_plate = 'OPQ-0123';

-- Row 6: Cadillac CT6 (UVW-8901) - use local Mercedes demo image as fallback
UPDATE vehicles 
SET photo_url = '/demo-vehicles/mercedes-c-class.jpg'  
WHERE license_plate = 'UVW-8901';

-- Also let's try a different approach for these problem vehicles with simple, well-known URLs
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop'
WHERE license_plate = 'OPQ-0123';

UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop'
WHERE license_plate = 'UVW-8901';