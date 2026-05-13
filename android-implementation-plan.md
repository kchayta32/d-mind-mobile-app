# Android Implementation Plan - D-MIND Native Mobile App
**Version:** Phase 1 - Background Operations & Reliability  
**Last Updated:** 2026-05-12  
**Target:** Android 10+ (API 29+)  

---

## 📋_current State Assessment

### ✅ What's Already in Place
| Component | Status | Details |
|-----------|--------|---------|
| Capacitor Version | ✓ | v6+ (based on plugin structure) |
| Geolocation Plugin | ✓ | `@capacitor-community/background-geolocation` |
| SQLite Plugin | ✓ | `@capacitor-community/sqlite` |
| Local Notifications | ✓ | `@capacitor/local-notifications` |
| Haptics Plugin | ✓ | `@capacitor/haptics` |
| Network plugin | ✓ | `@capacitor/network` |
| Build SDK | ✓ | compileSdk=35, targetSdk=35, minSdk=23 |

### ❌ Missing Components
| Phase | Component | Priority | Status |
|-------|-----------|----------|--------|
| 1 | Foreground Service | HIGH | **TO BE IMPLEMENTED** |
| 1 | FCM Data Messages | HIGH | **TO BE IMPLEMENTED** (No google-services.json) |
| 1 | Battery Optimization Check | MEDIUM | **TO BE IMPLEMENTED** |
| 2 | Notification Channel (IMPORTANCE_HIGH) | CRITICAL | **TO BE IMPLEMENTED** |
| 2 | DND Bypass (ACCESS_NOTIFICATION_POLICY) | CRITICAL | **TO BE IMPLEMENTED** |
| 2 | Full-Screen Intent | CRITICAL | **TO BE IMPLEMENTED** |
| 2 | Siren Audio | HIGH | **TO BE IMPLEMENTED** |
| 3 | Maplibre Offline Maps | HIGH | **TO BE IMPLEMENTED** |
| 3 | SQLite Queue System | HIGH | **TO BE IMPLEMENTED** |
| 4 | Native CSS (user-select, touch-action) | MEDIUM | **TO BE IMPLEMENTED** |
| 4 | Safe Area Handling | MEDIUM | **TO BE IMPLEMENTED** |
| 5 | Point-in-Polygon Geofencing | HIGH | **TO BE IMPLEMENTED** |
| 5 | High-Accuracy SOS | HIGH | **TO BE IMPLEMENTED** |

---

## 🚀 Phase 1: Background Operations & Reliability (Implementation Order)

### Step 1.1: Update AndroidManifest.xml

**Tasks:**
- Add `FOREGROUND_SERVICE` permission
- Add `FOREGROUND_SERVICE_LOCATION` permission (for Android 9+)
- Add `ACCESS_BACKGROUND_LOCATION` permission (for Android 10+)
- Add `ACCESS_NOTIFICATION_POLICY` permission (for DND bypass)
- Add `RECEIVE_BOOT_COMPLETED` (already present - ✓)
- Add `IGNORE_BATTERY_OPTIMIZATION_SETTINGS` intent
- Register Background Location Service

**Files to Modify:**
- `android/app/src/main/AndroidManifest.xml`

**Required Changes:**
```xml
<!-- Add Permissions -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_NOTIFICATION_POLICY" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

<!-- Add Service Declaration (inside <application> tag) -->
<service
    android:name=".service.BackgroundLocationService"
    android:foregroundServiceType="location"
    android:exported="false"
    android:permission="android.permission.FOREGROUND_SERVICE" />

<!-- Add Activity for Battery Optimization Settings -->
<activity
    android:name=".activity.BatteryOptimizationSettingsActivity"
    android:exported="true"
    android:label="@string/title_battery_optimization" />
```

---

### Step 1.2: Create BackgroundLocationService.java

**Location:** `android/app/src/main/java/com/dmind/app/service/BackgroundLocationService.java`

**Purpose:** 
- Run persistent foreground service for location tracking
- Show persistent notification in status bar
- Work with BackgroundGeolocation plugin

**Key Features:**
- Extends `Service` class
- Uses `startForeground()` with notification
- Implements location callbacks
- Handles Doze mode properly

---

### Step 1.3: Create NotificationHelper.java

