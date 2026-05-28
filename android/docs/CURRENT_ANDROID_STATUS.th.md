# สถานะปัจจุบัน Android Native D-MIND

วันที่อัปเดต: 2026-05-28

เอกสารนี้สรุปสถานะล่าสุดของ Android app หลังปรับ UI/UX แผนที่, เพิ่มแหล่งข้อมูลภัยพิบัติ, และนำระบบ Supabase จากเว็บแอพเดิมเข้ามาใน native Android ด้วย Kotlin/Jetpack Compose

## ภาพรวม

- แอป Android เป็น native app ใน `android/app` ใช้ Kotlin, Jetpack Compose, Material 3 และ MapLibre
- UI หลักอยู่ที่ `android/app/src/main/kotlin/com/dmind/app/ui/DMindApp.kt`
- ระบบแผนที่ใช้ OpenStreetMap raster tile เป็น base map และใช้ MapLibre แสดง marker/overlay
- ระบบข้อมูลแผนที่อยู่ใน `android/app/src/main/kotlin/com/dmind/app/data/map`
- ระบบ Supabase อยู่ใน `android/app/src/main/kotlin/com/dmind/app/data/supabase` และ `android/app/src/main/kotlin/com/dmind/app/network`
- Android build ไม่พึ่ง React/Vite runtime แต่ route และประสบการณ์ใช้งานถูกจัดให้ใกล้เคียงเว็บแอพเดิม

## โครง Navigation ปัจจุบัน

ระบบ navigation ใน Android จำลองแนวคิด route ของเว็บแอพเดิมด้วย enum `AppRoute`

### หน้าจอเต็มจอ

| Route | หน้าจอ | สถานะ |
| --- | --- | --- |
| `/disaster-map` | แผนที่ภัยพิบัติแยกประเภท | ใช้งานแล้ว |
| `/risk-zones` | สถานีตรวจวัด D-MIND | UI พร้อม, รอ endpoint จริง |

### หน้าจอที่มี bottom navigation

| Route | หน้าจอ | สถานะ |
| --- | --- | --- |
| `/หน้าแรก` | หน้าแรก | ใช้งานแล้ว |
| `/assistant` | Dr.Mind AI chatbot | เชื่อม Supabase Edge Function `ai-chat` แล้ว มี fallback เมื่อยังไม่ config |
| `/manual` | คู่มือ | ใช้งานแล้ว |
| `/contacts` | เบอร์โทรฉุกเฉิน | ใช้งานแล้ว |
| `/incident-reports` | รายงานเหตุการณ์ | อ่าน/ส่งข้อมูลผ่าน Supabase table `incident_reports` แล้ว มี fallback |
| `/damage-assessment` | ประเมินความเสียหาย | UI พร้อม, repository รองรับ Edge Function `analyze-damage` |
| `/weather-forecast` | พยากรณ์อากาศรายชั่วโมง | ใช้ข้อมูล TMD เมื่อมี token |
| `/daily-weather-forecast` | พยากรณ์อากาศรายวัน | UI native |
| `/notifications` | ตั้งค่าการแจ้งเตือน | อ่าน realtime alerts/notifications/settings จาก Supabase เมื่อ config พร้อม |
| `/app-guide` | คู่มือการใช้งานแอป | ใช้งานแล้ว |

## UI/UX แผนที่ล่าสุด

หน้าจอแผนที่ถูกปรับเป็น dashboard native แบบเต็มจอ:

- Header แบบลอยด้านบน มีปุ่มย้อนกลับ, ชื่อหน้า และเมนู
- Segmented control แยก `สถานี D-MIND` กับ `ภัยต่างๆ`
- Search bar พร้อมปุ่ม filter
- ปุ่มควบคุมแผนที่แนวตั้งด้านซ้าย: locate, zoom in, zoom out, layers
- Bottom sheet โค้งด้านล่าง พร้อม summary, chips, statistic cards และกราฟสถิติ
- ลบ control/การ์ดที่ไม่จำเป็นกลางแผนที่แล้ว
- หน้า `ภัยต่างๆ` ตัด `ฝนตกหนัก` และ `พายุ` ออกจากรายการเลือกภัยแล้ว
- หน้า `สถานี D-MIND` ใช้ข้อมูล mock เฉพาะชั่วคราว และแสดงสถานะ `ออนไลน์`, `แจ้งเตือน`, `ออฟไลน์`

