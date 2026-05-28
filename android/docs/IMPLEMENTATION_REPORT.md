# D-MIND Android-Only Native Implementation Report

Date: 2026-05-13

## Summary

The Android folder is now the active mobile workspace. The app builds from native Android code under `android/app`, and server-side integrations live under `android/backend`. The Android build no longer needs the root web project, web build artifacts, generated web assets, or Node dependencies.

## App Implementation

- Added Kotlin and Jetpack Compose to the app module.
- Added `MainActivity.kt` as a native `ComponentActivity` with `setContent { DMindApp() }`.
- Added a Compose mobile shell with Home, Map, Alerts, SOS, and More tabs.
- Added a MapLibre native map screen centered on Thailand.
- Added `NativeStatusRepository` to bridge Compose UI to existing Java services for monitoring, SOS queue, FCM token refresh, battery settings, DND settings, and emergency test alerts.
- Added a Room schema for alerts, SOS queue, danger zones, and location history as the Kotlin persistence migration target.
- Kept existing Java reliability code for background location, geofencing, local SQLite cache, emergency notifications, FCM, receivers, and WorkManager.
- Removed the web activity layout and generated web assets from `app/src/main/assets`.

## Backend Implementation

- Added `android/backend` as a Kotlin/JVM Ktor module.
- Added endpoints: `/health`, `/alerts`, `/sos`, `/reports`, `/weather`, `/damage-assessment`, `/chat`, and `/fcm/register`.
- Backend integrations that need secrets read environment variables only.
- The app reads only `BuildConfig.BACKEND_BASE_URL`, defaulting to `http://10.0.2.2:8080`.

## Build Isolation

- `settings.gradle` includes only `:app` and `:backend`.
- App Gradle dependencies are native Android/Kotlin dependencies.
- Removed generated web Gradle wiring and generated web assets from the Android workspace.
- Root web files outside `android` are not required for Android build or tests.

## Verification Results

- `.\gradlew.bat :app:assembleDebug`: passed.
- `.\gradlew.bat :app:testDebugUnitTest`: passed.
- `.\gradlew.bat :backend:test`: passed.

Verification used `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`.

## Update: 2026-05-28

- Added two new disaster map layers: `RiverDischarge` (river discharge rates) and `SoilMoistureHeatmap` (soil moisture levels).
- Integrated Open-Meteo Flood API and Land API within `DisasterMapRepository` to fetch river discharge data for major Thai rivers and 0-7 cm soil moisture levels, formatting the results into GeoJSON.
- Restructured `DisasterMapViewModel` to clear and fetch GeoJSON layers correctly based on active layer selections, preventing overlay conflicts.
- Enhanced `MapLibreView`, `DisasterMapScreen`, and `MapBottomSheet` to support styling and rendering GeoJSON points on MapLibre and showing interactive statistic legends/charts for these parameters.

## Remaining Product Work

- Replace placeholder backend route bodies with production integrations.
- Add real API DTO validation and auth.
- Expand Compose screens beyond the native shell into full feature parity.
- Add instrumented UI tests on physical Android devices.
- Add release signing and production backend URL flavors.