**Location:** `android/app/src/main/java/com/dmind/app/util/NotificationHelper.java`

**Purpose:**
- Create Notification Channels (IMPORTANCE_HIGH)
- Build notification with DND bypass
- Support full-screen intent
- Play custom siren sound

**Required Methods:**
```java
public static NotificationChannel createEmergencyChannel(Context context)
public static NotificationCompat.Builder createEmergencyNotification(Context context, String title, String message)
public static void requestNotificationAccess(Context context)
public static void showFullScreenIntent(Context context, String title, String message, PendingIntent pendingIntent)
```

---

### Step 1.4: Update MainActivity.java

**Location:** `android/app/src/main/java/com/dmind/app/MainActivity.java`

**Tasks:**
- Start BackgroundLocationService on app launch
- Check battery optimization status on resume
- Request notification access on first run

**Code Additions:**
```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    startBackgroundLocationService();
    checkBatteryOptimization();
}

@Override
protected void onResume() {
    super.onResume();
   checkNotificationAccess();
}
```

---

### Step 1.5: Create BatteryOptimizationSettingsActivity.java

**Location:** `android/app/src/main/java/com/dmind/app/activity/BatteryOptimizationSettingsActivity.java`

**Purpose:**
- Check battery optimization status
- Redirect user to system settings
- Handle result and update UI

**Flow:**
1. Check `PackageManager.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`
2. If not opt-in, show dialog "Enable battery optimization bypass?"
3. Launch intent `Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`
4. Listen for result and update service behavior

---

### Step 1.6: Setup Firebase Cloud Messaging (No google-services.json approach)

**Alternative Approach:** Use FCM HTTP v1 API directly from backend

**Flow:**
1. Get FCM token from `FirebaseMessaging.getInstance().getToken()`
2. Send token to your backend API
3. Backend sends data messages via FCM HTTP v1 API
4. Create `FirebaseMessagingService` to receive data messages

**Service Class:** `FCMDataMessageService.java`
```java
public class FCMDataMessageService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage message) {
        // Process data-only message
        // Check if location is in danger zone
        // Trigger local notification if needed
    }
    
    @Override
    public void onNewToken(String token) {
        // Send token to backend
    }
}
```

---

### Step 1.7: Update Capacitor Configuration

**File:** `capacitor.config.ts` (in root of project)

**Add Plugins Configuration:**
```typescript
Plugins: {
  BackgroundGeolocation: {
    foregroundService: true,
    foregroundServiceNotifyAfterAmount: 5000, // meters
    foregroundServiceId: 1001,
    foregroundServiceTitle: 'D-MIND: Monitoring your location',
    foregroundServiceDesc: 'Continuously tracking location for disaster alerts'
  },
  LocalNotifications: {
    smallIcon: 'ic_stat_notification',
    iconColor: '#DC2626'
  }
}
```

---

## 📐 Phase 2: Critical Alerts & DND Bypass

### Step 2.1: Create EmergencyNotificationManager.java

**Purpose:** Centralize all emergency notification logic

**Methods:**
```java
public class EmergencyNotificationManager {
    public static final String CHANNEL_ID_EMERGENCY = "emergency_alerts";
    public static final int NOTIFICATION_ID_Siren = 1000;
    
    // Create channel with IMPORTANCE_HIGH
    public static void createEmergencyNotificationChannel(Context context) { }
    
    // Bypass DND
    public static boolean isNotificationPolicyAccessGranted(Context context) { }
    public static void requestNotificationPolicyAccess(Context context) { }
    
    // Play siren sound
    public static void playSirenSound(Context context) { }
    
    // Show full-screen intent (lock screen wake)
    public static void showFullScreenEmergencyAlert(
        Context context, 
        String title, 
        String message,
        String actionType // "flood", "tsunami", "earthquake"
    ) { }
    
    // Trigger haptics
    public static void triggerEmergencyVibration(Context context) { }
}
```

---

### Step 2.2: Add Custom Siren Sound

**Location:** `android/app/src/main/res/raw/siren_alert.mp3`

**Requirements:**
- 5-10 seconds loud siren sound
- 44.1kHz stereo
- < 500KB size

