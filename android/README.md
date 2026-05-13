# D-MIND Android Workspace

โฟลเดอร์นี้คือ workspace หลักของ D-MIND mobile app แบบ Android-only ภายในนี้มีทั้ง native Android app, backend server module, เอกสารรายงาน, Gradle wrapper และไฟล์ config ที่จำเป็นต่อการ build/test โดยไม่ต้องพึ่ง React, Vite, Capacitor, `node_modules` หรือไฟล์ web นอกโฟลเดอร์ `android`

## โครงสร้างหลัก

| Path | รายละเอียด |
| --- | --- |
| `app/` | Android application module ใช้ Kotlin, Jetpack Compose, Java native services เดิม, resources และ unit tests |
| `backend/` | Kotlin/Ktor backend module สำหรับ API, proxy งานที่ต้องใช้ secret/API key และระบบส่ง push notification |
| `docs/` | เอกสารรายงาน `.md` และ `.txt` เช่น implementation report, folder map, system summary, notification summary |
| `gradle/` | Gradle wrapper support files |
| `build.gradle` | Gradle config ระดับ workspace |
| `settings.gradle` | include เฉพาะ `:app` และ `:backend` |
| `variables.gradle` | รวม version dependencies |

## Technology

- Android native app: Kotlin + Jetpack Compose + Material 3
- Native services เดิม: Java services สำหรับ FCM, emergency notification, background location, geofence, SOS queue และ WorkManager
- Map: MapLibre Android
- Local storage: SQLite เดิม และ Room schema สำหรับ migration ต่อ
- Backend: Kotlin/JVM + Ktor + Kotlin Serialization
- Push notification: Firebase Cloud Messaging (FCM) + FCM HTTP v1

## Requirements

- Android Studio หรือ Android SDK ที่พร้อม build Android app
- JDK 21 แนะนำให้ใช้ Android Studio JBR:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

ให้รันคำสั่งทั้งหมดจากโฟลเดอร์นี้:

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
```

## Build และ Test

Build debug APK:

```powershell
.\gradlew.bat :app:assembleDebug
```

Run app unit tests:

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Run backend tests:

```powershell
.\gradlew.bat :backend:test
```

Run ทุกตัวที่ใช้ตรวจสอบหลัก:

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :backend:test
```

ไฟล์ APK หลัง build:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Run Backend

Backend อยู่ที่ `backend/` และ default port คือ `8080`

```powershell
.\gradlew.bat :backend:run
```

ตั้ง port เองได้ด้วย env:

```powershell
$env:PORT="8081"
.\gradlew.bat :backend:run
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

## ตั้งค่า Backend URL ให้แอป

ค่า default สำหรับ Android emulator คือ:

```text
http://10.0.2.2:8080
```

ถ้าต้องการ build ให้ชี้ backend อื่น:

```powershell
.\gradlew.bat :app:assembleDebug -PDMIND_BACKEND_BASE_URL=https://api.example.com
```

ค่า `DMIND_BACKEND_BASE_URL` จะถูกใส่เข้า `BuildConfig.BACKEND_BASE_URL` ใน app module

## ระบบแจ้งเตือนมือถือ

แอปรองรับ native push notification ผ่าน Firebase Cloud Messaging:

1. `DMindApplication` สร้าง notification channels ตอนเปิดแอป
2. แอป refresh FCM token จาก Firebase
3. แอปส่ง token ไป backend ที่ `POST /fcm/register`
4. Backend ส่ง push ผ่าน `POST /notifications/send`
5. มือถือรับ data message ที่ `FCMFirebaseService`
6. แอปแสดง native emergency notification หรือ full-screen alert

Payload ที่แอปรองรับ:

| Key | จำเป็น | ตัวอย่าง |
| --- | --- | --- |
| `alert_type` | ใช่ | `flood`, `storm`, `earthquake`, `fire` |
| `alert_title` | ไม่บังคับ | `แจ้งเตือนน้ำท่วม` |
| `alert_message` | ไม่บังคับ | `มีเหตุการณ์สำคัญในพื้นที่ของคุณ` |

ตัวอย่างส่งแจ้งเตือนผ่าน backend:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8080/notifications/send `
  -ContentType application/json `
  -Body '{"title":"แจ้งเตือนทดสอบ","message":"มีเหตุการณ์สำคัญในพื้นที่ของคุณ","alertType":"flood","broadcast":true}'
```

