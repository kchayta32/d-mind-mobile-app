# D-MIND: Disaster Management & Information System

D-MIND เป็นระบบเฝ้าระวังภัยพิบัติและแจ้งเตือนฉุกเฉินสำหรับประเทศไทย โปรเจกต์นี้ยังเก็บโค้ดเว็บ React/Vite เดิมไว้เป็น reference แต่แกนหลักสำหรับการพัฒนาปัจจุบันอยู่ที่ `android/` ซึ่งเป็น native Android app พร้อม Kotlin/Ktor backend gateway ใน workspace เดียวกัน

อัปเดตล่าสุด: 25 พฤษภาคม 2026

## สถานะโปรเจกต์

- `android/` คือ workspace หลักสำหรับ mobile app, backend, Gradle build และเอกสาร Android
- Android app เป็น native app ใช้ Kotlin, Jetpack Compose, Material 3 และ Java native services เดิมบางส่วน
- Backend ใหม่อยู่ที่ `android/backend` ใช้ Kotlin/JVM + Ktor สำหรับ gateway, notification, media upload, weather และ analytics
- ระบบแจ้งเตือนมือถือใช้ Firebase Cloud Messaging (FCM), native notification channels และ full-screen emergency alert
- Root React/Vite/Capacitor ยังใช้เป็น legacy/reference code สำหรับดู logic, UI เดิม และ migration parity
- Android build ไม่ควรต้องพึ่ง `npm`, `node_modules`, Vite, React หรือไฟล์ web นอก `android/`

## เริ่มต้นเร็ว

พัฒนาและ build Android:

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat :app:assembleDebug
```

รัน backend dev:

```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
.\gradlew.bat :backend:run
Invoke-RestMethod http://localhost:8080/health
```

รันเว็บ legacy ที่ root เมื่อจำเป็น:

```powershell
npm install
npm run dev
```

## โครงสร้าง Repository

| Path | สถานะ | รายละเอียด |
| --- | --- | --- |
| `android/` | Active | Android-only workspace หลัก มี app, backend, docs และ Gradle wrapper |
| `android/app/` | Active | Native Android app module, Compose UI, Android services, resources และ unit tests |
| `android/backend/` | Active | Kotlin/Ktor backend gateway module |
| `android/docs/` | Active | เอกสาร migration, folder map, system summary, endpoint และ notification |
| `api-from-sensor/` | Reference | โค้ด/ข้อมูลสำหรับเชื่อมต่อ sensor หรือสถานีตรวจวัด |
| `src/` | Legacy | React/Vite web source เดิม ใช้เป็น reference ได้ |
| `public/` | Legacy | web static assets และ PWA assets เดิม |
| `supabase/` | Legacy/Reference | Supabase functions และ migrations เดิม |
| `dist/` | Generated/Legacy | web build output เดิม |
| `node_modules/` | Local dependency cache | ใช้กับ legacy web เท่านั้น |

## Android Build และ Test

คำสั่งทั้งหมดให้รันจาก `android/`

| งาน | คำสั่ง |
| --- | --- |
| Build debug APK | `.\gradlew.bat :app:assembleDebug` |
| ติดตั้งบน device/emulator | `.\gradlew.bat :app:installDebug` |
| App unit tests | `.\gradlew.bat :app:testDebugUnitTest` |
| Backend tests | `.\gradlew.bat :backend:test` |
| ตรวจหลักทั้งหมด | `.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest :backend:test` |

APK หลัง build:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Backend Gateway

Backend default port คือ `8080` และเปลี่ยนได้ด้วย `PORT`

```powershell
$env:PORT="8081"
.\gradlew.bat :backend:run
```

Endpoint หลัก:

| Method | Path | รายละเอียด |
| --- | --- | --- |
| GET | `/health` | ตรวจสถานะ backend |
| GET | `/alerts` | อ่าน active alerts จาก Supabase เมื่อ config พร้อม |
| POST | `/sos` | รับ SOS payload จากมือถือ |
| POST | `/reports` | รับ incident/victim reports และบันทึกลง Supabase |
| GET | `/weather` | Proxy ข้อมูล TMD hourly forecast เมื่อมี `TMD_API_TOKEN` |
| POST | `/media/incident-images` | Upload รูป incident เข้า Supabase Storage |
| POST | `/fcm/register` | รับ FCM token จากแอป Android |
| POST | `/notifications/send` | ส่ง push ผ่าน FCM HTTP v1 ต้องมี admin bearer token |
| GET | `/api/analytics/summary` | สรุปเหตุการณ์จาก USGS, GISTDA, TMD และ Air4Thai |
| GET | `/api/analytics/trends?period=7d` | Trend analytics รองรับ `7d`, `30d`, `1y` |
| GET | `/api/analytics/environmental` | PM2.5/AQI, อุณหภูมิ, ความชื้น และฝน |

`/chat` และ `/damage-assessment` มี route แล้ว แต่ฝั่ง backend ยังคืน `not_configured` จนกว่าจะต่อ production AI gateway/model endpoint จริง

## Config และ Secret

ห้าม commit secret จริงลง repository และอย่าใส่ service-role key หรือ private token ลง Android source โดยตรง

Android app อ่านค่าจาก Gradle property, environment variable, `android/local.properties` หรือ `local.properties` ที่ root โดยมี alias แบบ `DMIND_*` สำหรับค่า `VITE_*` เดิม เช่น `VITE_SUPABASE_URL` ใช้ `DMIND_SUPABASE_URL` ได้

ค่าที่ใช้บ่อย:

| Key/File | ใช้ที่ | รายละเอียด |
| --- | --- | --- |
| `BACKEND_BASE_URL` หรือ `DMIND_BACKEND_BASE_URL` | Android | Backend URL ตอน build ค่า default คือ `http://10.0.2.2:8080` |
| `DMIND_SUPABASE_URL` | Android | Supabase project URL สำหรับ client anon access |
| `DMIND_SUPABASE_PUBLISHABLE_KEY` | Android | Supabase anon/publishable key |
| `DMIND_SUPABASE_PROJECT_ID` | Android | Supabase project id |
| `DMIND_TMD_API_TOKEN` | Android/Backend | TMD token; Android value จะถูกฝังใน APK จึงไม่ควรใช้ secret ระดับสูง |
| `DMIND_GISTDA_API_KEY` | Android/Backend analytics | GISTDA API key สำหรับ disaster layers |
| `DMIND_THAI_LLM_API_KEY` | Android | ThaiLLM/Dr.Mind client key; ควรย้ายผ่าน backend ถ้าต้องปกปิดจริง |
| `android/app/google-services.json` | Android | Firebase Android config สำหรับรับ FCM token/message |
| `DMIND_ADMIN_TOKEN` | Backend | Bearer token สำหรับ `/notifications/send` |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | ใช้ backend gateway เขียนข้อมูล/Storage/FCM token registry |
| `FCM_PROJECT_ID` หรือ `FIREBASE_PROJECT_ID` | Backend | Firebase/Google Cloud project id สำหรับ FCM HTTP v1 |
| `GOOGLE_APPLICATION_CREDENTIALS` | Backend | Path ไป service-account JSON สำหรับ FCM HTTP v1 |
| `DMIND_TOKEN_STORE_PATH` | Backend | Local persistent FCM token registry fallback |

