#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include "config.h"

// MPU6050 Register Addresses
#define MPU_PWR_MGMT_1   0x6B
#define MPU_SMPLRT_DIV   0x19
#define MPU_CONFIG       0x1A
#define MPU_GYRO_CONFIG  0x1B
#define MPU_ACCEL_CONFIG 0x1C
#define MPU_ACCEL_XOUT_H 0x3B

struct SensorData {
  // AJ-SR04M
  float water_level;   // Water height in cm (or %)
  float raw_distance;  // Raw distance in cm

  // PMS5003
  float pm1;           // PM1.0 (ug/m3)
  float pm25;          // PM2.5 (ug/m3)
  float pm10;          // PM10 (ug/m3)

  // GY-521 (MPU6050)
  float pitch;         // Degrees
  float roll;          // Degrees
  float yaw;           // Degrees
  float acc_x;         // g
  float acc_y;         // g
  float acc_z;         // g
  float gyro_x;        // deg/s
  float gyro_y;        // deg/s
  float gyro_z;        // deg/s

  // BME280
  float temperature;   // Celsius
  float humidity;      // %RH
  float pressure;      // hPa

  // Sensor health status flags
  bool bme_ok;
  bool mpu_ok;
  bool pms_ok;
  bool ultrasonic_ok;
};

class SensorManager {
private:
  Adafruit_BME280 bme;
  HardwareSerial pmsSerial = HardwareSerial(2);

  float gyro_offset_x = 0;
  float gyro_offset_y = 0;
  float gyro_offset_z = 0;
  unsigned long last_fusion_time = 0;

  // AJ-SR04M Sound constant
  const float sound_speed = 0.0343;

  void writeMPU(uint8_t reg, uint8_t val) {
    Wire.beginTransmission(ADDR_GY521);
    Wire.write(reg);
    Wire.write(val);
    Wire.endTransmission();
  }

  bool initMPU() {
    Wire.beginTransmission(ADDR_GY521);
    Wire.write(0x75); // WHO_AM_I
    if (Wire.endTransmission() != 0) return false;

    Wire.requestFrom((uint8_t)ADDR_GY521, (uint8_t)1);
    if (!Wire.available()) return false;
    uint8_t id = Wire.read();

    writeMPU(MPU_PWR_MGMT_1, 0x00); // Wake up
    delay(50);
    writeMPU(MPU_SMPLRT_DIV, 0x07);
    writeMPU(MPU_CONFIG, 0x03);     // DLPF 44Hz
    writeMPU(MPU_GYRO_CONFIG, 0x00); // +-250 deg/s
    writeMPU(MPU_ACCEL_CONFIG, 0x00); // +-2g

    // Fast calibration
    float gx = 0, gy = 0, gz = 0;
    for (int i = 0; i < 50; i++) {
      int16_t rx, ry, rz;
      Wire.beginTransmission(ADDR_GY521);
      Wire.write(0x43);
      Wire.endTransmission(false);
      Wire.requestFrom((uint8_t)ADDR_GY521, (uint8_t)6);
      if (Wire.available() >= 6) {
        rx = (Wire.read() << 8) | Wire.read();
        ry = (Wire.read() << 8) | Wire.read();
        rz = (Wire.read() << 8) | Wire.read();
        gx += rx / 131.0;
        gy += ry / 131.0;
        gz += rz / 131.0;
      }
      delay(10);
    }
    gyro_offset_x = gx / 50.0;
    gyro_offset_y = gy / 50.0;
    gyro_offset_z = gz / 50.0;

    return true;
  }

public:
  SensorData data;

  SensorManager() {}

  void begin() {
    // 1. AJ-SR04M Pins
    pinMode(PIN_AJ_TRIG, OUTPUT);
    pinMode(PIN_AJ_ECHO, INPUT);
    digitalWrite(PIN_AJ_TRIG, LOW);

    // 2. PMS5003 UART
    pmsSerial.begin(9600, SERIAL_8N1, PIN_PMS_RX, PIN_PMS_TX);

    // 3. I2C Wire
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    Wire.setClock(400000);

    // 4. BME280
    data.bme_ok = bme.begin(ADDR_BME280, &Wire);
    if (!data.bme_ok) {
      data.bme_ok = bme.begin(0x77, &Wire);
    }

    // 5. GY-521 MPU6050
    data.mpu_ok = initMPU();

    last_fusion_time = millis();
  }

  void readUltrasonic() {
    digitalWrite(PIN_AJ_TRIG, LOW);
    delayMicroseconds(5);
    digitalWrite(PIN_AJ_TRIG, HIGH);
    delayMicroseconds(15);
    digitalWrite(PIN_AJ_TRIG, LOW);

    unsigned long duration = pulseIn(PIN_AJ_ECHO, HIGH, 35000);
    if (duration > 0) {
      float distance = (duration * sound_speed) / 2.0;
      data.raw_distance = distance;
      
      // Calculate water level from base
      float level = SENSOR_MOUNT_HEIGHT_CM - distance;
      if (level < 0) level = 0;
      if (level > MAX_WATER_DEPTH_CM) level = MAX_WATER_DEPTH_CM;
      data.water_level = level;
      data.ultrasonic_ok = true;
    } else {
      data.ultrasonic_ok = false;
    }
  }

