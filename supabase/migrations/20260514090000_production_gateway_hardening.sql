-- Production gateway hardening for the native Android backend.
-- The backend uses service-role access for privileged writes while clients read public-safe views.

CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  user_id UUID REFERENCES auth.users(id),
  user_id_text TEXT,
  installation_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_installation_id
  ON public.device_push_tokens (installation_id)
  WHERE installation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_user_id
  ON public.device_push_tokens (user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage device push tokens" ON public.device_push_tokens;
CREATE POLICY "Service role can manage device push tokens"
ON public.device_push_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_device_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_device_push_tokens_updated_at ON public.device_push_tokens;
CREATE TRIGGER touch_device_push_tokens_updated_at
BEFORE UPDATE ON public.device_push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.touch_device_push_tokens_updated_at();

CREATE OR REPLACE VIEW public.incident_reports_public AS
SELECT
  id,
  type,
  title,
  description,
  location,
  severity_level,
  status,
  is_verified,
  created_at
FROM public.incident_reports;

GRANT SELECT ON public.incident_reports_public TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view incident reports without contact info" ON public.incident_reports;

DROP POLICY IF EXISTS "Allow public select" ON public.user_notification_settings;
DROP POLICY IF EXISTS "Allow public update" ON public.user_notification_settings;

DROP POLICY IF EXISTS "Service role can manage notification settings" ON public.user_notification_settings;
CREATE POLICY "Service role can manage notification settings"
ON public.user_notification_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage their notification settings" ON public.user_notification_settings;
CREATE POLICY "Authenticated users can manage their notification settings"
ON public.user_notification_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
