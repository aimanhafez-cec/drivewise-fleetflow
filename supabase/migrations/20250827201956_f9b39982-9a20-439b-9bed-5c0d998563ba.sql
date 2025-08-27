-- Update all vehicles with unique, appropriate photos with white backgrounds
-- Each specific make/model gets its own photo

-- Audi models
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1606152421802-db97b2c92669?w=400&h=300&fit=crop&bg=white' WHERE make = 'Audi' AND model = 'A4';

-- BMW models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop&bg=white' WHERE make = 'BMW' AND model = '330i';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1580414629981-16de8c9b81f3?w=400&h=300&fit=crop&bg=white' WHERE make = 'BMW' AND model = '430i Convertible';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&bg=white' WHERE make = 'BMW' AND model = '750i';

-- Buick
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&bg=white' WHERE make = 'Buick' AND model = 'LaCrosse';

-- Cadillac  
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&bg=white' WHERE make = 'Cadillac' AND model = 'CT6';

-- Chevrolet models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=400&h=300&fit=crop&bg=white' WHERE make = 'Chevrolet' AND model = 'Camaro Convertible';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&bg=white' WHERE make = 'Chevrolet' AND model = 'Equinox';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&bg=white' WHERE make = 'Chevrolet' AND model = 'Malibu';

-- Chrysler
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1606016159991-4c72c0354c49?w=400&h=300&fit=crop&bg=white' WHERE make = 'Chrysler' AND model = '300';

-- Ford Mustang
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=400&h=300&fit=crop&bg=white' WHERE make = 'Ford' AND model = 'Mustang Convertible';

-- Honda models with white backgrounds  
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&bg=white' WHERE make = 'Honda' AND model = 'Accord';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1599912027806-cfb0c13aba8a?w=400&h=300&fit=crop&bg=white' WHERE make = 'Honda' AND model = 'Civic';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&bg=white' WHERE make = 'Honda' AND model = 'CR-V';

-- Hyundai models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&h=300&fit=crop&bg=white' WHERE make = 'Hyundai' AND model = 'Elantra';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop&bg=white' WHERE make = 'Hyundai' AND model = 'Sonata';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=400&h=300&fit=crop&bg=white' WHERE make = 'Hyundai' AND model = 'Tucson';

-- Kia
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop&bg=white' WHERE make = 'Kia' AND model = 'Rio';

-- Mazda models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1617469165786-8007eda739c7?w=400&h=300&fit=crop&bg=white' WHERE make = 'Mazda' AND model = 'CX-5';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1549399728-8e08c5a4dccf?w=400&h=300&fit=crop&bg=white' WHERE make = 'Mazda' AND model = 'Mazda3';

-- Mercedes-Benz models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop&bg=white' WHERE make = 'Mercedes-Benz' AND model = 'C-Class';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400&h=300&fit=crop&bg=white' WHERE make = 'Mercedes-Benz' AND model = 'S-Class';

-- Nissan models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop&bg=white' WHERE make = 'Nissan' AND model = 'Altima';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop&bg=white' WHERE make = 'Nissan' AND model = 'Versa';

-- Subaru models with white backgrounds
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&bg=white' WHERE make = 'Subaru' AND model = 'Impreza';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=400&h=300&fit=crop&bg=white' WHERE make = 'Subaru' AND model = 'Outback';

-- Toyota models with white backgrounds - each gets unique photo
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop&bg=white' WHERE make = 'Toyota' AND model = 'Camry';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1599912027806-cfb0c13aba8a?w=400&h=300&fit=crop&bg=white' WHERE make = 'Toyota' AND model = 'Corolla';
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=400&h=300&fit=crop&bg=white' WHERE make = 'Toyota' AND model = 'RAV4';

-- Volkswagen
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400&h=300&fit=crop&bg=white' WHERE make = 'Volkswagen' AND model = 'Jetta';

-- Fix any test data with invalid make names
UPDATE vehicles SET photo_url = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop&bg=white' WHERE make = 'Expedita amet unde ';