**Usage in Notification:**
```java
Uri sirenUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.siren_alert);
notificationBuilder.setSound(sirenUri);
notificationBuilder.setDefaults(Notification.DEFAULT_LIGHTS);
notificationBuilder.setVibrate(new long[]{0, 100, 200, 300}); // Pattern
```

---

### Step 2.3: Full-Screen Intent (Lock Screen Wake)

**Implementation:**
```java
Intent fullScreenIntent = new Intent(context, EmergencyAlertActivity.class);
fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
    context, 
    0, 
    fullScreenIntent, 
    PendingIntent.FLAG_IMMUTABLE
);

builder.setFullScreenIntent(fullScreenPendingIntent, true); // true = bypass DND
builder.setPriority(Notification.PRIORITY_MAX);
builder.setCategory(Notification.CALL_CATEGORY_ALARM);
```

---

### Step 2.4: Create EmergencyAlertActivity.java

**Location:** `android/app/src/main/java/com/dmind/app/activity/EmergencyAlertActivity.java`

**Purpose:**
- Full-screen alert when disaster imminent
- Bypass lock screen
- Show large warning text
- Play siren + vibrate
- Large "Acknowledge" button

**Manifest Entry:**
```xml
<activity
    android:name=".activity.EmergencyAlertActivity"
    android:exported="true"
    android:theme="@style/AppTheme.EmergencyAlert"
    android:turnScreenOn="true"
    android:showWhenLocked="true"
    android:flags="FLAG_SHOW_WHEN_LOCKED|FLAG_FULLSCREEN|FLAG_KEEP_SCREEN_ON" />
```

**Styles:**
```xml
<style name="AppTheme.EmergencyAlert" parent="Theme.AppCompat.DayNight.NoActionBar">
    <item name="android:background">@color/emergencyRed</item>
    <item name="android:windowBackground">@color/emergencyRed</item>
    <item name="android:statusBarColor">@color/emergencyRed</item>
    <item name="android:navigationBarColor">@color/emergencyRed</item>
    <item name="android:windowShowWhenLocked">true</item>
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
</style>
```

---

## 🌐 Phase 3: Offline-First Architecture

### Step 3.1: Maplibre Setup

**Add Dependency (build.gradle):**
```gradle
dependencies {
    implementation 'maplibre.gl:android-sdk:10.0.0'
    implementation 'maplibre.gl:android-sdk-geojson:10.0.0'
    implementation 'maplibre.gl:android-sdk-style:10.0.0'
}
```

**ProGuard Rules (proguard-rules.pro):**
```pro
-keep class com.mapbox.** { *; }
-keep class maplibre.** { *; }
```

**Download Offline Maps:**
- Use Mapbox/Tiled Web Maps tiles
- Store in `assets` folder or download to internal storage
- Package pre-downloaded tiles for major danger zones

---

### Step 3.2: SQLite Queue System (Offline-first)

**Create Table Schema:**
```sql
-- SOS Messages Queue
CREATE TABLE IF NOT EXISTS sos_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    latitude REAL,
    longitude REAL,
    battery_level INTEGER,
    message TEXT,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    created_at INTEGER,
    sent_at INTEGER
);

-- Emergency Alerts Cache
CREATE TABLE IF NOT EXISTS alerts_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT,
    alert_level TEXT,
    area_polygon TEXT,
    created_at INTEGER,
    read INTEGER DEFAULT 0
);
```

**Create DAO Class:**
- `SOSQueueDAO.java`
- `AlertsCacheDAO.java`

**Methods:**
```java
// SOS Queue
void enqueueSOS(SOSMessage message);
List<SOSMessage> getPendingMessages();
void updateMessageStatus(int id, String status);
void clearSentMessages();

// Offline Alerts
void cacheAlert(Alert alert);
List<Alert> getUnreadAlerts();
void markAlertAsRead(int id);
void clearOldAlerts(int days);
```

---

### Step 3.3: Network Resilience Logic