## Firebase และ Secret

ห้าม commit secret จริงลง repository

Android client config:

```text
app/google-services.json
```

ไฟล์นี้ต้องดาวน์โหลดจาก Firebase Console และวางเองเมื่อจะทดสอบ FCM จริง ถ้าไม่มีไฟล์นี้ app ยัง build ได้ แต่ push notification จริงจะยังไม่ทำงาน

Backend FCM env ที่ต้องใช้เมื่อส่ง push จริง:

```powershell
$env:FCM_PROJECT_ID="your-firebase-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\dmind-firebase-service-account.json"
.\gradlew.bat :backend:run
```

Secret/API key อื่นต้องอยู่ฝั่ง backend เท่านั้น เช่น:

- `OPENAI_API_KEY` สำหรับ `/chat` และ `/damage-assessment`
- `TMD_API_TOKEN` สำหรับ `/weather`
- `KEYSTORE_PASSWORD` และ `KEY_PASSWORD` สำหรับ release signing

## Backend Endpoints

| Method | Path | รายละเอียด |
| --- | --- | --- |
| GET | `/health` | ตรวจสถานะ backend |
| GET | `/alerts` | alert ตัวอย่าง |
| POST | `/sos` | รับ SOS จากมือถือ |
| POST | `/reports` | รับ incident/victim reports |
| GET | `/weather` | weather proxy placeholder |
| POST | `/damage-assessment` | damage assessment/AI proxy placeholder |
| POST | `/chat` | AI chat proxy placeholder |
| POST | `/fcm/register` | รับ FCM token จากมือถือ |
| POST | `/notifications/send` | ส่ง push notification ผ่าน FCM HTTP v1 |

## เอกสารที่ควรอ่านต่อ

| ไฟล์ | รายละเอียด |
| --- | --- |
| `docs/IMPLEMENTATION_REPORT.th.md` | รายงานการพัฒนา Android native และ backend |
| `docs/FOLDER_MAP.th.md` | แผนผังโฟลเดอร์และประเภทไฟล์ |
| `docs/SYSTEM_SUMMARY.th.md` | สรุป UI/UX, notification, API key และ endpoint |
| `docs/NOTIFICATION_SYSTEM.th.md` | สรุประบบแจ้งเตือนมือถือโดยเฉพาะ |
| `REAL_DEVICE_TEST_CHECKLIST.md` | checklist สำหรับทดสอบบนเครื่องจริง |
| `IMPLEMENTATION_SUMMARY.md` | สรุป implementation ระดับ workspace |

## ข้อจำกัดปัจจุบัน

- Backend route บางส่วนยังเป็น placeholder และยังไม่ได้ต่อ production integration จริง
- FCM token registry ใน backend ตอนนี้เป็น in-memory registry ถ้า restart backend token จะหาย
- `POST /notifications/send` ยังไม่มี authentication/authorization ต้องเพิ่มก่อนใช้ production
- การทดสอบ push notification จริงต้องใช้เครื่อง Android จริงหรือ environment ที่รับ FCM ได้ พร้อม Firebase project และ credentials
- หน้า UI เป็น native shell พร้อม workflow หลัก ยังต้องขยาย feature parity ต่อจากระบบเว็บเดิม

## สถานะตรวจสอบล่าสุด

คำสั่งเหล่านี้ผ่านแล้วใน workspace นี้:

```powershell
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:testDebugUnitTest
.\gradlew.bat :backend:test
```

ใช้ `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`
