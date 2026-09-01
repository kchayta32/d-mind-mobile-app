-- ============================================================================
--  D-MIND IoT Station: 02_create_individual_sensor_tables.sql
--  Description: Individual Separate Tables for each Sensor type + Auto-sync Trigger
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: water_level_logs (AJ-SR04M Ultrasonic Water Level)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_level_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  water_level DOUBLE PRECISION NOT NULL,       -- Water level in cm or percentage
  distance_cm DOUBLE PRECISION NULL,          -- Raw distance from sensor head to water surface
  status TEXT DEFAULT 'NORMAL',                -- 'NORMAL', 'WARNING', 'CRITICAL'
  device_id TEXT DEFAULT 'ESP32_STATION_01'
);

CREATE INDEX IF NOT EXISTS idx_water_level_logs_timestamp 
ON public.water_level_logs ("timestamp" DESC);

ALTER TABLE public.water_level_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All on water_level_logs" ON public.water_level_logs FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 2. Table: pm_logs (PMS5003 Laser Particulate Matter)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pm_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pm1 DOUBLE PRECISION NULL,                  -- PM 1.0 (ug/m3)
  pm25 DOUBLE PRECISION NOT NULL,             -- PM 2.5 (ug/m3)
  pm10 DOUBLE PRECISION NULL,                 -- PM 10 (ug/m3)
  aqi_category TEXT NULL,                     -- e.g. 'Good', 'Moderate', 'Unhealthy'
  device_id TEXT DEFAULT 'ESP32_STATION_01'
);

CREATE INDEX IF NOT EXISTS idx_pm_logs_timestamp 
ON public.pm_logs ("timestamp" DESC);

ALTER TABLE public.pm_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All on pm_logs" ON public.pm_logs FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 3. Table: motion_logs (GY-521 / MPU6050 Motion, Gyro, Vibration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.motion_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pitch DOUBLE PRECISION NULL,                -- Tilt Pitch angle (deg)
  roll DOUBLE PRECISION NULL,                 -- Tilt Roll angle (deg)
  yaw DOUBLE PRECISION NULL,                  -- Orientation Yaw angle (deg)
  acc_x DOUBLE PRECISION NULL,                -- X-axis acceleration (g)
  acc_y DOUBLE PRECISION NULL,                -- Y-axis acceleration (g)
  acc_z DOUBLE PRECISION NULL,                -- Z-axis acceleration (g)
  gyro_x DOUBLE PRECISION NULL,               -- X-axis angular velocity (deg/s)
  gyro_y DOUBLE PRECISION NULL,               -- Y-axis angular velocity (deg/s)
  gyro_z DOUBLE PRECISION NULL,               -- Z-axis angular velocity (deg/s)
  vibration_delta DOUBLE PRECISION NULL,      -- Absolute deviation from 1.0g (|TotalAcc - 1.0|)
  is_anomaly BOOLEAN DEFAULT FALSE,           -- Flagged if abnormal vibration / tilt detected
  device_id TEXT DEFAULT 'ESP32_STATION_01'
);

CREATE INDEX IF NOT EXISTS idx_motion_logs_timestamp 
ON public.motion_logs ("timestamp" DESC);

ALTER TABLE public.motion_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All on motion_logs" ON public.motion_logs FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 4. Table: environment_logs (BME280 Temperature, Humidity, Pressure)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.environment_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  temperature DOUBLE PRECISION NOT NULL,      -- Ambient Temperature (°C)
  humidity DOUBLE PRECISION NOT NULL,         -- Relative Humidity (%)
  pressure DOUBLE PRECISION NOT NULL,         -- Barometric Pressure (hPa)
  heat_index DOUBLE PRECISION NULL,           -- Calculated Heat Index (°C)
  dew_point DOUBLE PRECISION NULL,            -- Calculated Dew Point (°C)
  device_id TEXT DEFAULT 'ESP32_STATION_01'
);

CREATE INDEX IF NOT EXISTS idx_environment_logs_timestamp 
ON public.environment_logs ("timestamp" DESC);

ALTER TABLE public.environment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All on environment_logs" ON public.environment_logs FOR ALL USING (true);


-- ----------------------------------------------------------------------------
-- 5. Optional Auto-Sync Trigger: Synchronizes sensor_logs to individual tables
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_sensor_logs_to_individual_tables()
RETURNS TRIGGER AS $$
DECLARE
  v_vibration DOUBLE PRECISION;
  v_is_anomaly BOOLEAN := FALSE;
  v_aqi_cat TEXT;
  v_water_status TEXT := 'NORMAL';
BEGIN
  -- 1. Sync Water Level
  IF NEW.water_level IS NOT NULL THEN
    IF NEW.water_level >= 140.0 THEN
      v_water_status := 'CRITICAL';
    ELSIF NEW.water_level >= 100.0 THEN
      v_water_status := 'WARNING';
    END IF;

    INSERT INTO public.water_level_logs (timestamp, water_level, status)
    VALUES (NEW.timestamp, NEW.water_level, v_water_status);
  END IF;

  -- 2. Sync PM Logs
  IF NEW.pm25 IS NOT NULL THEN
    IF NEW.pm25 <= 15.0 THEN v_aqi_cat := 'Very Good';
    ELSIF NEW.pm25 <= 25.0 THEN v_aqi_cat := 'Good';
    ELSIF NEW.pm25 <= 37.5 THEN v_aqi_cat := 'Moderate';
    ELSIF NEW.pm25 <= 75.0 THEN v_aqi_cat := 'Unhealthy';
    ELSE v_aqi_cat := 'Hazardous';
    END IF;

    INSERT INTO public.pm_logs (timestamp, pm1, pm25, pm10, aqi_category)
    VALUES (NEW.timestamp, NEW.pm1, NEW.pm25, NEW.pm10, v_aqi_cat);
  END IF;

  -- 3. Sync Motion Logs
  IF NEW.acc_x IS NOT NULL AND NEW.acc_y IS NOT NULL AND NEW.acc_z IS NOT NULL THEN
    v_vibration := ABS(SQRT(NEW.acc_x * NEW.acc_x + NEW.acc_y * NEW.acc_y + NEW.acc_z * NEW.acc_z) - 1.0);
    IF v_vibration > 0.45 OR ABS(COALESCE(NEW.pitch, 0)) > 35.0 OR ABS(COALESCE(NEW.roll, 0)) > 35.0 THEN
      v_is_anomaly := TRUE;
    END IF;

    INSERT INTO public.motion_logs (
      timestamp, pitch, roll, yaw, 
      acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, 
      vibration_delta, is_anomaly
    )
    VALUES (
      NEW.timestamp, NEW.pitch, NEW.roll, NEW.yaw, 
      NEW.acc_x, NEW.acc_y, NEW.acc_z, NEW.gyro_x, NEW.gyro_y, NEW.gyro_z, 
      v_vibration, v_is_anomaly
    );
  END IF;

  -- 4. Sync Environment Logs
  IF NEW.temperature IS NOT NULL AND NEW.humidity IS NOT NULL AND NEW.pressure IS NOT NULL THEN
    INSERT INTO public.environment_logs (timestamp, temperature, humidity, pressure)
    VALUES (NEW.timestamp, NEW.temperature, NEW.humidity, NEW.pressure);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to sensor_logs table
DROP TRIGGER IF EXISTS trg_sync_sensor_logs ON public.sensor_logs;
CREATE TRIGGER trg_sync_sensor_logs
AFTER INSERT ON public.sensor_logs
FOR EACH ROW
EXECUTE FUNCTION public.sync_sensor_logs_to_individual_tables();
