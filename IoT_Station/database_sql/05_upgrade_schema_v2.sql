-- ============================================================================
--  D-MIND PLATFORM SCHEMA V2 MIGRATION & UPGRADE SCRIPT
--  File: 05_upgrade_schema_v2.sql
--  Description: Run this script directly in the Supabase SQL Editor.
--               - Safely UPDATES existing tables using ALTER TABLE ... ADD COLUMN IF NOT EXISTS
--               - CREATES new tables (iot_stations, client_applications, scopes, logs, etc.)
--               - Preserves all existing data in Supabase without loss or disruption
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. HARDWARE LAYER: CREATE iot_stations (NEW TABLE) & SEED DEFAULT
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.iot_stations (
  station_id VARCHAR(50) PRIMARY KEY,
  station_name VARCHAR(100) NOT NULL,
  location_name VARCHAR(150) NULL,
  latitude DOUBLE PRECISION NULL,
  longitude DOUBLE PRECISION NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
  firmware_version VARCHAR(20) DEFAULT 'v1.0.0',
  battery_level DOUBLE PRECISION DEFAULT 100.0,
  solar_voltage DOUBLE PRECISION DEFAULT 5.0,
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iot_stations_status ON public.iot_stations (status);
CREATE INDEX IF NOT EXISTS idx_iot_stations_last_ping ON public.iot_stations (last_ping DESC);

ALTER TABLE public.iot_stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Read on iot_stations" ON public.iot_stations;
CREATE POLICY "Allow Public Read on iot_stations" ON public.iot_stations FOR SELECT TO public, anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow Admin and Service Role Manage iot_stations" ON public.iot_stations;
CREATE POLICY "Allow Admin and Service Role Manage iot_stations" ON public.iot_stations FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);

-- Upsert initial primary station
INSERT INTO public.iot_stations (
  station_id, station_name, location_name, 
  latitude, longitude, status, firmware_version, 
  battery_level, solar_voltage, last_ping
) VALUES (
  'ESP32_STATION_01', 
  'D-MIND Station 01 (Primary River Basin)', 
  'Mae Taeng Flood Warning Point, Chiang Mai',
  18.7883, 98.9853, 'ONLINE', 'v1.2.0',
  98.5, 5.12, NOW()
) ON CONFLICT (station_id) DO UPDATE SET
  station_name = EXCLUDED.station_name,
  location_name = EXCLUDED.location_name,
  status = EXCLUDED.status,
  updated_at = NOW();


-- ============================================================================
-- 2. TELEMETRY LAYER: UPDATE sensor_logs & SENSOR PARTITIONS (EXISTING TABLES)
-- ============================================================================

