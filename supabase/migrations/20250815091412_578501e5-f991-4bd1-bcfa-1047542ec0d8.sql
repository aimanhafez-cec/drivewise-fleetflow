-- Create damage markers table
CREATE TABLE public.damage_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID,
  reservation_id UUID,
  line_id UUID NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('OUT', 'IN', 'EXCHANGE')),
  side TEXT NOT NULL CHECK (side IN ('FRONT', 'REAR', 'LEFT', 'RIGHT', 'TOP')),
  x DECIMAL NOT NULL CHECK (x >= 0 AND x <= 1),
  y DECIMAL NOT NULL CHECK (y >= 0 AND y <= 1),
  damage_type TEXT NOT NULL CHECK (damage_type IN ('SCRATCH', 'DENT', 'CRACK', 'PAINT', 'GLASS', 'TIRE', 'OTHER')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MED', 'HIGH')),
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vehicle exchanges table
CREATE TABLE public.vehicle_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL,
  line_id UUID NOT NULL,
  exchange_at TIMESTAMP WITH TIME ZONE NOT NULL,
  old_vehicle_id UUID NOT NULL,
  new_vehicle_id UUID NOT NULL,
  return_to_location_id TEXT,
  new_out_location_id TEXT,
  odometer_in_old INTEGER NOT NULL,
  fuel_in_old INTEGER NOT NULL,
  odometer_out_new INTEGER NOT NULL,
  fuel_out_new INTEGER NOT NULL,
  fees_added JSONB DEFAULT '[]'::jsonb,
  segment_a JSONB NOT NULL,
  segment_b JSONB NOT NULL,
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.damage_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_exchanges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "damage_markers_all" ON public.damage_markers FOR ALL USING (true);
CREATE POLICY "vehicle_exchanges_all" ON public.vehicle_exchanges FOR ALL USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_damage_markers_updated_at
  BEFORE UPDATE ON public.damage_markers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_exchanges_updated_at
  BEFORE UPDATE ON public.vehicle_exchanges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();