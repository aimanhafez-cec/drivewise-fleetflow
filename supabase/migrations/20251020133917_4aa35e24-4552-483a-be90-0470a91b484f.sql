-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.custody_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  notify_on_submission BOOLEAN DEFAULT true,
  notify_on_approval BOOLEAN DEFAULT true,
  notify_on_rejection BOOLEAN DEFAULT true,
  notify_on_handover BOOLEAN DEFAULT true,
  notify_on_closure BOOLEAN DEFAULT true,
  notify_on_sla_breach BOOLEAN DEFAULT true,
  email_address TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.custody_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification preferences"
  ON public.custody_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.custody_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.custody_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage all notification preferences"
  ON public.custody_notification_preferences
  FOR ALL
  USING (true);

-- Create webhook log table for external integrations
CREATE TABLE IF NOT EXISTS public.custody_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_id UUID REFERENCES public.custody_transactions(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL, -- 'fleet', 'billing', 'claims', 'notification'
  endpoint TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  status_code INTEGER,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.custody_webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view all webhook logs"
  ON public.custody_webhook_logs
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert webhook logs"
  ON public.custody_webhook_logs
  FOR INSERT
  WITH CHECK (true);

-- Create integration settings table
CREATE TABLE IF NOT EXISTS public.custody_integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL UNIQUE, -- 'fleet', 'billing', 'claims'
  is_enabled BOOLEAN DEFAULT false,
  endpoint_url TEXT,
  api_key_name TEXT, -- Reference to Supabase secret
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.custody_integration_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can manage integration settings"
  ON public.custody_integration_settings
  FOR ALL
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_custody_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custody_notification_preferences_updated_at
  BEFORE UPDATE ON public.custody_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_custody_notification_preferences_updated_at();

CREATE TRIGGER update_custody_integration_settings_updated_at
  BEFORE UPDATE ON public.custody_integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_custody_notification_preferences_updated_at();

-- Insert default integration settings
INSERT INTO public.custody_integration_settings (integration_type, is_enabled, config)
VALUES 
  ('fleet', false, '{"auto_update_status": true, "reserve_replacement": true}'::jsonb),
  ('billing', false, '{"auto_create_invoice": true, "post_on_closure": true}'::jsonb),
  ('claims', false, '{"auto_submit_accidents": true, "attach_documents": true}'::jsonb)
ON CONFLICT (integration_type) DO NOTHING;

COMMENT ON TABLE public.custody_notification_preferences IS 'User preferences for custody-related notifications';
COMMENT ON TABLE public.custody_webhook_logs IS 'Logs of all webhook calls to external systems';
COMMENT ON TABLE public.custody_integration_settings IS 'Configuration for external system integrations';