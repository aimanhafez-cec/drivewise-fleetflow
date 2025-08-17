-- Create drivers table for driver management
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  license_no TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  date_of_birth DATE,
  license_expiry DATE,
  status TEXT NOT NULL DEFAULT 'active',
  additional_driver_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create policies for driver access
CREATE POLICY "Drivers viewable by all authenticated users" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Staff can manage drivers" 
ON public.drivers 
FOR ALL 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample drivers for testing
INSERT INTO public.drivers (full_name, license_no, phone, email, date_of_birth, license_expiry, additional_driver_fee) VALUES
('John Smith', 'DL123456', '+1-555-0101', 'john.smith@email.com', '1985-03-15', '2025-03-15', 25.00),
('Sarah Johnson', 'DL789012', '+1-555-0102', 'sarah.j@email.com', '1990-07-22', '2025-07-22', 25.00),
('Mike Davis', 'DL345678', '+1-555-0103', 'mike.davis@email.com', '1988-11-08', '2024-12-15', 25.00),
('Emily Wilson', 'DL901234', '+1-555-0104', 'emily.w@email.com', '1992-05-30', '2025-05-30', 25.00),
('Robert Brown', 'DL567890', '+1-555-0105', 'robert.b@email.com', '2000-01-10', '2025-01-10', 50.00),
('Lisa Anderson', 'DL234567', '+1-555-0106', 'lisa.a@email.com', '1995-12-03', '2025-12-03', 25.00);