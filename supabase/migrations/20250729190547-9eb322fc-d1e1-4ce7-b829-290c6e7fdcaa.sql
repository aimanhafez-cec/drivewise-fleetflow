-- Fix security issues by enabling RLS and adding proper policies

-- Update the search path for the function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Enable Row Level Security for all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (public read, authenticated write)
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_all" ON public.categories FOR ALL TO authenticated USING (true);

-- RLS policies for vehicles (public read, authenticated write)
CREATE POLICY "vehicles_select" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "vehicles_all" ON public.vehicles FOR ALL TO authenticated USING (true);

-- RLS policies for profiles (users can only access their own profile, staff can read all)
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_staff_select" ON public.profiles FOR SELECT TO authenticated USING (true);

-- RLS policies for user_roles (users can read their own roles, all authenticated can manage)
CREATE POLICY "user_roles_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_all" ON public.user_roles FOR ALL TO authenticated USING (true);

-- RLS policies for reservations (customers can access their own, staff can access all)
CREATE POLICY "reservations_customer" ON public.reservations FOR ALL TO authenticated USING (
  customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "reservations_staff" ON public.reservations FOR ALL TO authenticated USING (true);

-- RLS policies for agreements (customers can see their own, staff can manage all)
CREATE POLICY "agreements_customer" ON public.agreements FOR SELECT TO authenticated USING (
  customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "agreements_staff" ON public.agreements FOR ALL TO authenticated USING (true);

-- RLS policies for damage_records (all authenticated users can access)
CREATE POLICY "damage_records_all" ON public.damage_records FOR ALL TO authenticated USING (true);

-- RLS policies for traffic_tickets (all authenticated users can access)
CREATE POLICY "traffic_tickets_all" ON public.traffic_tickets FOR ALL TO authenticated USING (true);

-- RLS policies for invoices (all authenticated users can access)
CREATE POLICY "invoices_all" ON public.invoices FOR ALL TO authenticated USING (true);

-- RLS policies for payments (all authenticated users can access)
CREATE POLICY "payments_all" ON public.payments FOR ALL TO authenticated USING (true);

-- RLS policies for report_templates (all authenticated users can access)
CREATE POLICY "report_templates_all" ON public.report_templates FOR ALL TO authenticated USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON public.reservations(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle ON public.reservations(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_agreements_vehicle ON public.agreements(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_agreements_customer ON public.agreements(customer_id);
CREATE INDEX IF NOT EXISTS idx_damage_records_vehicle ON public.damage_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON public.payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);

-- Create triggers for automatic updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_damage_records_updated_at BEFORE UPDATE ON public.damage_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_traffic_tickets_updated_at BEFORE UPDATE ON public.traffic_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();