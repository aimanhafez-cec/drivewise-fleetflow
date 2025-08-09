-- Corrected migration: create quotes and inspections with RLS (no IF NOT EXISTS on policies)

-- 1) Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  vehicle_id uuid NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', -- draft | sent | accepted | rejected | expired
  valid_until date NULL,
  notes text NULL,
  quote_number text NOT NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- indexes / constraints
CREATE UNIQUE INDEX IF NOT EXISTS quotes_quote_number_key ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS quotes_customer_id_idx ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON public.quotes(status);

DO $$ BEGIN
  ALTER TABLE public.quotes
    ADD CONSTRAINT quotes_vehicle_id_fkey
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Recreate policies to avoid existence issues
DROP POLICY IF EXISTS quotes_customer ON public.quotes;
CREATE POLICY quotes_customer
ON public.quotes
FOR ALL
USING (
  customer_id IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS quotes_staff ON public.quotes;
CREATE POLICY quotes_staff
ON public.quotes
FOR ALL
USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- 2) Inspections table (independent)
CREATE TABLE IF NOT EXISTS public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  reservation_id uuid NULL,
  performed_by uuid NULL,
  inspection_date timestamptz NOT NULL DEFAULT now(),
  odometer integer NULL,
  fuel_level integer NULL,
  notes text NULL,
  checklist jsonb NULL DEFAULT '{}'::jsonb,
  photos text[] NULL DEFAULT ARRAY[]::text[],
  status text NULL DEFAULT 'passed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE public.inspections
    ADD CONSTRAINT inspections_vehicle_id_fkey
    FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.inspections
    ADD CONSTRAINT inspections_reservation_id_fkey
    FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS inspections_vehicle_id_idx ON public.inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS inspections_date_idx ON public.inspections(inspection_date DESC);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inspections_all ON public.inspections;
CREATE POLICY inspections_all
ON public.inspections
FOR ALL
USING (true);

DROP TRIGGER IF EXISTS update_inspections_updated_at ON public.inspections;
CREATE TRIGGER update_inspections_updated_at
BEFORE UPDATE ON public.inspections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();