  void readPMS() {
    if (!pmsSerial.available()) return;
    
    // Look for frame header
    while (pmsSerial.available() && pmsSerial.peek() != 0x42) {
      pmsSerial.read();
    }

    if (pmsSerial.available() >= 32) {
      uint8_t buf[32];
      pmsSerial.readBytes(buf, 32);
      if (buf[0] == 0x42 && buf[1] == 0x4D) {
        uint16_t sum = 0;
        for (int i = 0; i < 30; i++) sum += buf[i];
        uint16_t chk = ((uint16_t)buf[30] << 8) | buf[31];
        if (sum == chk) {
          data.pm1  = ((uint16_t)buf[10] << 8) | buf[11];
          data.pm25 = ((uint16_t)buf[12] << 8) | buf[13];
          data.pm10 = ((uint16_t)buf[14] << 8) | buf[15];
          data.pms_ok = true;
        }
      }
    }
  }

  void readBME() {
    if (data.bme_ok) {
      data.temperature = bme.readTemperature();
      data.humidity    = bme.readHumidity();
      data.pressure    = bme.readPressure() / 100.0F; // hPa
    }
  }

  void readMPU() {
    if (!data.mpu_ok) return;

    Wire.beginTransmission(ADDR_GY521);
    Wire.write(MPU_ACCEL_XOUT_H);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)ADDR_GY521, (uint8_t)14, (uint8_t)true);

    if (Wire.available() >= 14) {
      int16_t rx = (Wire.read() << 8) | Wire.read();
      int16_t ry = (Wire.read() << 8) | Wire.read();
      int16_t rz = (Wire.read() << 8) | Wire.read();
      Wire.read(); Wire.read(); // Skip die temp
      int16_t rgx = (Wire.read() << 8) | Wire.read();
      int16_t rgy = (Wire.read() << 8) | Wire.read();
      int16_t rgz = (Wire.read() << 8) | Wire.read();

      data.acc_x = rx / 16384.0;
      data.acc_y = ry / 16384.0;
      data.acc_z = rz / 16384.0;

      data.gyro_x = (rgx / 131.0) - gyro_offset_x;
      data.gyro_y = (rgy / 131.0) - gyro_offset_y;
      data.gyro_z = (rgz / 131.0) - gyro_offset_z;

      unsigned long now = millis();
      float dt = (now - last_fusion_time) / 1000.0;
      last_fusion_time = now;
      if (dt <= 0 || dt > 1.0) dt = 0.05;

      float acc_pitch = atan2(data.acc_y, sqrt(data.acc_x * data.acc_x + data.acc_z * data.acc_z)) * 180.0 / PI;
      float acc_roll  = atan2(-data.acc_x, data.acc_z) * 180.0 / PI;

      data.pitch = 0.96 * (data.pitch + data.gyro_x * dt) + 0.04 * acc_pitch;
      data.roll  = 0.96 * (data.roll + data.gyro_y * dt) + 0.04 * acc_roll;
      data.yaw  += data.gyro_z * dt;
    }
  }

  void readAll() {
    readUltrasonic();
    readPMS();
    readBME();
    readMPU();
  }

  String toJSON() {
    StaticJsonDocument<512> doc;
    
    // Schema aligns exactly with Supabase sensor_logs table
    doc["water_level"]  = serialized(String(data.water_level, 2));
    doc["pm1"]          = serialized(String(data.pm1, 1));
    doc["pm25"]         = serialized(String(data.pm25, 1));
    doc["pm10"]         = serialized(String(data.pm10, 1));
    doc["pitch"]        = serialized(String(data.pitch, 2));
    doc["roll"]         = serialized(String(data.roll, 2));
    doc["yaw"]          = serialized(String(data.yaw, 2));
    doc["acc_x"]        = serialized(String(data.acc_x, 3));
    doc["acc_y"]        = serialized(String(data.acc_y, 3));
    doc["acc_z"]        = serialized(String(data.acc_z, 3));
    doc["gyro_x"]       = serialized(String(data.gyro_x, 2));
    doc["gyro_y"]       = serialized(String(data.gyro_y, 2));
    doc["gyro_z"]       = serialized(String(data.gyro_z, 2));
    doc["temperature"]  = serialized(String(data.temperature, 2));
    doc["humidity"]     = serialized(String(data.humidity, 2));
    doc["pressure"]     = serialized(String(data.pressure, 2));

    String jsonString;
    serializeJson(doc, jsonString);
    return jsonString;
  }
};

#endif // SENSOR_MANAGER_H
