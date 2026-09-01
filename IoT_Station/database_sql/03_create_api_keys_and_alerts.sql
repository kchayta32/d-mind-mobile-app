-- ============================================================================
--  D-MIND IoT Station: 03_create_api_keys_and_alerts.sql
--  Description: API Keys authentication table & Disaster Alerts management
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: api_keys (FastAPI Key Management for Mobile App)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,                     -- e.g. "D-Mind Mobile App Client", "Admin Test"
  key_prefix TEXT NOT NULL,                   -- First 8-10 chars for identification (e.g. "dmind_live_a1b2")
  hashed_key TEXT NOT NULL UNIQUE,            -- SHA-256 hash of full API key
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,                -- NULL = Never expires
  is_active BOOLEAN NOT NULL DEFAULT TRUE,    -- Soft revoke toggle
  rate_limit_rpm INT DEFAULT 120,             -- Requests per minute
  description TEXT NULL,
  last_used_at TIMESTAMPTZ NULL,
  total_requests BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hashed_key ON public.api_keys (hashed_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys (is_active);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Allow service_role full management; allow read-only for key lookup
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
-- 2. Table: disaster_alerts (Automated Warnings for Mobile App)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
  id SERIAL PRIMARY KEY,
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
  resolved_at TIMESTAMPTZ NULL,
  device_id TEXT DEFAULT 'ESP32_STATION_01'
);

CREATE INDEX IF NOT EXISTS idx_disaster_alerts_unresolved 
ON public.disaster_alerts (is_resolved, timestamp DESC);

ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All on disaster_alerts" ON public.disaster_alerts FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 3. View: v_latest_sensor_reading (Fast 1-row fetch for mobile app dashboard)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_latest_sensor_reading AS
SELECT 
  id,
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


-- ----------------------------------------------------------------------------
-- 4. View: v_active_disaster_alerts (Active alerts for notifications)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_active_disaster_alerts AS
SELECT 
  id,
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
