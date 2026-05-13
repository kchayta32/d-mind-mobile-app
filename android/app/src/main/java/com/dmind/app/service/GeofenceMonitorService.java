package com.dmind.app.service;

import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import com.dmind.app.database.AlertsCacheDAO;
import com.dmind.app.model.DangerZone;
import com.dmind.app.model.GeoPoint;
import com.dmind.app.util.EmergencyNotificationManager;
import com.dmind.app.util.GeofenceUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * GeofenceMonitorService - Continuously monitors user location against
 * disaster danger zones using geofencing algorithms.
 * 
 * This service works alongside BackgroundLocationService to:
 * 1. Maintain persistent location tracking
 * 2. Check if user is entering/leaving danger zones
 * 3. Trigger emergency alerts when entering danger zones
 * 4. Handle offline map rendering (using Maplibre)
 */
public class GeofenceMonitorService extends Service {
    
    public static final String ACTION_START_MONITORING = "com.dmind.app.START_GEOFENCE_MONITORING";
    public static final String ACTION_STOP_MONITORING = "com.dmind.app.STOP_GEOFENCE_MONITORING";
    public static final String ACTION_CHECK_GEOFENCE = "com.dmind.app.CHECK_GEOFENCE";
    
    private static final String TAG = "GeofenceMonitorService";
    
    private boolean isMonitoring = false;
    private List<DangerZone> dangerZones = new ArrayList<>();
    private EmergencyNotificationManager emergencyNotificationManager;
    
    @Override
    public void onCreate() {
        super.onCreate();
        emergencyNotificationManager = new EmergencyNotificationManager(this);
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();
            if (action == null) {
                return START_STICKY;
            }
            
            switch (action) {
                case ACTION_START_MONITORING:
                    startMonitoring();
                    break;
                case ACTION_STOP_MONITORING:
                    stopMonitoring();
                    break;
                case ACTION_CHECK_GEOFENCE:
                    checkGeofence();
                    break;
            }
        }
        
        return START_STICKY;
    }
    
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not using bound service
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        stopMonitoring();
    }
    
    // ============================================================
    // Monitoring Control
    // ============================================================
    
    /**
     * Start geofence monitoring
     */
    private void startMonitoring() {
        if (isMonitoring) {
            return;
        }
        
        isMonitoring = true;
        
        // Start location tracking (using BackgroundGeolocation plugin)
        startLocationTracking();
        
        // Load danger zones from database
        loadDangerZones();
    }
    
    /**
     * Stop geofence monitoring
     */
    private void stopMonitoring() {
        isMonitoring = false;
        
        // Stop location tracking
        stopLocationTracking();
        
        // Clear danger zones
        clearDangerZones();
    }
    
    // ============================================================
    // Location Tracking
    // ============================================================
    
    /**
     * Start location tracking with high accuracy
     */
    private void startLocationTracking() {
        // Using BackgroundGeolocation plugin configuration
        
        // Pseudocode:
        /*
        BackgroundGeolocationPlugin bgGeo = BackgroundGeolocationPlugin.getInstance();
        bgGeo.setConfig(new BackgroundGeolocationConfig.Builder()
            .desiredAccuracy(BackgroundGeolocationConfig.ACCURACY_HIGH)
            .distanceFilter(5.0) // Update every 5 meters
            .locationUpdateInterval(1000) // 1 second
            .fastestLocationUpdateInterval(500) // 0.5 second
            .build());
        bgGeo.start();
        
        bgGeo.on(GeoTracker.EVENT_LOCATION, new Callback() {
            @Override
            public void callback(JSONObject params) {
                // Location received - check against danger zones
                checkGeofence();
            }
        });
        */
        
        System.out.println("GeofenceMonitorService: Starting location tracking");
    }
    
    /**
     * Stop location tracking
     */
    private void stopLocationTracking() {
        // Stop BackgroundGeolocation plugin
        
        // Pseudocode:
        /*
        BackgroundGeolocationPlugin bgGeo = BackgroundGeolocationPlugin.getInstance();
        bgGeo.stop();
        */
        
        System.out.println("GeofenceMonitorService: Stopping location tracking");
    }
    
    // ============================================================
    // Danger Zone Management
    // ============================================================
    
    /**
     * Load danger zones from database
     */
    private void loadDangerZones() {
        AlertsCacheDAO dao = new AlertsCacheDAO(this);
        dangerZones = dao.getAllDangerZones();
        Log.d(TAG, "Loaded " + dangerZones.size() + " danger zones from SQLite");
    }
    
    /**
     * Clear loaded danger zones
     */
    private void clearDangerZones() {
        dangerZones.clear();
        Log.d(TAG, "Cleared loaded danger zones");
    }
    
    // ============================================================
    // Geofence Checking
    // ============================================================
    
    /**
     * Check if user is inside any danger zone
     */
    private void checkGeofence() {
        GeoPoint currentUserLocation = getCurrentLocation();
        if (currentUserLocation == null) {
            Log.d(TAG, "No last known location available for geofence check");
            return;
        }

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
    
    /**
     * Get current location (wrapper for location provider)
     */
    private GeoPoint getCurrentLocation() {
        if (!hasLocationPermissions()) {
            return null;
        }

        LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        if (locationManager == null) {
            return null;
        }

        Location bestLocation = null;
        for (String provider : locationManager.getProviders(true)) {
            try {
                Location location = locationManager.getLastKnownLocation(provider);
                if (location != null && (bestLocation == null || location.getAccuracy() < bestLocation.getAccuracy())) {
                    bestLocation = location;
                }
            } catch (SecurityException ignored) {
                return null;
            }
        }

        if (bestLocation != null) {
            return GeoPoint.fromAndroidLocation(bestLocation);
        }

        return null;
    }
    
    // ============================================================
    // Offline Map Integration
    // ============================================================
    
    /**
     * Prepare offline map tiles
     * This downloads map tiles for danger zones to ensure functionality offline
     */
    private void prepareOfflineMaps() {
        // Using Maplibre GL Native Android SDK
        
        // Pseudocode:
        /*
        MapView mapView = new MapView(this);
        mapView.setStyleUrl(MapboxMap.STYLE_SATELLITE_STREETS);
        
        // Load offline style
        OfflineManager offlineManager = OfflineManager.getInstance(this);
        
        // Download tiles for danger zone regions
        for (DangerZone zone : dangerZones) {
            double[] bounds = getBounding Box(zone.getVertices());
            offlineManager.downloadTileSet(
                "offline_dangerzone_" + zone.getId(),
                bounds,
                10.0, // min zoom
                16.0, // max zoom
                new TileSetDownloadListener() {
                    @Override
                    public void onComplete() {
                        // Offline map downloaded successfully
                    }
                    
                    @Override
                    public void onError(String error) {
                        // Handle error
                    }
                }
            );
        }
        */
        
        System.out.println("GeofenceMonitorService: Preparing offline maps");
    }
    
    // ============================================================
    // Location Authorization
    // ============================================================
    
    /**
     * Check if location permissions are granted
     */
    private boolean hasLocationPermissions() {
        return ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
               ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    
    /**
     * Request location permissions if needed
     */
    private void requestLocationPermissions() {
        // Request permission from system
        // This would be handled in an Activity, not Service
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if service is monitoring
     */
    public boolean isMonitoring() {
        return isMonitoring;
    }
    
    /**
     * Restart monitoring service (called from BootCompleteReceiver)
     */
    public static void restartService(android.content.Context context) {
        Intent serviceIntent = new Intent(context, GeofenceMonitorService.class);
        serviceIntent.setAction(ACTION_START_MONITORING);
        
        context.startService(serviceIntent);
    }
}
