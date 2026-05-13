# Backend Module

This module is a Kotlin/Ktor server for D-MIND mobile integrations.

## Contents

- `src/main/kotlin`: Ktor application module and API routes.
- `src/test/kotlin`: Backend tests.
- `build.gradle`: JVM/Ktor dependencies and application entrypoint.

Secrets must be provided as environment variables. The mobile app stores only `BACKEND_BASE_URL`.

## Run

```powershell
.\gradlew.bat :backend:run
```

`PORT` defaults to `8080`.

## Notification configuration

The Android app registers FCM tokens with:

```text
POST /fcm/register
```

The backend sends mobile push alerts with:

```text
POST /notifications/send
```

Required environment variables for real FCM delivery:

- `FCM_PROJECT_ID` or `FIREBASE_PROJECT_ID`: Firebase/Google Cloud project id.
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to a service-account JSON file with Firebase Cloud Messaging permission.

Example:

```powershell
$env:FCM_PROJECT_ID="your-firebase-project-id"
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\dmind-firebase-service-account.json"
.\gradlew.bat :backend:run
```
