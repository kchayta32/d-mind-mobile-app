-- ============================================================================
--  D-MIND IoT Station: 01_create_sensor_logs.sql
--  Description: Master Combined Sensor Logs Table (Aggregate Root Entity)
--  Updated: Includes station_id foreign key & backward-compatible ALTER TABLE
-- ============================================================================

-- 1. Create combined sensor_logs table (If not exists)
CREATE TABLE IF NOT EXISTS public.sensor_logs (
  id BIGSERIAL NOT NULL,
  station_id VARCHAR(50) NULL DEFAULT 'ESP32_STATION_01',
  timestamp TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
  water_level DOUBLE PRECISION NULL,
  pm1 DOUBLE PRECISION NULL,
  pm25 DOUBLE PRECISION NULL,
  pm10 DOUBLE PRECISION NULL,
  pitch DOUBLE PRECISION NULL,
  roll DOUBLE PRECISION NULL,
  yaw DOUBLE PRECISION NULL,
  acc_x DOUBLE PRECISION NULL,
  acc_y DOUBLE PRECISION NULL,
  acc_z DOUBLE PRECISION NULL,
  gyro_x DOUBLE PRECISION NULL,
  gyro_y DOUBLE PRECISION NULL,
  gyro_z DOUBLE PRECISION NULL,
  temperature DOUBLE PRECISION NULL,
  humidity DOUBLE PRECISION NULL,
  pressure DOUBLE PRECISION NULL,
  CONSTRAINT sensor_logs_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 2. Update existing sensor_logs table if already created in Supabase
ALTER TABLE public.sensor_logs 
ADD COLUMN IF NOT EXISTS station_id VARCHAR(50) DEFAULT 'ESP32_STATION_01';

-- Backfill default station_id for any prior records
UPDATE public.sensor_logs 
SET station_id = 'ESP32_STATION_01' 
WHERE station_id IS NULL;

-- 3. Indexes for fast time-series & station filtering
CREATE INDEX IF NOT EXISTS idx_sensor_logs_timestamp 
ON public.sensor_logs USING btree ("timestamp" DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_sensor_logs_station_id 
ON public.sensor_logs (station_id);

-- 4. Foreign Key to iot_stations (Safe check)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_sensor_logs_station'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'iot_stations'
  ) THEN 
    ALTER TABLE public.sensor_logs 
    ADD CONSTRAINT fk_sensor_logs_station 
    FOREIGN KEY (station_id) REFERENCES public.iot_stations(station_id) ON DELETE SET NULL; 
  END IF; 
END $$;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for Anon, Authenticated and Service Role
DROP POLICY IF EXISTS "Allow Public Read on sensor_logs" ON public.sensor_logs;
CREATE POLICY "Allow Public Read on sensor_logs"
ON public.sensor_logs
FOR SELECT
TO public, anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow Ingest on sensor_logs" ON public.sensor_logs;
CREATE POLICY "Allow Ingest on sensor_logs"
ON public.sensor_logs
FOR INSERT
TO public, anon, authenticated, service_role
WITH CHECK (true);

-- 7. Enable Supabase Realtime replication (Safe check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'sensor_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_logs;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Silently pass if publication does not exist in local testing
END $$;
