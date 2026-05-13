# D-MIND: Disaster Management & Information System

D-MIND เป็นระบบจัดการข้อมูลภัยพิบัติและการแจ้งเตือนฉุกเฉิน โดยสถานะปัจจุบันของโปรเจกต์นี้ย้ายแกนหลักไปที่แอป Android แบบ native แล้ว โฟลเดอร์ที่ใช้พัฒนาต่อเป็นหลักคือ `android/`

## สถานะปัจจุบัน

- `android/` คือ workspace หลักสำหรับ mobile app และ backend ใหม่
- Android app เป็น native Android ใช้ Kotlin, Jetpack Compose และ Java native services เดิมบางส่วน
- Backend ใหม่อยู่ใต้ `android/backend` เป็น Kotlin/Ktor server module
- ระบบแจ้งเตือนมือถือใช้ Firebase Cloud Messaging (FCM) และ native Android notification channels
- React/Vite/Capacitor ที่ root เป็น legacy/reference code ไม่ได้เป็นทางหลักของ Android build แล้ว
- Android build ไม่ควรต้องพึ่ง `node_modules`, Vite, React, Capacitor หรือไฟล์นอก `android`

## เริ่มจากตรงไหน

ถ้าจะพัฒนาแอปมือถือ ให้เข้าโฟลเดอร์นี้ก่อน:

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
```

อ่านคู่มือหลักของ Android workspace:

```text
android/README.md
```

เอกสารที่ควรอ่านต่อ:

| ไฟล์ | รายละเอียด |
| --- | --- |
| `android/README.md` | คู่มือ build, test, backend, FCM และข้อจำกัดปัจจุบัน |
| `android/docs/IMPLEMENTATION_REPORT.th.md` | รายงานการพัฒนา Android native และ backend |
| `android/docs/FOLDER_MAP.th.md` | แผนผังโฟลเดอร์และประเภทไฟล์ |
| `android/docs/SYSTEM_SUMMARY.th.md` | สรุป UI/UX, notification, API key และ endpoint |
| `android/docs/NOTIFICATION_SYSTEM.th.md` | สรุประบบแจ้งเตือนมือถือ |
| `android/REAL_DEVICE_TEST_CHECKLIST.md` | checklist สำหรับทดสอบบนเครื่อง Android จริง |

## โครงสร้าง Repository

| Path | สถานะ | รายละเอียด |
| --- | --- | --- |
| `android/` | Active | Android-only workspace หลัก มี app, backend, docs และ Gradle wrapper |
| `android/app/` | Active | Native Android app module |
| `android/backend/` | Active | Kotlin/Ktor backend module |
| `android/docs/` | Active | เอกสาร `.md` และ `.txt` สำหรับ migration, UI/UX, endpoint และ notification |
| `src/` | Legacy | React/Vite web source เดิม ใช้เป็น reference ได้ แต่ไม่ใช่ Android app หลัก |
| `public/` | Legacy | web static assets เดิม |
| `supabase/` | Legacy/Reference | Supabase functions และ migrations เดิม |
| `dist/` | Generated/Legacy | web build output เดิม |
| `node_modules/` | Local dependency cache | ใช้กับ web legacy เท่านั้น ไม่ควรเกี่ยวกับ Android build |
| `api-from-sensor/` | Reference | พื้นที่สำหรับโค้ด/ข้อมูล integration จาก sensor หากมีการใช้งานต่อ |

## Build และ Test Android

รันจาก `android/`

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

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

Run ทั้งหมด:

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :backend:test
```

APK output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Run Backend

รันจาก `android/`

```powershell
.\gradlew.bat :backend:run
```

Backend default port คือ `8080`

Health check:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

## ตั้งค่า Backend URL ให้ Android App

ค่า default สำหรับ Android emulator:

```text
http://10.0.2.2:8080
```

ถ้าต้องการ build ให้ชี้ backend จริง:

```powershell
.\gradlew.bat :app:assembleDebug -PDMIND_BACKEND_BASE_URL=https://api.example.com
```

ค่า `DMIND_BACKEND_BASE_URL` จะถูกใส่เข้า `BuildConfig.BACKEND_BASE_URL`

