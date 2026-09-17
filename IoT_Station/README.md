# 🌊 D-MIND IoT Station: Comprehensive Hardware, Firmware & Gateway Documentation

ระบบชุดอุปกรณ์ตรวจวัดภาคสนามอัจฉริยะ (Smart Environmental & Disaster Monitoring Station) ภายใต้โครงการ **D-MIND** ควบคุมด้วย **ESP32 + Extension Board** และประมวลผลผ่าน **Raspberry Pi Gateway & Server** เชื่อมต่อฐานข้อมูล **Supabase** แบบ Real-time

---

## 📁 โครงสร้างโฟลเดอร์ในโปรเจกต์ `IoT_Station`

```
IoT_Station/
├── README.md                                  # เอกสารภาพรวมและการใช้งานระบบ
├── esp32_firmware/                            # ซอร์สโค้ด Arduino สำหรับบอร์ด ESP32
│   ├── test_sensors/                          # โค้ดทดสอบเซนเซอร์แบบแยกตัว (เซนเซอร์ละไฟล์)
│   │   ├── test_aj_sr04m/
│   │   │   └── test_aj_sr04m.ino              # โค้ดทดสอบ AJ-SR04M (วัดระดับน้ำอัลตราโซนิก)
│   │   ├── test_pms5003/
│   │   │   └── test_pms5003.ino               # โค้ดทดสอบ PMS5003 (วัดฝุ่น PM1.0, PM2.5, PM10)
│   │   ├── test_bme280/
│   │   │   └── test_bme280.ino                # โค้ดทดสอบ BME280 (วัดอุณหภูมิ, ความชื้น, ความกดอากาศ)
│   │   └── test_gy521_mpu6050/
│   │       └── test_gy521_mpu6050.ino         # โค้ดทดสอบ GY-521 (วัดการสั่นสะเทือน, ความเอียง Pitch/Roll/Yaw)
│   └── combined_station/                      # โค้ดรวมเซนเซอร์ทุกตัวในสเก็ตช์เดียว
│       ├── combined_station.ino               # โค้ดหลักอ่าน 4 เซนเซอร์ ส่งผ่าน MQTT / Supabase
│       ├── config.h                           # ไฟล์ตั้งค่า Wi-Fi, MQTT IP, Supabase Keys, และค่าพิน
│       └── SensorManager.h                    # คลาสจัดการอ่านเซนเซอร์และแพ็กเป็น JSON
├── pinout_and_wiring/                         # ตารางการต่อวงจรและจับคู่ขา Pinout
│   ├── PINOUT_TABLES.md                       # ตาราง Pinout ทั้งแบบแยกเซนเซอร์และแบบรวม
│   └── WIRING_DIAGRAM.md                      # ไดอะแกรมวงจรไฟฟ้าและคำแนะนำด้านพลังงาน
├── database_sql/                              # สคริปต์ SQL Editor สำหรับ Supabase
│   ├── 00_create_iot_stations.sql             # ตารางหลัก iot_stations และดัชนี
│   ├── 01_create_sensor_logs.sql              # ตารางรวม sensor_logs (มี station_id) + ดัชนี + RLS
│   ├── 02_create_individual_sensor_tables.sql # ตารางแยกเซนเซอร์ (water_level, pm, motion, env) + Trigger ซิงค์
│   ├── 03_create_api_keys_and_alerts.sql      # ตาราง api_keys (มี client_id), disaster_alerts และ Views
│   ├── 04_sample_seed_data.sql                # ข้อมูลตัวอย่างสถานี, ลูกข่าย และการตรวจวัด
│   ├── 05_upgrade_schema_v2.sql               # สคริปต์อัปเกรดฐานข้อมูลเดิมเป็นเวอร์ชัน 2.0 (Idempotent)
│   └── README.md                              # คำอธิบายลำดับการรัน SQL บน Supabase
└── raspberry_pi_gateway/                      # ระบบ Gateway บน Raspberry Pi (FastAPI + MQTT)
    ├── app/
    │   ├── main.py                            # FastAPI Entrypoint + Background MQTT Daemon
    │   ├── config.py                          # ตั้งค่าตัวแปรระบบและเกณฑ์การแจ้งเตือนภัยพิบัติ
    │   ├── auth.py                            # ระบบสร้าง, เข้ารหัส SHA-256 และตรวจ API Key
    │   ├── mqtt_subscriber.py                 # ตัวรับข้อมูล MQTT จาก ESP32 บันทึกลง Supabase
    │   ├── models/                            # Pydantic Schemas (Sensors, API Keys, Alerts)
    │   ├── routers/                           # API Endpoints (/sensors, /auth, /alerts)
    │   └── services/                          # Supabase Service & Alert Evaluation Engine
    ├── requirements.txt                       # ไบรารี Python สำหรับ Gateway
    ├── .env                                   # ตั้งค่า Supabase Keys และ Connection String
    ├── Dockerfile                             # ไฟล์สร้าง Docker Image
    ├── docker-compose.yml                     # รัน Mosquitto MQTT Broker + FastAPI ผ่าน Docker
    ├── setup_rpi.sh                           # สคริปต์ติดตั้งอัตโนมัติแบบ 1-Click บน Linux
    └── README.md                              # คู่มือการใช้งาน Gateway และ API Reference
```

