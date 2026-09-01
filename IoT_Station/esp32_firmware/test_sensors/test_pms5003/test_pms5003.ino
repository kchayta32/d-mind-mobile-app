/*
 ============================================================================
  Project     : D-MIND IoT Station
  File        : test_pms5003.ino
  Sensor      : PMS5003 (Plantower Laser Dust & Particulate Matter Sensor)
  Microcontroller: ESP32 DevKit V1 + Extension Board
 ============================================================================
  Wiring Pinout (ESP32 Extension Board):
  -------------------------------------------------------------
  PMS5003 Pin   | ESP32 Pin   | Extension Board Header | Notes
  -------------------------------------------------------------
  Pin 1 (VCC)   | 5V / VIN    | 5V Rail                | 5V Power Supply (Fan & Laser)
  Pin 2 (GND)   | GND         | GND Rail               | Common Ground
  Pin 3 (SET)   | 3.3V / Open | -                      | High = Active mode (Default)
  Pin 4 (TXD)   | GPIO 16     | RX2                    | Connects to ESP32 RX2
  Pin 5 (RXD)   | GPIO 17     | TX2                    | Connects to ESP32 TX2 (Optional)
  Pin 6 (RESET) | 3.3V / Open | -                      | High = Normal working mode
  -------------------------------------------------------------

  Notes:
  - Baud rate: 9600 bps, 8 data bits, no parity, 1 stop bit (8N1).
  - ESP32 HardwareSerial2 is mapped to RX2 (GPIO 16) and TX2 (GPIO 17).
 ============================================================================
*/

#define PMS_RX_PIN 16
#define PMS_TX_PIN 17

HardwareSerial pmsSerial(2);

// PMS5003 Data Structure
struct PMSData {
  uint16_t framelen;
  uint16_t pm10_standard, pm25_standard, pm100_standard; // CF=1, standard particle
  uint16_t pm10_env, pm25_env, pm100_env;                 // Under atmospheric environment
  uint16_t particles_03um, particles_05um, particles_10um, particles_25um, particles_50um, particles_100um;
  uint16_t unused;
  uint16_t checksum;
};

PMSData pmsData;

bool readPMSdata(Stream *s) {
  if (!s->available()) {
    return false;
  }

  // Look for 0x42 0x4D header
  if (s->peek() != 0x42) {
    s->read();
    return false;
  }

  // Ensure at least 32 bytes are available
  if (s->available() < 32) {
    return false;
  }

  uint8_t buffer[32];
  s->readBytes(buffer, 32);

  if (buffer[0] != 0x42 || buffer[1] != 0x4D) {
    return false;
  }

  // Verify checksum
  uint16_t sum = 0;
  for (uint8_t i = 0; i < 30; i++) {
    sum += buffer[i];
  }

  uint16_t checksum = ((uint16_t)buffer[30] << 8) | buffer[31];
  if (sum != checksum) {
    Serial.println("[PMS5003 ERROR] Checksum mismatch!");
    return false;
  }

  // Unpack big-endian data
  pmsData.framelen        = ((uint16_t)buffer[2] << 8) | buffer[3];
  pmsData.pm10_standard   = ((uint16_t)buffer[4] << 8) | buffer[5];
  pmsData.pm25_standard   = ((uint16_t)buffer[6] << 8) | buffer[7];
  pmsData.pm100_standard  = ((uint16_t)buffer[8] << 8) | buffer[9];

  pmsData.pm10_env        = ((uint16_t)buffer[10] << 8) | buffer[11];
  pmsData.pm25_env        = ((uint16_t)buffer[12] << 8) | buffer[13];
  pmsData.pm100_env       = ((uint16_t)buffer[14] << 8) | buffer[15];

  pmsData.particles_03um  = ((uint16_t)buffer[16] << 8) | buffer[17];
  pmsData.particles_05um  = ((uint16_t)buffer[18] << 8) | buffer[19];
  pmsData.particles_10um  = ((uint16_t)buffer[20] << 8) | buffer[21];
  pmsData.particles_25um  = ((uint16_t)buffer[22] << 8) | buffer[23];
  pmsData.particles_50um  = ((uint16_t)buffer[24] << 8) | buffer[25];
  pmsData.particles_100um = ((uint16_t)buffer[26] << 8) | buffer[27];

  return true;
}

const char* getAQICategory(uint16_t pm25) {
  if (pm25 <= 15) return "Very Good (0-15 ug/m3)";
  if (pm25 <= 25) return "Good (15.1-25 ug/m3)";
  if (pm25 <= 37.5) return "Moderate (25.1-37.5 ug/m3)";
  if (pm25 <= 75) return "Unhealthy for Sensitive Groups (37.6-75 ug/m3)";
  return "Hazardous (>75 ug/m3)";
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=================================================");
  Serial.println("   D-MIND IoT Station: PMS5003 Dust Sensor Test  ");
  Serial.println("=================================================");

  // Initialize PMS5003 Hardware Serial 2
  pmsSerial.begin(9600, SERIAL_8N1, PMS_RX_PIN, PMS_TX_PIN);
  delay(500);

  Serial.println("PMS5003 Serial Initialized at 9600 baud.");
  Serial.println("Waiting for sensor warm-up (30s optimal)...");
  Serial.println("-------------------------------------------------");
}

void loop() {
  if (readPMSdata(&pmsSerial)) {
    Serial.println("-------------------------------------------------");
    Serial.println("Concentration Units (Atmospheric Environment):");
    Serial.print("  PM 1.0 : "); Serial.print(pmsData.pm10_env);  Serial.println(" ug/m3");
    Serial.print("  PM 2.5 : "); Serial.print(pmsData.pm25_env);  Serial.println(" ug/m3");
    Serial.print("  PM 10  : "); Serial.print(pmsData.pm100_env); Serial.println(" ug/m3");
    
    Serial.print("Air Quality Status: ");
    Serial.println(getAQICategory(pmsData.pm25_env));

    if (pmsData.pm25_env > 37.5) {
      Serial.println("[ALERT] PM2.5 exceeds standard threshold!");
    }

    Serial.println("Particle Counts per 0.1L air:");
    Serial.print("  > 0.3um: "); Serial.println(pmsData.particles_03um);
    Serial.print("  > 0.5um: "); Serial.println(pmsData.particles_05um);
    Serial.print("  > 1.0um: "); Serial.println(pmsData.particles_10um);
    Serial.print("  > 2.5um: "); Serial.println(pmsData.particles_25um);
    Serial.print("  > 5.0um: "); Serial.println(pmsData.particles_50um);
    Serial.print("  > 10 um: "); Serial.println(pmsData.particles_100um);
    Serial.println("-------------------------------------------------");
  }

  delay(2000);
}
