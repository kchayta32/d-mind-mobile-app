/*
 ============================================================================
  Project     : D-MIND IoT Station
  File        : test_bme280.ino
  Sensor      : BME280 (Temperature, Relative Humidity, Barometric Pressure)
  Microcontroller: ESP32 DevKit V1 + Extension Board
 ============================================================================
  Wiring Pinout (ESP32 Extension Board):
  -------------------------------------------------------------
  BME280 Pin    | ESP32 Pin   | Extension Board Header | Notes
  -------------------------------------------------------------
  VCC / VIN     | 3.3V        | 3.3V Rail              | 3.3V Power Supply
  GND           | GND         | GND Rail               | Common Ground
  SCL           | GPIO 22     | G22 (I2C SCL)          | I2C Clock Bus
  SDA           | GPIO 21     | G21 (I2C SDA)          | I2C Data Bus
  -------------------------------------------------------------

  Required Arduino Libraries:
  1. "Adafruit BME280 Library" by Adafruit
  2. "Adafruit Unified Sensor" by Adafruit
 ============================================================================
*/

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#define I2C_SDA 21
#define I2C_SCL 22
#define SEALEVELPRESSURE_HPA (1013.25)

Adafruit_BME280 bme; // I2C instance
bool sensorFound = false;

// Calculate Dew Point (approximate Magnus formula)
float calculateDewPoint(float tempC, float humidity) {
  float a = 17.27;
  float b = 237.7;
  float alpha = ((a * tempC) / (b + tempC)) + log(humidity / 100.0);
  return (b * alpha) / (a - alpha);
}

// Calculate Heat Index in Celsius (Rothfusz equation)
float calculateHeatIndex(float tempC, float humidity) {
  float tempF = (tempC * 9.0 / 5.0) + 32.0;
  float hiF = -42.379 + 2.04901523 * tempF + 10.14333127 * humidity
              - 0.22475541 * tempF * humidity - 0.00683783 * tempF * tempF
              - 0.05481717 * humidity * humidity + 0.00122874 * tempF * tempF * humidity
              + 0.00085282 * tempF * humidity * humidity - 0.00000199 * tempF * tempF * humidity * humidity;
  return (hiF - 32.0) * 5.0 / 9.0;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================================");
  Serial.println("   D-MIND IoT Station: BME280 Environment Test   ");
  Serial.println("=================================================");

  Wire.begin(I2C_SDA, I2C_SCL);

  // Attempt connection at address 0x76 (standard for most purple modules)
  if (bme.begin(0x76, &Wire)) {
    Serial.println("[SUCCESS] BME280 detected at I2C address 0x76.");
    sensorFound = true;
  } else if (bme.begin(0x77, &Wire)) {
    Serial.println("[SUCCESS] BME280 detected at I2C address 0x77.");
    sensorFound = true;
  } else {
    Serial.println("[ERROR] Could not find a valid BME280 sensor!");
    Serial.println("Please check your wiring (SDA=21, SCL=22, 3.3V, GND).");
  }

  if (sensorFound) {
    // Recommended indoor/outdoor monitoring settings
    bme.setSampling(Adafruit_BME280::MODE_NORMAL,
                    Adafruit_BME280::SAMPLING_X2,  // temperature
                    Adafruit_BME280::SAMPLING_X16, // pressure
                    Adafruit_BME280::SAMPLING_X1,  // humidity
                    Adafruit_BME280::FILTER_X16,
                    Adafruit_BME280::STANDBY_MS_500);
  }
}

void loop() {
  if (!sensorFound) {
    // Retry scanning
    if (bme.begin(0x76, &Wire) || bme.begin(0x77, &Wire)) {
      sensorFound = true;
      Serial.println("[RECONNECTED] BME280 initialized.");
    } else {
      Serial.println("[WAITING] Retrying BME280 sensor connection...");
      delay(3000);
      return;
    }
  }

  float temperature = bme.readTemperature();       // °C
  float humidity    = bme.readHumidity();          // %
  float pressure    = bme.readPressure() / 100.0F; // hPa
  float altitude    = bme.readAltitude(SEALEVELPRESSURE_HPA); // meters

  float dewPoint  = calculateDewPoint(temperature, humidity);
  float heatIndex = calculateHeatIndex(temperature, humidity);

  Serial.println("-------------------------------------------------");
  Serial.print("Temperature : "); Serial.print(temperature, 2); Serial.println(" °C");
  Serial.print("Humidity    : "); Serial.print(humidity, 2);    Serial.println(" %");
  Serial.print("Pressure    : "); Serial.print(pressure, 2);    Serial.println(" hPa");
  Serial.print("Approx Alt  : "); Serial.print(altitude, 2);    Serial.println(" m");
  Serial.print("Dew Point   : "); Serial.print(dewPoint, 2);    Serial.println(" °C");
  Serial.print("Heat Index  : "); Serial.print(heatIndex, 2);   Serial.println(" °C");

  // Environmental alerts
  if (humidity > 85.0) {
    Serial.println("[ALERT] High Humidity (>85%) - Rain/Storm condition likely!");
  }
  if (heatIndex > 40.0) {
    Serial.println("[ALERT] Extreme Heat Index Danger (>40°C)!");
  }
  if (pressure < 1000.0) {
    Serial.println("[ALERT] Low Barometric Pressure (<1000 hPa) - Low pressure system!");
  }
  Serial.println("-------------------------------------------------");

  delay(2000);
}
