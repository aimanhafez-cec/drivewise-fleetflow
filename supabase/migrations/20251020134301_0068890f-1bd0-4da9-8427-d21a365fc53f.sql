-- Fix search_path for custody notification preferences trigger function
DROP FUNCTION IF EXISTS public.update_custody_notification_preferences_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_custody_notification_preferences_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_custody_notification_preferences_updated_at
  BEFORE UPDATE ON public.custody_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_custody_notification_preferences_updated_at();

CREATE TRIGGER update_custody_integration_settings_updated_at
  BEFORE UPDATE ON public.custody_integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_custody_notification_preferences_updated_at();