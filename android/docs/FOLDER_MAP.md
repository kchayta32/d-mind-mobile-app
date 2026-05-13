# D-MIND Android Folder Map

Date: 2026-05-13

| Folder | Main File Types | Purpose |
| --- | --- | --- |
| `android/` | `.gradle`, `.bat`, `.properties`, `.md` | Android workspace root, Gradle wrapper, shared build config, reports |
| `android/app/` | `.gradle`, `.pro`, README | Native Android app module |
| `android/app/src/main/kotlin/com/dmind/app/` | `.kt` | App entrypoint, Compose UI, data bridge, domain models, backend config |
| `android/app/src/main/kotlin/com/dmind/app/ui/` | `.kt` | Compose screens, bottom navigation, MapLibre host |
| `android/app/src/main/kotlin/com/dmind/app/ui/theme/` | `.kt` | Material 3 color scheme and app theme |
| `android/app/src/main/kotlin/com/dmind/app/data/` | `.kt` | Native repository bridging UI to services and local queue |
| `android/app/src/main/kotlin/com/dmind/app/data/local/` | `.kt` | Room schema for alerts, SOS queue, danger zones, and location history |
| `android/app/src/main/kotlin/com/dmind/app/domain/` | `.kt` | UI/domain state models |
| `android/app/src/main/kotlin/com/dmind/app/network/` | `.kt` | Backend URL configuration |
| `android/app/src/main/kotlin/com/dmind/app/di/` | `.kt` | Lightweight app container |
| `android/app/src/main/java/com/dmind/app/activity/` | `.java` | Native activities for battery settings and emergency full-screen alerts |
| `android/app/src/main/java/com/dmind/app/service/` | `.java` | Background location, geofence, and FCM services |
| `android/app/src/main/java/com/dmind/app/receiver/` | `.java` | Boot, network, power, and lifecycle receivers |
| `android/app/src/main/java/com/dmind/app/worker/` | `.java` | WorkManager worker for queued SOS delivery |
| `android/app/src/main/java/com/dmind/app/database/` | `.java` | Local SQLite cache and queue DAO |
| `android/app/src/main/java/com/dmind/app/model/` | `.java` | Alert, danger zone, location, SOS, and coordinate models |
| `android/app/src/main/java/com/dmind/app/util/` | `.java` | Notification, FCM token, geofence, and emergency helpers |
| `android/app/src/main/res/` | `.xml`, `.png` | Android resources, icons, layouts, strings, styles, config XML |
| `android/app/src/test/` | `.java` | JVM unit tests |
| `android/backend/` | `.gradle`, README | Ktor backend module |
| `android/backend/src/main/kotlin/` | `.kt` | Backend API routes and server entrypoint |
| `android/backend/src/test/kotlin/` | `.kt` | Backend route tests |
| `android/docs/` | `.md`, `.txt` | Implementation report and folder inventory |
| `android/gradle/` | `.jar`, `.properties` | Gradle wrapper files |

Ignored/generated folders such as `.gradle`, `.idea`, `build`, and `app/build` contain tool caches and build outputs.
