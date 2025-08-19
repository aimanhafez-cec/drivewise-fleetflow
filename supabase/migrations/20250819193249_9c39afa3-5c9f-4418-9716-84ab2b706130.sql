-- Create inspection_in table for return inspections
CREATE TABLE public.inspection_in (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL,
  line_id UUID NOT NULL,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  media JSONB DEFAULT '[]'::jsonb,
  signature JSONB DEFAULT NULL,
  performed_by_user_id UUID DEFAULT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  damage_marker_ids TEXT[] DEFAULT '{}',
  device_info TEXT DEFAULT NULL,
  location_id TEXT DEFAULT NULL
);

-- Enable Row Level Security
ALTER TABLE public.inspection_in ENABLE ROW LEVEL SECURITY;

-- Create policy for inspection_in (same as inspection_out)
CREATE POLICY "inspection_in_all" 
ON public.inspection_in 
FOR ALL 
USING (true);

-- Create function to check if agreement has locked in inspection
CREATE OR REPLACE FUNCTION public.agreement_has_locked_in_inspection(agreement_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.inspection_in 
    WHERE agreement_id = agreement_id_param 
    AND status = 'LOCKED'
  );
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_inspection_in_updated_at
BEFORE UPDATE ON public.inspection_in
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();