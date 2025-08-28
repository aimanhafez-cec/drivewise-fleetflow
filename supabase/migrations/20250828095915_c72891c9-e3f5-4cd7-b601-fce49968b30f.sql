-- Create enum types for Car Subscription system
CREATE TYPE public.subscription_model AS ENUM ('By Class', 'By Specific VIN');
CREATE TYPE public.renewal_cycle AS ENUM ('Monthly (anniversary)', '3-Monthly');
CREATE TYPE public.minimum_commitment AS ENUM ('None', '1', '3', '6');
CREATE TYPE public.cancellation_notice AS ENUM ('0', '7', '14', '30');
CREATE TYPE public.subscription_plan AS ENUM ('Essential', 'Standard', 'Premium', 'Custom');
CREATE TYPE public.suspension_behavior AS ENUM ('Disallow driving', 'Notice only');
CREATE TYPE public.geo_restrictions AS ENUM ('UAE-only', 'GCC Allowed', 'Off-road Prohibited');
CREATE TYPE public.salik_handling AS ENUM ('Rebill Actual', 'Included Allowance');
CREATE TYPE public.payment_method_type AS ENUM ('Card Autopay', 'Direct Debit', 'Invoice (Corporate)');
CREATE TYPE public.swap_frequency AS ENUM ('1 per month', '1 per quarter', 'None');
CREATE TYPE public.insurance_type AS ENUM ('Comprehensive', 'Basic', 'Customer''s Own');
CREATE TYPE public.maintenance_inclusion AS ENUM ('Included', 'Excluded');
CREATE TYPE public.replacement_sla_unit AS ENUM ('Hours', 'Days');
CREATE TYPE public.billing_day_type AS ENUM ('Anniversary', '1st', '15th');
CREATE TYPE public.mileage_rollover AS ENUM ('No', 'Yes');
CREATE TYPE public.vehicle_swap_rules AS ENUM ('Same class', 'Up to +1 class (fee)');
CREATE TYPE public.early_cancellation_fee_type AS ENUM ('None', 'Fixed AED', '% of remaining month');
CREATE TYPE public.maintenance_trigger AS ENUM ('Every X km', 'Every Y months', 'Both (first due)');
CREATE TYPE public.preferred_workshop AS ENUM ('OEM', 'In-house', 'Partner');
CREATE TYPE public.condition_report_cadence AS ENUM ('On start', 'On swap', 'Monthly');
CREATE TYPE public.swap_request_flow AS ENUM ('Self-service App', 'Call Center', 'Branch');
CREATE TYPE public.final_billing_type AS ENUM ('Pro-rata', 'Full month');
CREATE TYPE public.car_subscription_status AS ENUM ('draft', 'active', 'suspended', 'cancelled', 'expired');

-- Create main car_subscriptions table
CREATE TABLE public.car_subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id TEXT UNIQUE,
    
    -- Agreement & Parties
    rental_type TEXT NOT NULL DEFAULT 'Car Subscription',
    customer_type customer_type NOT NULL,
    customer_id UUID NOT NULL,
    bill_to_contact TEXT,
    
    -- Vehicle / Class
    subscription_model subscription_model NOT NULL DEFAULT 'By Class',
    vehicle_class_id UUID,
    vehicle_id UUID,
    plate_no TEXT,
    odometer_out INTEGER,
    
    -- Terms & Flexibility
    start_date DATE NOT NULL,
    renewal_cycle renewal_cycle NOT NULL DEFAULT 'Monthly (anniversary)',
    minimum_commitment minimum_commitment NOT NULL DEFAULT 'None',
    cancellation_notice cancellation_notice NOT NULL DEFAULT '14',
    swap_allowed BOOLEAN NOT NULL DEFAULT true,
    swap_frequency swap_frequency NOT NULL DEFAULT '1 per month',
    pause_freeze_allowed BOOLEAN NOT NULL DEFAULT false,
    pause_freeze_limit INTEGER,
    
    -- Pricing & Billing
    plan subscription_plan NOT NULL DEFAULT 'Standard',
    monthly_fee NUMERIC NOT NULL,
    included_km_month INTEGER NOT NULL,
    excess_km_rate NUMERIC NOT NULL,
    extra_drivers_included INTEGER NOT NULL DEFAULT 0,
    delivery_collection TEXT NOT NULL DEFAULT 'Included',
    upgrade_downgrade_fee NUMERIC,
    joining_setup_fee NUMERIC,
    vat_code TEXT NOT NULL DEFAULT '5% (standard)',
    billing_day billing_day_type NOT NULL DEFAULT 'Anniversary',
    
    -- Inclusions
    insurance insurance_type NOT NULL DEFAULT 'Comprehensive',
    maintenance maintenance_inclusion NOT NULL DEFAULT 'Included',
    tyres maintenance_inclusion NOT NULL DEFAULT 'Included',
    roadside_assistance maintenance_inclusion NOT NULL DEFAULT 'Included',
    registration_renewal maintenance_inclusion NOT NULL DEFAULT 'Included',
    replacement_vehicle maintenance_inclusion NOT NULL DEFAULT 'Included',
    replacement_sla INTEGER,
    replacement_sla_unit replacement_sla_unit DEFAULT 'Hours',
    
    -- Tolls & Fines
    salik_darb_handling salik_handling NOT NULL DEFAULT 'Rebill Actual',
    salik_darb_allowance_cap NUMERIC,
    admin_fee_model TEXT,
    traffic_fines_handling TEXT NOT NULL DEFAULT 'Auto Rebill + Admin Fee',
    admin_fee_per_fine NUMERIC DEFAULT 50,
    
    -- Payments & Collections
    security_deposit TEXT NOT NULL DEFAULT 'Waived',
    deposit_amount NUMERIC,
    payment_method payment_method_type NOT NULL DEFAULT 'Card Autopay',
    auto_charge_retries INTEGER NOT NULL DEFAULT 2,
    dunning_rules TEXT NOT NULL DEFAULT 'Email/SMS Day 0/3/7 → Suspend Day X',
    suspension_behavior suspension_behavior NOT NULL DEFAULT 'Notice only',
    
    -- Usage & Policy
    geo_restrictions geo_restrictions NOT NULL DEFAULT 'UAE-only',
    mileage_rollover mileage_rollover NOT NULL DEFAULT 'No',
    vehicle_swap_rules vehicle_swap_rules NOT NULL DEFAULT 'Same class',
    early_cancellation_fee early_cancellation_fee_type NOT NULL DEFAULT 'Fixed AED',
    early_cancellation_amount NUMERIC DEFAULT 300,
    contract_freeze_fee NUMERIC,
    
    -- Operations & Service
    maintenance_trigger maintenance_trigger NOT NULL DEFAULT 'Both (first due)',
    maintenance_km_interval INTEGER DEFAULT 10000,
    maintenance_month_interval INTEGER DEFAULT 12,
    auto_create_service_jobs BOOLEAN NOT NULL DEFAULT true,
    preferred_workshop preferred_workshop NOT NULL DEFAULT 'Partner',
    telematics_device BOOLEAN DEFAULT false,
    telematics_device_id TEXT,
    tracking_consent BOOLEAN DEFAULT false,
    condition_report_cadence condition_report_cadence NOT NULL DEFAULT 'On start & on swap',
    
    -- Renewal / Swap / Exit
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    swap_request_flow swap_request_flow NOT NULL DEFAULT 'Self-service App',
    exit_inspection BOOLEAN NOT NULL DEFAULT true,
    buyout_offer BOOLEAN DEFAULT false,
    buyout_amount NUMERIC,
    final_billing final_billing_type NOT NULL DEFAULT 'Pro-rata',
    
    -- Handover (conditional)
    condition_report_out JSONB,
    fuel_level_out TEXT,
    
    -- Status and metadata
    status car_subscription_status NOT NULL DEFAULT 'draft',
    contract_start_date DATE,
    contract_end_date DATE,
    signed_date DATE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    notes TEXT
);

