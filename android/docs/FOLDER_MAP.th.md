# แผนผังโฟลเดอร์ Android Workspace

วันที่: 2026-05-13

เอกสารนี้อธิบายว่าแต่ละโฟลเดอร์ใต้ `android` มีไฟล์ประเภทใดและใช้ทำอะไร

## ระดับบนของ `android`

| โฟลเดอร์/ไฟล์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `app/` | Android app module | แอปมือถือ native Android |
| `backend/` | Kotlin/JVM Ktor module | backend API สำหรับ mobile integration, secret/API key proxy และ notification sender |
| `docs/` | Markdown/Text | เอกสาร implementation, folder map, UI/UX, endpoint และระบบแจ้งเตือน |
| `gradle/` | Gradle wrapper files | ไฟล์ runtime ของ Gradle wrapper |
| `build.gradle` | Gradle script | config ระดับ Android workspace |
| `settings.gradle` | Gradle settings | include เฉพาะ `:app` และ `:backend` |
| `variables.gradle` | Gradle variables | รวม version ของ dependencies |
| `gradle.properties` | Gradle properties | Android/Gradle build settings |
| `gradlew`, `gradlew.bat` | Gradle wrapper scripts | คำสั่ง build/test |

## `android/app`

| โฟลเดอร์/ไฟล์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `build.gradle` | Gradle script | dependencies, Kotlin/Compose, Firebase, BuildConfig |
| `README.md` | Markdown | สรุป app module |
| `proguard-rules.pro` | ProGuard/R8 rules | กฎ minify/obfuscation |
| `src/main/AndroidManifest.xml` | XML manifest | permissions, activities, services, receivers, providers |
| `src/main/kotlin/` | Kotlin | Compose UI, app entrypoint, data/domain/network code |
| `src/main/java/` | Java | native services เดิม, notification, location, receivers, database helpers |
| `src/main/res/` | XML/drawable resources | strings, themes, layouts, icons, network security config |
| `src/test/` | Unit tests | JVM unit tests ของ app |
| `google-services.json` | Firebase config | ต้องเพิ่มเองจาก Firebase Console เมื่อทดสอบ FCM จริง |

## Kotlin source ใต้ `android/app/src/main/kotlin/com/dmind/app`

| โฟลเดอร์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `DMindApplication.kt` | Kotlin Application class | สร้าง notification channels และ refresh FCM token |
| `MainActivity.kt` | Kotlin Activity | native Compose host |
| `ui/` | Kotlin Compose | หน้าจอ Home, Map, Alerts, SOS, More และ navigation |
| `ui/theme/` | Kotlin Compose theme | Material 3 theme, colors, typography |
| `data/` | Kotlin repository/data bridge | เชื่อม UI กับ services เดิมและ local data |
| `data/local/` | Kotlin Room schema | entity/DAO/database สำหรับ alerts, SOS, danger zones, location history |
| `domain/` | Kotlin models | state/model ที่ UI ใช้ |
| `network/` | Kotlin config/client placeholder | backend base URL และ API boundary |

## Java source ใต้ `android/app/src/main/java/com/dmind/app`

| โฟลเดอร์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `activity/` | Java Activity | emergency alert, battery optimization settings |
| `database/` | Java SQLite DAO/helper | alerts cache, SOS queue, danger zones, location history เดิม |
| `model/` | Java model | models สำหรับ alert/SOS/location |
| `receiver/` | Java BroadcastReceiver | boot, power, network restore |
| `service/` | Java Service | FCM receiver, background location, geofence monitoring |
| `util/` | Java utility | notification helper, emergency manager, FCM token registrar, geofence utilities |
| `worker/` | Java WorkManager worker | flush SOS queue เมื่อ network พร้อม |

## Resources ใต้ `android/app/src/main/res`

| โฟลเดอร์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `drawable/`, `drawable-v24/` | XML/vector drawable | icons และ launcher foreground |
| `layout/` | XML layout | layout ของ Java activities ที่ยังไม่ย้ายเป็น Compose |
| `mipmap-*` | launcher assets | launcher icons |
| `values/`, `values-v27/` | XML values | strings, colors, themes, styles |
| `xml/` | XML config | file provider paths, network security config |

## `android/backend`

| โฟลเดอร์/ไฟล์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `build.gradle` | Gradle script | Ktor, Kotlin serialization, Google Auth dependencies |
| `README.md` | Markdown | วิธีใช้ backend module |
| `src/main/kotlin/com/dmind/backend/Application.kt` | Kotlin/Ktor | routes, DTOs, FCM HTTP v1 sender, env config |
| `src/test/kotlin/com/dmind/backend/ApplicationTest.kt` | Kotlin test | unit tests สำหรับ health, FCM register และ notification send validation |

## `android/docs`

| ไฟล์ | ประเภทไฟล์ | ใช้ทำอะไร |
| --- | --- | --- |
| `IMPLEMENTATION_REPORT.md/.txt` | English report | รายงาน implementation เดิม |
| `IMPLEMENTATION_REPORT.th.md/.txt` | Thai report | รายงาน implementation ภาษาไทย |
| `FOLDER_MAP.md/.txt` | English folder map | แผนผังโฟลเดอร์เดิม |
| `FOLDER_MAP.th.md/.txt` | Thai folder map | แผนผังโฟลเดอร์ภาษาไทย |
| `SYSTEM_SUMMARY.th.md/.txt` | Thai system summary | สรุป UI/UX, notification, API key และ endpoint |
| `NOTIFICATION_SYSTEM.th.md/.txt` | Thai notification summary | สรุประบบแจ้งเตือนมือถือโดยเฉพาะ |

## ขอบเขตที่ตั้งใจไม่ใช้แล้วใน Android build

- React/Vite source นอก `android`
- `../node_modules`
- Capacitor/Cordova Gradle modules
- WebView primary UI
- generated React assets ใต้ Android assets