## ระบบแจ้งเตือนมือถือ

Flow หลัก:

1. แอปเปิดผ่าน `DMindApplication`
2. แอปสร้าง notification channels
3. แอปขอ FCM token จาก Firebase
4. แอปส่ง token ไป backend ที่ `POST /fcm/register`
5. Backend ส่ง push ผ่าน `POST /notifications/send`
6. มือถือรับ data message ที่ `FCMFirebaseService`
7. แอปแสดง native emergency notification หรือ full-screen alert

Backend notification endpoints:

| Method | Path | รายละเอียด |
| --- | --- | --- |
| POST | `/fcm/register` | รับ FCM token จากมือถือ |
| POST | `/notifications/send` | ส่ง push notification ผ่าน FCM HTTP v1 |

ตัวอย่างส่งแจ้งเตือนจาก backend dev:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:8080/notifications/send `
  -ContentType application/json `
  -Body '{"title":"แจ้งเตือนทดสอบ","message":"มีเหตุการณ์สำคัญในพื้นที่ของคุณ","alertType":"flood","broadcast":true}'
```

## API Key และ Secret

ห้าม commit secret จริงลง repository

Android app ควรเก็บเฉพาะ config ที่ไม่ใช่ secret เช่น `BACKEND_BASE_URL` ส่วน API key/secret จริงต้องอยู่ฝั่ง backend หรือ secret manager

ค่าที่เกี่ยวข้อง:

| Key/File | อยู่ที่ไหน | ใช้ทำอะไร |
| --- | --- | --- |
| `android/app/google-services.json` | app module | Firebase Android config สำหรับรับ FCM token/message |
| `DMIND_BACKEND_BASE_URL` | Gradle property | กำหนด backend URL ตอน build Android app |
| `FCM_PROJECT_ID` หรือ `FIREBASE_PROJECT_ID` | backend env | ระบุ Firebase/Google Cloud project |
| `GOOGLE_APPLICATION_CREDENTIALS` | backend env | path ไป service-account JSON สำหรับ FCM HTTP v1 |
| `OPENAI_API_KEY` | backend env | future `/chat` และ `/damage-assessment` |
| `TMD_API_TOKEN` | backend env | future `/weather` |

ตัวอย่างตั้งค่า FCM ฝั่ง backend:

```powershell
$env:FCM_PROJECT_ID="your-firebase-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\dmind-firebase-service-account.json"
.\gradlew.bat :backend:run
```

## Legacy Web

โค้ด React/Vite ที่ root ยังอยู่เพื่อใช้ดู logic, UI เดิม หรือเทียบ feature parity ระหว่าง migration แต่ไม่ใช่ทางหลักของ mobile app แล้ว

ถ้าจำเป็นต้องรันเว็บเดิม:

```powershell
npm install
npm run dev
```

คำสั่งนี้เกี่ยวกับ legacy web เท่านั้น ไม่จำเป็นสำหรับ Android build

## Acceptance ของ Android Workspace

- Android build สำเร็จจาก `android/` โดยไม่ต้องใช้ `npm`
- Gradle settings include เฉพาะ `:app` และ `:backend`
- Primary UI เป็น native Compose ไม่ใช่ WebView
- Backend อยู่ใต้ `android/backend`
- เอกสารรายงานอยู่ใต้ `android/docs`
- Secret จริงไม่ถูกฝังลง APK หรือ commit ลง repository

## สถานะตรวจสอบล่าสุด

คำสั่งที่ผ่านแล้ว:

```powershell
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:testDebugUnitTest
.\gradlew.bat :backend:test
```

ใช้ `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`

## งานที่ควรทำต่อ

- ย้าย FCM token registry จาก in-memory ไป database
- เพิ่ม authentication/authorization ให้ `/notifications/send`
- ต่อ backend placeholder routes เข้ากับ production integrations จริง
- ขยาย Compose UI ให้ครบ feature parity จาก web เดิม
- เพิ่ม instrumented tests บนอุปกรณ์ Android จริง
- เตรียม release signing และ production backend URL flavors
