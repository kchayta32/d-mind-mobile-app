/*
 ============================================================================
  Project     : D-MIND IoT Station
  File        : test_gy521_mpu6050.ino
  Sensor      : GY-521 (MPU-6050 6-Axis Accelerometer & Gyroscope)
  Microcontroller: ESP32 DevKit V1 + Extension Board
 ============================================================================
  Wiring Pinout (ESP32 Extension Board):
  -------------------------------------------------------------
  GY-521 Pin    | ESP32 Pin   | Extension Board Header | Notes
  -------------------------------------------------------------
  VCC           | 3.3V or 5V  | 3.3V Rail (or 5V)      | Module has onboard 3.3V LDO
  GND           | GND         | GND Rail               | Common Ground
  SCL           | GPIO 22     | G22 (I2C SCL)          | Shared I2C Clock Bus
  SDA           | GPIO 21     | G21 (I2C SDA)          | Shared I2C Data Bus
  AD0           | GND         | GND Rail               | Sets I2C Address to 0x68
  INT           | NC / Open   | -                      | Optional Interrupt Pin
  -------------------------------------------------------------

  Notes:
  - Default I2C Address: 0x68 (AD0=LOW) or 0x69 (AD0=HIGH).
  - Uses direct I2C register access via Wire.h for high efficiency & reliability.
  - Implements Complementary Filter for real-time Pitch, Roll, Yaw calculation.
  - Calculates Total G-force & detects abnormal vibration/earthquake shocks.
 ============================================================================
*/

#include <Wire.h>

#define I2C_SDA 21
#define I2C_SCL 22
#define MPU6050_ADDR 0x68

// MPU6050 Registers
#define MPU6050_SMPLRT_DIV   0x19
#define MPU6050_CONFIG       0x1A
#define MPU6050_GYRO_CONFIG  0x1B
#define MPU6050_ACCEL_CONFIG 0x1C
#define MPU6050_ACCEL_XOUT_H 0x3B
#define MPU6050_PWR_MGMT_1   0x6B
#define MPU6050_WHO_AM_I     0x75

// Raw sensor values
int16_t raw_acc_x, raw_acc_y, raw_acc_z;
int16_t raw_temp;
int16_t raw_gyro_x, raw_gyro_y, raw_gyro_z;

// Scaled physical units
float acc_x, acc_y, acc_z;       // in 'g' (1g ≈ 9.81 m/s^2)
float gyro_x, gyro_y, gyro_z;    // in degrees/second
float temp_c;

// Orientation angles (degrees)
float pitch = 0.0;
float roll  = 0.0;
float yaw   = 0.0;

// Gyro calibration offsets
float gyro_x_offset = 0.0;
float gyro_y_offset = 0.0;
float gyro_z_offset = 0.0;

// Timing for integration
unsigned long lastTime = 0;

void writeMPURegister(uint8_t reg, uint8_t data) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(reg);
  Wire.write(data);
  Wire.endTransmission();
}

bool initMPU6050() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_WHO_AM_I);
  if (Wire.endTransmission() != 0) {
    return false;
  }
  Wire.requestFrom((uint8_t)MPU6050_ADDR, (uint8_t)1);
  uint8_t whoami = Wire.read();
  if (whoami != 0x68 && whoami != 0x72 && whoami != 0x70) {
    Serial.print("[WARNING] Unknown WHO_AM_I id: 0x");
    Serial.println(whoami, HEX);
  }

  // Wake up MPU6050 (clear SLEEP bit)
  writeMPURegister(MPU6050_PWR_MGMT_1, 0x00);
  delay(100);

  // Set sample rate divider: 1kHz / (1 + 7) = 125 Hz
  writeMPURegister(MPU6050_SMPLRT_DIV, 0x07);

  // Set DLPF to ~44Hz bandwidth
  writeMPURegister(MPU6050_CONFIG, 0x03);

  // Set Gyroscope Full Scale Range: ±250 °/s (FS_SEL=0 -> 131 LSB/(°/s))
  writeMPURegister(MPU6050_GYRO_CONFIG, 0x00);

  // Set Accelerometer Full Scale Range: ±2g (AFS_SEL=0 -> 16384 LSB/g)
  writeMPURegister(MPU6050_ACCEL_CONFIG, 0x00);

  return true;
}

void calibrateGyroscope() {
  Serial.println("Calibrating Gyroscope... KEEP SENSOR STILL for 3 seconds.");
  float sum_gx = 0, sum_gy = 0, sum_gz = 0;
  const int CALIB_SAMPLES = 200;

  for (int i = 0; i < CALIB_SAMPLES; i++) {
    readRawMPU6050();
    sum_gx += raw_gyro_x / 131.0;
    sum_gy += raw_gyro_y / 131.0;
    sum_gz += raw_gyro_z / 131.0;
    delay(15);
  }

  gyro_x_offset = sum_gx / CALIB_SAMPLES;
  gyro_y_offset = sum_gy / CALIB_SAMPLES;
  gyro_z_offset = sum_gz / CALIB_SAMPLES;

  Serial.println("Calibration Complete!");
  Serial.print("Offsets -> GX: "); Serial.print(gyro_x_offset, 3);
  Serial.print(" | GY: "); Serial.print(gyro_y_offset, 3);
  Serial.print(" | GZ: "); Serial.println(gyro_z_offset, 3);
}

