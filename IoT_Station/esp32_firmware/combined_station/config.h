#ifndef CONFIG_H
#define CONFIG_H

// ============================================================================
//  D-MIND IoT Station: Configuration & Credentials
// ============================================================================

// --- Wi-Fi Network Configuration ---
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// --- Telemetry Transmission Mode ---
// Set to true to transmit via MQTT to Raspberry Pi Gateway (Diagram 3.1 architecture)
#define ENABLE_MQTT_MODE          true

// Set to true to send directly to Supabase REST API as secondary / fallback
#define ENABLE_SUPABASE_DIRECT    false

// --- Raspberry Pi MQTT Broker Settings ---
#define MQTT_BROKER_HOST "192.168.1.100" // Replace with Raspberry Pi local IP address
#define MQTT_BROKER_PORT 1883
#define MQTT_CLIENT_ID   "ESP32_DMIND_STATION_01"
#define MQTT_USER        ""              // Optional MQTT Username
#define MQTT_PASS        ""              // Optional MQTT Password
#define MQTT_TOPIC_DATA  "iot/dmind/telemetry"
#define MQTT_TOPIC_STATUS "iot/dmind/status"

// --- Supabase Cloud Database Settings ---
#define SUPABASE_URL     "https://evxjnivabxdlgfvncdcu.supabase.co"
#define SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2eGpuaXZhYnhkbGdmdm5jZGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTUyODgsImV4cCI6MjA2MjYzMTI4OH0.bKRopkNDOTQJETMRhpKVemdnaIass0HOnlTRoAaYCeU"

// --- Sensor Pinout Definitions (ESP32 DevKit V1) ---
// 1. AJ-SR04M Waterproof Ultrasonic
#define PIN_AJ_TRIG      5
#define PIN_AJ_ECHO      18

// 2. PMS5003 Laser Dust Sensor (HardwareSerial 2)
#define PIN_PMS_RX       16 // ESP32 RX2 connected to PMS5003 TX
#define PIN_PMS_TX       17 // ESP32 TX2 connected to PMS5003 RX

// 3. I2C Bus (Shared between BME280 & GY-521)
#define PIN_I2C_SDA      21
#define PIN_I2C_SCL      22

// --- I2C Addresses ---
#define ADDR_BME280      0x76 // Or 0x77
#define ADDR_GY521       0x68 // Or 0x69

// --- Water Level Calibration Constants (AJ-SR04M) ---
#define SENSOR_MOUNT_HEIGHT_CM  200.0 // Distance from sensor face to ground/bed (cm)
#define MAX_WATER_DEPTH_CM      180.0 // Max water height for 100% calculation (cm)

// --- Timers & Intervals ---
#define SENSOR_SAMPLE_INTERVAL_MS 5000  // 5 seconds between sensor readings
#define WIFI_RECONNECT_INTERVAL_MS 10000 // 10 seconds retry if disconnected

// Onboard LED Pin for Status Indication (usually GPIO 2 on ESP32 DevKit)
#define STATUS_LED_PIN   2

#endif // CONFIG_H
