# How to Build the D-MIND APK

The production app now lives in the native Android project under `android/`. Build and run the Kotlin/Jetpack Compose app directly from Android Studio or Gradle.

## Prerequisites
You need **Android Studio** installed to build the APK.
1. Download & Install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio and ensure the **Android SDK** is installed (it usually asks on first launch).

## Steps to Build APK
1.  **Open Android Studio**.
2.  Click **Open** and select the `android` folder inside your project:
    `E:\2-2568\d-mind\d-mind-ai\android`
3.  Wait for Gradle sync to finish (it downloads necessary dependencies).
4.  **Build the APK**:
    *   Go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Or connect your Android phone via USB and click the **Run** (Play) button to install directly.

## Native Android Configuration

Keep API keys out of source control. Add local values in `android/local.properties`, Gradle properties, or environment variables:

```properties
DMIND_GISTDA_API_KEY=your_key_here
DMIND_GISTDA_BASE_URL=https://api-gateway.gistda.or.th/api/2.0/
DMIND_TMD_API_TOKEN=your_tmd_token_here
DMIND_SUPABASE_URL=https://your-project.supabase.co
DMIND_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
DMIND_THAI_LLM_API_KEY=your_thaillm_token_here
DMIND_THAI_LLM_BASE_URL=http://thaillm.or.th/api/v1/
DMIND_THAI_LLM_MODEL=typhoon-s-thaillm-8b-instruct
```

Legacy `VITE_GISTDA_*` names are still accepted as fallbacks, but new Android config should use the `DMIND_` names.

## Command Line Build

From the `android/` folder:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
.\gradlew.bat :app:assembleDebug
.\gradlew.bat :app:testDebugUnitTest
```
