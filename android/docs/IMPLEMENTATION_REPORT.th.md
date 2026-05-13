# รายงานการพัฒนา D-MIND Android แบบ Native เท่านั้น

วันที่: 2026-05-13

## สรุป

โฟลเดอร์ `android` เป็น workspace หลักของแอปมือถือแล้ว แอป build จาก native Android code ใน `android/app` และ backend อยู่ใน `android/backend` งาน build ของ Android ไม่ต้องพึ่ง root web project, web build artifacts, generated web assets หรือ Node dependencies

## การพัฒนาแอป

- เพิ่ม Kotlin และ Jetpack Compose ใน app module
- เพิ่ม `MainActivity.kt` เป็น native `ComponentActivity` และใช้ `setContent { DMindApp() }`
- เพิ่มโครงหลักของแอปมือถือด้วย Compose พร้อมแท็บ Home, Map, Alerts, SOS และ More
- เพิ่มหน้าแผนที่ native ด้วย MapLibre โดยตั้งศูนย์กลางแผนที่ไว้ที่ประเทศไทย
- เพิ่ม `NativeStatusRepository` สำหรับเชื่อม Compose UI กับ Java services เดิม เช่น monitoring, SOS queue, FCM token refresh, battery settings, DND settings และ emergency test alerts
- เพิ่ม Room schema สำหรับ alerts, SOS queue, danger zones และ location history เพื่อเป็นเป้าหมายการย้าย persistence ไป Kotlin
- เก็บ Java reliability code เดิมไว้สำหรับ background location, geofencing, local SQLite cache, emergency notifications, FCM, receivers และ WorkManager
- ลบ web activity layout และ generated web assets ออกจาก `app/src/main/assets`

## การพัฒนาระบบแจ้งเตือนมือถือ

- เพิ่ม `DMindApplication` เพื่อสร้าง notification channels และ refresh FCM token ตอนเปิดแอป
- ปรับ `FCMTokenRegistrar` ให้ส่ง token ไป backend ด้วย payload `token`, `platform`, `userId`
- ปรับ `FCMFirebaseService` ให้ไม่ log token จริง และรับ FCM data message ผ่าน keys `alert_type`, `alert_title`, `alert_message`
- เพิ่ม endpoint backend `POST /notifications/send` สำหรับส่ง push ผ่าน FCM HTTP v1
- เพิ่ม Google Auth dependency ใน backend เพื่อใช้ Application Default Credentials
- เพิ่ม unit test สำหรับ `/fcm/register` และ `/notifications/send`
- ทำให้แอปไม่ crash ถ้ายังไม่มี Firebase config ในเครื่อง dev โดยข้าม FCM registration แบบปลอดภัย

## การพัฒนา Backend

- เพิ่ม `android/backend` เป็น Kotlin/JVM Ktor module
- เพิ่ม endpoints: `/health`, `/alerts`, `/sos`, `/reports`, `/weather`, `/damage-assessment`, `/chat`, `/fcm/register` และ `/notifications/send`
- integration ฝั่ง backend ที่ต้องใช้ secret อ่านจาก environment variables เท่านั้น
- แอปอ่านค่า backend ผ่าน `BuildConfig.BACKEND_BASE_URL` โดยค่าเริ่มต้นคือ `http://10.0.2.2:8080`
- FCM sender ใช้ `FCM_PROJECT_ID` หรือ `FIREBASE_PROJECT_ID` และ `GOOGLE_APPLICATION_CREDENTIALS`

## การแยก Build ให้เป็นอิสระ

- `settings.gradle` include เฉพาะ `:app` และ `:backend`
- dependencies ของ app เป็น native Android/Kotlin dependencies
- ลบ generated web Gradle wiring และ generated web assets ออกจาก Android workspace
- ไฟล์ web ที่อยู่นอก `android` ไม่จำเป็นต่อ Android build หรือ tests

## เอกสารที่เพิ่ม/อัปเดต

- `android/docs/IMPLEMENTATION_REPORT.th.md`
- `android/docs/IMPLEMENTATION_REPORT.th.txt`
- `android/docs/SYSTEM_SUMMARY.th.md`
- `android/docs/SYSTEM_SUMMARY.th.txt`
- `android/docs/NOTIFICATION_SYSTEM.th.md`
- `android/docs/NOTIFICATION_SYSTEM.th.txt`
- `android/docs/FOLDER_MAP.th.md`
- `android/docs/FOLDER_MAP.th.txt`

## ผลการตรวจสอบ

- `.\gradlew.bat :backend:test`: ผ่าน
- `.\gradlew.bat :app:assembleDebug`: ผ่าน
- `.\gradlew.bat :app:testDebugUnitTest`: ผ่าน

การตรวจสอบใช้ `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`

## งาน Product ที่ยังเหลือ

- ย้าย FCM token registry จาก in-memory ไป database
- เพิ่ม authentication/authorization ให้ `/notifications/send` ก่อนใช้ production
- แทนที่ placeholder backend route bodies ด้วย production integrations จริง
- เพิ่ม DTO validation และ audit log สำหรับ API ที่มีผลต่อผู้ใช้
- ขยาย Compose screens จาก native shell ให้ครบ feature parity
- เพิ่ม instrumented UI tests บนอุปกรณ์ Android จริง
- เพิ่ม release signing และ production backend URL flavors