-- Create supporting tables
CREATE TABLE public.subscription_primary_drivers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.car_subscriptions(id) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    mobile TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_kyc_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.car_subscriptions(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_swap_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.car_subscriptions(id) ON DELETE CASCADE,
    old_vehicle_id UUID,
    new_vehicle_id UUID,
    swap_date DATE NOT NULL,
    swap_reason TEXT,
    upgrade_fee NUMERIC DEFAULT 0,
    odometer_in INTEGER,
    odometer_out INTEGER,
    fuel_level_in TEXT,
    fuel_level_out TEXT,
    condition_report_in JSONB,
    condition_report_out JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_billing_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.car_subscriptions(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    base_monthly_fee NUMERIC NOT NULL,
    included_km INTEGER NOT NULL,
    actual_km INTEGER,
    excess_km INTEGER DEFAULT 0,
    excess_km_charges NUMERIC DEFAULT 0,
    salik_darb_charges NUMERIC DEFAULT 0,
    fine_charges NUMERIC DEFAULT 0,
    admin_fees NUMERIC DEFAULT 0,
    other_charges NUMERIC DEFAULT 0,
    subtotal NUMERIC NOT NULL,
    vat_amount NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    invoice_id UUID,
    billing_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.subscription_usage_tracking (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES public.car_subscriptions(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL,
    odometer_reading INTEGER,
    km_driven INTEGER DEFAULT 0,
    salik_darb_events INTEGER DEFAULT 0,
    salik_darb_amount NUMERIC DEFAULT 0,
    location_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.car_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_primary_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_swap_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Staff can manage all car subscriptions" ON public.car_subscriptions FOR ALL USING (true);
CREATE POLICY "Staff can manage subscription drivers" ON public.subscription_primary_drivers FOR ALL USING (true);
CREATE POLICY "Staff can manage subscription documents" ON public.subscription_kyc_documents FOR ALL USING (true);
CREATE POLICY "Staff can manage subscription swaps" ON public.subscription_swap_history FOR ALL USING (true);
CREATE POLICY "Staff can manage subscription billing" ON public.subscription_billing_history FOR ALL USING (true);
CREATE POLICY "Staff can manage subscription usage" ON public.subscription_usage_tracking FOR ALL USING (true);

-- Create subscription ID generation function
CREATE OR REPLACE FUNCTION public.generate_subscription_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    next_num INTEGER;
    result_subscription_id TEXT;
BEGIN
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(car_subscriptions.subscription_id FROM 'SUB-(\d+)') AS INTEGER)) 
         FROM public.car_subscriptions 
         WHERE car_subscriptions.subscription_id IS NOT NULL AND car_subscriptions.subscription_id ~ '^SUB-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    result_subscription_id := 'SUB-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_subscription_id;
END;
$function$;

-- Create trigger for updated_at
CREATE TRIGGER update_car_subscriptions_updated_at
    BEFORE UPDATE ON public.car_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();