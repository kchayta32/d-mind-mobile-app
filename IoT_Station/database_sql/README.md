# 🗄️ D-MIND Database Architecture & SQL Specifications (V2.1)

คู่มือโครงสร้างฐานข้อมูล SQL และแนวทางการปรับปรุงโครงสร้าง (Database Migration) ของระบบ **D-MIND (Disaster Management & Information System)** ให้สอดคล้องกับแผนภาพ **ER / Data Model** ล่าสุด

---

## 📑 สรุปรายการไฟล์ SQL ในโฟลเดอร์นี้

| ลำดับ | ชื่อไฟล์ SQL | หมวดหมู่ | คำอธิบายและการทำงาน |
|---|---|---|---|
| **00** | [`00_create_iot_stations.sql`](00_create_iot_stations.sql) | ฮาร์ดแวร์สถานี (ใหม่) | สร้างตาราง `iot_stations` สำหรับเก็บเมทาดาทาของสถานี ESP32/RPi พิกัด แบตเตอรี่ โซลาร์เซลล์ และ Seed สถานีตั้งต้น `ESP32_STATION_01` |
| **01** | [`01_create_sensor_logs.sql`](01_create_sensor_logs.sql) | โทรมาตรรวม (อัปเดต) | ตาราง `sensor_logs` (Aggregate Root) รับ Payload รวม 4 เซนเซอร์ เพิ่มคอลัมน์ `station_id` (FK) แบบไม่ทำลายข้อมูลเดิม |
| **02** | [`02_create_individual_sensor_tables.sql`](02_create_individual_sensor_tables.sql) | แยกมิติเซนเซอร์ (อัปเดต) | ตาราง Partition ย่อย 4 ตาราง (`water_level_logs`, `pm_logs`, `motion_logs`, `environment_logs`) พร้อมทริกเกอร์ `sync_sensor_logs_to_individual_tables()` เชื่อมโยง `station_id` |
| **03** | [`03_create_api_keys_and_alerts.sql`](03_create_api_keys_and_alerts.sql) | เกตเวย์ & เตือนภัย (อัปเดต) | จัดการ FastAPI Ingress: เพิ่มตาราง `client_applications`, `api_key_scopes`, `fastapi_endpoints`, `api_request_logs` และอัปเดต `api_keys(client_id)`, `disaster_alerts(station_id)` |
| **04** | [`04_sample_seed_data.sql`](04_sample_seed_data.sql) | ข้อมูลจำลอง (อัปเดต) | Seed ข้อมูลสถานี, แอปรองรับ, คีย์ API (แฮช SHA-256), สิทธิ์ Scopes, FCM Push Token และข้อมูลเซนเซอร์ทดสอบ |
| **⭐ 05** | [`05_upgrade_schema_v2.sql`](05_upgrade_schema_v2.sql) | **สคริปต์ไมเกรชันหลัก (All-in-One)** | **สคริปต์หลักสำหรับนำไปรันบน Supabase SQL Editor ทันที** ใช้คำสั่ง `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` อัปเดตตารางเดิมและสร้างตารางใหม่อย่างปลอดภัย 100% |

---

## 🚀 วิธีการรันอัปเกรดใน Supabase (Migration Guide)

เนื่องจากคุณได้รันไฟล์ชุดแรกไปแล้วใน Supabase:
1. เปิด **Supabase Dashboard** -> เข้าไปยังโปรเจกต์ของคุณ
2. ไปที่แท็บ **SQL Editor** ทางเมนูด้านซ้าย
3. คัดลอกโค้ดทั้งหมดจากไฟล์ **[`05_upgrade_schema_v2.sql`](05_upgrade_schema_v2.sql)** ไปวางในหน้าต่าง Query
4. กดปุ่ม **Run** (หรือ `Ctrl + Enter`)
5. ระบบจะทำการ:
   - ตรวจสอบและเพิ่มคอลัมน์ `station_id` และ `client_id` ในตารางเดิมโดย **ไม่ลบข้อมูลที่มีอยู่เดิม**
   - อัปเดต Trigger และ View ให้สอดคล้องกับโครงสร้างใหม่
   - สร้างตารางใหม่ (`iot_stations`, `client_applications`, `api_key_scopes`, `api_request_logs`, `fastapi_endpoints`, `device_push_tokens`, `realtime_alerts`, `alert_deliveries`, `victim_reports`)
   - แสดงตารางสรุปผลการไมเกรชัน (Post-Migration Verification Table)

---

## 🗺️ ตารางเปรียบเทียบโครงสร้างกับไดอะแกรม ER Model

### 1. โมดูลเซนเซอร์สถานี (Ref. จาก 01_iot_sensor_data_model)
| เอนทิตี (Table) | คีย์หลัก (PK) | คีย์นอก (FK) | สถานะการจัดการ |
|---|---|---|---|
| `iot_stations` | `station_id` (varchar) | - | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `sensor_logs` | `id` (bigserial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `water_level_logs` | `id` (serial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `pm_logs` | `id` (serial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `motion_logs` | `id` (serial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `environment_logs` | `id` (serial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `disaster_alerts` | `id` (serial) | `station_id` -> `iot_stations` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |

### 2. โมดูล FastAPI API Key & Client App (Ref. จาก 02_fastapi_apikey_data_model)
| เอนทิตี (Table) | คีย์หลัก (PK) | คีย์นอก (FK) | สถานะการจัดการ |
|---|---|---|---|
| `client_applications` | `id` (uuid) | - | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `api_keys` | `id` (uuid) | `client_id` -> `client_applications` | อัปเดตตารางเดิม (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) |
| `api_key_scopes` | `id` (serial) | `key_id` -> `api_keys` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `fastapi_endpoints` | `(endpoint_path, http_method)` | - | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `api_request_logs` | `id` (bigserial) | `key_id` -> `api_keys` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `device_push_tokens` | `id` (uuid) | `client_id` -> `client_applications` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |

### 3. โมดูลระบบรวมและช่วยเหลือฉุกเฉิน (Ref. จาก 03_dmind_master_integrated_er)
| เอนทิตี (Table) | คีย์หลัก (PK) | คีย์นอก (FK) | สถานะการจัดการ |
|---|---|---|---|
| `realtime_alerts` | `id` (uuid) | `station_id` -> `iot_stations` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `alert_deliveries` | `id` (uuid) | `alert_id`, `token_id` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
| `victim_reports` | `id` (uuid) | `client_id` -> `client_applications` | สร้างใหม่ (`CREATE TABLE IF NOT EXISTS`) |
