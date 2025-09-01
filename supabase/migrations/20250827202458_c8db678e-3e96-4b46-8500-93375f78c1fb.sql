-- Fix the specific vehicles that aren't showing photos
-- Row 4: BMW 750i (OPQ-0123)
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1617469165786-8007eda739c7?w=400&h=300&fit=crop'
WHERE license_plate = 'OPQ-0123';

-- Row 6: Cadillac CT6 (UVW-8901)
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1549399728-8e08c5a4dccf?w=400&h=300&fit=crop'
WHERE license_plate = 'UVW-8901';

-- Row 10: Chrysler 300 (NOP-4567)  
UPDATE vehicles 
SET photo_url = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop'
WHERE license_plate = 'NOP-4567';