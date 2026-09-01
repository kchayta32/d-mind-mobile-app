-- ============================================================================
--  D-MIND IoT Station: 01_create_sensor_logs.sql
--  Description: Master Combined Sensor Logs Table (As defined in specification)
-- ============================================================================

-- 1. Create combined sensor_logs table
CREATE TABLE IF NOT EXISTS public.sensor_logs (
  id SERIAL NOT NULL,
  timestamp TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
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

-- 2. Create index on timestamp for fast time-series filtering & ordering
CREATE INDEX IF NOT EXISTS idx_sensor_logs_timestamp 
ON public.sensor_logs USING btree ("timestamp") TABLESPACE pg_default;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.sensor_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Anon, Authenticated and Service Role
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

-- 5. Enable Supabase Realtime replication for instant live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_logs;
