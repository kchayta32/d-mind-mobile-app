# D-MIND Android Workspace

โฟลเดอร์นี้คือ workspace หลักของ D-MIND mobile app แบบ Android-only ภายในมี native Android app, Kotlin/Ktor backend gateway, เอกสารรายงาน, Gradle wrapper และ config สำหรับ build/test โดยไม่ต้องพึ่ง React, Vite, Capacitor, `node_modules` หรือไฟล์ web นอกโฟลเดอร์ `android/`

อัปเดตล่าสุด: 25 พฤษภาคม 2026

## ภาพรวม

- App id: `com.dmind.app`
- App version: `2.0.0` (`versionCode 2`)
- Android: `minSdk 23`, `compileSdk 35`, `targetSdk 35`
- Build tools: Android Gradle Plugin `8.13.2`, Kotlin `2.3.21`, JDK `21`
- Backend: Kotlin/JVM + Ktor `3.4.3`
- Workspace modules: `:app` และ `:backend`

## โครงสร้างหลัก

| Path | รายละเอียด |
| --- | --- |
| `app/` | Android application module ใช้ Kotlin, Jetpack Compose, Material 3, Java native services, resources และ unit tests |
| `backend/` | Kotlin/Ktor backend module สำหรับ API gateway, Supabase gateway, media upload, analytics และ push notification |
| `docs/` | เอกสาร `.md` และ `.txt` เช่น implementation report, folder map, system summary และ notification summary |
| `gradle/` | Gradle wrapper support files |
| `build.gradle` | Gradle config ระดับ workspace |
| `settings.gradle` | include เฉพาะ `:app` และ `:backend` |
| `variables.gradle` | รวม dependency versions |
| `local.properties` | Local config ที่ไม่ควร commit เช่น Android SDK path และ key สำหรับ dev |

## Technology

- Native UI: Kotlin + Jetpack Compose + Material 3
- Map: MapLibre Android
- Local storage: Room และ SQLite layer เดิมสำหรับ native services
- Background/reliability: WorkManager, foreground location services, boot receiver, network/power receivers
- Notification: Firebase Cloud Messaging, native notification channels, full-screen emergency alert
- Data: Supabase REST/Storage, backend gateway, GISTDA, TMD, USGS และ Air4Thai
- AI: ThaiLLM client ใน Android และ placeholder backend routes สำหรับ production AI gateway

## Requirements

- Android Studio หรือ Android SDK ที่ build Android app ได้
- JDK 21 แนะนำให้ใช้ Android Studio JBR
- Windows PowerShell สำหรับคำสั่งตัวอย่างด้านล่าง

ตั้งค่า JDK:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

ให้รันคำสั่งทั้งหมดจากโฟลเดอร์นี้:

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
```

## Local Config

Android app อ่าน config จาก Gradle property, environment variable, `android/local.properties` หรือ `../local.properties` โดยรองรับ alias `DMIND_*` สำหรับ key เดิมที่ขึ้นต้นด้วย `VITE_*`

ตัวอย่าง `android/local.properties` สำหรับ dev:

```properties
sdk.dir=C:\\Users\\Kitti\\AppData\\Local\\Android\\Sdk
BACKEND_BASE_URL=http://10.0.2.2:8080
DMIND_SUPABASE_URL=https://your-project.supabase.co
DMIND_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
DMIND_SUPABASE_PROJECT_ID=your-project-id
DMIND_TMD_API_TOKEN=your-tmd-token
DMIND_GISTDA_API_KEY=your-gistda-key
DMIND_THAI_LLM_API_KEY=your-thaillm-key
DMIND_THAI_LLM_BASE_URL=http://thaillm.or.th/api/v1/
DMIND_THAI_LLM_MODEL=typhoon-s-thaillm-8b-instruct
```

ค่าที่ถูกใส่ผ่าน Android `BuildConfig` สามารถถูก extract จาก APK ได้ จึงไม่ควรใส่ service-role key หรือ private token ที่ต้องปกปิดจริงลงฝั่ง client

## Build และ Test

Build debug APK:

```powershell
.\gradlew.bat :app:assembleDebug
```

ติดตั้งบน emulator/device:

```powershell
.\gradlew.bat :app:installDebug
```

Run app unit tests:

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Run backend tests:

```powershell
.\gradlew.bat :backend:test
```

Run ชุดตรวจหลัก:

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :backend:test
```

ไฟล์ APK หลัง build:

```text
app/build/outputs/apk/debug/app-debug.apk
```

## Release Build

Release build ใช้ ProGuard/R8, resource shrink และ signing config เมื่อกำหนด keystore ไว้

```powershell
$env:DMIND_RELEASE_STORE_FILE="C:\secure\dmind-release.jks"
$env:DMIND_RELEASE_KEY_ALIAS="dmind"
$env:KEYSTORE_PASSWORD="your-keystore-password"
$env:KEY_PASSWORD="your-key-password"
.\gradlew.bat :app:assembleRelease
```

อย่า commit keystore หรือ signing password ลง repository

## Run Backend

Backend default port คือ `8080`

```powershell
.\gradlew.bat :backend:run
```

