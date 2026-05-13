# สรุประบบ D-MIND Android: UI/UX, ระบบแจ้งเตือน, API Key และ Endpoint

วันที่: 2026-05-13

## หลักการสำคัญ

- Android app เป็น native mobile app อยู่ใน `android/app`
- Backend อยู่ใน `android/backend` และทำหน้าที่เป็นจุดรวมงานที่ต้องใช้ secret/API key
- แอปมือถือไม่ฝัง secret จริงลง APK เก็บเฉพาะ `BuildConfig.BACKEND_BASE_URL`
- API key/secret ของ production ต้องอยู่ใน environment variables หรือ secret manager ของ backend เท่านั้น
- ระบบแจ้งเตือนมือถือใช้ Firebase Cloud Messaging (FCM) สำหรับ push จาก server และใช้ native notification channel สำหรับแสดงผลในเครื่อง

## UI/UX หลักของแอป

ไฟล์หลัก: `android/app/src/main/kotlin/com/dmind/app/ui/DMindApp.kt`

| หน้า | จุดประสงค์ | UI/UX ปัจจุบัน | Action หลัก |
| --- | --- | --- | --- |
| Home | ตรวจความพร้อมของระบบ | banner, readiness chips, permission onboarding | ขอ Location, Notifications, Battery, DND |
| Map | แผนที่ภัยพิบัติ | MapLibre native map เต็มจอ พร้อม label overlay | แสดงแผนที่ศูนย์กลางประเทศไทย |
| Alerts | ระบบแจ้งเตือน | card สถานะ notification permission และ DND bypass | Trigger native test alert |
| SOS | ขอความช่วยเหลือฉุกเฉิน | แสดง Pending SOS และปุ่มปฏิบัติการฉุกเฉิน | Queue SOS, Start/Stop monitoring |
| More | ฟีเจอร์เสริมและ config | backend URL, feature list, FCM token card | เปิด App Settings, Refresh FCM |

ไฟล์ theme: `android/app/src/main/kotlin/com/dmind/app/ui/theme/Theme.kt`

- ใช้ Material 3
- รองรับ light/dark theme
- สีหลักเป็น teal, สี emergency เป็น red, สี accent เป็น blue

## State และ Data Bridge ของ UI

ไฟล์หลัก: `android/app/src/main/kotlin/com/dmind/app/data/NativeStatusRepository.kt`

หน้าที่:

- อ่านสถานะ permission: foreground location, background location, notification
- อ่านสถานะ battery optimization และ DND access
- อ่านสถานะ background monitoring จาก `BackgroundLocationService`
- อ่านจำนวน pending SOS จาก local SQLite DAO
- trigger emergency test alert
- queue demo SOS แล้วสั่ง WorkManager ส่งเมื่อ network พร้อม
- refresh FCM token แล้วส่งไป backend ถ้าตั้งค่า backend แล้ว

ไฟล์ state model: `android/app/src/main/kotlin/com/dmind/app/domain/ReliabilityStatus.kt`

สถานะที่ UI ใช้:

- `locationGranted`
- `backgroundLocationGranted`
- `notificationGranted`
- `batteryIgnoring`
- `dndGranted`
- `monitoring`
- `pendingSOSCount`
- `sosEndpointConfigured`
- `fcmTokenEndpointConfigured`
- `fcmTokenAvailable`

## ระบบแจ้งเตือนมือถือ

ไฟล์หลัก:

- `android/app/src/main/kotlin/com/dmind/app/DMindApplication.kt`
- `android/app/src/main/java/com/dmind/app/util/NotificationHelper.java`
- `android/app/src/main/java/com/dmind/app/util/EmergencyNotificationManager.java`
- `android/app/src/main/java/com/dmind/app/activity/EmergencyAlertActivity.java`
- `android/app/src/main/java/com/dmind/app/service/FCMFirebaseService.java`
- `android/app/src/main/java/com/dmind/app/util/FCMTokenRegistrar.java`

Notification channels:

| Channel ID | ความสำคัญ | ใช้ทำอะไร |
| --- | --- | --- |
| `emergency_alerts` | HIGH | แจ้งเตือนภัยพิบัติสำคัญ, vibration, DND bypass, full-screen intent |
| `background_operations` | LOW | notification ค้างสำหรับ foreground service ติดตามตำแหน่ง |
| `sos_messages` | HIGH | แจ้งสถานะ SOS ที่รอส่งหรือส่งแล้ว |

Flow การรับแจ้งเตือน:

1. แอปเริ่มต้นผ่าน `DMindApplication`
2. สร้าง notification channels ล่วงหน้า
3. ขอ/refresh FCM token จาก Firebase
4. ส่ง token ไป backend ที่ `BuildConfig.BACKEND_BASE_URL + "/fcm/register"`
5. Backend เก็บ token ใน registry
6. Backend ส่ง push ผ่าน FCM HTTP v1 ที่ endpoint Google
7. เครื่องผู้ใช้รับ FCM data message ที่ `FCMFirebaseService`
8. อ่าน data keys `alert_type`, `alert_title`, `alert_message`
9. ส่งต่อไป `EmergencyNotificationManager.triggerEmergencyAlert(...)`
10. `NotificationHelper` แสดง native notification ผ่าน channel `emergency_alerts`
11. ถ้าเป็น full-screen alert จะเปิด `EmergencyAlertActivity`

