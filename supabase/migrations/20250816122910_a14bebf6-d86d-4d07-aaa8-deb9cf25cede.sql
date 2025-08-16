-- Create inspection_out table for pre-rental inspections
CREATE TABLE public.inspection_out (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL,
  line_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SIGNED', 'LOCKED')),
  
  -- Checklist data
  checklist JSONB NOT NULL DEFAULT '{}',
  
  -- Vehicle metrics
  metrics JSONB NOT NULL DEFAULT '{}',
  
  -- Related damage markers (stored separately in damage_markers table)
  damage_marker_ids TEXT[] DEFAULT '{}',
  
  -- Media uploads
  media JSONB DEFAULT '[]',
  
  -- Signature data
  signature JSONB DEFAULT NULL,
  
  -- Audit fields
  performed_by_user_id UUID,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_info TEXT,
  location_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inspection_out ENABLE ROW LEVEL SECURITY;

-- Create policies for inspection_out
CREATE POLICY "inspection_out_all" 
ON public.inspection_out 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_inspection_out_agreement_id ON public.inspection_out(agreement_id);
CREATE INDEX idx_inspection_out_line_id ON public.inspection_out(line_id);
CREATE INDEX idx_inspection_out_status ON public.inspection_out(status);

-- Create trigger for updated_at
CREATE TRIGGER update_inspection_out_updated_at
BEFORE UPDATE ON public.inspection_out
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if agreement has locked out inspection
CREATE OR REPLACE FUNCTION public.agreement_has_locked_out_inspection(agreement_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.inspection_out 
    WHERE agreement_id = agreement_id_param 
    AND status = 'LOCKED'
  );
END;
$$;