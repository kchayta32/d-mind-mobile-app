-- ============================================================================
--  D-MIND IoT Station: 03_create_api_keys_and_alerts.sql
--  Description: FastAPI API Key Management, Ingress Security & Disaster Alerts
--  Updated: Includes client_applications, api_key_scopes, api_request_logs,
--           fastapi_endpoints, safe ALTER TABLE statements and updated views
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: client_applications (Consumer Apps Registry)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.client_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(100) NOT NULL,              -- e.g. 'D-MIND Android Mobile Client'
  app_type VARCHAR(30) NOT NULL DEFAULT 'mobile_android', -- 'mobile_android', 'mobile_ios', 'web_admin', 'partner_service'
  bundle_id VARCHAR(100) NULL,                 -- e.g. 'com.dmind.app'
  developer_contact VARCHAR(150) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'REVOKED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_apps_status ON public.client_applications (status);
CREATE INDEX IF NOT EXISTS idx_client_apps_bundle ON public.client_applications (bundle_id);

ALTER TABLE public.client_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read on client_applications" ON public.client_applications;
CREATE POLICY "Allow Read on client_applications" ON public.client_applications FOR SELECT TO public, anon, authenticated USING (true);

-- Seed default application client
INSERT INTO public.client_applications (id, app_name, app_type, bundle_id, developer_contact, status)
VALUES (
  'd1111111-1111-1111-1111-111111111111', 
  'D-MIND Android Mobile App (Official Client)', 
  'mobile_android', 
  'com.dmind.app', 
  'dev@d-mind.org', 
  'ACTIVE'
)
ON CONFLICT (id) DO UPDATE SET
  app_name = EXCLUDED.app_name,
  bundle_id = EXCLUDED.bundle_id,
  status = EXCLUDED.status;


-- ----------------------------------------------------------------------------
-- 2. Table: api_keys (FastAPI Key Management for Mobile App)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NULL,                         -- References client_applications(id)
  key_name TEXT NOT NULL,                      -- e.g. "D-Mind Mobile App Client", "Admin Test"
  key_prefix TEXT NOT NULL,                    -- First 8-14 chars for identification (e.g. "dmind_live_a1b2")
  hashed_key TEXT NOT NULL UNIQUE,             -- SHA-256 hash of full API key
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,                 -- NULL = Never expires
  is_active BOOLEAN NOT NULL DEFAULT TRUE,     -- Soft revoke toggle
  rate_limit_rpm INT DEFAULT 120,              -- Requests per minute
  description TEXT NULL,
  last_used_at TIMESTAMPTZ NULL,
  total_requests BIGINT DEFAULT 0
);

-- Update existing table if already run in Supabase
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS client_id UUID NULL;