-- 2.1 Update Master sensor_logs
ALTER TABLE public.sensor_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.sensor_logs 
SET station_id = 'ESP32_STATION_01' 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_sensor_logs_station_id ON public.sensor_logs (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sensor_logs_station') THEN 
    ALTER TABLE public.sensor_logs 
    ADD CONSTRAINT fk_sensor_logs_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.2 Update water_level_logs
ALTER TABLE public.water_level_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.water_level_logs 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_water_level_logs_station_id ON public.water_level_logs (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_water_level_station') THEN 
    ALTER TABLE public.water_level_logs 
    ADD CONSTRAINT fk_water_level_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.3 Update pm_logs
ALTER TABLE public.pm_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.pm_logs 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_pm_logs_station_id ON public.pm_logs (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pm_logs_station') THEN 
    ALTER TABLE public.pm_logs 
    ADD CONSTRAINT fk_pm_logs_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.4 Update motion_logs
ALTER TABLE public.motion_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.motion_logs 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_motion_logs_station_id ON public.motion_logs (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_motion_logs_station') THEN 
    ALTER TABLE public.motion_logs 
    ADD CONSTRAINT fk_motion_logs_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.5 Update environment_logs
ALTER TABLE public.environment_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.environment_logs 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_environment_logs_station_id ON public.environment_logs (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_environment_logs_station') THEN 
    ALTER TABLE public.environment_logs 
    ADD CONSTRAINT fk_environment_logs_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.6 Update disaster_alerts
ALTER TABLE public.disaster_alerts 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

UPDATE public.disaster_alerts 
SET station_id = COALESCE(device_id, 'ESP32_STATION_01') 
WHERE station_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_disaster_alerts_station_id ON public.disaster_alerts (station_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_disaster_alerts_station') THEN 
    ALTER TABLE public.disaster_alerts 
    ADD CONSTRAINT fk_disaster_alerts_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 2.7 Update Auto-Sync Trigger Function
CREATE OR REPLACE FUNCTION public.sync_sensor_logs_to_individual_tables()
RETURNS TRIGGER AS $$
DECLARE
  v_station_id VARCHAR(50);
  v_vibration DOUBLE PRECISION;
  v_is_anomaly BOOLEAN := FALSE;
  v_aqi_cat TEXT;
  v_water_status TEXT := 'NORMAL';
  v_heat_index DOUBLE PRECISION;
  v_dew_point DOUBLE PRECISION;
BEGIN
  v_station_id := COALESCE(NEW.station_id, 'ESP32_STATION_01');

  -- 1. Sync Water Level
  IF NEW.water_level IS NOT NULL THEN
    IF NEW.water_level >= 140.0 THEN
      v_water_status := 'CRITICAL';
    ELSIF NEW.water_level >= 100.0 THEN
      v_water_status := 'WARNING';
    END IF;

    INSERT INTO public.water_level_logs (station_id, device_id, timestamp, water_level, status)
    VALUES (v_station_id, v_station_id, NEW.timestamp, NEW.water_level, v_water_status);
  END IF;

  -- 2. Sync PM Logs
  IF NEW.pm25 IS NOT NULL THEN
    IF NEW.pm25 <= 15.0 THEN v_aqi_cat := 'Very Good';
    ELSIF NEW.pm25 <= 25.0 THEN v_aqi_cat := 'Good';
    ELSIF NEW.pm25 <= 37.5 THEN v_aqi_cat := 'Moderate';
    ELSIF NEW.pm25 <= 75.0 THEN v_aqi_cat := 'Unhealthy';
    ELSE v_aqi_cat := 'Hazardous';
    END IF;

    INSERT INTO public.pm_logs (station_id, device_id, timestamp, pm1, pm25, pm10, aqi_category)
    VALUES (v_station_id, v_station_id, NEW.timestamp, NEW.pm1, NEW.pm25, NEW.pm10, v_aqi_cat);
  END IF;

  -- 3. Sync Motion Logs
  IF NEW.acc_x IS NOT NULL AND NEW.acc_y IS NOT NULL AND NEW.acc_z IS NOT NULL THEN
    v_vibration := ABS(SQRT(NEW.acc_x * NEW.acc_x + NEW.acc_y * NEW.acc_y + NEW.acc_z * NEW.acc_z) - 1.0);
    IF v_vibration > 0.45 OR ABS(COALESCE(NEW.pitch, 0)) > 35.0 OR ABS(COALESCE(NEW.roll, 0)) > 35.0 THEN
      v_is_anomaly := TRUE;
    END IF;

    INSERT INTO public.motion_logs (
      station_id, device_id, timestamp, pitch, roll, yaw, 
      acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, 
      vibration_delta, is_anomaly
    )
    VALUES (
      v_station_id, v_station_id, NEW.timestamp, NEW.pitch, NEW.roll, NEW.yaw, 
      NEW.acc_x, NEW.acc_y, NEW.acc_z, NEW.gyro_x, NEW.gyro_y, NEW.gyro_z, 
      v_vibration, v_is_anomaly
    );
  END IF;

  -- 4. Sync Environment Logs
  IF NEW.temperature IS NOT NULL AND NEW.humidity IS NOT NULL AND NEW.pressure IS NOT NULL THEN
    v_dew_point := NEW.temperature - ((100.0 - NEW.humidity) / 5.0);
    v_heat_index := NEW.temperature;

    INSERT INTO public.environment_logs (
      station_id, device_id, timestamp, 
      temperature, humidity, pressure, heat_index, dew_point
    )
    VALUES (
      v_station_id, v_station_id, NEW.timestamp, 
      NEW.temperature, NEW.humidity, NEW.pressure, v_heat_index, v_dew_point
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_sensor_logs ON public.sensor_logs;
CREATE TRIGGER trg_sync_sensor_logs
AFTER INSERT ON public.sensor_logs
FOR EACH ROW
EXECUTE FUNCTION public.sync_sensor_logs_to_individual_tables();


-- ============================================================================
-- 3. INGRESS & SECURITY LAYER: CREATE client_applications (NEW) & UPDATE api_keys
-- ============================================================================

-- 3.1 Create client_applications table
CREATE TABLE IF NOT EXISTS public.client_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(100) NOT NULL,
  app_type VARCHAR(30) NOT NULL DEFAULT 'mobile_android',
  bundle_id VARCHAR(100) NULL,
  developer_contact VARCHAR(150) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_apps_status ON public.client_applications (status);
CREATE INDEX IF NOT EXISTS idx_client_apps_bundle ON public.client_applications (bundle_id);

ALTER TABLE public.client_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read on client_applications" ON public.client_applications;
CREATE POLICY "Allow Read on client_applications" ON public.client_applications FOR SELECT TO public, anon, authenticated USING (true);

-- Seed default client app
INSERT INTO public.client_applications (
  id, app_name, app_type, bundle_id, developer_contact, status
) VALUES (
  'd1111111-1111-1111-1111-111111111111', 
  'D-MIND Android Mobile App (Official Client)', 
  'mobile_android', 
  'com.dmind.app', 
  'dev@d-mind.org', 
  'ACTIVE'
) ON CONFLICT (id) DO UPDATE SET
  app_name = EXCLUDED.app_name,
  bundle_id = EXCLUDED.bundle_id,
  status = EXCLUDED.status;

-- 3.2 Update existing api_keys table
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS client_id UUID NULL;

UPDATE public.api_keys 
SET client_id = 'd1111111-1111-1111-1111-111111111111' 
WHERE client_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_client_id ON public.api_keys (client_id);

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_api_keys_client') THEN 
    ALTER TABLE public.api_keys 
    ADD CONSTRAINT fk_api_keys_client 
    FOREIGN KEY (client_id) REFERENCES public.client_applications(id) ON DELETE SET NULL; 
  END IF; 
END $$;


-- ============================================================================
-- 4. GATEWAY CONTROL LAYER: CREATE SCOPES, ENDPOINTS & REQUEST LOGS (NEW TABLES)
-- ============================================================================

-- 4.1 Table: api_key_scopes
CREATE TABLE IF NOT EXISTS public.api_key_scopes (
  id SERIAL PRIMARY KEY,
  key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  scope_name VARCHAR(50) NOT NULL,
  description VARCHAR(150) NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_key_scope UNIQUE (key_id, scope_name)
);

CREATE INDEX IF NOT EXISTS idx_api_key_scopes_key_id ON public.api_key_scopes (key_id);
ALTER TABLE public.api_key_scopes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Read on api_key_scopes" ON public.api_key_scopes;
CREATE POLICY "Allow Read on api_key_scopes" ON public.api_key_scopes FOR SELECT TO public, anon, authenticated USING (true);

-- 4.2 Table: fastapi_endpoints
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

INSERT INTO public.fastapi_endpoints (endpoint_path, http_method, required_scope, rate_limit_tier, auth_scheme, description)
VALUES 
  ('/api/v1/sensors/latest', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch latest single-row telemetry reading'),
  ('/api/v1/sensors/history', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch historical telemetry records'),
  ('/api/v1/sensors/stats', 'GET', 'sensors:read', '120 rpm', 'X-API-Key', 'Fetch 24-hour sensor summary statistics'),
  ('/api/v1/alerts/active', 'GET', 'alerts:read', '120 rpm', 'X-API-Key', 'Fetch unresolved active disaster alerts'),
  ('/api/v1/telemetry', 'POST', 'telemetry:write', '120 rpm', 'X-API-Key', 'Hardware station direct telemetry ingest')
ON CONFLICT (endpoint_path, http_method) DO NOTHING;

-- 4.3 Table: api_request_logs
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


-- ============================================================================
-- 5. EMERGENCY SERVICES & DISPATCH LAYER (NEW RELATED TABLES)
-- ============================================================================

-- 5.1 Table: device_push_tokens (FCM Mobile Tokens)
CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NULL REFERENCES public.client_applications(id) ON DELETE SET NULL,
  user_id UUID NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) DEFAULT 'android',
  installation_id VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_push_tokens_token ON public.device_push_tokens (token);
CREATE INDEX IF NOT EXISTS idx_device_push_tokens_active ON public.device_push_tokens (is_active);

ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Manage device_push_tokens" ON public.device_push_tokens;
CREATE POLICY "Allow Manage device_push_tokens" ON public.device_push_tokens FOR ALL USING (true) WITH CHECK (true);

-- 5.2 Table: realtime_alerts (Official Regional Broadcast Alerts)
CREATE TABLE IF NOT EXISTS public.realtime_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id VARCHAR(50) NULL REFERENCES public.iot_stations(station_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type VARCHAR(30) NOT NULL,
  severity_level INTEGER NOT NULL DEFAULT 3,
  coordinates JSONB NULL,
  radius_km DOUBLE PRECISION DEFAULT 10.0,
  affected_provinces TEXT[] NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_realtime_alerts_active ON public.realtime_alerts (is_active, created_at DESC);
ALTER TABLE public.realtime_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow Public Read realtime_alerts" ON public.realtime_alerts;
CREATE POLICY "Allow Public Read realtime_alerts" ON public.realtime_alerts FOR SELECT TO public, anon, authenticated USING (true);
DROP POLICY IF EXISTS "Allow Service Write realtime_alerts" ON public.realtime_alerts;
CREATE POLICY "Allow Service Write realtime_alerts" ON public.realtime_alerts FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);

-- 5.3 Table: alert_deliveries (Push Delivery Tracking)
CREATE TABLE IF NOT EXISTS public.alert_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.realtime_alerts(id) ON DELETE CASCADE,
  token_id UUID NOT NULL REFERENCES public.device_push_tokens(id) ON DELETE CASCADE,
  delivery_method VARCHAR(20) DEFAULT 'push',
  delivery_status VARCHAR(20) DEFAULT 'sent',
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_deliveries_alert ON public.alert_deliveries (alert_id);
ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All on alert_deliveries" ON public.alert_deliveries;
CREATE POLICY "Allow All on alert_deliveries" ON public.alert_deliveries FOR ALL USING (true) WITH CHECK (true);

-- 5.4 Table: victim_reports (Citizen SOS Requests)
CREATE TABLE IF NOT EXISTS public.victim_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NULL REFERENCES public.client_applications(id) ON DELETE SET NULL,
  name VARCHAR(100) NULL,
  contact VARCHAR(30) NULL,
  description TEXT NULL,
  coordinates JSONB NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_victim_reports_status ON public.victim_reports (status, created_at DESC);
ALTER TABLE public.victim_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All on victim_reports" ON public.victim_reports;
CREATE POLICY "Allow All on victim_reports" ON public.victim_reports FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- 6. VIEWS UPGRADE (Compatible with station_id)
-- ============================================================================

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

COMMIT;

-- ============================================================================
-- 7. POST-MIGRATION VERIFICATION
-- ============================================================================
SELECT 
  table_name, 
  (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'iot_stations', 'sensor_logs', 'water_level_logs', 'pm_logs', 
    'motion_logs', 'environment_logs', 'disaster_alerts', 'client_applications', 
    'api_keys', 'api_key_scopes', 'fastapi_endpoints', 'api_request_logs',
    'device_push_tokens', 'realtime_alerts', 'alert_deliveries', 'victim_reports'
  )
ORDER BY table_name;