void readRawMPU6050() {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(MPU6050_ACCEL_XOUT_H);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU6050_ADDR, (uint8_t)14, (uint8_t)true);

  if (Wire.available() >= 14) {
    raw_acc_x = (Wire.read() << 8) | Wire.read();
    raw_acc_y = (Wire.read() << 8) | Wire.read();
    raw_acc_z = (Wire.read() << 8) | Wire.read();
    raw_temp  = (Wire.read() << 8) | Wire.read();
    raw_gyro_x = (Wire.read() << 8) | Wire.read();
    raw_gyro_y = (Wire.read() << 8) | Wire.read();
    raw_gyro_z = (Wire.read() << 8) | Wire.read();
  }
}

void updateSensorFusion() {
  readRawMPU6050();

  // Convert to engineering units
  acc_x = raw_acc_x / 16384.0; // in g
  acc_y = raw_acc_y / 16384.0;
  acc_z = raw_acc_z / 16384.0;

  gyro_x = (raw_gyro_x / 131.0) - gyro_x_offset; // in deg/s
  gyro_y = (raw_gyro_y / 131.0) - gyro_y_offset;
  gyro_z = (raw_gyro_z / 131.0) - gyro_z_offset;

  temp_c = (raw_temp / 340.0) + 36.53;

  // Calculate elapsed time (dt)
  unsigned long currentTime = millis();
  float dt = (currentTime - lastTime) / 1000.0;
  lastTime = currentTime;

  if (dt <= 0 || dt > 1.0) dt = 0.05; // Guard against rollover or first loop

  // Calculate accelerometer pitch and roll (angles from gravity vector)
  float acc_pitch = atan2(acc_y, sqrt(acc_x * acc_x + acc_z * acc_z)) * 180.0 / PI;
  float acc_roll  = atan2(-acc_x, acc_z) * 180.0 / PI;

  // Complementary Filter (96% Gyroscope integration + 4% Accelerometer baseline)
  pitch = 0.96 * (pitch + gyro_x * dt) + 0.04 * acc_pitch;
  roll  = 0.96 * (roll + gyro_y * dt) + 0.04 * acc_roll;
  yaw  += gyro_z * dt; // Yaw drift can be reset as needed
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================================");
  Serial.println("   D-MIND IoT Station: GY-521 (MPU6050) Test     ");
  Serial.println("=================================================");

  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(400000); // 400kHz Fast I2C

  if (!initMPU6050()) {
    Serial.println("[ERROR] Failed to initialize MPU6050! Check I2C wiring (SDA=21, SCL=22).");
    while (1) { delay(1000); }
  }

  Serial.println("[SUCCESS] MPU6050 Connected.");
  calibrateGyroscope();

  lastTime = millis();
  Serial.println("-------------------------------------------------");
  Serial.println("Format: Acc (X, Y, Z in g) | Gyro (X, Y, Z in deg/s) | Pitch, Roll, Yaw (deg)");
}

void loop() {
  updateSensorFusion();

  // Calculate Total Acceleration Vector Magnitude (G-Force)
  float total_acc_mag = sqrt(acc_x * acc_x + acc_y * acc_y + acc_z * acc_z);

  // Vibration deviation from 1.0g resting gravity
  float vibration_delta = abs(total_acc_mag - 1.0);

  Serial.println("-------------------------------------------------");
  Serial.printf("Acc  (g)     : X = %+.3f, Y = %+.3f, Z = %+.3f | Total = %.3f g\n", acc_x, acc_y, acc_z, total_acc_mag);
  Serial.printf("Gyro (deg/s) : X = %+.2f, Y = %+.2f, Z = %+.2f\n", gyro_x, gyro_y, gyro_z);
  Serial.printf("Orientation  : Pitch = %+.2f°, Roll = %+.2f°, Yaw = %+.2f°\n", pitch, roll, yaw);
  Serial.printf("Die Temp     : %.2f °C\n", temp_c);

  // Anomaly / Disaster detection
  if (vibration_delta > 0.45) {
    Serial.printf("[ALERT] High Abnormal Vibration / Earthquake Shock Detected! (Delta: %.2f g)\n", vibration_delta);
  } else if (abs(pitch) > 45.0 || abs(roll) > 45.0) {
    Serial.println("[ALERT] Severe Tilt Angle Detected (Landslide / Structure Collapse Warning)!");
  } else {
    Serial.println("[STATUS] Motion & Stability Normal.");
  }

  delay(200);
}
