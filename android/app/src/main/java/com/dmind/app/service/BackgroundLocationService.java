package com.dmind.app.service;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.dmind.app.R;
import com.dmind.app.database.AlertsCacheDAO;
import com.dmind.app.model.DangerZone;
import com.dmind.app.model.GeoPoint;
import com.dmind.app.util.EmergencyNotificationManager;
import com.dmind.app.util.GeofenceUtils;
import com.dmind.app.util.NotificationHelper;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import java.util.List;

/**
 * BackgroundLocationService - Persistent foreground service for continuous
 * location tracking even when the app is swiped away from recent apps.
 * 
 * This service:
 * 1. Runs as a foreground service (shows persistent notification)
 * 2. Works with BackgroundGeolocation plugin
 * 3. Continuously monitors user location against danger zones
 * 4. Triggers emergency alerts when entering geofenced danger areas
 */
// คลาสหลักสำหรับบริการเบื้องหลังเพื่อติดตามตำแหน่งที่ตั้งของผู้ใช้อย่างต่อเนื่อง
public class BackgroundLocationService extends Service {
    
    public static final String ACTION_START = "com.dmind.app.START_BACKGROUND_SERVICE";
    public static final String ACTION_STOP = "com.dmind.app.STOP_BACKGROUND_SERVICE";
    public static final String ACTION_CHECK_DISTANCE = "com.dmind.app.CHECK_DISTANCE";
    
    private static final int NOTIFICATION_ID = 1000;
    private static final String CHANNEL_ID = "background_operations";
    private static final String TAG = "BackgroundLocationService";
    private static final String PREFS = "dmind_native";
    private static final String KEY_MONITORING = "monitoring";
    private static final long LOCATION_INTERVAL_MS = 30_000L;
    private static final long LOCATION_MIN_UPDATE_MS = 10_000L;
    
    private NotificationHelper notificationHelper;
    private EmergencyNotificationManager emergencyNotificationManager;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private Location lastLocation;
    private boolean isServiceRunning = false;
    
    // เริ่มต้นสร้าง Service และตั้งค่าคอมโพเนนต์ที่จำเป็น เช่น การจัดการแจ้งเตือน และการระบุตำแหน่ง
    @Override
    public void onCreate() {
        super.onCreate();
        notificationHelper = new NotificationHelper(this);
        emergencyNotificationManager = new EmergencyNotificationManager(this);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        notificationHelper.createBackgroundChannel();
    }
    
