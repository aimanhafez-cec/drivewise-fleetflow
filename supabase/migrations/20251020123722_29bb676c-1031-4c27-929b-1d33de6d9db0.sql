-- ================================================
-- VEHICLES IN CUSTODY - DATABASE SCHEMA
-- Phase 1: Core Tables, Functions, and Policies
-- ================================================

-- 1. Create Enums
CREATE TYPE custody_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'closed', 'voided');
CREATE TYPE custodian_type AS ENUM ('customer', 'driver', 'originator');
CREATE TYPE custody_reason AS ENUM ('accident', 'breakdown', 'maintenance', 'damage', 'other');
CREATE TYPE rate_policy_type AS ENUM ('inherit', 'prorate', 'free', 'special_code');
CREATE TYPE document_type AS ENUM ('customer_acknowledgment', 'incident_report', 'photos', 'police_report', 'insurance_docs', 'handover_checklist', 'signature');
CREATE TYPE document_category AS ENUM ('required', 'optional');
CREATE TYPE esign_status AS ENUM ('pending', 'signed', 'declined');
CREATE TYPE charge_type AS ENUM ('damage', 'upgrade', 'downgrade', 'admin_fee', 'other');
CREATE TYPE charge_responsibility AS ENUM ('customer', 'company', 'insurance', 'third_party');
CREATE TYPE charge_status AS ENUM ('draft', 'posted', 'invoiced', 'paid');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
CREATE TYPE custody_action_type AS ENUM ('created', 'updated', 'status_changed', 'document_added', 'approval_requested', 'approved', 'rejected', 'closed', 'voided');

-- 2. Main Custody Transactions Table
CREATE TABLE public.custody_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custody_no TEXT UNIQUE,
    status custody_status NOT NULL DEFAULT 'draft',
    
    -- Agreement & Customer
    agreement_id UUID REFERENCES public.agreements(id),
    agreement_line_id UUID REFERENCES public.agreement_lines(id),
    branch_id UUID,
    customer_id UUID NOT NULL,
    
    -- Custodian Information
    custodian_type custodian_type NOT NULL,
    custodian_party_id UUID,
    custodian_name TEXT NOT NULL,
    custodian_contact JSONB DEFAULT '{}',
    
    -- Vehicles
    original_vehicle_id UUID REFERENCES public.vehicles(id),
    replacement_vehicle_id UUID REFERENCES public.vehicles(id),
    
    -- Incident Details
    reason_code custody_reason NOT NULL,
    reason_subcode TEXT,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_ref TEXT,
    incident_narrative TEXT,
    incident_odometer INTEGER,
    incident_location JSONB,
    
    -- Custody Window
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_return_date DATE,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    until_original_ready BOOLEAN DEFAULT false,
    linked_maintenance_ticket_id UUID,
    
    -- Financial
    rate_policy rate_policy_type NOT NULL DEFAULT 'inherit',
    special_rate_code TEXT,
    deposit_carryover BOOLEAN DEFAULT true,
    damage_preauth_hold NUMERIC(10,2),
    damage_preauth_card_ref TEXT,
    tax_profile_id UUID,
    
    -- SLA Tracking
    sla_target_approve_by TIMESTAMP WITH TIME ZONE,
    sla_target_handover_by TIMESTAMP WITH TIME ZONE,
    sla_breached BOOLEAN DEFAULT false,
    
    -- Approvals & Closure
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    
    -- Audit
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Custody Documents Table
CREATE TABLE public.custody_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custody_id UUID NOT NULL REFERENCES public.custody_transactions(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_category document_category NOT NULL DEFAULT 'optional',
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    esign_status esign_status,
    esign_signed_at TIMESTAMP WITH TIME ZONE,
    esign_signed_by UUID,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

-- 4. Custody Charges Table
CREATE TABLE public.custody_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custody_id UUID NOT NULL REFERENCES public.custody_transactions(id) ON DELETE CASCADE,
    charge_type charge_type NOT NULL,
    item_code TEXT,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    tax_rate NUMERIC(5,2),
    tax_amount NUMERIC(10,2),
    total_amount NUMERIC(10,2) NOT NULL,
    responsibility charge_responsibility NOT NULL DEFAULT 'customer',
    status charge_status NOT NULL DEFAULT 'draft',
    posted_by UUID,
    posted_at TIMESTAMP WITH TIME ZONE,
    invoice_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    notes TEXT
);

