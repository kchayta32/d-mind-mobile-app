-- ============================================================================
--  D-MIND IoT Station: 04_sample_seed_data.sql
--  Description: Initial sample seed data for testing queries, FastAPI, and app clients
--  Updated: Includes station_id, client_id, scopes, and sample push token
--           Includes defensive table safeguards so it runs cleanly in any order
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Prerequisites Safeguard: Ensure tables and columns exist
-- ----------------------------------------------------------------------------
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

ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS client_id UUID NULL;

CREATE TABLE IF NOT EXISTS public.api_key_scopes (
  id SERIAL PRIMARY KEY,
  key_id UUID NOT NULL,
  scope_name VARCHAR(50) NOT NULL,
  description VARCHAR(150) NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_key_scope UNIQUE (key_id, scope_name)
);

CREATE TABLE IF NOT EXISTS public.device_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NULL,
  user_id UUID NULL,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) DEFAULT 'android',
  installation_id VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sensor_logs ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';
ALTER TABLE public.disaster_alerts ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

-- ----------------------------------------------------------------------------
-- 1. Ensure Station Exists
-- ----------------------------------------------------------------------------
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
) ON CONFLICT (station_id) DO NOTHING;

-- 2. Ensure Client Application Exists
INSERT INTO public.client_applications (
  id, app_name, app_type, bundle_id, developer_contact, status
) VALUES (
  'd1111111-1111-1111-1111-111111111111', 
  'D-MIND Android Mobile App (Official Client)', 
  'mobile_android', 
  'com.dmind.app', 
  'dev@d-mind.org', 
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed Sample API Key (Hash of 'dmind_live_sample_key_12345678')
INSERT INTO public.api_keys (
  id, client_id, key_name, key_prefix, hashed_key, 
  rate_limit_rpm, is_active, description
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'd1111111-1111-1111-1111-111111111111',
  'D-Mind Android Client Production Key',
  'dmind_live_samp',
  -- SHA-256 of 'dmind_live_sample_key_12345678'
  '2c5443e2e5e7e00858e9f80164627a69b76c81fa79a1f2b3802e3b2e5ef6a345',
  120,
  TRUE,
  'Official production API Key for Android Native Client telemetry access'
) ON CONFLICT (hashed_key) DO NOTHING;

-- 4. Seed API Key Scopes
INSERT INTO public.api_key_scopes (key_id, scope_name, description)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'sensors:read', 'Permission to read latest telemetry and historical data'),
  ('a1111111-1111-1111-1111-111111111111', 'alerts:read', 'Permission to read active disaster alerts')
ON CONFLICT (key_id, scope_name) DO NOTHING;

-- 5. Seed Sample Mobile Device Push Token (FCM)
INSERT INTO public.device_push_tokens (
  id, client_id, token, platform, installation_id, is_active
) VALUES (
  'f1111111-1111-1111-1111-111111111111',
  'd1111111-1111-1111-1111-111111111111',
  'fcm_token_sample_android_client_device_001_dmind_test',
  'android',
  'install_pixel_7_pro_001',
  TRUE
) ON CONFLICT (token) DO NOTHING;

-- 6. Insert sample sensor logs across recent timestamps
INSERT INTO public.sensor_logs (
  station_id, timestamp, water_level, pm1, pm25, pm10, 
  pitch, roll, yaw, 
  acc_x, acc_y, acc_z, 
  gyro_x, gyro_y, gyro_z, 
  temperature, humidity, pressure
) VALUES
('ESP32_STATION_01', NOW() - INTERVAL '15 minutes', 45.2, 8.5, 14.2, 22.1,  0.5, -0.2, 180.0,  0.01, -0.02, 0.99,  0.02, -0.01, 0.00,  28.4, 65.2, 1011.8),
('ESP32_STATION_01', NOW() - INTERVAL '10 minutes', 48.0, 9.1, 16.0, 24.5,  0.6, -0.1, 180.1,  0.02, -0.01, 1.00,  0.01,  0.00, 0.01,  28.7, 66.0, 1011.5),
('ESP32_STATION_01', NOW() - INTERVAL '5 minutes',  52.4, 12.3, 24.8, 38.0, 0.4, -0.3, 180.2, -0.01,  0.02, 0.98, -0.02,  0.01, 0.00,  29.1, 68.4, 1011.0),
('ESP32_STATION_01', NOW() - INTERVAL '2 minutes',  78.6, 21.0, 42.5, 65.0, 1.2, -0.8, 180.5,  0.05, -0.04, 1.02,  0.15, -0.08, 0.04,  29.8, 74.5, 1009.8),
('ESP32_STATION_01', NOW(),                         92.1, 28.4, 58.2, 89.4, 2.5, -1.4, 181.0,  0.12, -0.08, 1.08,  0.42, -0.25, 0.10,  30.2, 79.1, 1008.2);

-- 7. Insert sample initial disaster alert
INSERT INTO public.disaster_alerts (
  station_id, timestamp, alert_type, severity, title, message, sensor_name, current_value, threshold_value, unit
) VALUES
(
  'ESP32_STATION_01',
  NOW() - INTERVAL '2 minutes',
  'PM25_HIGH',
  'WARNING',
  'ตรวจพบค่าฝุ่น PM 2.5 เกินเกณฑ์มาตรฐาน',
  'เซนเซอร์ PMS5003 ตรวจพบค่า PM 2.5 อยู่ที่ 58.2 ug/m3 ซึ่งเกินเกณฑ์ปลอดภัย (37.5 ug/m3)',
  'PMS5003',
  58.2,
  37.5,
  'ug/m3'
);