## ประเภทข้อมูลบนแผนที่ภัยพิบัติ

| Layer | แหล่งข้อมูล | สถานะ |
| --- | --- | --- |
| แผ่นดินไหว | USGS `all_week.geojson` | ใช้งานแล้ว |
| ไฟป่า | GISTDA VIIRS `/features/viirs/1day` | ใช้งานแล้ว |
| PM2.5 | placeholder สำหรับ layer คุณภาพอากาศ | รอ endpoint จริง |
| ภัยแล้ง | ข้อมูลสรุป/seed ภายในแอป | ใช้งานเป็น fallback |
| DRIPlus | GISTDA WMS `/maps/dri/7days/wms` | ตรวจ capabilities แล้ว |
| NDWI | GISTDA WMS `/maps/ndwi/7days/wms` | ตรวจ capabilities แล้ว |
| SMAP | GISTDA WMS `/maps/smap/7days/wms` | ตรวจ capabilities แล้ว |
| น้ำท่วม | GISTDA `/features/flood/1day` และ WMS `/maps/flood/1day/wms` | ใช้งานแล้ว |
| น้ำท่วมซ้ำซาก | GISTDA `/features/flood-freq` และ WMS `/maps/flood-freq/wms` | ใช้งานแล้ว |
| ผักตบชวา | GISTDA `/features/water_hyacinth` | ใช้งานแล้ว |
| การไหลของแม่น้ำ | Open-Meteo Flood API | ใช้งานแล้ว |
| ความชื้นในดิน | Open-Meteo Land API | ใช้งานแล้ว |

## แหล่งข้อมูลภายนอก

ข้อมูลถูกดึงและ refresh ทุก 5 นาทีใน repository ฝั่ง Android

| หน่วยงาน/API | ใช้ทำอะไร | หมายเหตุ |
| --- | --- | --- |
| กรมอุตุนิยมวิทยา (TMD) | พยากรณ์อากาศรายชั่วโมง | ต้องตั้งค่า `VITE_TMD_API_TOKEN` |
| GISTDA | ไฟป่า, น้ำท่วม, น้ำท่วมซ้ำซาก, ผักตบชวา, DRIPlus, NDWI, SMAP | ต้องตั้งค่า GISTDA API key ผ่าน env/build config |
| USGS | แผ่นดินไหวทั้งในและต่างประเทศ | ใช้ public GeoJSON |
| OpenStreetMap | base map และค้นหาสถานที่ | ใช้ tile server และ Nominatim |
| Open-Meteo | ข้อมูลการไหลของแม่น้ำ (Flood API) และความชื้นสะสมในดิน (Land/Forestry API) | ใช้ public API ดึงตามพิกัดจุดหลักในไทย |

## GISTDA Endpoints ที่รองรับใน Android

Feature endpoints:

- `/api/2.0/resources/features/viirs/1day`
- `/api/2.0/resources/features/flood/1day`
- `/api/2.0/resources/features/flood-freq`
- `/api/2.0/resources/features/water_hyacinth`

WMS endpoints:

- `/api/2.0/resources/maps/flood/1day/wms`
- `/api/2.0/resources/maps/flood-freq/wms`
- `/api/2.0/resources/maps/dri/7days/wms`
- `/api/2.0/resources/maps/ndwi/7days/wms`
- `/api/2.0/resources/maps/smap/7days/wms`

Layer names ที่ใช้ตรวจจาก capabilities:

| WMS | Layer name |
| --- | --- |
| flood 1day | `676e3c965e01949dda35fa23` |
| flood-freq | `6799ab8c6f832362f99030e6` |
| DRIPlus | `6799acce8d739fff9dacee2f` |
| NDWI | `6799acf27966ebcdded074a8` |
| SMAP | `6799ace4582fb798d9a87895` |

## Supabase Integration

