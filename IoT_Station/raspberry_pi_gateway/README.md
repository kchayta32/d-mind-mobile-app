# 🍓 D-MIND Raspberry Pi Gateway & FastAPI Backend

คู่มือการติดตั้งและการทำงานของระบบ **Raspberry Pi Gateway** สำหรับรับข้อมูลจาก ESP32 ผ่าน MQTT แปลงและประมวลผลเป็น REST API ด้วย **FastAPI** จัดเก็บลง **Supabase** และระบบรักษาความปลอดภัยด้วย **API Key Management** สำหรับโมบายแอปพลิเคชัน

---

## 🏗️ สถาปัตยกรรมการทำงาน (Architecture Overview)

```
+----------------+      MQTT (JSON)      +-----------------------------+      HTTPS / REST      +--------------------+
|  ESP32 Station | --------------------> | Raspberry Pi Gateway        | ---------------------> | Supabase Database  |
|  (4 Sensors)   |  Topic:               | - Mosquitto MQTT Broker     |                        | - sensor_logs      |
+----------------+  iot/dmind/telemetry  | - MQTT Telemetry Subscriber |                        | - api_keys         |
                                         | - Alert Engine (Anomaly)    |                        | - disaster_alerts  |
                                         | - FastAPI Server (Port 8000)|                        +--------------------+
                                         +-----------------------------+                                  ^
                                                        ^                                                 |
                                                        | REST API with X-API-Key                         |
                                                        +-------------------------------------------------+
                                                        | D-MIND Mobile Application                       |
                                                        +-------------------------------------------------+
```

---

## 🚀 วิธีการติดตั้งบน Raspberry Pi (Installation Guide)

### วิธีที่ 1: ติดตั้งแบบ 1-Click Script (Native Linux)
เปิด Terminal บนบอร์ด Raspberry Pi แล้วรันคำสั่ง:

```bash
cd ~/IoT_Station/raspberry_pi_gateway
chmod +x setup_rpi.sh
./setup_rpi.sh
```

สคริปต์จะทำการ:
1. ติดตั้ง `mosquitto` MQTT broker และเปิดใช้งาน service
2. สร้าง Python Virtual Environment (`venv`) และติดตั้ง dependencies
3. ตั้งค่าไฟล์ `.env`
4. ติดตั้ง `systemd` service ชื่อ `dmind-gateway.service` ให้เปิดทำงานอัตโนมัติเมื่อเปิดเครื่อง

---

### วิธีที่ 2: ติดตั้งผ่าน Docker Compose (Containerized)
หากบน Raspberry Pi มี Docker ติดตั้งอยู่แล้ว สามารถรันได้ด้วยคำสั่งเดียว:

```bash
cd ~/IoT_Station/raspberry_pi_gateway
docker-compose up -d --build
```

---

## 🔑 การสร้างและจัดการ API Key สำหรับ Mobile App

ระบบใช้กลไกการสร้าง API Key ที่ปลอดภัยสูง (Cryptographically Secure API Key):
- รูปแบบคีย์: `dmind_live_<random_32_bytes>`
- ตัวอย่างคีย์: `dmind_live_8fK2m9PqZx7vLn4wRt1sY3uIj6hGb5vC`
- ในฐานข้อมูล Supabase จะจัดเก็บเฉพาะ **SHA-256 Hash** เท่านั้น เพื่อความปลอดภัยสูงสุด

### 1. สร้าง API Key ใหม่ (Admin Only)
ยิง Request ไปที่ `POST /api/v1/auth/keys` พร้อม Header `X-Admin-Secret`:

```bash
curl -X POST http://<RASPBERRY_PI_IP>:8000/api/v1/auth/keys \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: dmind_admin_secret_super_secure_key_2026" \
  -d '{
    "key_name": "D-Mind Mobile App Production",
    "description": "API Key for React Native / Capacitor mobile client",
    "expires_in_days": 365,
    "rate_limit_rpm": 120
  }'
```

**ตัวอย่าง Response ที่ได้:**
```json
{
  "id": "7b3b6df8-6ef1-4cf1-8390-5cf73a5a7824",
  "key_name": "D-Mind Mobile App Production",
  "key_prefix": "dmind_live_8fK",
  "raw_api_key": "dmind_live_8fK2m9PqZx7vLn4wRt1sY3uIj6hGb5vC",
  "created_at": "2026-09-01T14:15:00Z",
  "expires_at": "2027-09-01T14:15:00Z",
  "is_active": true,
  "rate_limit_rpm": 120,
  "message": "API Key created successfully! Keep this key safe as it will not be displayed again."
}
```

---