หมายเหตุ:

- Android 13+ ต้องขอ `POST_NOTIFICATIONS`
- DND bypass ต้องให้ผู้ใช้เปิด permission ที่ system settings
- Full-screen alert ใช้ permission `USE_FULL_SCREEN_INTENT`
- ถ้าเครื่อง dev ยังไม่มี Firebase config แอปจะข้าม FCM registration โดยไม่ crash

## FCM Data Payload ที่แอปรองรับ

ไฟล์: `android/app/src/main/java/com/dmind/app/service/FCMFirebaseService.java`

| Key | จำเป็น | ความหมาย |
| --- | --- | --- |
| `alert_type` | ใช่ | ประเภทภัย เช่น `flood`, `earthquake`, `storm`, `fire` |
| `alert_title` | ไม่บังคับ | หัวข้อแจ้งเตือน |
| `alert_message` | ไม่บังคับ | ข้อความแจ้งเตือน |

ถ้าไม่มี `alert_type` แอปจะไม่ trigger emergency alert เพื่อเลี่ยงการแจ้งเตือนผิดประเภท

## Backend

ไฟล์หลัก:

- `android/backend/src/main/kotlin/com/dmind/backend/Application.kt`
- `android/backend/build.gradle`

Run command:

```powershell
.\gradlew.bat :backend:run
```

Port:

| ค่า | ที่มา | ค่าเริ่มต้น |
| --- | --- | --- |
| `PORT` | backend environment variable | `8080` |

Endpoints ปัจจุบัน:

| Method | Path | ใช้ทำอะไร | สถานะ |
| --- | --- | --- | --- |
| GET | `/health` | ตรวจ backend health | ใช้งานได้ |
| GET | `/alerts` | ดึงรายการ alert ตัวอย่าง | placeholder |
| POST | `/sos` | รับ SOS จากมือถือ | รับ payload แล้วตอบ accepted |
| POST | `/reports` | รับ incident/victim reports | placeholder |
| GET | `/weather` | weather proxy | เช็ก env `TMD_API_TOKEN` |
| POST | `/damage-assessment` | damage assessment/AI proxy | เช็ก env `OPENAI_API_KEY` |
| POST | `/chat` | AI chat proxy | เช็ก env `OPENAI_API_KEY` |
| POST | `/fcm/register` | รับ FCM token จากมือถือ | ใช้งานได้ |
| POST | `/notifications/send` | ส่ง push notification ไปมือถือผ่าน FCM HTTP v1 | ใช้งานได้เมื่อ backend มี Firebase credentials |

## Backend Base URL ของแอป

ตำแหน่งตั้งค่า:

| รายการ | ตำแหน่ง |
| --- | --- |
| Gradle property | `DMIND_BACKEND_BASE_URL` |
| build field | `android/app/build.gradle` |
| runtime config | `android/app/src/main/kotlin/com/dmind/app/network/BackendConfig.kt` |
| ค่า default emulator | `http://10.0.2.2:8080` |

ตัวอย่าง build พร้อมกำหนด backend:

```powershell
.\gradlew.bat :app:assembleDebug -PDMIND_BACKEND_BASE_URL=https://api.example.com
```

## ตำแหน่ง API Key และ Secret

ห้ามใส่ค่าจริงของ API key ลงใน source code หรือเอกสารนี้

| Key/Secret | ควรเก็บที่ไหน | ใช้โดย | หมายเหตุ |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | backend environment variable | `/chat`, `/damage-assessment` | backend เช็กว่ามี env นี้หรือไม่ |
| `TMD_API_TOKEN` | backend environment variable | `/weather` | backend เช็กว่ามี env นี้หรือไม่ |
| Firebase Android config | `android/app/google-services.json` | FCM Android client | ได้จาก Firebase Console |
| `FCM_PROJECT_ID` หรือ `FIREBASE_PROJECT_ID` | backend environment variable | `/notifications/send` | project id ของ Firebase/Google Cloud |
| `GOOGLE_APPLICATION_CREDENTIALS` | backend environment variable | `/notifications/send` | path ไป service-account JSON ที่มีสิทธิ์ Firebase Cloud Messaging API Admin |
| GISTDA API key | backend environment variable หรือ secret manager | future map/disaster proxy | ยังเป็น future integration |
| Supabase URL/key | backend environment variable หรือ secret manager | future data integration | Android native build ไม่พึ่ง root Supabase client |
| Release keystore password | `KEYSTORE_PASSWORD`, `KEY_PASSWORD` | release signing | ใช้เฉพาะตอน build release |

