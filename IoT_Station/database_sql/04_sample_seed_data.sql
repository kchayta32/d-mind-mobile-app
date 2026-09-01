-- ============================================================================
--  D-MIND IoT Station: 04_sample_seed_data.sql
--  Description: Initial sample mock data for testing queries and dashboards
-- ============================================================================

-- Insert sample sensor logs across recent timestamps
INSERT INTO public.sensor_logs (
  timestamp, water_level, pm1, pm25, pm10, 
  pitch, roll, yaw, 
  acc_x, acc_y, acc_z, 
  gyro_x, gyro_y, gyro_z, 
  temperature, humidity, pressure
) VALUES
(NOW() - INTERVAL '15 minutes', 45.2, 8.5, 14.2, 22.1,  0.5, -0.2, 180.0,  0.01, -0.02, 0.99,  0.02, -0.01, 0.00,  28.4, 65.2, 1011.8),
(NOW() - INTERVAL '10 minutes', 48.0, 9.1, 16.0, 24.5,  0.6, -0.1, 180.1,  0.02, -0.01, 1.00,  0.01,  0.00, 0.01,  28.7, 66.0, 1011.5),
(NOW() - INTERVAL '5 minutes',  52.4, 12.3, 24.8, 38.0, 0.4, -0.3, 180.2, -0.01,  0.02, 0.98, -0.02,  0.01, 0.00,  29.1, 68.4, 1011.0),
(NOW() - INTERVAL '2 minutes',  78.6, 21.0, 42.5, 65.0, 1.2, -0.8, 180.5,  0.05, -0.04, 1.02,  0.15, -0.08, 0.04,  29.8, 74.5, 1009.8),
(NOW(),                         92.1, 28.4, 58.2, 89.4, 2.5, -1.4, 181.0,  0.12, -0.08, 1.08,  0.42, -0.25, 0.10,  30.2, 79.1, 1008.2);

-- Insert sample initial disaster alert
INSERT INTO public.disaster_alerts (
  timestamp, alert_type, severity, title, message, sensor_name, current_value, threshold_value, unit
) VALUES
(
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