ตัวอย่างรัน backend สำหรับ push notification จริง:

```powershell
$env:DMIND_ADMIN_TOKEN="use-a-long-random-admin-token"
$env:FCM_PROJECT_ID="your-firebase-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\dmind-firebase-service-account.json"
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
.\gradlew.bat :backend:run
```

## เอกสารที่ควรอ่านต่อ

| ไฟล์ | รายละเอียด |
| --- | --- |
| `android/README.md` | คู่มือหลักของ Android workspace |
| `android/IMPLEMENTATION_SUMMARY.md` | สรุป implementation ระดับ workspace |
| `android/REAL_DEVICE_TEST_CHECKLIST.md` | Checklist สำหรับทดสอบบนเครื่อง Android จริง |
| `android/docs/IMPLEMENTATION_REPORT.th.md` | รายงานการพัฒนา Android native และ backend |
| `android/docs/FOLDER_MAP.th.md` | แผนผังโฟลเดอร์และประเภทไฟล์ |
| `android/docs/SYSTEM_SUMMARY.th.md` | สรุป UI/UX, notification, API key และ endpoint |
| `android/docs/NOTIFICATION_SYSTEM.th.md` | รายละเอียดระบบแจ้งเตือนมือถือ |
| `BUILD_APK_GUIDE.md` | คู่มือ build APK เดิม |
| `PLAY_STORE_GUIDE.md` | แนวทางเตรียมเผยแพร่ Play Store |

## Legacy Web

Root web app ยังมี script ตาม `package.json`

| Script | คำสั่ง | รายละเอียด |
| --- | --- | --- |
| `dev` | `npm run dev` | เปิด Vite dev server |
| `build` | `npm run build` | Build web production |
| `build:dev` | `npm run build:dev` | Build web development mode |
| `lint` | `npm run lint` | ESLint |
| `preview` | `npm run preview` | Preview web build |

ส่วนนี้เป็น legacy/reference path ไม่ใช่ทางหลักของ Android native build

## งานที่ควรทำต่อ

- ต่อ `/chat` และ `/damage-assessment` backend routes เข้ากับ production AI gateway/model endpoint
- ตัดสินใจนโยบาย key ที่ฝังใน APK โดยเฉพาะ TMD, GISTDA และ ThaiLLM
- ทดสอบ FCM บนเครื่อง Android จริงพร้อม Firebase project และ credentials
- ขยาย native Compose UI ให้ครบ feature parity จาก web เดิม
- เพิ่ม instrumented tests สำหรับ notification, geofence, background location และ report upload
- เตรียม release signing, production backend URL และ Play Store release checklist
