# Android App Module

This module builds the native D-MIND mobile app.

## Contents

- `src/main/kotlin`: Kotlin entrypoint, Compose UI, app data bridge, domain status models, backend config, and lightweight dependency container.
- `src/main/java`: Existing Java reliability layer for notifications, background location, FCM, geofencing, local SQLite cache, receivers, and WorkManager.
- `src/main/res`: XML layouts for legacy native activities, icons, colors, strings, styles, and platform XML configuration.
- `src/test`: JVM unit tests for native utility logic.
- `build.gradle`: App dependencies and Android build settings.