    // จัดการคำสั่งที่ส่งมายัง Service (เช่น เริ่มบริการ หยุดบริการ หรือตรวจสอบระยะห่าง)
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (ACTION_START.equals(action)) {
                startForegroundService();
            } else if (ACTION_STOP.equals(action)) {
                stopService();
            } else if (ACTION_CHECK_DISTANCE.equals(action)) {
                // Trigger distance check (location update received)
                checkLocationWithDangerZones();
            }
        }
        
        return START_STICKY;
    }
    
    // เรียกใช้งานเมื่อ Service ถูกทำลาย เพื่อหยุดการทำงานและเคลียร์ทรัพยากร
    @Override
    public void onDestroy() {
        super.onDestroy();
        isServiceRunning = false;
        // Stop location tracking
    }
    
    // เชื่อมต่อบิงดิงกับ Service (ในที่นี้ไม่ได้ใช้งานจึงส่งคืนค่า null)
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not using bound service
    }
    
    // ============================================================
    // การจัดการ Service (Service Management)
    // ============================================================
    
    /**
     * Start the foreground service
     */
    // เริ่มทำงานแบบ Foreground Service เพื่อให้ระบบไม่สั่งปิด และเริ่มติดตามตำแหน่ง
    private void startForegroundService() {
        if (isServiceRunning) {
            return;
        }
        
        isServiceRunning = true;
        markRunning(true);
        
        // Create notification for foreground service
        Notification notification = createPersistentNotification();
        
        // Start as foreground service
        startForeground(NOTIFICATION_ID, notification);
        
        // Start location tracking
        startLocationTracking();
    }
    
    /**
     * Stop the background service
     */
    // หยุดการทำงานของ Service และหยุดการติดตามตำแหน่งทั้งหมด
    private void stopService() {
        isServiceRunning = false;
        markRunning(false);
        stopLocationTracking();
        stopForeground(true);
        stopSelf();
    }
    
    /**
     * Create persistent notification for foreground service
     */
    // สร้างการแจ้งเตือนแบบติดค้าง (Persistent Notification) สำหรับ Foreground Service
    private Notification createPersistentNotification() {
        Intent stopIntent = new Intent(this, BackgroundLocationService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this, 
            0, 
            stopIntent, 
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_CANCEL_CURRENT
        );
        
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("D-MIND: Monitoring your location")
            .setContentText("Continuously tracking for disaster alerts")
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .addAction(R.drawable.ic_stat_notification, "Disable", stopPendingIntent);
        
        // Set icon color for newer Android versions
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            builder.setColor(getColor(R.color.colorPrimary));
        }
        
        return builder.build();
    }
    
    // ============================================================
    // การติดตามตำแหน่ง (Location Tracking)
    // ============================================================
    
    /**
     * Start active location tracking through Google Play Services.
     */
    // เริ่มต้นระบบติดตามตำแหน่งความแม่นยำสูงผ่าน Fused Location Provider Client
    private void startLocationTracking() {
        if (!hasLocationPermission()) {
            Log.w(TAG, "Location tracking skipped because location permission is missing");
            return;
        }

        LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, LOCATION_INTERVAL_MS)
            .setMinUpdateIntervalMillis(LOCATION_MIN_UPDATE_MS)
            .setMinUpdateDistanceMeters(25f)
            .build();

        if (locationCallback == null) {
            locationCallback = new LocationCallback() {
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    Location location = locationResult.getLastLocation();
                    if (location != null) {
                        onLocationReceived(location);
                    }
                }
            };
        }

        try {
            fusedLocationClient.requestLocationUpdates(request, locationCallback, Looper.getMainLooper());
            fusedLocationClient.getLastLocation().addOnSuccessListener(location -> {
                if (location != null) {
                    onLocationReceived(location);
                }
            });
            Log.d(TAG, "Active fused location updates started");
        } catch (SecurityException e) {
            Log.w(TAG, "Location permission was revoked before updates started", e);
        }
    }
    
    /**
     * Stop location tracking
     */
    // หยุดรับข้อมูลอัปเดตตำแหน่งเพื่อประหยัดพลังงาน
    private void stopLocationTracking() {
        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
            Log.d(TAG, "Active fused location updates stopped");
        }
    }
    
    // ============================================================
    // การตรวจสอบพื้นที่อันตราย (Danger Zone Monitoring)
    // ============================================================
    
    /**
     * Check current location against danger zones
     * This is the core logic for geofencing disaster alerts
     */
    // ตรวจสอบว่าพิกัดปัจจุบันอยู่ในพื้นที่อันตราย (Danger Zone) หรือไม่ และส่งการแจ้งเตือนฉุกเฉินถ้าอยู่ข้างใน
    private void checkLocationWithDangerZones() {
        GeoPoint currentUserLocation = getLastKnownGeoPoint();
        if (currentUserLocation == null) {
            Log.d(TAG, "No last known location available");
            return;
        }

        AlertsCacheDAO dao = new AlertsCacheDAO(this);
        List<DangerZone> dangerZones = dao.getAllDangerZones();

        for (DangerZone zone : dangerZones) {
            List<GeoPoint> vertices = zone.getVertices();
            if (zone.isActive() && vertices.size() >= 3 && GeofenceUtils.isPointInPolygon(currentUserLocation, vertices)) {
                emergencyNotificationManager.triggerEmergencyAlert(
                    zone.getAlertTitle(),
                    zone.getAlertMessage(),
                    zone.getType()
                );
                Log.w(TAG, "User is inside danger zone: " + zone.getId());
                break;
            }
        }
    }

    // แปลงตำแหน่ง Android Location ล่าสุดให้เป็นออบเจ็กต์ GeoPoint
    private GeoPoint getLastKnownGeoPoint() {
        return lastLocation != null ? GeoPoint.fromAndroidLocation(lastLocation) : null;
    }
    
    // ============================================================
    // การจัดการเมื่อได้รับตำแหน่งใหม่ (Location Update Handling)
    // ============================================================
    
    /**
     * Handle location updates from BackgroundGeolocation plugin
     */
    // ประมวลผลเมื่อได้รับพิกัดพิกัดใหม่ บันทึกลงฐานข้อมูลแคช และตรวจสอบกับเขตพื้นที่อันตราย
    private void onLocationReceived(Location location) {
        if (location != null) {
            lastLocation = location;
            AlertsCacheDAO dao = new AlertsCacheDAO(this);
            dao.addLocation(location.getLatitude(), location.getLongitude(), location.getAccuracy());
            
            // Check if user is entering/leaving danger zones
            checkLocationWithDangerZones();
            
            // Update power management
            handleBatteryOptimization();
        }
    }
    
    /**
     * Handle battery optimization for the service
     */
    // จัดการการประหยัดพลังงานโดยใช้ WakeLock เพื่อให้แน่ใจว่าการประมวลผลพิกัดทำงานเสร็จสมบูรณ์
    private void handleBatteryOptimization() {
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "D-MIND:BackgroundLocation"
        );
        
        // Acquire wake lock for 10 seconds
        wakeLock.acquire(10 * 1000L);
        
        // Release immediately after processing (not in this simple example)
        // For production, use LocationUpdater to manage wake locks properly
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
    
    // ============================================================
    // เมธอดช่วยเหลือทั่วไป (Utility Methods)
    // ============================================================
    
    /**
     * Check if service is running
     */
    // ตรวจสอบสถานะว่า Service กำลังทำงานอยู่หรือไม่
    public boolean isServiceRunning() {
        return isServiceRunning;
    }

    // ตรวจสอบว่าแอปได้รับสิทธิ์การเข้าถึงตำแหน่งพิกัด (Location Permission) หรือไม่
    private boolean hasLocationPermission() {
        return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
               ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    // บันทึกสถานะการเปิด/ปิดติดตามตำแหน่งลงใน SharedPreferences
    private void markRunning(boolean running) {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putBoolean(KEY_MONITORING, running).apply();
    }

    // ดึงสถานะการทำงานของบริการระบุตำแหน่งจาก SharedPreferences
    public static boolean isMarkedRunning(Context context) {
        SharedPreferences prefs = context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        return prefs.getBoolean(KEY_MONITORING, false);
    }
    
    /**
     * Restart the service (called from BootCompleteReceiver)
     */
    // ฟังก์ชันสำหรับสั่งเริ่มต้นหรือรีสตาร์ท Service ใหม่
    public static void restartService(Context context) {
        Intent serviceIntent = new Intent(context, BackgroundLocationService.class);
        serviceIntent.setAction(ACTION_START);
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
