-- ==========================================
-- Phase 10: Edge Cases & Policies (Fixed)
-- ==========================================

-- Function: Check for overlapping custody periods
CREATE OR REPLACE FUNCTION public.check_custody_overlap(
  p_vehicle_id UUID,
  p_date_from TIMESTAMPTZ,
  p_date_to TIMESTAMPTZ,
  p_exclude_custody_id UUID DEFAULT NULL
)
RETURNS TABLE(has_overlap BOOLEAN, overlapping_custody_id UUID, overlapping_custody_no TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as has_overlap,
    ct.id as overlapping_custody_id,
    ct.custody_no as overlapping_custody_no
  FROM public.custody_transactions ct
  WHERE ct.replacement_vehicle_id = p_vehicle_id
    AND ct.status IN ('approved', 'active')
    AND (p_exclude_custody_id IS NULL OR ct.id != p_exclude_custody_id)
    AND (
      -- New period overlaps with existing
      (p_date_from, COALESCE(p_date_to, '2099-12-31'::TIMESTAMPTZ)) OVERLAPS 
      (ct.effective_from, COALESCE(ct.expected_return_date, ct.actual_return_date, '2099-12-31'::TIMESTAMPTZ))
    )
  LIMIT 1;
END;
$$;

-- Function: Validate custody before insert/update
CREATE OR REPLACE FUNCTION public.validate_custody_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_overlap RECORD;
  v_vehicle_status TEXT;
BEGIN
  -- Check for overlapping custody periods
  IF NEW.replacement_vehicle_id IS NOT NULL THEN
    SELECT * INTO v_overlap
    FROM public.check_custody_overlap(
      NEW.replacement_vehicle_id,
      NEW.effective_from,
      NEW.expected_return_date,
      NEW.id
    );
    
    IF v_overlap.has_overlap THEN
      RAISE EXCEPTION 'Vehicle is already in custody during this period (Custody: %)', v_overlap.overlapping_custody_no;
    END IF;
    
    -- Check vehicle eligibility
    SELECT status INTO v_vehicle_status
    FROM public.vehicles
    WHERE id = NEW.replacement_vehicle_id;
    
    IF v_vehicle_status IN ('out_of_service', 'sold', 'written_off') THEN
      RAISE EXCEPTION 'Vehicle is not eligible for custody (Status: %)', v_vehicle_status;
    END IF;
  END IF;
  
  -- Validate date logic
  IF NEW.expected_return_date IS NOT NULL AND NEW.expected_return_date <= NEW.effective_from THEN
    RAISE EXCEPTION 'Expected return date must be after effective date';
  END IF;
  
  IF NEW.actual_return_date IS NOT NULL AND NEW.actual_return_date < NEW.effective_from THEN
    RAISE EXCEPTION 'Actual return date cannot be before effective date';
  END IF;
  
  -- Validate incident date
  IF NEW.incident_date > NOW() THEN
    RAISE EXCEPTION 'Incident date cannot be in the future';
  END IF;
  
  -- Validate special rate code requirement
  IF NEW.rate_policy = 'special_code' AND (NEW.special_rate_code IS NULL OR NEW.special_rate_code = '') THEN
    RAISE EXCEPTION 'Special rate code is required when rate policy is "special_code"';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for custody validation
DROP TRIGGER IF EXISTS custody_validation_trigger ON public.custody_transactions;
CREATE TRIGGER custody_validation_trigger
  BEFORE INSERT OR UPDATE ON public.custody_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_custody_transaction();

-- Function: Auto-detect SLA breaches (Fixed)
CREATE OR REPLACE FUNCTION public.auto_detect_sla_breaches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Mark pending approvals as breached if past approval deadline
  WITH updated AS (
    UPDATE public.custody_transactions
    SET 
      sla_breached = TRUE,
      updated_at = NOW()
    WHERE status = 'pending_approval'
      AND sla_breached = FALSE
      AND sla_target_approve_by IS NOT NULL
      AND NOW() > sla_target_approve_by
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_count FROM updated;
  
  -- Mark approved custodies as breached if past handover deadline
  WITH updated AS (
    UPDATE public.custody_transactions
    SET 
      sla_breached = TRUE,
      updated_at = NOW()
    WHERE status = 'approved'
      AND sla_breached = FALSE
      AND sla_target_handover_by IS NOT NULL
      AND NOW() > sla_target_handover_by
    RETURNING 1
  )
  SELECT v_count + COUNT(*) INTO v_count FROM updated;
  
  RETURN v_count;
END;
$$;

-- Function: Check document expiry
CREATE OR REPLACE FUNCTION public.check_document_expiry(
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE(
  custody_id UUID,
  custody_no TEXT,
  document_type TEXT,
  days_until_expiry INTEGER,
  is_expired BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.custody_id,
    ct.custody_no,
    cd.document_type::TEXT,
    EXTRACT(DAY FROM (cd.metadata->>'expiry_date')::TIMESTAMPTZ - NOW())::INTEGER as days_until_expiry,
    (cd.metadata->>'expiry_date')::TIMESTAMPTZ < NOW() as is_expired
  FROM public.custody_documents cd
  JOIN public.custody_transactions ct ON ct.id = cd.custody_id
  WHERE cd.metadata->>'expiry_date' IS NOT NULL
    AND (cd.metadata->>'expiry_date')::TIMESTAMPTZ <= (NOW() + (p_days_ahead || ' days')::INTERVAL)
  ORDER BY (cd.metadata->>'expiry_date')::TIMESTAMPTZ ASC;
END;
$$;

-- Function: Get overdue custodies
CREATE OR REPLACE FUNCTION public.get_overdue_custodies()
RETURNS TABLE(
  custody_id UUID,
  custody_no TEXT,
  customer_name TEXT,
  days_overdue INTEGER,
  expected_return_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id as custody_id,
    ct.custody_no,
    ct.custodian_name as customer_name,
    EXTRACT(DAY FROM NOW() - ct.expected_return_date)::INTEGER as days_overdue,
    ct.expected_return_date
  FROM public.custody_transactions ct
  WHERE ct.status = 'active'
    AND ct.expected_return_date IS NOT NULL
    AND ct.expected_return_date < NOW()
    AND ct.until_original_ready = FALSE
  ORDER BY days_overdue DESC;
END;
$$;

-- Function: Retry failed webhooks
CREATE OR REPLACE FUNCTION public.retry_failed_webhooks(
  p_max_age_hours INTEGER DEFAULT 24,
  p_max_retries INTEGER DEFAULT 3
)
RETURNS TABLE(
  webhook_id UUID,
  custody_id UUID,
  event_type TEXT,
  retry_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cwl.id as webhook_id,
    cwl.custody_id,
    cwl.event_type,
    COALESCE((cwl.metadata->>'retry_count')::INTEGER, 0) as retry_count
  FROM public.custody_webhook_logs cwl
  WHERE cwl.sent_at > (NOW() - (p_max_age_hours || ' hours')::INTERVAL)
    AND cwl.http_status_code >= 400
    AND COALESCE((cwl.metadata->>'retry_count')::INTEGER, 0) < p_max_retries
  ORDER BY cwl.sent_at ASC;
END;
$$;

-- Function: Calculate custody statistics for dashboard
CREATE OR REPLACE FUNCTION public.get_custody_statistics(
  p_date_from TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_date_to TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active_count,
      COUNT(*) FILTER (WHERE status = 'pending_approval') as pending_approval_count,
      COUNT(*) FILTER (WHERE sla_breached = TRUE) as sla_breached_count,
      COUNT(*) FILTER (WHERE status = 'closed' AND created_at BETWEEN p_date_from AND p_date_to) as closed_count,
      AVG(
        EXTRACT(DAY FROM 
          COALESCE(actual_return_date, NOW()) - effective_from
        )
      ) FILTER (WHERE status IN ('active', 'closed')) as avg_duration_days,
      COUNT(*) FILTER (
        WHERE status IN ('pending_approval', 'approved')
        AND sla_target_approve_by IS NOT NULL
        AND NOW() <= sla_target_approve_by
      )::NUMERIC / NULLIF(
        COUNT(*) FILTER (WHERE status IN ('pending_approval', 'approved')), 0
      ) * 100 as sla_compliance_percentage
    FROM public.custody_transactions
    WHERE created_at >= p_date_from
  )
  SELECT jsonb_build_object(
    'active_custodies', COALESCE(active_count, 0),
    'pending_approvals', COALESCE(pending_approval_count, 0),
    'sla_breaches', COALESCE(sla_breached_count, 0),
    'closed_this_period', COALESCE(closed_count, 0),
    'avg_duration_days', ROUND(COALESCE(avg_duration_days, 0), 1),
    'sla_compliance_pct', ROUND(COALESCE(sla_compliance_percentage, 0), 1),
    'period_from', p_date_from,
    'period_to', p_date_to
  ) INTO v_stats
  FROM stats;
  
  RETURN v_stats;
END;
$$;

-- Function: Validate charge before posting
CREATE OR REPLACE FUNCTION public.validate_custody_charge()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_custody_status TEXT;
BEGIN
  -- Check custody status
  SELECT status INTO v_custody_status
  FROM public.custody_transactions
  WHERE id = NEW.custody_id;
  
  IF v_custody_status = 'voided' THEN
    RAISE EXCEPTION 'Cannot add charges to a voided custody transaction';
  END IF;
  
  -- Validate amounts
  IF NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Charge quantity must be greater than 0';
  END IF;
  
  IF NEW.unit_price < 0 THEN
    RAISE EXCEPTION 'Charge unit price cannot be negative';
  END IF;
  
  -- Calculate totals if not provided
  IF NEW.tax_amount IS NULL AND NEW.tax_rate IS NOT NULL THEN
    NEW.tax_amount := ROUND((NEW.quantity * NEW.unit_price * NEW.tax_rate / 100), 2);
  END IF;
  
  IF NEW.total_amount IS NULL THEN
    NEW.total_amount := ROUND((NEW.quantity * NEW.unit_price) + COALESCE(NEW.tax_amount, 0), 2);
  END IF;
  
  -- Prevent posting charges for draft custodies
  IF NEW.status = 'posted' AND v_custody_status = 'draft' THEN
    RAISE EXCEPTION 'Cannot post charges for a draft custody transaction';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for charge validation
DROP TRIGGER IF EXISTS custody_charge_validation_trigger ON public.custody_charges;
CREATE TRIGGER custody_charge_validation_trigger
  BEFORE INSERT OR UPDATE ON public.custody_charges
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_custody_charge();

-- Function: Auto-close expired custodies
CREATE OR REPLACE FUNCTION public.auto_close_expired_custodies(
  p_days_overdue INTEGER DEFAULT 90
)
RETURNS TABLE(
  custody_id UUID,
  custody_no TEXT,
  action_taken TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Auto-close extremely overdue custodies
  UPDATE public.custody_transactions
  SET 
    status = 'closed',
    actual_return_date = expected_return_date,
    closed_at = NOW(),
    notes = COALESCE(notes || E'\n\n', '') || 
      'Auto-closed due to ' || p_days_overdue || ' days overdue. Manual review required.',
    updated_at = NOW()
  WHERE status = 'active'
    AND expected_return_date IS NOT NULL
    AND expected_return_date < (NOW() - (p_days_overdue || ' days')::INTERVAL)
  RETURNING id, custody_no, 'auto_closed' as action_taken;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custody_sla_breach ON public.custody_transactions(sla_breached) WHERE sla_breached = TRUE;
CREATE INDEX IF NOT EXISTS idx_custody_status_dates ON public.custody_transactions(status, effective_from, expected_return_date);
CREATE INDEX IF NOT EXISTS idx_custody_replacement_vehicle ON public.custody_transactions(replacement_vehicle_id) WHERE replacement_vehicle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custody_charges_status ON public.custody_charges(custody_id, status);
CREATE INDEX IF NOT EXISTS idx_custody_approvals_pending ON public.custody_approvals(custody_id, status) WHERE status = 'pending';

-- Add comments for documentation
COMMENT ON FUNCTION public.check_custody_overlap IS 'Check for overlapping custody periods for a vehicle';
COMMENT ON FUNCTION public.auto_detect_sla_breaches IS 'Automatically detect and mark SLA breaches for custody transactions';
COMMENT ON FUNCTION public.check_document_expiry IS 'Check for expiring or expired custody documents';
COMMENT ON FUNCTION public.get_overdue_custodies IS 'Get list of overdue custody transactions';
COMMENT ON FUNCTION public.retry_failed_webhooks IS 'Get list of failed webhooks that need retry';
COMMENT ON FUNCTION public.get_custody_statistics IS 'Calculate custody statistics for dashboard';
COMMENT ON FUNCTION public.auto_close_expired_custodies IS 'Automatically close extremely overdue custody transactions';