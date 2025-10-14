-- Create addon_items master catalog table
CREATE TABLE IF NOT EXISTS public.addon_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_code TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('monthly', 'one-time')),
  default_unit_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AED',
  uom TEXT NOT NULL DEFAULT 'each',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.addon_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active addon items
CREATE POLICY "Everyone can view active addon items"
  ON public.addon_items
  FOR SELECT
  USING (is_active = true);

-- Staff can manage all addon items
CREATE POLICY "Staff can manage addon items"
  ON public.addon_items
  FOR ALL
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_addon_items_active ON public.addon_items(is_active, display_order);
CREATE INDEX idx_addon_items_category ON public.addon_items(category);

-- Add trigger for updated_at
CREATE TRIGGER update_addon_items_updated_at
  BEFORE UPDATE ON public.addon_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial addon items
INSERT INTO public.addon_items (item_code, item_name, description, category, pricing_model, default_unit_price, display_order) VALUES
  ('GPS-001', 'GPS Navigation System', 'Portable GPS device with latest maps', 'electronics', 'monthly', 150, 10),
  ('CHILD-SEAT-001', 'Child Safety Seat', 'Forward-facing child seat (15-36kg)', 'safety', 'monthly', 100, 20),
  ('CHILD-SEAT-002', 'Infant Car Seat', 'Rear-facing infant seat (0-13kg)', 'safety', 'monthly', 100, 21),
  ('CHILD-SEAT-003', 'Booster Seat', 'Booster seat (22-36kg)', 'safety', 'monthly', 80, 22),
  ('WIFI-001', 'Wi-Fi Hotspot Device', 'Mobile Wi-Fi hotspot with unlimited data', 'electronics', 'monthly', 200, 30),
  ('DRIVER-ADD-001', 'Additional Driver Fee', 'Fee for adding extra authorized driver', 'services', 'one-time', 300, 40),
  ('DELIVERY-001', 'Vehicle Delivery Service', 'Door-to-door vehicle delivery within city', 'services', 'one-time', 200, 50),
  ('PICKUP-001', 'Vehicle Pickup Service', 'Door-to-door vehicle collection service', 'services', 'one-time', 200, 51),
  ('FUEL-PREPAY-001', 'Fuel Prepayment', 'Prepay for full tank of fuel', 'services', 'one-time', 250, 60),
  ('TOLL-TAG-001', 'Salik/Darb Tag', 'Toll tag device (charges billed separately)', 'electronics', 'monthly', 50, 70),
  ('DASHCAM-001', 'Dashboard Camera', 'Front and rear dashcam recording', 'electronics', 'monthly', 150, 80),
  ('PHONE-MOUNT-001', 'Phone Mount & Charger', 'Magnetic phone mount with USB charger', 'accessories', 'one-time', 50, 90),
  ('TRUNK-ORG-001', 'Trunk Organizer', 'Collapsible trunk storage organizer', 'accessories', 'one-time', 75, 91),
  ('FLOOR-MAT-001', 'All-Weather Floor Mats', 'Premium rubber floor mat set', 'accessories', 'one-time', 100, 92),
  ('CLEAN-DETAIL-001', 'Interior Deep Cleaning', 'Professional interior detailing service', 'services', 'one-time', 300, 100),
  ('WINTER-TIRE-001', 'Winter Tire Package', 'Complete winter tire installation', 'seasonal', 'one-time', 800, 110),
  ('ROOF-BOX-001', 'Roof Cargo Box', 'Large capacity roof-mounted cargo box', 'accessories', 'monthly', 250, 120),
  ('BIKE-RACK-001', 'Bicycle Rack', 'Roof or hitch-mounted bike rack (2 bikes)', 'accessories', 'monthly', 200, 121),
  ('SKI-RACK-001', 'Ski/Snowboard Rack', 'Roof-mounted ski/snowboard carrier', 'seasonal', 'monthly', 150, 122);