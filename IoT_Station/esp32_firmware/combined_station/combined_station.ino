/*
 ============================================================================
  Project     : D-MIND IoT Station
  File        : combined_station.ino
  Description : Unified ESP32 Station Firmware reading 4 sensors:
                1. AJ-SR04M (Water Level)
                2. PMS5003  (PM1.0, PM2.5, PM10)
                3. BME280   (Temperature, Humidity, Pressure)
                4. GY-521   (MPU6050 Motion / Gyro / Orientation)
                Transmits data via MQTT to Raspberry Pi Gateway and/or
                directly to Supabase Cloud Database REST API.
  Microcontroller: ESP32 DevKit V1 + Extension Board
 ============================================================================
  Libraries Required:
  1. "PubSubClient" by Nick O'Leary (for MQTT)
  2. "ArduinoJson" (v6 or v7) by Benoit Blanchon
  3. "Adafruit BME280 Library" & "Adafruit Unified Sensor"
  4. "WiFi" & "HTTPClient" (Built-in with ESP32 Arduino Core)
 ============================================================================
*/

#include <WiFi.h>
#include <PubSubClient.h>
#include <HTTPClient.h>
#include "config.h"
#include "SensorManager.h"

WiFiClient espClient;
PubSubClient mqttClient(espClient);
SensorManager sensors;

unsigned long lastSampleTime = 0;
unsigned long lastMqttRetry = 0;

void setupWiFi() {
  delay(100);
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN)); // Blink
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(STATUS_LED_PIN, HIGH);
    Serial.println("\n[SUCCESS] Wi-Fi Connected!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("RSSI Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    digitalWrite(STATUS_LED_PIN, LOW);
    Serial.println("\n[WARNING] Wi-Fi Connection failed. Will retry in background...");
  }
}

void reconnectMQTT() {
  if (!ENABLE_MQTT_MODE) return;
  if (WiFi.status() != WL_CONNECTED) return;

  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastMqttRetry > 5000) {
      lastMqttRetry = now;
      Serial.print("Attempting MQTT connection to Gateway (");
      Serial.print(MQTT_BROKER_HOST);
      Serial.print(")...");

      bool connected = false;
      if (strlen(MQTT_USER) > 0) {
        connected = mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS);
      } else {
        connected = mqttClient.connect(MQTT_CLIENT_ID);
      }

      if (connected) {
        Serial.println(" CONNECTED!");
        // Publish online status
        String statusPayload = String("{\"station_id\":\"") + STATION_ID + "\",\"status\":\"ONLINE\"}";
        mqttClient.publish(MQTT_TOPIC_STATUS, statusPayload.c_str(), true);
      } else {
        Serial.print(" FAILED, rc=");
        Serial.print(mqttClient.state());
        Serial.println(" (Will retry in 5s)");
      }
    }
  }
}

bool sendToSupabaseDirect(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String endpoint = String(SUPABASE_URL) + "/rest/v1/sensor_logs";

  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
  http.addHeader("Prefer", "return=minimal");

  int httpResponseCode = http.POST(jsonPayload);
  bool success = (httpResponseCode >= 200 && httpResponseCode < 300);

  if (success) {
    Serial.printf("[SUPABASE DIRECT] Data ingested successfully. Code: %d\n", httpResponseCode);
  } else {
    Serial.printf("[SUPABASE DIRECT ERROR] Failed to send. Code: %d, Error: %s\n", 
                  httpResponseCode, http.errorToString(httpResponseCode).c_str());
  }

  http.end();
  return success;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, LOW);

  Serial.println("=================================================");
  Serial.println("       D-MIND IoT Station: Multi-Sensor Hub       ");
  Serial.println("=================================================");

  // Initialize sensors
  Serial.println("Initializing sensors (AJ-SR04M, PMS5003, BME280, GY-521)...");
  sensors.begin();
  Serial.println("Sensors initialized.");

  // Connect Wi-Fi
  setupWiFi();

  // Setup MQTT
  if (ENABLE_MQTT_MODE) {
    mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
    mqttClient.setBufferSize(1024); // Expand buffer for telemetry payload
  }

  Serial.println("=================================================");
  Serial.println("Station Running. Ready to stream telemetry data.");
  Serial.println("=================================================");
}

void loop() {
  // Maintain Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiCheck = 0;
    if (millis() - lastWifiCheck > WIFI_RECONNECT_INTERVAL_MS) {
      lastWifiCheck = millis();
      Serial.println("[Wi-Fi] Reconnecting...");
      WiFi.reconnect();
    }
  }

  // Maintain MQTT connection
  if (ENABLE_MQTT_MODE) {
    if (!mqttClient.connected()) {
      reconnectMQTT();
    } else {
      mqttClient.loop();
    }
  }

  // Read sensors and transmit at designated interval
  unsigned long now = millis();
  if (now - lastSampleTime >= SENSOR_SAMPLE_INTERVAL_MS) {
    lastSampleTime = now;

    // Read all 4 sensors
    sensors.readAll();

    // Serialize to JSON formatted for sensor_logs table
    String payload = sensors.toJSON();

    // Print to Serial Monitor
    Serial.println("\n----------------- [TELEMETRY REPORT] -----------------");
    Serial.printf("Water Level  : %.2f cm (Raw Dist: %.2f cm)\n", sensors.data.water_level, sensors.data.raw_distance);
    Serial.printf("Dust PM      : PM1.0=%.1f | PM2.5=%.1f | PM10=%.1f (ug/m3)\n", sensors.data.pm1, sensors.data.pm25, sensors.data.pm10);
    Serial.printf("Environment  : Temp=%.2f °C | Hum=%.2f %% | Pres=%.2f hPa\n", sensors.data.temperature, sensors.data.humidity, sensors.data.pressure);
    Serial.printf("Orientation  : Pitch=%+.2f° | Roll=%+.2f° | Yaw=%+.2f°\n", sensors.data.pitch, sensors.data.roll, sensors.data.yaw);
    Serial.printf("Acceleration : X=%+.3fg | Y=%+.3fg | Z=%+.3fg\n", sensors.data.acc_x, sensors.data.acc_y, sensors.data.acc_z);
    Serial.printf("Gyroscope    : X=%+.2f | Y=%+.2f | Z=%+.2f (deg/s)\n", sensors.data.gyro_x, sensors.data.gyro_y, sensors.data.gyro_z);
    Serial.print("JSON Payload : ");
    Serial.println(payload);

    // 1. Send via MQTT to Raspberry Pi Gateway
    if (ENABLE_MQTT_MODE && mqttClient.connected()) {
      bool published = mqttClient.publish(MQTT_TOPIC_DATA, payload.c_str());
      if (published) {
        Serial.println("[MQTT] Telemetry published to Raspberry Pi successfully.");
      } else {
        Serial.println("[MQTT ERROR] Failed to publish message.");
      }
    }

    // 2. Send directly to Supabase REST if configured
    if (ENABLE_SUPABASE_DIRECT) {
      sendToSupabaseDirect(payload);
    }

    Serial.println("------------------------------------------------------");
  }

  delay(20);
}
