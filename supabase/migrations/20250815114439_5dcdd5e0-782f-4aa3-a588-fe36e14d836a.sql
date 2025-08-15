-- Create RFQ status enum
CREATE TYPE public.rfq_status AS ENUM ('new', 'under_review', 'quoted', 'cancelled');

-- Create RFQs table
CREATE TABLE public.rfqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfq_no TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL,
  pickup_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_loc_id TEXT NOT NULL,
  return_at TIMESTAMP WITH TIME ZONE NOT NULL,
  return_loc_id TEXT NOT NULL,
  vehicle_type_id UUID,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  status rfq_status NOT NULL DEFAULT 'new',
  created_by UUID,
  salesperson_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on RFQs
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for RFQs
CREATE POLICY "rfqs_customer" 
ON public.rfqs 
FOR ALL 
USING (customer_id IN (
  SELECT profiles.id 
  FROM profiles 
  WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "rfqs_staff" 
ON public.rfqs 
FOR ALL 
USING (true);

-- Add rfq_id to quotes table
ALTER TABLE public.quotes ADD COLUMN rfq_id UUID REFERENCES public.rfqs(id);

-- Create function to generate RFQ numbers
CREATE OR REPLACE FUNCTION public.generate_rfq_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    next_num INTEGER;
    result_rfq_no TEXT;
BEGIN
    -- Get the next number, starting from 1 if no RFQs exist
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(rfqs.rfq_no FROM 'RFQ-(\d+)') AS INTEGER)) 
         FROM public.rfqs 
         WHERE rfqs.rfq_no IS NOT NULL AND rfqs.rfq_no ~ '^RFQ-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    -- Generate the RFQ number with zero padding
    result_rfq_no := 'RFQ-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_rfq_no;
END;
$$;

-- Create trigger for RFQ updated_at
CREATE TRIGGER update_rfqs_updated_at
BEFORE UPDATE ON public.rfqs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();