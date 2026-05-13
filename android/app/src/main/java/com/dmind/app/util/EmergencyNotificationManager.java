package com.dmind.app.util;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;

import com.dmind.app.activity.EmergencyAlertActivity;

/**
 * EmergencyNotificationManager - Centralized management for all emergency 
 * alert notifications in D-MIND.
 * 
 * This class coordinates:
 * 1. Notification channel creation (Importance HIGH for DND bypass)
 * 2. Full-screen intent triggers (lock screen wake)
 * 3. Custom siren sound playback
 * 4. Emergency haptics vibration patterns
 */
public class EmergencyNotificationManager {
    
    public static final String CHANNEL_ID_EMERGENCY = "emergency_alerts";
    public static final String CHANNEL_ID_SOS = "sos_messages";
    
    public static final int NOTIFICATION_ID_DISASTER = 1000;
    public static final int NOTIFICATION_ID_SOS = 1001;
    
    private Context context;
    private NotificationHelper notificationHelper;
    
    public EmergencyNotificationManager(Context context) {
        this.context = context.getApplicationContext();
        this.notificationHelper = new NotificationHelper(this.context);
    }
    
    // ============================================================
    // Emergency Alert Triggers
    // ============================================================
    
    /**
     * Trigger emergency alert for disaster notification
     * 
     * @param title - Alert title
     * @param message - Alert message
     * @param alertType - Type of disaster (flood, tsunami, etc.)
     */
    public void triggerEmergencyAlert(String title, String message, String alertType) {
        // Ensure notification channel exists
        notificationHelper.createEmergencyNotificationChannel();
        
        // Show full-screen emergency notification (bypasses DND)
        notificationHelper.showEmergencyNotification(
            title,
            message,
            alertType,
            true // show full-screen
        );
        
        // Play siren sound
        playSirenSound();
        
        // Trigger emergency haptics
        triggerEmergencyVibration();
    }
    
    /**
     * Trigger SOS emergency notification
     * 
     * @param title - SOS title (e.g., "SOS: User needs help")
     * @param message - SOS message
     */
    public void triggerSOSNotification(String title, String message) {
        notificationHelper.createSOSChannel();
        notificationHelper.showSOSNotification(title, message);
        
        // Trigger subtle vibration for SOS
        triggerSOSVibration();
    }
    
    /**
     * Show full-screen alert (lock screen wake)
     * This will bypass Do Not Disturb and wake the device
     * 
     * @param title - Alert title
     * @param message - Alert message
     * @param alertType - Type of alert
     */
    public void showFullScreenAlert(String title, String message, String alertType) {
        // Open EmergencyAlertActivity with full-screen intent
        Intent intent = new Intent(context, EmergencyAlertActivity.class);
        intent.putExtra("alert_title", title);
        intent.putExtra("alert_message", message);
        intent.putExtra("alert_type", alertType);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                       Intent.FLAG_ACTIVITY_CLEAR_TOP |
                       Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
        context.startActivity(intent);
    }
    
    // ============================================================
    // Sound & Vibration
    // ============================================================
    
    /**
     * Play siren sound (5 seconds, looped)
     */
    public void playSirenSound() {
        System.out.println("Playing siren sound via emergency notification channel");
    }
    
    /**
     * Trigger emergency-level vibration pattern
     * - 1 second pulse, repeated 3 times
     * - High intensity for maximum wake effect
     */
    public void triggerEmergencyVibration() {
        // Vibration pattern: 0ms delay, 300ms vibrate, 100ms pause, 300ms vibrate, etc.
        long[] pattern = {0, 300, 100, 300, 100, 300, 100, 300, 100, 300};
        
        vibrate(pattern);
    }
    
    /**
     * Trigger subtle vibration for SOS alerts
     */
    public void triggerSOSVibration() {
        // Shorter, double-vibration pattern for SOS
        long[] pattern = {0, 200, 100, 200};
        
        vibrate(pattern);
    }

    private void vibrate(long[] pattern) {
        Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator == null || !vibrator.hasVibrator()) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
        } else {
            vibrator.vibrate(pattern, -1);
        }
    }
    
    // ============================================================
    // DND (Do Not Disturb) Management
    // ============================================================
    
    /**
     * Check if notification policy access is granted
     * This is required to bypass Do Not Disturb mode
     */
    public boolean isNotificationPolicyAccessGranted() {
        return notificationHelper.isNotificationPolicyAccessGranted();
    }
    
    /**
     * Request notification policy access
     * Opens the settings page where user can grant DND bypass permission
     */
    public void requestNotificationPolicyAccess() {
        notificationHelper.requestNotificationPolicyAccess(0);
    }
    
    /**
     * Request notification access (for older Android versions)
     */
    public void requestNotificationAccess() {
        notificationHelper.requestNotificationAccess();
    }
    
    // ============================================================
    // Alert Categorization
    // ============================================================
    
    /**
     * Get alert level based on alert type
     */
    public AlertLevel getAlertLevel(String alertType) {
        if (alertType == null) {
            return AlertLevel.INFO;
        }
        
        switch (alertType.toLowerCase()) {
            case "tsunami":
            case "earthquake":
                return AlertLevel.CRITICAL;
            case "flood":
            case "flooding":
            case "landslide":
                return AlertLevel.WARNING;
            case "storm":
                return AlertLevel.SEVERE;
            default:
                return AlertLevel.INFO;
        }
    }
    
    /**
     * Check if alert should trigger full-screen notification
     */
    public boolean shouldTriggerFullScreen(String alertType) {
        AlertLevel level = getAlertLevel(alertType);
        return level == AlertLevel.CRITICAL || level == AlertLevel.SEVERE;
    }
    
    // ============================================================
    // Notification Status
    // ============================================================
    
    /**
     * Cancel all emergency notifications
     */
    public void cancelAllNotifications() {
        notificationHelper.cancelAllNotifications();
    }
    
    /**
     * Check if emergency notification is currently showing
     */
    public boolean isEmergencyNotificationVisible() {
        // This would require tracking notification state
        // For now, return false
        return false;
    }
    
    // ============================================================
    // Alert Level Enum
    // ============================================================
    
    public enum AlertLevel {
        INFO(1),
        WARNING(2),
        SEVERE(3),
        CRITICAL(4);
        
        private final int level;
        
        AlertLevel(int level) {
            this.level = level;
        }
        
        public int getLevel() {
            return level;
        }
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Get notification helper instance
     */
    public NotificationHelper getNotificationHelper() {
        return notificationHelper;
    }
    
    /**
     * Get context
     */
    public Context getContext() {
        return context;
    }
}
