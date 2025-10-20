-- ============================================
-- Phase 9: Permissions & Security (Fixed)
-- RBAC, RLS Policies, and Data Masking
-- ============================================

-- 1. Add missing columns to user_roles if they don't exist
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Create security definer functions for role checking (using existing user_role enum)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND COALESCE(is_active, true) = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
      AND COALESCE(is_active, true) = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'fleet_manager', 'rental_agent', 'maintenance', 'finance')
      AND COALESCE(is_active, true) = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 3. Create data masking functions
CREATE OR REPLACE FUNCTION public.mask_phone(phone TEXT, _user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff_or_admin(_user_id) THEN
    RETURN phone;
  END IF;
  
  IF phone IS NULL OR LENGTH(phone) < 4 THEN
    RETURN phone;
  END IF;
  
  RETURN '***-***-' || RIGHT(phone, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_email(email TEXT, _user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parts TEXT[];
  username TEXT;
  domain TEXT;
BEGIN
  IF public.is_staff_or_admin(_user_id) THEN
    RETURN email;
  END IF;
  
  IF email IS NULL OR email NOT LIKE '%@%' THEN
    RETURN email;
  END IF;
  
  parts := string_to_array(email, '@');
  username := parts[1];
  domain := parts[2];
  
  IF LENGTH(username) <= 2 THEN
    RETURN username || '@' || domain;
  END IF;
  
  RETURN LEFT(username, 2) || '***@' || domain;
END;
$$;

-- 4. RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Update custody_transactions RLS policies
DROP POLICY IF EXISTS "custody_transactions_all" ON public.custody_transactions;
DROP POLICY IF EXISTS "Staff can view all custody transactions" ON public.custody_transactions;
DROP POLICY IF EXISTS "Customers can view their custody transactions" ON public.custody_transactions;
DROP POLICY IF EXISTS "Staff can create custody transactions" ON public.custody_transactions;
DROP POLICY IF EXISTS "Staff can update custody transactions" ON public.custody_transactions;
DROP POLICY IF EXISTS "Admins can delete custody transactions" ON public.custody_transactions;

CREATE POLICY "Staff can view all custody transactions"
ON public.custody_transactions
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Customers can view their custody transactions"
ON public.custody_transactions
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Staff can create custody transactions"
ON public.custody_transactions
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Staff can update custody transactions"
ON public.custody_transactions
FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Admins can delete custody transactions"
ON public.custody_transactions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. custody_documents RLS policies
DROP POLICY IF EXISTS "custody_documents_all" ON public.custody_documents;
DROP POLICY IF EXISTS "Staff can manage all custody documents" ON public.custody_documents;
DROP POLICY IF EXISTS "Customers can view their custody documents" ON public.custody_documents;

CREATE POLICY "Staff can manage all custody documents"
ON public.custody_documents
FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Customers can view their custody documents"
ON public.custody_documents
FOR SELECT
TO authenticated
USING (
  custody_id IN (
    SELECT id FROM public.custody_transactions 
    WHERE customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- 7. custody_charges RLS policies
DROP POLICY IF EXISTS "custody_charges_all" ON public.custody_charges;
DROP POLICY IF EXISTS "Staff can manage all custody charges" ON public.custody_charges;
DROP POLICY IF EXISTS "Customers can view their custody charges" ON public.custody_charges;

CREATE POLICY "Staff can manage all custody charges"
ON public.custody_charges
FOR ALL
TO authenticated
USING (public.is_staff_or_admin(auth.uid()))
WITH CHECK (public.is_staff_or_admin(auth.uid()));

CREATE POLICY "Customers can view their custody charges"
ON public.custody_charges
FOR SELECT
TO authenticated
USING (
  custody_id IN (
    SELECT id FROM public.custody_transactions 
    WHERE customer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- 8. custody_approvals RLS policies
DROP POLICY IF EXISTS "custody_approvals_all" ON public.custody_approvals;
DROP POLICY IF EXISTS "Managers can manage approvals" ON public.custody_approvals;
DROP POLICY IF EXISTS "Staff can view approvals" ON public.custody_approvals;

CREATE POLICY "Managers can manage approvals"
ON public.custody_approvals
FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'fleet_manager']::user_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin', 'fleet_manager']::user_role[]));

CREATE POLICY "Staff can view approvals"
ON public.custody_approvals
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

-- 9. custody_notification_preferences RLS
DROP POLICY IF EXISTS "custody_notification_preferences_all" ON public.custody_notification_preferences;
DROP POLICY IF EXISTS "Users can manage their own notification preferences" ON public.custody_notification_preferences;
DROP POLICY IF EXISTS "Staff can view all notification preferences" ON public.custody_notification_preferences;

CREATE POLICY "Users can manage their own notification preferences"
ON public.custody_notification_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can view all notification preferences"
ON public.custody_notification_preferences
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

-- 10. custody_integration_settings RLS (Admin only)
DROP POLICY IF EXISTS "custody_integration_settings_all" ON public.custody_integration_settings;
DROP POLICY IF EXISTS "Admins can manage integration settings" ON public.custody_integration_settings;
DROP POLICY IF EXISTS "Managers can view integration settings" ON public.custody_integration_settings;

CREATE POLICY "Admins can manage integration settings"
ON public.custody_integration_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view integration settings"
ON public.custody_integration_settings
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'fleet_manager']::user_role[]));

-- 11. custody_webhook_logs RLS
DROP POLICY IF EXISTS "custody_webhook_logs_all" ON public.custody_webhook_logs;
DROP POLICY IF EXISTS "Admins and managers can view webhook logs" ON public.custody_webhook_logs;

CREATE POLICY "Admins and managers can view webhook logs"
ON public.custody_webhook_logs
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'fleet_manager']::user_role[]));

-- 12. custody_audit_log RLS
DROP POLICY IF EXISTS "custody_audit_log_all" ON public.custody_audit_log;
DROP POLICY IF EXISTS "Staff can view audit logs" ON public.custody_audit_log;

CREATE POLICY "Staff can view audit logs"
ON public.custody_audit_log
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

-- 13. Create audit function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
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
      NULL, 'role_granted', NEW.granted_by,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role::TEXT,
        'expires_at', NEW.expires_at
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF COALESCE(OLD.is_active, true) != COALESCE(NEW.is_active, true) THEN
      INSERT INTO public.custody_audit_log (
        custody_id, action_type, performed_by, metadata
      ) VALUES (
        NULL, 
        CASE WHEN COALESCE(NEW.is_active, true) THEN 'role_activated' ELSE 'role_deactivated' END,
        auth.uid(),
        jsonb_build_object('user_id', NEW.user_id, 'role', NEW.role::TEXT)
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.custody_audit_log (
      custody_id, action_type, performed_by, metadata
    ) VALUES (
      NULL, 'role_revoked', auth.uid(),
      jsonb_build_object('user_id', OLD.user_id, 'role', OLD.role::TEXT)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_user_roles_changes ON public.user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION audit_role_changes();

-- 14. Create helper view for custody with masking
CREATE OR REPLACE VIEW public.custody_transactions_secure AS
SELECT 
  ct.*,
  CASE 
    WHEN public.is_staff_or_admin(auth.uid()) THEN ct.custodian_contact
    ELSE jsonb_build_object(
      'phone', public.mask_phone(ct.custodian_contact->>'phone', auth.uid()),
      'email', public.mask_email(ct.custodian_contact->>'email', auth.uid())
    )
  END as custodian_contact_masked
FROM public.custody_transactions ct;