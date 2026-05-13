# D-MIND Native Android Real Device Checklist

Use one Android 10-12 device and one Android 13+ device before release.

## Build And Install

- [ ] Set `JAVA_HOME=C:\Program Files\Android\Android Studio\jbr` or another JDK 17+ path.
- [ ] Run `.\gradlew.bat :app:assembleDebug`.
- [ ] Install `app/build/outputs/apk/debug/app-debug.apk` on a physical device.
- [ ] Start `.\gradlew.bat :backend:run` with required environment variables for live backend integrations.

## Native Shell

- [ ] App opens to the Compose Home screen.
- [ ] Bottom navigation switches Home, Map, Alerts, SOS, and More without blank screens.
- [ ] Map screen renders the MapLibre map and remains responsive after rotation/resume.

## Permissions And Reliability

- [ ] Grant foreground location permission.
- [ ] On Android 10+, grant "Allow all the time" background location in app settings.
- [ ] On Android 13+, grant notification permission.
- [ ] Allow D-MIND to run in the background from battery settings.
- [ ] Grant notification policy access for DND bypass.

## Emergency And Offline Flow

- [ ] Tap "Start monitoring" and confirm the persistent monitoring notification appears.
- [ ] Queue SOS offline; confirm the pending SOS count increases.
- [ ] Restore network and backend; confirm WorkManager sends queued SOS to `/sos`.
- [ ] Trigger the native test alert; confirm emergency notification, vibration, and full-screen activity.
- [ ] Refresh FCM token; confirm backend receives `/fcm/register` when backend is running.

## Release Gate

- [ ] `.\gradlew.bat :app:assembleDebug` passes.
- [ ] `.\gradlew.bat :app:testDebugUnitTest` passes.
- [ ] `.\gradlew.bat :backend:test` passes.
- [ ] No Gradle task requires files outside `android`.
