-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_no TEXT NOT NULL,
  customer_id UUID NOT NULL,
  pickup_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pickup_loc_id TEXT NOT NULL,
  return_at TIMESTAMP WITH TIME ZONE NOT NULL,
  return_loc_id TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  fx_rate NUMERIC DEFAULT 1.0,
  base_currency TEXT NOT NULL DEFAULT 'USD',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_total NUMERIC NOT NULL DEFAULT 0,
  discount_total NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  bill_to_type TEXT NOT NULL DEFAULT 'customer',
  bill_to_id UUID,
  status TEXT NOT NULL DEFAULT 'draft',
  expires_at DATE,
  terms TEXT,
  created_by UUID,
  approved_by UUID,
  version_of UUID,
  version_no INTEGER NOT NULL DEFAULT 1,
  salesperson_id UUID,
  template_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_lines table
CREATE TABLE public.quote_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  vehicle_type_id UUID,
  vehicle_id UUID,
  qty INTEGER NOT NULL DEFAULT 1,
  rate_plan_id UUID,
  days INTEGER NOT NULL DEFAULT 1,
  base_rate NUMERIC NOT NULL DEFAULT 0,
  addons_total NUMERIC NOT NULL DEFAULT 0,
  misc_total NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_addons table
CREATE TABLE public.quote_addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID,
  quote_line_id UUID,
  addon_id UUID NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_code TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_taxes table
CREATE TABLE public.quote_taxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  tax_code TEXT NOT NULL,
  base NUMERIC NOT NULL DEFAULT 0,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_attachments table
CREATE TABLE public.quote_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote_events table
CREATE TABLE public.quote_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL,
  kind TEXT NOT NULL,
  at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meta JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quotes
CREATE POLICY "quotes_staff_all" ON public.quotes FOR ALL USING (true);
CREATE POLICY "quotes_customer_own" ON public.quotes FOR SELECT USING (customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create RLS policies for quote_lines
CREATE POLICY "quote_lines_staff_all" ON public.quote_lines FOR ALL USING (true);
CREATE POLICY "quote_lines_customer_own" ON public.quote_lines FOR SELECT USING (quote_id IN (SELECT id FROM quotes WHERE customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create RLS policies for quote_addons
CREATE POLICY "quote_addons_staff_all" ON public.quote_addons FOR ALL USING (true);
CREATE POLICY "quote_addons_customer_own" ON public.quote_addons FOR SELECT USING (quote_id IN (SELECT id FROM quotes WHERE customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create RLS policies for quote_taxes
CREATE POLICY "quote_taxes_staff_all" ON public.quote_taxes FOR ALL USING (true);
CREATE POLICY "quote_taxes_customer_own" ON public.quote_taxes FOR SELECT USING (quote_id IN (SELECT id FROM quotes WHERE customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create RLS policies for quote_attachments
CREATE POLICY "quote_attachments_staff_all" ON public.quote_attachments FOR ALL USING (true);
CREATE POLICY "quote_attachments_customer_own" ON public.quote_attachments FOR SELECT USING (quote_id IN (SELECT id FROM quotes WHERE customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create RLS policies for quote_events
CREATE POLICY "quote_events_staff_all" ON public.quote_events FOR ALL USING (true);
CREATE POLICY "quote_events_customer_own" ON public.quote_events FOR SELECT USING (quote_id IN (SELECT id FROM quotes WHERE customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION public.generate_quote_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    next_num INTEGER;
    current_year TEXT;
    result_quote_no TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get the next number for this year
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(quotes.quote_no FROM 'Q-' || current_year || '-(\d+)') AS INTEGER)) 
         FROM public.quotes 
         WHERE quotes.quote_no IS NOT NULL AND quotes.quote_no ~ ('^Q-' || current_year || '-\d+$')), 
        0
    ) + 1 INTO next_num;
    
    -- Generate the quote number with zero padding
    result_quote_no := 'Q-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN result_quote_no;
END;
$function$;

-- Create trigger to update updated_at columns
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_lines_updated_at
  BEFORE UPDATE ON public.quote_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_addons_updated_at
  BEFORE UPDATE ON public.quote_addons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quote_taxes_updated_at
  BEFORE UPDATE ON public.quote_taxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();