UPDATE public.api_keys 
SET client_id = 'd1111111-1111-1111-1111-111111111111' 
WHERE client_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_hashed_key ON public.api_keys (hashed_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys (is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON public.api_keys (client_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_api_keys_client')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_applications') THEN 
    ALTER TABLE public.api_keys 
    ADD CONSTRAINT fk_api_keys_client 
    FOREIGN KEY (client_id) REFERENCES public.client_applications(id) ON DELETE SET NULL; 
  END IF; 
END $$;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service Role Full Access on api_keys" ON public.api_keys;
CREATE POLICY "Service Role Full Access on api_keys"
ON public.api_keys
FOR ALL
TO service_role, postgres
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon Verify Key on api_keys" ON public.api_keys;
CREATE POLICY "Anon Verify Key on api_keys"
ON public.api_keys
FOR SELECT
TO anon, authenticated
USING (is_active = true);


-- ----------------------------------------------------------------------------
-- 3. Table: api_key_scopes (Granular RBAC Permissions per Key)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_key_scopes (
  id SERIAL PRIMARY KEY,
  key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  scope_name VARCHAR(50) NOT NULL,             -- e.g. 'sensors:read', 'alerts:read', 'telemetry:write'
  description VARCHAR(150) NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_key_scope UNIQUE (key_id, scope_name)
);

CREATE INDEX IF NOT EXISTS idx_api_key_scopes_key_id ON public.api_key_scopes (key_id);

ALTER TABLE public.api_key_scopes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read on api_key_scopes" ON public.api_key_scopes;
CREATE POLICY "Allow Read on api_key_scopes" ON public.api_key_scopes FOR SELECT TO public, anon, authenticated USING (true);


-- ----------------------------------------------------------------------------
-- 4. Table: fastapi_endpoints (Target Resources Catalog)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fastapi_endpoints (
  endpoint_path VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL DEFAULT 'GET',
  required_scope VARCHAR(50) NOT NULL DEFAULT 'sensors:read',
  rate_limit_tier VARCHAR(20) DEFAULT '120 rpm',
  auth_scheme VARCHAR(30) DEFAULT 'X-API-Key',
  description VARCHAR(150) NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (endpoint_path, http_method)
);

ALTER TABLE public.fastapi_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read on fastapi_endpoints" ON public.fastapi_endpoints;
CREATE POLICY "Allow Read on fastapi_endpoints" ON public.fastapi_endpoints FOR SELECT TO public, anon, authenticated USING (true);

-- Seed known endpoints
INSERT INTO public.fastapi_endpoints (endpoint_path, http_method, required_scope, rate_limit_tier, auth_scheme, description)
VALUES 
  ('/api/v1/sensors/latest', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch latest single-row telemetry reading'),
  ('/api/v1/sensors/history', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch historical telemetry records'),
  ('/api/v1/sensors/stats', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch 24-hour sensor summary statistics'),
  ('/api/v1/alerts/active', 'GET', 'alerts:read', '120 rpm', 'X-API-Key', 'Fetch unresolved active disaster alerts'),
  ('/api/v1/telemetry', 'POST', 'telemetry:write', '120 rpm', 'X-API-Key', 'Hardware station direct telemetry ingest')
ON CONFLICT (endpoint_path, http_method) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. Table: api_request_logs (Traffic Audit & Telemetry Metrics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id BIGSERIAL PRIMARY KEY,
  key_id UUID NULL REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(100) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(200) NULL,
  status_code INTEGER NOT NULL,
  response_time_ms DOUBLE PRECISION NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_key_time ON public.api_request_logs (key_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_time ON public.api_request_logs (requested_at DESC);

ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Insert and Read on api_request_logs" ON public.api_request_logs;
CREATE POLICY "Allow Insert and Read on api_request_logs" ON public.api_request_logs FOR ALL TO service_role, postgres, authenticated, anon USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------------
-- 6. Table: disaster_alerts (Automated Warnings for Mobile App)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
  id SERIAL PRIMARY KEY,
  station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01',
  device_id TEXT DEFAULT 'ESP32_STATION_01',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_type TEXT NOT NULL,                   -- 'WATER_LEVEL_HIGH', 'PM25_HIGH', 'ABNORMAL_VIBRATION', 'EARTHQUAKE_SHOCK', 'HEATWAVE'
  severity TEXT NOT NULL DEFAULT 'WARNING',   -- 'INFO', 'WARNING', 'CRITICAL'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sensor_name TEXT NOT NULL,                  -- 'AJ-SR04M', 'PMS5003', 'GY-521', 'BME280'
  current_value DOUBLE PRECISION NULL,
  threshold_value DOUBLE PRECISION NULL,
  unit TEXT NULL,                             -- 'cm', 'ug/m3', 'g', '°C'
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ NULL
);

-- Update existing table if already run in Supabase
ALTER TABLE public.disaster_alerts 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.disaster_alerts 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_disaster_alerts_unresolved 
ON public.disaster_alerts (is_resolved, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_disaster_alerts_station_id 
ON public.disaster_alerts (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_disaster_alerts_station')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iot_stations') THEN 
    ALTER TABLE public.disaster_alerts 
    ADD CONSTRAINT fk_disaster_alerts_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All on disaster_alerts" ON public.disaster_alerts;
CREATE POLICY "Allow All on disaster_alerts" ON public.disaster_alerts FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 7. View: v_latest_sensor_reading (Fast 1-row fetch for mobile app dashboard)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_latest_sensor_reading CASCADE;
CREATE VIEW public.v_latest_sensor_reading AS
SELECT 
  id,
  station_id,
  timestamp,
  water_level,
  pm1,
  pm25,
  pm10,
  pitch,
  roll,
  yaw,
  acc_x,
  acc_y,
  acc_z,
  gyro_x,
  gyro_y,
  gyro_z,
  temperature,
  humidity,
  pressure
FROM public.sensor_logs
ORDER BY id DESC
LIMIT 1;

GRANT SELECT ON public.v_latest_sensor_reading TO anon, authenticated, service_role;


-- ----------------------------------------------------------------------------
-- 8. View: v_active_disaster_alerts (Active alerts for notifications)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_active_disaster_alerts CASCADE;
CREATE VIEW public.v_active_disaster_alerts AS
SELECT 
  id,
  station_id,
  timestamp,
  alert_type,
  severity,
  title,
  message,
  sensor_name,
  current_value,
  threshold_value,
  unit,
  device_id
FROM public.disaster_alerts
WHERE is_resolved = FALSE
ORDER BY timestamp DESC;

GRANT SELECT ON public.v_active_disaster_alerts TO anon, authenticated, service_role;