ตั้ง port เองได้:

```powershell
$env:PORT="8081"
.\gradlew.bat :backend:run
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

ตัวอย่าง env สำหรับ backend production-like dev:

```powershell
$env:DMIND_ADMIN_TOKEN="use-a-long-random-admin-token"
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
$env:TMD_API_TOKEN="your-tmd-token"
$env:FCM_PROJECT_ID="your-firebase-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\dmind-firebase-service-account.json"
$env:DMIND_TOKEN_STORE_PATH="build\device-push-tokens.json"
.\gradlew.bat :backend:run
```

## Backend URL ให้แอป

ค่า default สำหรับ Android emulator:

```text
http://10.0.2.2:8080
```

ชี้ backend อื่นตอน build:

```powershell
.\gradlew.bat :app:assembleDebug -PDMIND_BACKEND_BASE_URL=https://api.example.com
```

ค่า `DMIND_BACKEND_BASE_URL` หรือ `BACKEND_BASE_URL` จะถูกใส่เข้า `BuildConfig.BACKEND_BASE_URL`

## Backend Endpoints

| Method | Path | ต้องใช้ config | รายละเอียด |
| --- | --- | --- | --- |
| GET | `/health` | ไม่ต้อง | ตรวจสถานะ backend |
| GET | `/alerts` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | อ่าน active alerts จาก Supabase |
| POST | `/sos` | ไม่ต้อง | รับ SOS จากมือถือ มี rate limit |
| POST | `/reports` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | รับ incident/victim reports |
| GET | `/weather` | `TMD_API_TOKEN` | Proxy TMD hourly forecast |
| POST | `/damage-assessment` | ยังไม่ต่อ | คืน `damage_assessment_not_configured` |
| POST | `/chat` | ยังไม่ต่อ | คืน `chat_not_configured` |
| POST | `/media/incident-images` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Upload รูปเข้า Supabase Storage bucket `incident-images` |
| POST | `/fcm/register` | ไม่บังคับ, sync Supabase เมื่อพร้อม | รับ FCM token และ persist ลง local registry |
| POST | `/notifications/send` | `DMIND_ADMIN_TOKEN`, FCM credentials | ส่ง push notification ผ่าน FCM HTTP v1 |
| GET | `/api/analytics/summary` | GISTDA/TMD optional | รวมสถิติภัยพิบัติจาก external APIs |
| GET | `/api/analytics/trends?period=7d` | GISTDA/TMD optional | Trend analytics รองรับ `7d`, `30d`, `1y` |
| GET | `/api/analytics/environmental` | TMD optional | PM2.5/AQI, อุณหภูมิ, ความชื้น และฝน |

## ระบบแจ้งเตือนมือถือ

Flow หลัก:

1. `DMindApplication` สร้าง notification channels ตอนเปิดแอป
2. แอป refresh FCM token จาก Firebase
3. แอปส่ง token ไป backend ที่ `POST /fcm/register`
4. Backend persist token ลง local file และ sync Supabase table `device_push_tokens` เมื่อ config พร้อม
5. Backend ส่ง push ผ่าน `POST /notifications/send`
6. มือถือรับ data message ที่ `FCMFirebaseService`
7. แอปแสดง native emergency notification หรือ full-screen alert

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
  -Headers @{ Authorization = "Bearer $env:DMIND_ADMIN_TOKEN" } `
  -ContentType application/json `
  -Body '{"title":"แจ้งเตือนทดสอบ","message":"มีเหตุการณ์สำคัญในพื้นที่ของคุณ","alertType":"flood","broadcast":true}'
```

ไฟล์ Firebase client config:

```text
app/google-services.json
```

ถ้าไม่มีไฟล์นี้ app ยัง build ได้ แต่ push notification จริงจะยังไม่ทำงาน

## หน้าจอและ Feature หลัก

| หน้าจอ | รายละเอียด |
| --- | --- |
| Dashboard | สถานะภาพรวม, shortcut, สถิติ 24 ชม. และทางเข้า feature สำคัญ |
| Map | MapLibre disaster map พร้อมชั้นข้อมูลแผ่นดินไหว น้ำท่วม ไฟป่า VIIRS ภัยแล้ง PM2.5 สถานี และตัวกรอง |
| Alerts | Active alerts และประวัติ notification |
| Report | ส่ง incident report พร้อมพิกัดและรูปภาพ |
| Stations | สถานีตรวจวัดและ sensor integration |
| Dr.Mind | ผู้ช่วย AI จากข้อมูล D-MIND/Supabase และ ThaiLLM config |
| Settings | สิทธิ์, reliability checklist, theme, language และ config status |
| Emergency Contacts | เบอร์ฉุกเฉิน |
| Emergency Manual | คู่มือรับมือภัยพิบัติ |
| Weather | พยากรณ์อากาศ TMD รายชั่วโมง และหน้าราย 7 วันที่เตรียมต่อเพิ่ม |
| Damage Assessment | Workflow ถ่าย/อัปโหลดภาพสำหรับประเมินความเสียหาย |
| Victim Reports | แจ้งข้อมูลผู้ประสบภัยและสถานะความช่วยเหลือ |
| Satisfaction Survey | แบบประเมินความพึงพอใจ |
| Analytics | สรุปสถิติ แนวโน้ม และข้อมูลสิ่งแวดล้อม |