-- 5. Custody Approvals Table
CREATE TABLE public.custody_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custody_id UUID NOT NULL REFERENCES public.custody_transactions(id) ON DELETE CASCADE,
    approval_level INTEGER NOT NULL,
    approver_role TEXT NOT NULL,
    approver_user_id UUID,
    required BOOLEAN DEFAULT true,
    status approval_status NOT NULL DEFAULT 'pending',
    decision_timestamp TIMESTAMP WITH TIME ZONE,
    decision_notes TEXT,
    due_by TIMESTAMP WITH TIME ZONE,
    reminded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Custody Audit Log Table
CREATE TABLE public.custody_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custody_id UUID NOT NULL REFERENCES public.custody_transactions(id) ON DELETE CASCADE,
    action_type custody_action_type NOT NULL,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    performed_by UUID,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    api_source TEXT,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}'
);

-- 7. Custody SLA Configuration Table
CREATE TABLE public.custody_sla_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reason_code custody_reason NOT NULL,
    vehicle_class_id UUID,
    branch_id UUID,
    approve_within_hours NUMERIC(5,2) NOT NULL DEFAULT 4,
    handover_within_hours NUMERIC(5,2) NOT NULL DEFAULT 2,
    close_within_hours_after_ready NUMERIC(5,2) NOT NULL DEFAULT 24,
    escalation_path JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Enhance Vehicle Exchanges Table
ALTER TABLE public.vehicle_exchanges 
ADD COLUMN IF NOT EXISTS custody_transaction_id UUID REFERENCES public.custody_transactions(id),
ADD COLUMN IF NOT EXISTS allocation_rationale TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 9. Create Indexes for Performance
CREATE INDEX idx_custody_status ON public.custody_transactions(status);
CREATE INDEX idx_custody_agreement ON public.custody_transactions(agreement_id);
CREATE INDEX idx_custody_customer ON public.custody_transactions(customer_id);
CREATE INDEX idx_custody_original_vehicle ON public.custody_transactions(original_vehicle_id);
CREATE INDEX idx_custody_replacement_vehicle ON public.custody_transactions(replacement_vehicle_id);
CREATE INDEX idx_custody_effective_from ON public.custody_transactions(effective_from);
CREATE INDEX idx_custody_created_at ON public.custody_transactions(created_at);
CREATE INDEX idx_custody_documents_custody ON public.custody_documents(custody_id);
CREATE INDEX idx_custody_charges_custody ON public.custody_charges(custody_id);
CREATE INDEX idx_custody_approvals_custody ON public.custody_approvals(custody_id);
CREATE INDEX idx_custody_audit_custody ON public.custody_audit_log(custody_id);

-- 10. Database Functions

-- Generate custody number
CREATE OR REPLACE FUNCTION public.generate_custody_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_num INTEGER;
    result_custody_no TEXT;
BEGIN
    SELECT COALESCE(
        (SELECT MAX(CAST(SUBSTRING(custody_no FROM 'CST-(\d+)') AS INTEGER)) 
         FROM public.custody_transactions 
         WHERE custody_no IS NOT NULL AND custody_no ~ '^CST-\d+$'), 
        0
    ) + 1 INTO next_num;
    
    result_custody_no := 'CST-' || LPAD(next_num::TEXT, 6, '0');
    RETURN result_custody_no;
END;
$$;

-- Auto-set custody number on insert
CREATE OR REPLACE FUNCTION public.set_custody_no()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.custody_no IS NULL THEN
        NEW.custody_no := public.generate_custody_no();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_custody_no
    BEFORE INSERT ON public.custody_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_custody_no();

