# How to Build the D-MIND APK

I have converted your project into a native **Android Project** using Capacitor. You can now build the APK directly on your computer without deploying the website first.

## Prerequisites
You need **Android Studio** installed to build the APK.
1. Download & Install [Android Studio](https://developer.android.com/studio).
2. Open Android Studio and ensure the **Android SDK** is installed (it usually asks on first launch).

## Steps to Build APK
1.  **Open Android Studio**.
2.  Click **Open** and select the `android` folder inside your project:
    `g:\2-2568\d-mind\d-mind-ai\android`
3.  Wait for Gradle sync to finish (it downloads necessary dependencies).
4.  **Build the APK**:
    *   Go to **Build** menu > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   Or connect your Android phone via USB and click the **Run** (Play) button to install directly.

## Updating the App
If you make changes to the code (React/TypeScript), run this terminal command to update the Android project:
```bash
npm run build
npx cap sync
```
Then build again in Android Studio.