**Network Bridge Class:**
```java
public class NetworkBridge {
    public static boolean isConnected(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }
    
    public static boolean isOnline(Context context) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL("https://api.dmind.app/health").openConnection();
            conn.setConnectTimeout(3000);
            conn.setRequestMethod("HEAD");
            int code = conn.getResponseCode();
            return code == 200;
        } catch (Exception e) {
            return false;
        }
    }
    
    public static void processOfflineQueue(Context context, Runnable onComplete) {
        if (isOnline(context)) {
            // Send pending SOS messages
            SOSQueueDAO dao = new SOSQueueDAO(context);
            List<SOSMessage> pending = dao.getPendingMessages();
            
            for (SOSMessage msg : pending) {
                if (sendToServer(msg)) {
                    dao.updateMessageStatus(msg.getId(), "sent");
                } else {
                    dao.updateMessageStatus(msg.getId(), "failed");
                }
            }
            if (onComplete != null) onComplete.run();
        }
    }
}
```

---

## 🎨 Phase 4: Native UI/UX Feel

### Step 4.1: CSS for Webview (Capacitor Web Layer)

**File:** `www/css/native-style.css` (or include in main.css)

```css
/* Disable text selection (mimic native app) */
* {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

/* Remove touch highlight on Android */
* {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

/* Remove callout on iOS long press */
* {
    -webkit-touch-callout: none;
}

/* Disable zoom on double-tap */
meta[name="viewport"] {
    user-scalable: no;
    initial-scale: 1;
    maximum-scale: 1;
}

/* Custom scrollbars for native feel */
::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
}

/* Safe Area Support */
@supports (padding-top: env(safe-area-inset-top)) {
    .safe-area-top { padding-top: env(safe-area-inset-top); }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
    .safe-area-left { padding-left: env(safe-area-inset-left); }
    .safe-area-right { padding-right: env(safe-area-inset-right); }
}
```

**Add to index.html:**
```html
<link rel="stylesheet" href="/assets/css/native-style.css">
```

---

### Step 4.2: Safe Area Handling in Android XML

**Update Layout Files:**
```xml
<!-- activity_main.xml -->
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:fitsSystemWindows="true">
    
    <!-- WebView with safe area padding -->
    <WebView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:paddingTop="0dp"
        android:paddingBottom="0dp" />
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

**MainActivity.java Enhancement:**
```java
private void applySafeAreaInsets() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        getWindow().setDecorFitsSystemWindows(false);
    } else {
        // For older versions, use fitsSystemWindows="false" in XML
    }
}
```

---

### Step 4.3: Bottom Sheets Implementation

**XML Layout:** `res/layout/bottom_sheet_disaster_info.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:background="@drawable/bottom_sheet_background"
    android:padding="16dp">

    <View
        android:layout_width="40dp"
        android:layout_height="4dp"
        android:background="#CCCCCC"
        android:layout_gravity="center_horizontal" />

    <TextView
        android:id="@+id/bottomSheetTitle"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Disaster Information"
        android:textSize="18sp"
        android:textStyle="bold"
        android:layout_marginTop="16dp" />

    <TextView
        android:id="@+id/bottomSheetDescription"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Evacuation routes and safety tips"
        android:layout_marginTop="8dp" />

    <View android:layout_height="1dp" android:layout_width="match_parent" android:background="#000" android:layout_marginTop="16dp" />

    <Button
        android:id="@+id/btnAcknowledge"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="Acknowledge"
        android:layout_marginTop="16dp"
        android:backgroundTint="#DC2626"
        android:textColor="#FFFFFF" />