Android มี REST client สำหรับ Supabase แล้ว โดยอ่านค่าจาก BuildConfig:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_ID`

ไฟล์หลัก:

- `android/app/src/main/kotlin/com/dmind/app/network/SupabaseConfig.kt`
- `android/app/src/main/kotlin/com/dmind/app/network/SupabaseRestClient.kt`
- `android/app/src/main/kotlin/com/dmind/app/data/supabase/SupabaseModels.kt`
- `android/app/src/main/kotlin/com/dmind/app/data/supabase/SupabaseRepository.kt`

ความสามารถปัจจุบัน:

- อ่านข้อมูลผ่าน PostgREST `select`
- เพิ่มข้อมูลผ่าน PostgREST `insert`
- อัปเดตข้อมูลผ่าน PostgREST `patch`
- เรียก Supabase Edge Functions
- อัปโหลดไฟล์เข้า Supabase Storage
- สร้าง public URL สำหรับไฟล์ใน bucket

Tables/functions ที่ repository รองรับ:

| ชื่อ | ใช้ทำอะไร |
| --- | --- |
| `incident_reports` | รายงานเหตุการณ์จากผู้ใช้ |
| `realtime_alerts` | alert ล่าสุดสำหรับหน้าแจ้งเตือน |
| `notifications` | ประวัติ/รายการแจ้งเตือน |
| `user_notification_settings` | การตั้งค่าการแจ้งเตือนของผู้ใช้ |
| `victim_reports` | ข้อมูลผู้ประสบภัย |
| `satisfaction_surveys` | แบบประเมินความพึงพอใจ |
| `damage_assessments` | ผลประเมินความเสียหาย |
| `ai-chat` | Edge Function สำหรับ Dr.Mind |
| `analyze-damage` | Edge Function สำหรับประเมินความเสียหาย |

หมายเหตุ: ยังไม่ได้ทำ realtime websocket subscription โดยตรงใน Android รอบนี้ หน้าจออ่านข้อมูลจาก Supabase REST และ refresh ตาม lifecycle/การกดใช้งาน

## Configuration

Gradle อ่านค่าจาก environment, project property หรือ `.env` ที่ root project

| Config | ใช้ทำอะไร |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project id |
| `VITE_TMD_API_TOKEN` | TMD hourly forecast |
| `VITE_GISTDA_API_KEY` | GISTDA default API key |
| `VITE_GISTDA_WMS_API_KEY` | GISTDA WMS fallback key |
| `VITE_GISTDA_DISASTER_API_KEY` | GISTDA disaster fallback key |
| `VITE_GISTDA_FIRE_API_KEY` | GISTDA fire fallback key |

เอกสารไม่บันทึกค่า API key จริง ให้ใส่ค่าใน `.env` หรือ environment ของเครื่อง build แทน

## Network Security

`android/app/src/main/res/xml/network_security_config.xml` อนุญาต domain ที่ใช้กับระบบปัจจุบัน เช่น:

- `api-gateway.gistda.or.th`
- `data.tmd.go.th`
- `earthquake.usgs.gov`
- `tile.openstreetmap.org`
- `nominatim.openstreetmap.org`
- `api.open-meteo.com`
- `flood-api.open-meteo.com`
- Supabase project domains

## ผลการตรวจสอบล่าสุด

คำสั่งที่ผ่านแล้ว:

```powershell
.\gradlew.bat :app:compileDebugKotlin
.\gradlew.bat :app:assembleDebug
```

หมายเหตุ: ยังมี warning จาก MapLibre `MarkerOptions`/marker API ที่ deprecated แต่ไม่ทำให้ build fail

## งานที่ควรทำต่อ

- เปลี่ยนข้อมูล mock ของหน้า `สถานี D-MIND` เป็น endpoint จริงเมื่อ API พร้อม
- เพิ่ม Supabase realtime websocket subscription สำหรับ alerts/notifications
- เพิ่ม image picker และ flow อัปโหลดภาพในรายงานเหตุการณ์/ประเมินความเสียหาย
- เพิ่ม authentication/user session ให้ Android หากต้องผูกข้อมูลกับผู้ใช้จริง
- ย้าย MapLibre marker ไปใช้ annotation/plugin API ที่ใหม่กว่าเพื่อลด warning
- เพิ่ม instrumented UI tests สำหรับหน้าจอแผนที่และ Supabase flows
