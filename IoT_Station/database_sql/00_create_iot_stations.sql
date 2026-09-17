-- ============================================================================
--  D-MIND IoT Station: 00_create_iot_stations.sql
--  Description: Master Hardware Stations Table (IoT Telemetry Source Entity)
-- ============================================================================

-- 1. Create table: iot_stations
CREATE TABLE IF NOT EXISTS public.iot_stations (
  station_id VARCHAR(50) PRIMARY KEY,                         -- e.g. 'ESP32_STATION_01'
  station_name VARCHAR(100) NOT NULL,                         -- e.g. 'D-MIND Station 01 - Chiang Mai'
  location_name VARCHAR(150) NULL,                            -- e.g. 'Mae Taeng River Basin, Chiang Mai'
  latitude DOUBLE PRECISION NULL,                             -- GPS Latitude (e.g. 18.7883)
  longitude DOUBLE PRECISION NULL,                            -- GPS Longitude (e.g. 98.9853)
  status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',               -- 'ONLINE', 'OFFLINE', 'MAINTENANCE'
  firmware_version VARCHAR(20) DEFAULT 'v1.0.0',              -- ESP32 firmware release tag
  battery_level DOUBLE PRECISION DEFAULT 100.0,               -- Remaining battery percentage (0.0 - 100.0)
  solar_voltage DOUBLE PRECISION DEFAULT 5.0,                 -- Solar cell incoming voltage (V)
  last_ping TIMESTAMPTZ DEFAULT NOW(),                        -- Last heartbeat received
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast station monitoring
CREATE INDEX IF NOT EXISTS idx_iot_stations_status 
ON public.iot_stations (status);

CREATE INDEX IF NOT EXISTS idx_iot_stations_last_ping 
ON public.iot_stations (last_ping DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.iot_stations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow Public Read on iot_stations" ON public.iot_stations;
CREATE POLICY "Allow Public Read on iot_stations"
ON public.iot_stations
FOR SELECT
TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow Admin and Service Role Manage iot_stations" ON public.iot_stations;
CREATE POLICY "Allow Admin and Service Role Manage iot_stations"
ON public.iot_stations
FOR ALL
TO service_role, postgres
USING (true)
WITH CHECK (true);

-- 5. Seed / Upsert Default Station (Ensures FKs to station_id will resolve)
INSERT INTO public.iot_stations (
  station_id, station_name, location_name, 
  latitude, longitude, status, firmware_version, 
  battery_level, solar_voltage, last_ping
)
VALUES (
  'ESP32_STATION_01', 
  'D-MIND Station 01 (Primary River Basin)', 
  'Mae Taeng Flood Warning Point, Chiang Mai',
  18.7883, 98.9853, 'ONLINE', 'v1.2.0',
  98.5, 5.12, NOW()
)
ON CONFLICT (station_id) DO UPDATE SET
  station_name = EXCLUDED.station_name,
  location_name = EXCLUDED.location_name,
  status = EXCLUDED.status,
  updated_at = NOW();