-- Check vehicle availability for custody
CREATE OR REPLACE FUNCTION public.check_vehicle_custody_availability(
    p_vehicle_id UUID,
    p_date_from TIMESTAMP WITH TIME ZONE,
    p_date_to TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_available BOOLEAN;
BEGIN
    -- Check if vehicle is in custody during the period
    SELECT NOT EXISTS (
        SELECT 1 FROM public.custody_transactions
        WHERE replacement_vehicle_id = p_vehicle_id
        AND status IN ('approved', 'active')
        AND effective_from < p_date_to
        AND (actual_return_date IS NULL OR actual_return_date > p_date_from)
    ) INTO v_is_available;
    
    RETURN v_is_available;
END;
$$;

-- Calculate SLA timestamps
CREATE OR REPLACE FUNCTION public.calculate_custody_sla(p_custody_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_custody RECORD;
    v_sla_config RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_custody FROM public.custody_transactions WHERE id = p_custody_id;
    
    SELECT * INTO v_sla_config 
    FROM public.custody_sla_config
    WHERE reason_code = v_custody.reason_code
    AND is_active = true
    ORDER BY 
        CASE WHEN branch_id = v_custody.branch_id THEN 0 ELSE 1 END,
        CASE WHEN vehicle_class_id IS NOT NULL THEN 0 ELSE 1 END
    LIMIT 1;
    
    IF v_sla_config IS NULL THEN
        -- Use default SLA if no config found
        v_sla_config.approve_within_hours := 4;
        v_sla_config.handover_within_hours := 2;
    END IF;
    
    v_result := jsonb_build_object(
        'approve_by', v_custody.created_at + (v_sla_config.approve_within_hours || ' hours')::INTERVAL,
        'handover_by', v_custody.approved_at + (v_sla_config.handover_within_hours || ' hours')::INTERVAL
    );
    
    RETURN v_result;
END;
$$;

-- Validate custody status change
CREATE OR REPLACE FUNCTION public.validate_custody_status_change(
    p_custody_id UUID,
    p_from_status custody_status,
    p_to_status custody_status
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_errors TEXT[] := '{}';
    v_warnings TEXT[] := '{}';
    v_custody RECORD;
BEGIN
    SELECT * INTO v_custody FROM public.custody_transactions WHERE id = p_custody_id;
    
    -- Validate transitions
    IF p_to_status = 'pending_approval' THEN
        -- Check required documents
        IF NOT EXISTS (
            SELECT 1 FROM public.custody_documents 
            WHERE custody_id = p_custody_id 
            AND document_category = 'required'
        ) THEN
            v_errors := array_append(v_errors, 'Required documents not uploaded');
        END IF;
    END IF;
    
    IF p_to_status = 'closed' THEN
        -- Check for unposted charges
        IF EXISTS (
            SELECT 1 FROM public.custody_charges
            WHERE custody_id = p_custody_id
            AND status = 'draft'
        ) THEN
            v_errors := array_append(v_errors, 'Cannot close with unposted charges');
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'valid', array_length(v_errors, 1) IS NULL,
        'errors', v_errors,
        'warnings', v_warnings
    );
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_custody_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_custody_updated_at
    BEFORE UPDATE ON public.custody_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_custody_updated_at();

-- Auto-create audit log entry
CREATE OR REPLACE FUNCTION public.custody_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.custody_audit_log (
            custody_id, action_type, performed_by, metadata
        ) VALUES (
            NEW.id, 'created', NEW.created_by, 
            jsonb_build_object('custody_no', NEW.custody_no)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO public.custody_audit_log (
                custody_id, action_type, field_name, old_value, new_value, performed_by
            ) VALUES (
                NEW.id, 'status_changed', 'status', OLD.status::TEXT, NEW.status::TEXT, 
                COALESCE(NEW.approved_by, NEW.closed_by, NEW.created_by)
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_custody_audit
    AFTER INSERT OR UPDATE ON public.custody_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.custody_audit_trigger();

-- 11. Row Level Security Policies

ALTER TABLE public.custody_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_sla_config ENABLE ROW LEVEL SECURITY;

-- Staff can manage all custody records
CREATE POLICY "Staff can manage custody transactions"
ON public.custody_transactions FOR ALL
USING (true);

CREATE POLICY "Staff can manage custody documents"
ON public.custody_documents FOR ALL
USING (true);

CREATE POLICY "Staff can manage custody charges"
ON public.custody_charges FOR ALL
USING (true);

CREATE POLICY "Staff can manage custody approvals"
ON public.custody_approvals FOR ALL
USING (true);

CREATE POLICY "Staff can view custody audit log"
ON public.custody_audit_log FOR SELECT
USING (true);

CREATE POLICY "Staff can view SLA config"
ON public.custody_sla_config FOR SELECT
USING (true);

-- Customers can view their own custody records
CREATE POLICY "Customers can view own custody transactions"
ON public.custody_transactions FOR SELECT
USING (customer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Insert default SLA configurations
INSERT INTO public.custody_sla_config (reason_code, approve_within_hours, handover_within_hours, close_within_hours_after_ready) VALUES
('accident', 2, 1, 24),
('breakdown', 1, 1, 12),
('maintenance', 4, 2, 48),
('damage', 2, 1, 24),
('other', 4, 2, 24);