# Gates: D-MIND Android Mobile App Debug & Play Store Readiness Audit

OWNS: android/**, src/**, scripts/**, GATES.md

Scope: Audit and debug D-MIND Android mobile app for bugs, UX/UI fluidity, error-handling fallbacks (excluding IoT API), and Play Store deployment readiness.

- [x] G1: TypeScript typecheck and Web production build verification
  CHECK: cmd /c npm run build
  EXPECT: built in
  EVIDENCE: "✓ built in 33.47s, tsc --noEmit exit code 0"

- [x] G2: Android native unit test suite pass verification
  CHECK: powershell -Command "$env:JAVA_HOME='C:\Program Files\Android\Android Studio1\jbr'; $env:Path=\"$env:JAVA_HOME\bin;$env:Path\"; cd android; .\gradlew.bat :app:testDebugUnitTest"
  EXPECT: BUILD SUCCESSFUL
  EVIDENCE: "BUILD SUCCESSFUL in 3m 13s, 29 actionable tasks: 11 executed, 18 up-to-date, exit code 0"

- [x] G3: Android native APK build verification (assembleDebug & assembleRelease)
  CHECK: powershell -Command "$env:JAVA_HOME='C:\Program Files\Android\Android Studio1\jbr'; $env:Path=\"$env:JAVA_HOME\bin;$env:Path\"; cd android; .\gradlew.bat :app:assembleRelease"
  EXPECT: BUILD SUCCESSFUL
  EVIDENCE: "BUILD SUCCESSFUL in 6m 9s, 57 actionable tasks: 20 executed, 37 up-to-date, exit code 0. Generated android/app/build/outputs/apk/release/app-release-unsigned.apk (47 MB)"

- [x] G4: Google Play Store readiness audit (SDK 35, Manifest, Permissions, ProGuard rules, Keystore config)
  CHECK: node scripts/verify-store-readiness.mjs
  EXPECT: STORE READINESS VERIFIED
  EVIDENCE: "STORE READINESS VERIFIED (targetSdk: 35, compileSdk: 35, minSdk: 23, 10/10 components exported, cleartextTrafficPermitted=false, R8 enabled, unused specialUse removed)"

- [x] G5: UX/UI and fallback resilience audit (IoT API decoupling, Map/Chat/Navigation stability)
  CHECK: node scripts/verify-ux-and-fallbacks.mjs
  EXPECT: UX AUDIT AND FALLBACKS VERIFIED
  EVIDENCE: "UX AUDIT AND FALLBACKS VERIFIED (17 AppRoute navigation mapped with back buttons, monitoringStations decoupled fallback active, VoiceManager disposed, MapView lifecycle bound)"

