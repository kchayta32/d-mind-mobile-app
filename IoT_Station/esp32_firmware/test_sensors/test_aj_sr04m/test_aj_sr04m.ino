/*
 ============================================================================
  Project     : D-MIND IoT Station
  File        : test_aj_sr04m.ino
  Sensor      : AJ-SR04M (Waterproof Ultrasonic Distance / Water Level Sensor)
  Microcontroller: ESP32 DevKit V1 + Extension Board
 ============================================================================
  Wiring Pinout (ESP32 Extension Board):
  -------------------------------------------------------------
  AJ-SR04M Pin  | ESP32 Pin   | Extension Board Header | Notes
  -------------------------------------------------------------
  5V (VCC)      | 5V / VIN    | 5V Rail                | 5V Power Supply
  GND           | GND         | GND Rail               | Common Ground
  TRIG          | GPIO 5      | G5 (Digital Output)    | Ultrasonic Trigger
  ECHO          | GPIO 18     | G18 (Digital Input)    | Ultrasonic Echo
  -------------------------------------------------------------
  
  Notes:
  - Mode 1: Default Trigger/Echo pulse mode (R27 resistor unpopulated on sensor board).
  - Sound speed: 343 m/s at 20°C (0.0343 cm/µs).
  - Effective Range: ~20 cm to 450 cm (Blind zone ~20 cm).
 ============================================================================
*/

#define TRIG_PIN 5
#define ECHO_PIN 18

// Sound velocity constant (cm/microsecond)
const float SOUND_SPEED = 0.0343;

// Calibration parameters for Water Level calculation (adjustable)
const float SENSOR_MOUNT_HEIGHT_CM = 200.0; // Total height from sensor to bottom of water tank/river bed (cm)
const float MAX_WATER_DEPTH_CM     = 180.0; // Maximum safe water depth (cm)
const float BLIND_ZONE_CM          = 20.0;  // Physical minimum detection blind zone

// Moving average filter
const int SAMPLE_COUNT = 5;
float distanceSamples[SAMPLE_COUNT];
int sampleIndex = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================================");
  Serial.println("   D-MIND IoT Station: AJ-SR04M Water Sensor Test ");
  Serial.println("=================================================");

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Initialize trigger pin LOW
  digitalWrite(TRIG_PIN, LOW);
  delay(100);

  // Pre-fill filter array
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    distanceSamples[i] = 0.0;
  }

  Serial.println("AJ-SR04M Ultrasonic Sensor Initialized.");
  Serial.println("Format: Distance (cm) | Water Level (cm) | Water Level (%)");
  Serial.println("-------------------------------------------------");
}

float measureRawDistance() {
  // Clear the trigger pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(5);

  // Trigger pulse: HIGH for 15 microseconds (AJ-SR04M requires >10us)
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(15);
  digitalWrite(TRIG_PIN, LOW);

  // Read the echo pin (timeout after 30,000 µs ~ 5 meters)
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    // Timeout or out of range
    return -1.0;
  }

  // Calculate distance in cm (duration * sound_speed / 2)
  float distance = (duration * SOUND_SPEED) / 2.0;
  return distance;
}

float getFilteredDistance() {
  float raw = measureRawDistance();
  if (raw < 0) {
    return -1.0; // Invalid measurement
  }

  // Store in circular buffer
  distanceSamples[sampleIndex] = raw;
  sampleIndex = (sampleIndex + 1) % SAMPLE_COUNT;

  // Calculate moving average
  float sum = 0.0;
  int validCount = 0;
  for (int i = 0; i < SAMPLE_COUNT; i++) {
    if (distanceSamples[i] > 0) {
      sum += distanceSamples[i];
      validCount++;
    }
  }

  if (validCount > 0) {
    return sum / validCount;
  }
  return raw;
}

void loop() {
  float distance = getFilteredDistance();

  if (distance < 0 || distance > 600.0) {
    Serial.println("[WARNING] Sensor reading timeout or out of range!");
  } else {
    // Calculate water level from bottom: Mount Height - Measured Distance
    float waterLevelCm = SENSOR_MOUNT_HEIGHT_CM - distance;
    if (waterLevelCm < 0) waterLevelCm = 0.0;
    if (waterLevelCm > MAX_WATER_DEPTH_CM) waterLevelCm = MAX_WATER_DEPTH_CM;

    // Calculate percentage (0 - 100%)
    float waterLevelPercent = (waterLevelCm / MAX_WATER_DEPTH_CM) * 100.0;

    Serial.print("Distance to Water: ");
    Serial.print(distance, 2);
    Serial.print(" cm | Water Level: ");
    Serial.print(waterLevelCm, 2);
    Serial.print(" cm (");
    Serial.print(waterLevelPercent, 1);
    Serial.print("%)");

    // Status warning
    if (waterLevelPercent >= 80.0) {
      Serial.print(" [ALERT: CRITICAL HIGH WATER!]");
    } else if (waterLevelPercent >= 60.0) {
      Serial.print(" [WARNING: HIGH WATER LEVEL]");
    } else {
      Serial.print(" [NORMAL]");
    }
    Serial.println();
  }

  delay(1000);
}