---

## ⚡ ตารางสรุปการต่อขาเซนเซอร์ (ESP32 Pinout Summary)

| เซนเซอร์ | ขาบนเซนเซอร์ | ขาบน ESP32 / Shield | ฟังก์ชันการทำงาน |
| :--- | :--- | :--- | :--- |
| **AJ-SR04M** | 5V, GND, TRIG, ECHO | `5V`, `GND`, `GPIO 5`, `GPIO 18` | วัดระดับน้ำ (อัลตราโซนิกกันน้ำ) |
| **PMS5003** | VCC, GND, TXD, RXD | `5V`, `GND`, `GPIO 16 (RX2)`, `GPIO 17 (TX2)` | วัดฝุ่นละอองเลเซอร์ PM1.0, PM2.5, PM10 |
| **BME280** | VIN, GND, SCL, SDA | `3.3V`, `GND`, `GPIO 22`, `GPIO 21` | วัดอุณหภูมิ, ความชื้น, ความกดอากาศ (I2C: `0x76`) |
| **GY-521** | VCC, GND, SCL, SDA, AD0 | `3.3V`, `GND`, `GPIO 22`, `GPIO 21`, `GND` | วัดความเอียง, แรงสั่นสะเทือน, แผ่นดินไหว (I2C: `0x68`) |

---

## 🗄️ การรัน SQL บน Supabase SQL Editor

คัดลอกไฟล์ในโฟลเดอร์ `database_sql/` ไปวางและรันใน **Supabase SQL Editor**:
- **กรณีต้องการอัปเกรดฐานข้อมูลเดิม (แนะนำสำหรับระบบที่รันไปแล้ว):**
  รันไฟล์ `05_upgrade_schema_v2.sql` เพียงไฟล์เดียว ซึ่งมีคำสั่ง `ADD COLUMN IF NOT EXISTS`, ฟังก์ชัน Trigger ปรับปรุงใหม่ และสร้างตารางเชื่อมโยงทั้งหมดแบบ Idempotent
- **กรณีเริ่มต้นติดตั้งฐานข้อมูลใหม่ตั้งแต่ต้น (Fresh Install):**
  1. รัน `00_create_iot_stations.sql`: สร้างตาราง `iot_stations`
  2. รัน `01_create_sensor_logs.sql`: สร้างตาราง `sensor_logs` พร้อม Index และ RLS
  3. รัน `02_create_individual_sensor_tables.sql`: สร้างตารางแยกเซนเซอร์พร้อม Trigger ซิงค์ข้อมูลอัตโนมัติ
  4. รัน `03_create_api_keys_and_alerts.sql`: สร้างระบบ `client_applications`, `api_keys`, `api_key_scopes`, `api_request_logs`, `disaster_alerts`
  5. *(ทางเลือก)* รัน `04_sample_seed_data.sql`: โหลดข้อมูลทดสอบสถานีและโทรมาตร

---

## 🚀 ลำดับการเปิดใช้งานระบบ (Step-by-Step Deployment)

1. **เริ่มต้น Gateway บน Raspberry Pi**:
   ```bash
   cd ~/IoT_Station/raspberry_pi_gateway
   ./setup_rpi.sh
   ```
   *ตรวจเช็ก IP ของ Raspberry Pi เช่น `192.168.1.100`*

2. **สร้าง API Key สำหรับ Mobile App**:
   ```bash
   curl -X POST http://192.168.1.100:8000/api/v1/auth/keys \
     -H "X-Admin-Secret: dmind_admin_secret_super_secure_key_2026" \
     -H "Content-Type: application/json" \
     -d '{"key_name": "Mobile App Client", "rate_limit_rpm": 120}'
   ```

3. **ตั้งค่าและแฟลชโค้ด ESP32**:
   - เปิดไฟล์ `esp32_firmware/combined_station/config.h`
   - แก้ไข `WIFI_SSID`, `WIFI_PASSWORD`, และ `MQTT_BROKER_HOST` ให้ตรงกับ IP ของ Raspberry Pi
   - อัปโหลดผ่านโปรแกรม **Arduino IDE**

4. **ตรวจสอบผลลัพธ์บน Mobile App / Dashboard**:
   - โมบายแอปพลิเคชันเรียกใช้งาน Endpoint `GET /api/v1/sensors/latest` และ `GET /api/v1/alerts` โดยแนบ Header `X-API-Key`
