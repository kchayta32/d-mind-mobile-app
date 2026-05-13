package com.dmind.app.receiver;

import android.app.Application;
import android.os.Bundle;
import android.util.Log;

import androidx.lifecycle.DefaultLifecycleObserver;
import androidx.lifecycle.LifecycleOwner;

import com.dmind.app.util.EmergencyNotificationManager;

/**
 * AppLifecycleMonitor - Monitors application lifecycle for emergency alert management.
 * 
 * This class helps manage emergency alerts based on app state:
 * - When app goes to background: Prepare for full-screen alert
 * - When app returns to foreground: Resume normal operation
 */
public class AppLifecycleMonitor implements DefaultLifecycleObserver {
    
    private static final String TAG = "AppLifecycleMonitor";
    
    private EmergencyNotificationManager emergencyManager;
    private boolean isBackground = false;
    
    public AppLifecycleMonitor(Application application) {
        // Initialize with emergency notification manager
        this.emergencyManager = new EmergencyNotificationManager(application);
    }
    
    // ============================================================
    // Lifecycle Callbacks
    // ============================================================
    
    @Override
    public void onCreate(LifecycleOwner owner) {
        Log.d(TAG, "Application onCreate");
        
        // Initialize emergency notification manager
        emergencyManager.getNotificationHelper().createEmergencyNotificationChannel();
        emergencyManager.getNotificationHelper().createBackgroundChannel();
    }
    
    @Override
    public void onStart(LifecycleOwner owner) {
        Log.d(TAG, "Application onStart");
        
        isBackground = false;
    }
    
    @Override
    public void onResume(LifecycleOwner owner) {
        Log.d(TAG, "Application onResume");
        
        isBackground = false;
        
        // Check if battery optimization is enabled
        checkBatteryOptimization();
    }
    
    @Override
    public void onPause(LifecycleOwner owner) {
        Log.d(TAG, "Application onPause");
        
        isBackground = true;
        
        // Hide emergency notification from status bar (but keep service running)
        emergencyManager.cancelAllNotifications();
    }
    
    @Override
    public void onStop(LifecycleOwner owner) {
        Log.d(TAG, "Application onStop");
        
        isBackground = true;
    }
    
    @Override
    public void onDestroy(LifecycleOwner owner) {
        Log.d(TAG, "Application onDestroy");
    }
    
    // ============================================================
    // Battery Optimization Check
    // ============================================================
    
    /**
     * Check if battery optimization is enabled and show warning if needed
     */
    private void checkBatteryOptimization() {
        // Implementation would check if app is on battery optimization whitelist
        // For now, this is handled in BatteryOptimizationSettingsActivity
        
        Log.d(TAG, "Battery optimization check (handled separately)");
    }
    
    // ============================================================
    // Emergency Alert Management
    // ============================================================
    
    /**
     * Check if emergency alert should trigger full-screen intent
     * This should be called from EmergencyNotificationManager
     */
    public boolean shouldTriggerFullScreenAlert(String alertType) {
        // Critical alerts always trigger full-screen
        if (alertType != null) {
            String lowerType = alertType.toLowerCase();
            return lowerType.contains("tsunami") || 
                   lowerType.contains("earthquake") || 
                   lowerType.contains("flood");
        }
        return false;
    }
    
    /**
     * Cancel all active emergency alerts
     */
    public void cancelEmergencyAlerts() {
        emergencyManager.cancelAllNotifications();
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if app is in background
     */
    public boolean isAppInBackground() {
        return isBackground;
    }
    
    /**
     * Get emergency notification manager
     */
    public EmergencyNotificationManager getEmergencyManager() {
        return emergencyManager;
    }
}