ตำแหน่งไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | รายละเอียด |
| --- | --- |
| `android/backend/src/main/kotlin/com/dmind/backend/Application.kt` | อ่าน env ผ่าน `System.getenv(...)`, ส่ง FCM HTTP v1 |
| `android/app/build.gradle` | ตั้ง `BuildConfig.BACKEND_BASE_URL` และตรวจ `google-services.json` |
| `android/app/src/main/kotlin/com/dmind/app/DMindApplication.kt` | สร้าง notification channels และ refresh FCM token ตอนเปิดแอป |
| `android/app/src/main/java/com/dmind/app/util/FCMTokenRegistrar.java` | ส่ง FCM token ไป `/fcm/register` |
| `android/app/src/main/java/com/dmind/app/service/FCMFirebaseService.java` | รับ FCM data message และแสดง native emergency notification |
| `android/app/src/main/java/com/dmind/app/worker/SOSQueueWorker.java` | ส่ง SOS ไป `/sos` |

## ตัวอย่างส่งแจ้งเตือนจาก backend

ส่งแบบ broadcast ไปทุก token ที่ลงทะเบียนไว้ใน backend instance ปัจจุบัน:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8080/notifications/send `
  -ContentType application/json `
  -Body '{"title":"แจ้งเตือนทดสอบ","message":"มีเหตุการณ์สำคัญในพื้นที่ของคุณ","alertType":"flood","broadcast":true}'
```

ส่งไปยัง token เดียว:

```json
{
  "title": "แจ้งเตือนทดสอบ",
  "message": "มีเหตุการณ์สำคัญในพื้นที่ของคุณ",
  "alertType": "flood",
  "token": "<FCM_DEVICE_TOKEN>"
}
```

ส่งตาม user id ที่ลงทะเบียนไว้:

```json
{
  "title": "แจ้งเตือนเฉพาะผู้ใช้",
  "message": "โปรดตรวจสอบพื้นที่ปลอดภัยใกล้คุณ",
  "alertType": "storm",
  "userId": "anonymous"
}
```

## Background Monitoring และ Geofence

ไฟล์หลัก:

- `android/app/src/main/java/com/dmind/app/service/BackgroundLocationService.java`
- `android/app/src/main/java/com/dmind/app/service/GeofenceMonitorService.java`
- `android/app/src/main/java/com/dmind/app/util/GeofenceUtils.java`
- `android/app/src/main/java/com/dmind/app/database/AlertsCacheDAO.java`

Flow:

1. ผู้ใช้กด Start monitoring จากหน้า SOS
2. UI เรียก `NativeStatusRepository.startMonitoring()`
3. เริ่ม `BackgroundLocationService` เป็น foreground service
4. service ใช้ Google Play Services Fused Location
5. บันทึก location ลง local database
6. ตรวจตำแหน่งกับ danger zones ด้วย point-in-polygon
7. ถ้าอยู่ในพื้นที่เสี่ยง จะ trigger emergency alert

Permission ที่เกี่ยวข้อง:

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`
- `WAKE_LOCK`
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`

## SOS Queue

ไฟล์หลัก:

- `android/app/src/main/java/com/dmind/app/worker/SOSQueueWorker.java`
- `android/app/src/main/java/com/dmind/app/database/AlertsCacheDAO.java`
- `android/app/src/main/java/com/dmind/app/model/SOSMessage.java`

Flow:

1. ผู้ใช้กด Queue SOS ในหน้า SOS
2. `NativeStatusRepository.queueDemoSOS()` บันทึก SOS ลง local SQLite
3. สั่ง `SOSQueueWorker.enqueue(...)`
4. WorkManager รอ network
5. เมื่อ network พร้อม ส่ง POST ไป endpoint `/sos`
6. ถ้าส่งสำเร็จ mark เป็น sent
7. ถ้าส่งไม่สำเร็จ retry ตาม WorkManager backoff

Endpoint ที่ใช้:

```text
BuildConfig.BACKEND_BASE_URL + "/sos"
```

## Data Storage ภายในแอป

ไฟล์หลัก:

- SQLite เดิม: `android/app/src/main/java/com/dmind/app/database/AlertsCacheDAO.java`
- Room schema ใหม่: `android/app/src/main/kotlin/com/dmind/app/data/local/DMindRoomDatabase.kt`

ข้อมูลหลัก:

- danger zones
- SOS queue
- alerts cache
- location history

## จุดที่ยังเป็น Placeholder

- `/alerts` ยังคืน demo alert
- `/reports` ยังรับ request แบบ placeholder
- `/weather` ยังเช็ก env `TMD_API_TOKEN` แต่ยังไม่ยิง API จริง
- `/damage-assessment` และ `/chat` ยังเช็ก env `OPENAI_API_KEY` แต่ยังไม่เรียก model จริง
- FCM token registry ใน backend ตอนนี้เป็น in-memory registry ควรย้ายไป database เมื่อขึ้น production
- หน้า UI ยังเป็น native shell และ readiness/actions หลัก ยังไม่ครบทุก feature จากเว็บเดิม