## 📱 การเรียกใช้ API จาก Mobile Application

ใส่ Header `X-API-Key` หรือ `Authorization: Bearer <API_KEY>` ในทุก Request:

### 1. ดึงข้อมูลเซนเซอร์ล่าสุด (Latest Telemetry)
```http
GET /api/v1/sensors/latest HTTP/1.1
Host: <RASPBERRY_PI_IP>:8000
X-API-Key: dmind_live_8fK2m9PqZx7vLn4wRt1sY3uIj6hGb5vC
```

**ตัวอย่าง Response:**
```json
{
  "id": 1024,
  "timestamp": "2026-09-01T14:15:30",
  "water_level": 45.2,
  "pm1": 12.0,
  "pm25": 24.5,
  "pm10": 38.1,
  "pitch": 1.25,
  "roll": -0.84,
  "yaw": 180.12,
  "acc_x": 0.02,
  "acc_y": -0.01,
  "acc_z": 0.99,
  "gyro_x": 0.05,
  "gyro_y": -0.02,
  "gyro_z": 0.01,
  "temperature": 29.4,
  "humidity": 68.5,
  "pressure": 1011.2
}
```

### 2. ดึงประวัติข้อมูลย้อนหลัง (Historical Data)
```http
GET /api/v1/sensors/history?limit=20&offset=0 HTTP/1.1
Host: <RASPBERRY_PI_IP>:8000
X-API-Key: dmind_live_8fK2m9PqZx7vLn4wRt1sY3uIj6hGb5vC
```

### 3. ดึงการแจ้งเตือนภัยพิบัติ (Active Disaster Alerts)
```http
GET /api/v1/alerts HTTP/1.1
Host: <RASPBERRY_PI_IP>:8000
X-API-Key: dmind_live_8fK2m9PqZx7vLn4wRt1sY3uIj6hGb5vC
```

---

## 📊 เกณฑ์การตรวจจับและแจ้งเตือนภัยพิบัติอัตโนมัติ (Alert Engine Thresholds)

| ประเภทภัยพิบัติ (Alert Type) | เซนเซอร์ | เงื่อนไขตรวจจับ | ระดับความรุนแรง | การแจ้งเตือน |
| :--- | :--- | :--- | :--- | :--- |
| **ระดับน้ำสูงวิกฤต (Flood Critical)** | AJ-SR04M | `water_level >= 140 cm` | 🚨 CRITICAL | แจ้งเตือนน้ำท่วมฉับพลัน |
| **ระดับน้ำเฝ้าระวัง (Water Warning)** | AJ-SR04M | `water_level >= 100 cm` | ⚠️ WARNING | แจ้งเตือนเฝ้าระวังระดับน้ำ |
| **ฝุ่น PM 2.5 อันตราย (Hazardous PM2.5)**| PMS5003 | `pm25 >= 75.0 µg/m³` | 🚨 CRITICAL | แจ้งเตือนคุณภาพอากาศเป็นอันตราย |
| **ฝุ่น PM 2.5 เกินมาตรฐาน** | PMS5003 | `pm25 >= 37.5 µg/m³` | ⚠️ WARNING | แจ้งเตือนผลกระทบต่อสุขภาพ |
| **ฝุ่น PM 10 เกินมาตรฐาน** | PMS5003 | `pm10 >= 120.0 µg/m³` | ⚠️ WARNING | ฝุ่นละอองขนาดใหญ่เกินเกณฑ์ |
| **แผ่นดินไหว / การสั่นไหวรุนแรง** | GY-521 | `\|Total G - 1.0\| >= 0.45g` | 🚨 CRITICAL | แจ้งเตือนแผ่นดินไหว/แรงกระแทก |
| **สถานีเอียงผิดปกติ (Structural Tilt)** | GY-521 | `\|Pitch\| หรือ \|Roll\| >= 35°` | 🚨 CRITICAL | เสี่ยงต่อเสาตรวจวัดล้ม/ดินสไลด์ |

---

## 🛠️ การตรวจสอบสถานะและการแก้ไขปัญหา (Troubleshooting)

```bash
# ตรวจสอบสถานะการทำงานของ Gateway Daemon
sudo systemctl status dmind-gateway

# ดู Log แบบ Realtime
journalctl -u dmind-gateway -f

# ทดสอบส่งข้อความ MQTT เข้า Gateway ด้วยมือ
mosquitto_pub -h localhost -t "iot/dmind/telemetry" -m '{"water_level":50.0,"pm25":18.0,"temperature":28.5,"humidity":70.0,"pressure":1012.0,"acc_x":0.01,"acc_y":-0.01,"acc_z":1.0}'
```
