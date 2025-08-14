-- Create agreement_lines table to store individual line items for agreements
CREATE TABLE public.agreement_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL,
  vehicle_class_id UUID,
  vehicle_id UUID,
  check_out_at TIMESTAMP WITH TIME ZONE,
  out_location_id TEXT,
  check_in_at TIMESTAMP WITH TIME ZONE,
  in_location_id TEXT,
  drivers JSONB DEFAULT '[]'::jsonb,
  rate_breakdown JSONB DEFAULT '{}'::jsonb,
  additions JSONB DEFAULT '[]'::jsonb,
  discount JSONB,
  tax_id UUID,
  tax_value NUMERIC,
  line_net NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on agreement_lines
ALTER TABLE public.agreement_lines ENABLE ROW LEVEL SECURITY;

-- Create policies for agreement_lines
CREATE POLICY "agreement_lines_customer" 
ON public.agreement_lines 
FOR ALL 
USING (agreement_id IN (
  SELECT agreements.id FROM agreements 
  WHERE agreements.customer_id IN (
    SELECT profiles.id FROM profiles 
    WHERE profiles.user_id = auth.uid()
  )
));

CREATE POLICY "agreement_lines_staff" 
ON public.agreement_lines 
FOR ALL 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.agreement_lines 
ADD CONSTRAINT agreement_lines_agreement_id_fkey 
FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agreement_lines_updated_at
BEFORE UPDATE ON public.agreement_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add converted_agreement_id to reservations table to track conversions
ALTER TABLE public.reservations 
ADD COLUMN converted_agreement_id UUID REFERENCES agreements(id);

-- Add agreement_no column to agreements table for human-readable identifiers
ALTER TABLE public.agreements 
ADD COLUMN agreement_no TEXT UNIQUE;

-- Create function to generate agreement numbers
CREATE OR REPLACE FUNCTION generate_agreement_no()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    agreement_no TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(agreement_no FROM 'AGR-(\d+)') AS INTEGER)), 0) + 1 
    INTO next_num 
    FROM agreements 
    WHERE agreement_no IS NOT NULL;
    
    agreement_no := 'AGR-' || LPAD(next_num::TEXT, 6, '0');
    RETURN agreement_no;
END;
$$ LANGUAGE plpgsql;