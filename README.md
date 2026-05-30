# D-MIND: Disaster Management & Information System

D-MIND เป็นระบบเฝ้าระวังภัยพิบัติและแจ้งเตือนฉุกเฉินสำหรับประเทศไทย โปรเจกต์นี้ได้รับการเปลี่ยนผ่านเข้าสู่แอปพลิเคชันหลักบน **Native Android App (Kotlin/Jetpack Compose)** พร้อม **Kotlin/Ktor Backend Gateway** ภายใต้โครงสร้าง workspace เดียวกันที่โฟลเดอร์ [android/](file:///E:/2-2568/d-mind/d-mind-ai/android) โดยยังคงเก็บโค้ดเว็บ React/Vite/Capacitor เดิมไว้เป็นข้อมูลอ้างอิงสำหรับการตรวจสอบระบบเก่า

อัปเดตล่าสุด: 30 พฤษภาคม 2026

---

## 📊 สถานะโปรเจกต์และการอัปเดตล่าสุด

ปัจจุบันการพัฒนาฟีเจอร์หลักเสร็จสมบูรณ์แล้วในส่วนของ Native App และ Backend API Gateway โดยมีการอัปเดตที่สำคัญดังนี้:

### 1. ระบบวิเคราะห์และสังเคราะห์เสียงในตัว (Native Voice Integration)
- พัฒนาคลาส [VoiceManager](file:///E:/2-2568/d-mind/d-mind-ai/android/app/src/main/kotlin/com/dmind/app/util/VoiceManager.kt) เพื่อห่อหุ้มคำสั่งการรู้จำเสียงพูดของ Android (Speech-to-Text) และการสังเคราะห์เสียงพูด (Text-to-Speech)
- นำมาผสานรวมเข้ากับหน้าจอ [ChatbotScreen](file:///E:/2-2568/d-mind/d-mind-ai/android/app/src/main/kotlin/com/dmind/app/ui/screens/chatbot/ChatbotScreen.kt) ของระบบผู้ช่วยอัจฉริยะ **Dr.Mind** ทำให้ผู้ใช้งานสามารถพูดสอบถามรายละเอียดเหตุการณ์ภัยพิบัติและขอรับคำแนะนำการปฏิบัติตัวได้อย่างสะดวกรวดเร็ว รวมถึงได้รับการอ่านข้อความตอบกลับด้วยเสียงแบบ Native Thai/English

### 2. การอัปเดตแผนที่ภัยพิบัติและการแสดงผลเชิงวิเคราะห์ (Disaster Map & Legends)
- **การเพิ่มชั้นข้อมูล (Disaster Layers) ใหม่**: รวมข้อมูลการไหลของแม่น้ำ (`RiverDischarge`) และข้อมูลระดับความชื้นในดินสะสม (`SoilMoistureHeatmap`) จาก Open-Meteo API มาประมวลผลเป็นรูปแบบ GeoJSON เพื่อแสดงผลบนหน้าจอ [DisasterMapScreen](file:///E:/2-2568/d-mind/d-mind-ai/android/app/src/main/kotlin/com/dmind/app/ui/screens/map/DisasterMapScreen.kt)
- **คำอธิบายสัญลักษณ์แผนที่แบบโต้ตอบได้**: พัฒนาคอมโพเนนต์ [MapLegendOverlay](file:///E:/2-2568/d-mind/d-mind-ai/android/app/src/main/kotlin/com/dmind/app/ui/screens/map/MapLegendOverlay.kt) ให้ผู้ใช้สามารถลากย้ายตำแหน่งบนหน้าจอแผนที่ (Interactive Draggable Overlay) เพื่อดูรายละเอียดความหมายของเฉดสีและระดับความรุนแรงของภัยพิบัติ เช่น ข้อมูลจุดความร้อนจาก VIIRS, พื้นที่น้ำท่วมซ้ำซาก, ปริมาณฝุ่น PM2.5, และความชื้นในดิน

### 3. ระบบแจ้งเตือนฉุกเฉินระดับระบบปฏิบัติการ (Emergency Alert Routing)
- ปรับปรุงการนำเส้นทางแจ้งเตือนของ Firebase Cloud Messaging (FCM) แบบ Data Messages และการแจ้งเตือนแบบ Full-screen Emergency Alert ใน Android ให้สามารถระบุระดับความสำคัญ ความรุนแรงของภัย พร้อมปรับปรุงไอคอนแจ้งเตือนเฉพาะกลุ่มภัยพิบัติแต่ละประเภท (เช่น อุทกภัย, วาตภัย, แผ่นดินไหว, อัคคีภัย)

### 4. API ข้อมูลเชิงวิเคราะห์และสภาพแวดล้อมฝั่ง Backend
- รองรับ API Endpoint เชิงวิเคราะห์ใหม่ใน [AnalyticsRoutes](file:///E:/2-2568/d-mind/d-mind-ai/android/backend/src/main/kotlin/com/dmind/backend/routes/AnalyticsRoutes.kt) เพื่อสรุปข้อมูลและดูแนวโน้มสถิติของดัชนีชี้วัดด้านสิ่งแวดล้อม (Environmental Data) เช่น ปริมาณฝุ่น PM2.5/AQI, ปริมาณฝนสะสม และอุณหภูมิความชื้นของสถานีต่างๆ ทั่วประเทศ

---

## 📂 โครงสร้าง Repository

| โฟลเดอร์ / ไฟล์ | สถานะการใช้งาน | คำอธิบายและหน้าที่การทำงาน |
| --- | --- | --- |
| [android/](file:///E:/2-2568/d-mind/d-mind-ai/android) | **Active** | Workspace หลักสำหรับการพัฒนา Native App และ Backend Gateway |
| [android/app/](file:///E:/2-2568/d-mind/d-mind-ai/android/app) | **Active** | ตัวแอปพลิเคชันหลัก Android Native App (Jetpack Compose UI) |
| [android/backend/](file:///E:/2-2568/d-mind/d-mind-ai/android/backend) | **Active** | บริการเซิร์ฟเวอร์ Kotlin/Ktor Backend Gateway API |
| [android/docs/](file:///E:/2-2568/d-mind/d-mind-ai/android/docs) | **Active** | เอกสารรายงานการพัฒนาระบบ แผนภาพสถาปัตยกรรม และคำอธิบาย API |
| [api-from-sensor/](file:///E:/2-2568/d-mind/d-mind-ai/api-from-sensor) | Reference | ชุดโค้ด/ตัวอย่างไฟล์เพื่อเชื่อมต่อเซนเซอร์ตรวจวัดในพื้นที่ |
| [src/](file:///E:/2-2568/d-mind/d-mind-ai/src) | Legacy | โค้ดของระบบเว็บแอพ React/Vite/Capacitor เดิม (Reference) |
| [public/](file:///E:/2-2568/d-mind/d-mind-ai/public) | Legacy | ไฟล์สแตติกของระบบเว็บและแอสเซทของ PWA เดิม |
| [supabase/](file:///E:/2-2568/d-mind/d-mind-ai/supabase) | Legacy/Reference | สคริปต์ Database Schema และ Edge Functions เดิม |
| [dist/](file:///E:/2-2568/d-mind/d-mind-ai/dist) | Generated/Legacy | ผลลัพธ์ของการคอมไพล์เว็บแอพเดิม |

---

## ⚡ เริ่มต้นใช้งานอย่างรวดเร็ว

### การตั้งค่าและ Build ตัวแอป Android (Debug APK)
1. ติดตั้ง Android SDK และ JDK 21 (แนะนำ JBR ใน Android Studio)
2. รันคำสั่งผ่าน Windows PowerShell:
```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
# คอมไพล์และสร้างไฟล์ติดตั้ง debug APK
.\gradlew.bat :app:assembleDebug
```
3. ไฟล์ติดตั้งจะได้ที่พาธ: `android/app/build/outputs/apk/debug/app-debug.apk`

### การเริ่มต้นรันบริการ Backend Gateway
1. กำหนดตัวแปรสภาพแวดล้อมที่จำเป็นสำหรับเชื่อมโยงข้อมูล เช่น Supabase หรือ Firebase (FCM)
2. รันคำสั่งดังต่อไปนี้:
```powershell
cd E:\2-2568\d-mind\d-mind-ai\android
.\gradlew.bat :backend:run
# ตรวจสอบสถานะการเชื่อมต่อ
Invoke-RestMethod http://localhost:8080/health
```

---

## 🔌 API Endpoints ฝั่ง Backend Gateway

บริการ Ktor ทำหน้าที่เสมือน Gateway พอร์ตมาตรฐานคือ `8080` (เปลี่ยนได้โดยการตั้งค่าตัวแปร `PORT`)

| Method | Path | หน้าที่และรายละเอียดการทำงาน |
| --- | --- | --- |
| GET | `/health` | ตรวจสอบสถานะการทำงานของบริการเซิร์ฟเวอร์ |
| GET | `/alerts` | ดึงข้อมูลเหตุการณ์แจ้งเตือนล่าสุดที่ยังคงมีผลอยู่จาก Supabase |
| POST | `/sos` | บันทึกข้อมูลและจัดคิวขอความช่วยเหลือฉุกเฉิน (SOS) จากเครื่องผู้ใช้ |
| POST | `/reports` | รับการแจ้งรายงานสถานการณ์ภัยพิบัติพร้อมข้อมูลตำแหน่งพิกัดและรูปภาพ |
| GET | `/weather` | Proxy ดึงข้อมูลพยากรณ์อากาศรายชั่วโมงจากกรมอุตุนิยมวิทยา (TMD) |
| POST | `/media/incident-images` | อัปโหลดรูปภาพสถานการณ์เหตุภัยพิบัติไปจัดเก็บยัง Supabase Storage |
| POST | `/fcm/register` | ลงทะเบียนและอัปเดต Device FCM Token สำหรับใช้ส่งสัญญาณแจ้งเตือนรายเครื่อง |
| POST | `/notifications/send` | ส่งสัญญาณแจ้งเตือนแบบ Push Notification ผ่าน FCM HTTP v1 |
| GET | `/api/analytics/summary` | สรุปข้อมูลการตรวจพิจารณาภัยพิบัติรายวัน (USGS, GISTDA, TMD, Air4Thai) |
| GET | `/api/analytics/trends?period=7d` | บริการวิเคราะห์เชิงแนวโน้ม รองรับช่วงเวลาย้อนหลัง `7d`, `30d`, `1y` |
| GET | `/api/analytics/environmental` | สรุปดัชนีชี้วัดสิ่งแวดล้อมรายพื้นที่ เช่น PM2.5/AQI, ปริมาณน้ำฝน และสภาพอากาศ |

---

## 🔒 การกำหนดค่า Configuration และ Secrets

ห้ามนำรหัสผ่านหรือ API Keys ระดับสิทธิ์สูงไปฝังในตัว Android App โดยเด็ดขาด การเรียกใช้ APIs ภายนอกควรส่งผ่าน Backend Gateway

### ตัวแปรหลักที่ใช้กำหนดการตั้งค่า:
- **`BACKEND_BASE_URL`**: พิกัด URL เซิร์ฟเวอร์ Gateway สำหรับแอป Android (Emulator ใช้เป็น `http://10.0.2.2:8080` เป็นหลัก)
- **`DMIND_SUPABASE_URL` / `DMIND_SUPABASE_PUBLISHABLE_KEY`**: พารามิเตอร์สำหรับเชื่อมต่อไปยังฐานข้อมูล Supabase ระดับ Client
- **`SUPABASE_SERVICE_ROLE_KEY`**: คีย์สิทธิ์สูงสุดสำหรับ Ktor Backend เพื่อบันทึกข้อมูลและอัปโหลดรูปภาพลงระบบคลาวด์
- **`GOOGLE_APPLICATION_CREDENTIALS`**: ที่อยู่ไฟล์ Service Account JSON ของ Google Cloud สำหรับการส่งข้อความแจ้งเตือนผ่าน Firebase
- **`DMIND_TMD_API_TOKEN` / `DMIND_GISTDA_API_KEY`**: โทเคนสำหรับขอเชื่อมต่อข้อมูลสภาพอากาศและชั้นข้อมูลภูมิสารสนเทศของไทย

---

## 📖 เอกสารอ่านประกอบและคู่มือพัฒนาระบบ

| ไฟล์คู่มือการพัฒนา | รายละเอียดข้อมูลในเอกสาร |
| --- | --- |
| [android/README.md](file:///E:/2-2568/d-mind/d-mind-ai/android/README.md) | คู่มือการตั้งค่า รันคำสั่ง และสถาปัตยกรรมของโฟลเดอร์ Android Workspace หลัก |
| [android/docs/CURRENT_ANDROID_STATUS.th.md](file:///E:/2-2568/d-mind/d-mind-ai/android/docs/CURRENT_ANDROID_STATUS.th.md) | สรุปสถานะความคืบหน้าของฟีเจอร์ใน Native App, ชั้นข้อมูลแผนที่ และการประมวลผล |
| [android/docs/IMPLEMENTATION_REPORT.th.md](file:///E:/2-2568/d-mind/d-mind-ai/android/docs/IMPLEMENTATION_REPORT.th.md) | รายงานประเมินผลการสร้าง Compose UI, การย้าย Java legacy services และการปรับแต่งสถาปัตยกรรม |
| [android/docs/SYSTEM_SUMMARY.th.md](file:///E:/2-2568/d-mind/d-mind-ai/android/docs/SYSTEM_SUMMARY.th.md) | รายละเอียดโครงสร้าง UI/UX, ลำดับการเรียกใช้ APIs และ endpoints ของระบบทั้งหมด |
| [android/docs/NOTIFICATION_SYSTEM.th.md](file:///E:/2-2568/d-mind/d-mind-ai/android/docs/NOTIFICATION_SYSTEM.th.md) | สถาปัตยกรรมลูปการส่งและรับสัญญาณเตือนภัยฉุกเฉิน FCM ในระดับระบบปฏิบัติการ |
| [android/IMPLEMENTATION_SUMMARY.md](file:///E:/2-2568/d-mind/d-mind-ai/android/IMPLEMENTATION_SUMMARY.md) | สรุปกระบวนการย้ายโค้ดจากระบบเว็บมาเป็น Native App และขั้นตอนตรวจสอบความถูกต้องเบื้องต้น |
| [android/REAL_DEVICE_TEST_CHECKLIST.md](file:///E:/2-2568/d-mind/d-mind-ai/android/REAL_DEVICE_TEST_CHECKLIST.md) | รายการตรวจสอบและทดสอบระบบบนอุปกรณ์แอนดรอยด์จริง (สิทธิ์การเข้าถึง, แผนที่, การรับแจ้งเตือนขณะจอดับ) |
| [BUILD_APK_GUIDE.md](file:///E:/2-2568/d-mind/d-mind-ai/BUILD_APK_GUIDE.md) | แนวทางการติดตั้งและจัดเตรียมเครื่องมือคอมไพล์ APK ของแอปพลิเคชันระบบเดิม |
| [PLAY_STORE_GUIDE.md](file:///E:/2-2568/d-mind/d-mind-ai/PLAY_STORE_GUIDE.md) | เอกสารแนะนำการเตรียมข้อมูลความปลอดภัยและการเซ็นชื่อเพื่อเผยแพร่ผ่าน Google Play Store |

---

## 🎯 งานสำคัญและแผนงานพัฒนาขั้นถัดไป

1. **การเชื่อมต่อ AI Service ขั้นสมบูรณ์**: พัฒนาส่วนขยายพอร์ต Endpoint `/chat` และ `/damage-assessment` ของ Ktor Backend ให้เชื่อมต่อไปยัง AI Gateway และ LLM ขนาดใหญ่อย่างสมบูรณ์แทนข้อมูลจำลองเดิม
2. **การปรับแต่งการระบุคีย์ฝังในแอป**: ปรับแนวทางการอ่าน Token ของ TMD, GISTDA, และ ThaiLLM ให้ส่งผ่าน Backend Proxy ทั้งหมดเพื่อความมั่นคงปลอดภัยขั้นสูง
3. **ระบบรับส่งข้อมูลแบบ Realtime WebSockets**: พัฒนาระบบรับข้อความเหตุการณ์และการแจ้งเตือนบนแอป Android ให้เป็นแบบ Realtime (ผ่านช่องทาง Supabase Realtime หรือ WebSocket เชื่อม Backend Gateway) นอกเหนือจากระบบ FCM
4. **ขยาย Native Compose UI ให้ครอบคลุม**: เพิ่มหน้าจอแสดงผลข้อมูลเชิงลึกแบบ Native เพิ่มเติม เช่น หน้าพยากรณ์อากาศ 7 วัน (7-day Weather Forecast) และหน้าจอประเมินมูลค่าความเสียหายตามโครงสร้างเว็บแอปพลิเคชันเดิม