</LinearLayout>
```

**Java Code:**
```java
public void showBottomSheet(DialogInterface dialogInterface) {
    View bottomSheetView = getLayoutInflater().inflate(R.layout.bottom_sheet_disaster_info, null);
    
    BottomSheetDialog bottomSheet = new BottomSheetDialog(this);
    bottomSheet.setContentView(bottomSheetView);
    
    bottomSheet.findViewById(R.id.btnAcknowledge).setOnClickListener(v -> {
        // Handle acknowledge action
        bottomSheet.dismiss();
    });
    
    bottomSheet.show();
}
```

---

## 🗺️ Phase 5: Smart Geofencing

### Step 5.1: Point-in-Polygon Algorithm

**Create GeofenceUtils.java:**
```java
public class GeofenceUtils {
    /**
     * Determine if a point is inside a polygon using Ray Casting Algorithm
     * @param point - GeoPoint {lat, lng}
     * @param polygon - Array of GeoPoints defining polygon vertices
     * @return true if inside polygon, false otherwise
     */
    public static boolean isPointInPolygon(GeoPoint point, List<GeoPoint> polygon) {
        int n = polygon.size();
        double x = point.getLongitude();
        double y = point.getLatitude();
        boolean inside = false;
        
        for (int i = 0, j = n - 1; i < n; j = i++) {
            double xi = polygon.get(i).getLongitude();
            double yi = polygon.get(i).getLatitude();
            double xj = polygon.get(j).getLongitude();
            double yj = polygon.get(j).getLatitude();
            
            boolean intersect = ((yi > y) != (yj > y)) &&
                               (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    /**
     * Calculate distance between two points (Haversine formula)
     * @return distance in meters
     */
    public static double calculateDistance(GeoPoint p1, GeoPoint p2) {
        int R = 6371000; // Earth radius in meters
        
        double lat1 = Math.toRadians(p1.getLatitude());
        double lat2 = Math.toRadians(p2.getLatitude());
        double deltaLat = Math.toRadians(p2.getLatitude() - p1.getLatitude());
        double deltaLon = Math.toRadians(p2.getLongitude() - p1.getLongitude());
        
        double a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                   Math.cos(lat1) * Math.cos(lat2) *
                   Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }
}
```

**GeoPoint Class:**
```java
public class GeoPoint {
    private double latitude;
    private double longitude;
    
    public GeoPoint(double lat, double lng) {
        this.latitude = lat;
        this.longitude = lng;
    }
    
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
}
```

---

### Step 5.2: Geofence Monitor Service

**Create GeofenceMonitorService.java:**
```java
public class GeofenceMonitorService extends Service {
    private BackgroundGeolocationPlugin backgroundGeolocation;
    private List<DangerZone> dangerZones;
    private Context context;
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        context = getApplicationContext();
        
        // Load danger zones from offline database
        dangerZones = loadDangerZones();
        
        // Start location tracking
        backgroundGeolocation = new BackgroundGeolocationPlugin(this, null);
        backgroundGeolocation.setConfig(createGeolocationConfig());
        backgroundGeolocation.start();
        
        return START_STICKY;
    }
    
    private void onLocationChanged(Location location) {
        GeoPoint currentLocation = new GeoPoint(location.getLatitude(), location.getLongitude());
        
        // Check if user entered any danger zone
        for (DangerZone zone : dangerZones) {
            if (GeofenceUtils.isPointInPolygon(currentLocation, zone.getVertices())) {
                // User is in danger zone!
                EmergencyNotificationManager.showFullScreenEmergencyAlert(
                    context,
                    zone.getAlertTitle(),
                    zone.getAlertMessage(),
                    zone.getType() // "flood", "tsunami", etc.
                );
                break;
            }
        }
    }
    
    private List<DangerZone> loadDangerZones() {
        // Load from SQLite database
        AlertsCacheDAO dao = new AlertsCacheDAO(context);
        return dao.getDangerZones();
    }
}
```

---

### Step 5.3: High-Accuracy SOS Handler

**Update SOS Button Logic:**
```java
public void onSOSButtonPressed() {
    // Request HIGH accuracy GPS
    LocationRequest locationRequest = LocationRequest.Builder.newBuilder()
        .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
        .setIntervalMillis(1000)
        .setFastestIntervalMillis(500)
        .build();
    
    LocationCallback locationCallback = new LocationCallback() {
        @Override
        public void onLocationResult(LocationResult locationResult) {
            Location location = locationResult.getLastLocation();
            
            if (location != null && location.getAccuracy() < 20) { // < 20 meters accuracy
                // Create SOS message with high-accuracy location
                SOSMessage sosMessage = new SOSMessage();
                sosMessage.setLatitude(location.getLatitude());
                sosMessage.setLongitude(location.getLongitude());
                sosMessage.setBatteryLevel(getBatteryLevel());
                sosMessage.setMessage("Emergency: I need help!");
                sosMessage.setTimestamp(System.currentTimeMillis());
                
                // Queue or send immediately based on connectivity
                SOSQueueDAO dao = new SOSQueueDAO(getApplicationContext());
                dao.enqueueSOS(sosMessage);
                
                // Trigger haptic feedback
                Haptics haptics = HapticsPlugin.getInstance();
                haptics.vibrate(new VibrationOptions.Builder().setPattern(
                    new long[]{0, 100, 200, 300, 400, 500}).build());
                
                // Lock GPS listener to save battery after accuracy achieved
                locationCallback.destroy();
            }
        }
    };
    
    // Request location update
    FusedLocationProviderClient client = 
        LocationServices.getFusedLocationProviderClient(this);
    client.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
}
```

---

## 🗂️ Project Structure After Implementation

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml (MODIFIED)
│   │   ├── java/com/dmind/app/
│   │   │   ├── MainActivity.java (MODIFIED)
│   │   │   ├── service/
│   │   │   │   ├── BackgroundLocationService.java (NEW)
│   │   │   │   └── GeofenceMonitorService.java (NEW)
│   │   │   ├── activity/
│   │   │   │   ├── BatteryOptimizationSettingsActivity.java (NEW)
│   │   │   │   └── EmergencyAlertActivity.java (NEW)
│   │   │   ├── util/
│   │   │   │   ├── NotificationHelper.java (NEW)
│   │   │   │   ├── EmergencyNotificationManager.java (NEW)
│   │   │   │   └── GeofenceUtils.java (NEW)
│   │   │   └── model/
│   │   │       ├── GeoPoint.java (NEW)
│   │   │       ├── SOSMessage.java (NEW)
│   │   │       └── DangerZone.java (NEW)
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── bottom_sheet_disaster_info.xml (NEW)
│   │   │   ├── raw/
│   │   │   │   └── siren_alert.mp3 (NEW)
│   │   │   ├── values/
│   │   │   │   └── styles.xml (MODIFIED - Add EmergencyAlert theme)
│   │   │   └── values/colors.xml (MODIFIED - Add emergency colors)
│   │   └── AndroidManifest.xml (MODIFIED - Add permissions & services)
│   └── build.gradle (MODIFIED - Add Maplibre dependencies)
└── build.gradle (MODIFIED - Add Firebase dependencies if needed)
```

---

## 📱 Dependencies to Add

### gradle.properties (Already present ✓)
```properties
# Already have Firebase plugin
com.google.gms.google-services=4.4.2
```

### app/build.gradle (Modify dependencies section)
```gradle
dependencies {
    // ... existing dependencies ...
    
    // Mapbox/Maplibre for maps
    implementation 'maplibre.gl:android-sdk:10.0.0'
    implementation 'maplibre.gl:android-sdk-geojson:10.0.0'
    implementation 'maplibre.gl:android-sdk-style:10.0.0'
    
    // Google Play Services Location (for high-accuracy GPS)
    implementation 'com.google.android.gms:play-services-location:21.3.0'
    
    // Firebase Messaging (if using FCM)
    implementation 'com.google.firebase:firebase-messaging:23.3.0'
}
```

### AndroidManifest.xml (Add permissions - see Step 1.1)

---

## 🧪 Testing Checklist

| Test | Checklist | Status |
|------|-----------|--------|
| **Background Service** | Service runs in foreground, notification visible, location updates | |
| **Battery Optimization** | User can bypass battery optimization | |
| **DND Bypass** | Notifications bypass Do Not Disturb mode | |
| **Full-Screen Alert** | Lock screen wakes up, full-screen alert shows | |
| **Siren Sound** | Custom sound plays on emergency notification | |
| **Offline Maps** | Map tiles load without internet | |
| **SOS Queue** | Messages queued when offline, sent when online | |
| **Polygon Test** | Point-in-polygon detects location in zone | |
| **SOS Accuracy** | High-accuracy GPS (<20m) before sending SOS | |

---

## 🚨 Priority Order for Implementation

1. **CRITICAL Path:**
   - Update AndroidManifest (permissions)
   - Create NotificationHelper (emergency channel)
   - Create EmergencyNotificationManager
   - Create EmergencyAlertActivity

2. **HIGH Priority:**
   - BackgroundLocationService
   - GeofenceUtils & GeofenceMonitorService
   - SOSQueueDAO & NetworkBridge
   - BatteryOptimizationSettingsActivity

3. **MEDIUM Priority:**
   - CSS native styles
   - Safe areaInsets
   - Bottom sheets

4. **Testing → Deployment**

---

**Would you like me to proceed with implementation now? I'll start with Phase 1 (Background Operations) and work through each component systematically.**

Please confirm:
1. Should I proceed with steps in order?
2. Any specific component you want to prioritize?