## Config Reference

| Key | ฝั่ง | รายละเอียด |
| --- | --- | --- |
| `BACKEND_BASE_URL`, `DMIND_BACKEND_BASE_URL` | Android | Backend gateway URL |
| `VITE_SUPABASE_URL`, `DMIND_SUPABASE_URL` | Android | Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY`, `DMIND_SUPABASE_PUBLISHABLE_KEY` | Android | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID`, `DMIND_SUPABASE_PROJECT_ID` | Android | Supabase project id |
| `VITE_TMD_API_TOKEN`, `DMIND_TMD_API_TOKEN`, `TMD_API_TOKEN` | Android/Backend | TMD API token |
| `DMIND_GISTDA_API_KEY`, `VITE_GISTDA_API_KEY` | Android/Backend analytics | GISTDA API key หลัก |
| `VITE_GISTDA_DISASTER_API_KEY`, `VITE_GISTDA_WMS_API_KEY`, `VITE_GISTDA_FIRE_API_KEY` | Android | GISTDA key แยกตามชุดข้อมูล ถ้าไม่ได้ตั้งจะ fallback ไป key หลัก |
| `THAI_LLM_API_KEY`, `TYPHOON_API_KEY`, `DMIND_THAI_LLM_API_KEY` | Android | Key สำหรับ Dr.Mind ThaiLLM client |
| `THAI_LLM_BASE_URL`, `DMIND_THAI_LLM_BASE_URL` | Android | Base URL ของ ThaiLLM ค่า default `http://thaillm.or.th/api/v1/` |
| `THAI_LLM_MODEL`, `DMIND_THAI_LLM_MODEL` | Android | Model ค่า default `typhoon-s-thaillm-8b-instruct` |
| `DMIND_ADMIN_TOKEN` | Backend | Admin bearer token สำหรับ `/notifications/send` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Backend | Supabase service-role gateway |
| `FCM_PROJECT_ID`, `FIREBASE_PROJECT_ID` | Backend | Firebase project id |
| `GOOGLE_APPLICATION_CREDENTIALS` | Backend | Service-account JSON path สำหรับ FCM HTTP v1 |
| `DMIND_TOKEN_STORE_PATH` | Backend | Local token registry path |
| `DMIND_RATE_LIMIT_PER_MINUTE` | Backend | Rate limit สำหรับ endpoint ที่รับ payload |
| `DMIND_UPLOAD_MAX_BYTES` | Backend | Max image upload size ค่า default 8 MB |
| `DMIND_RELEASE_STORE_FILE`, `DMIND_RELEASE_KEY_ALIAS`, `KEYSTORE_PASSWORD`, `KEY_PASSWORD` | Android release | Signing config |

## เอกสารที่ควรอ่านต่อ

| ไฟล์ | รายละเอียด |
| --- | --- |
| `IMPLEMENTATION_SUMMARY.md` | สรุป implementation ระดับ workspace |
| `REAL_DEVICE_TEST_CHECKLIST.md` | Checklist ทดสอบบนเครื่อง Android จริง |
| `docs/IMPLEMENTATION_REPORT.th.md` | รายงานการพัฒนา Android native และ backend |
| `docs/FOLDER_MAP.th.md` | แผนผังโฟลเดอร์และประเภทไฟล์ |
| `docs/SYSTEM_SUMMARY.th.md` | สรุป UI/UX, notification, API key และ endpoint |
| `docs/NOTIFICATION_SYSTEM.th.md` | สรุประบบแจ้งเตือนมือถือ |
| `app/README.md` | รายละเอียด app module |
| `backend/README.md` | รายละเอียด backend module |

## ข้อจำกัดปัจจุบัน

- Push notification จริงต้องใช้ `app/google-services.json`, Firebase project, service-account credentials และเครื่อง Android/emulator ที่รับ FCM ได้
- `/chat` และ `/damage-assessment` ใน backend ยังเป็น placeholder และยังไม่ต่อ production gateway/model endpoint
- `GET /alerts`, `POST /reports` และ media upload ต้องใช้ Supabase service-role config ฝั่ง backend
- Analytics ใช้ external APIs หลายแหล่งและ degrade เป็นค่า 0 ได้เมื่อ API ไม่พร้อมหรือไม่มี key
- Client-side keys ที่ใส่ใน `BuildConfig` ไม่ใช่ที่เก็บ secret ระดับ production
- Feature parity จาก web เดิมยังต้องขยายต่อในบางหน้าจอ เช่น 7-day weather, damage assessment และ production AI workflow

## ก่อนส่งงานหรือ Release

รันชุดนี้อย่างน้อยหนึ่งครั้งจาก `android/`:

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :backend:test
```

สำหรับงานที่กระทบ notification, location, camera หรือ background service ให้ทดสอบตาม `REAL_DEVICE_TEST_CHECKLIST.md` บนเครื่อง Android จริงด้วย
