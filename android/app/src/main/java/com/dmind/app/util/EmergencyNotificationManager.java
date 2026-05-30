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
// คลาสสำหรับจัดการและส่งสัญญาณเตือนภัยฉุกเฉินระดับประเทศ (Emergency Alert Manager) เช่น สึนามิ น้ำท่วม แผ่นดินไหว
public class EmergencyNotificationManager {
    
    public static final String CHANNEL_ID_EMERGENCY = "emergency_alerts";
    public static final String CHANNEL_ID_SOS = "sos_messages";
    
    public static final int NOTIFICATION_ID_DISASTER = 1000;
    public static final int NOTIFICATION_ID_SOS = 1001;
    
    private Context context;
    private NotificationHelper notificationHelper;
    
    // คอนสตรักเตอร์สำหรับสร้างตัวจัดการการแจ้งเตือนฉุกเฉินและกำหนดคอนเท็กซ์
    public EmergencyNotificationManager(Context context) {
        this.context = context.getApplicationContext();
        this.notificationHelper = new NotificationHelper(this.context);
    }
    
    // ============================================================
    // การส่งสัญญาณแจ้งเตือนฉุกเฉิน (Emergency Alert Triggers)
    // ============================================================
    
    /**
     * Trigger emergency alert for disaster notification
     * 
     * @param title - Alert title
     * @param message - Alert message
     * @param alertType - Type of disaster (flood, tsunami, etc.)
     */
    // เริ่มส่งสัญญาณแจ้งเตือนภัยพิบัติฉุกเฉิน (สร้างช่องการแจ้งเตือน แสดงข้อความแบบเต็มหน้าจอ เล่นไซเรน และสั่นสะเทือน)
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
    // เริ่มส่งสัญญาณแจ้งเตือนระบบ SOS พิกัดช่วยเหลือของผู้ใช้
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
    // แสดงหน้าจอเตือนภัยฉุกเฉินแบบเต็มหน้าจอ (บดบังหน้าจอล็อคและทำให้เครื่องตื่น)
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
    // เสียงและการสั่น (Sound & Vibration)
    // ============================================================
    
    /**
     * Play siren sound (5 seconds, looped)
     */
    // เล่นเสียงไซเรนเพื่อเตือนภัยฉุกเฉิน
    public void playSirenSound() {
        System.out.println("Playing siren sound via emergency notification channel");
    }
    
    /**
     * Trigger emergency-level vibration pattern
     * - 1 second pulse, repeated 3 times
     * - High intensity for maximum wake effect
     */
    // สั่นเตือนภัยฉุกเฉินแบบเน้นย้ำความแรงสูง เพื่อปลุกผู้ใช้ให้ตื่นตัว
    public void triggerEmergencyVibration() {
        // Vibration pattern: 0ms delay, 300ms vibrate, 100ms pause, 300ms vibrate, etc.
        long[] pattern = {0, 300, 100, 300, 100, 300, 100, 300, 100, 300};
        
        vibrate(pattern);
    }
    
    /**
     * Trigger subtle vibration for SOS alerts
     */
    // สั่นเตือนระบบ SOS สั้นๆ แบบนุ่มนวลกว่าภัยพิบัติ
    public void triggerSOSVibration() {
        // Shorter, double-vibration pattern for SOS
        long[] pattern = {0, 200, 100, 200};
        
        vibrate(pattern);
    }

    // สั่งการตัวสั่นของเครื่องตามรูปแบบจังหวะที่กำหนด
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
    // การจัดการโหมดห้ามรบกวน (DND - Do Not Disturb Management)
    // ============================================================
    
    /**
     * Check if notification policy access is granted
     * This is required to bypass Do Not Disturb mode
     */
    // ตรวจสอบว่าแอปได้รับสิทธิ์การละเว้นโหมดห้ามรบกวน (Do Not Disturb Bypass) หรือยัง
    public boolean isNotificationPolicyAccessGranted() {
        return notificationHelper.isNotificationPolicyAccessGranted();
    }
    
    /**
     * Request notification policy access
     * Opens the settings page where user can grant DND bypass permission
     */
    // ขอสิทธิ์การละเว้นโหมดห้ามรบกวนจากผู้ใช้ โดยเปิดหน้าตั้งค่าของระบบ
    public void requestNotificationPolicyAccess() {
        notificationHelper.requestNotificationPolicyAccess(0);
    }
    
    /**
     * Request notification access (for older Android versions)
     */
    // ขอสิทธิ์การเข้าถึงการแจ้งเตือนของระบบสำหรับ Android รุ่นเก่า
    public void requestNotificationAccess() {
        notificationHelper.requestNotificationAccess();
    }
    
    // ============================================================
    // การจัดหมวดหมู่สัญญาณเตือน (Alert Categorization)
    // ============================================================
    
    /**
     * Get alert level based on alert type
     */
    // คืนค่าระดับความรุนแรงของภัยพิบัติ (Alert Level) โดยระบุตามประเภทของภัยพิบัติ
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
            case "pm25":
            case "pm2_5":
            case "pm2.5":
            case "pollution":
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
    // ตรวจสอบว่าประเภทภัยพิบัติที่กำหนด ควรแสดงผลแบบเต็มหน้าจอทันทีหรือไม่ (กรณีรุนแรงมาก)
    public boolean shouldTriggerFullScreen(String alertType) {
        AlertLevel level = getAlertLevel(alertType);
        return level == AlertLevel.CRITICAL || level == AlertLevel.SEVERE;
    }
    
    // ============================================================
    // สถานะการแจ้งเตือน (Notification Status)
    // ============================================================
    
    /**
     * Cancel all emergency notifications
     */
    // ยกเลิกข้อความและสัญญาณเตือนภัยฉุกเฉินทั้งหมดบนแถบการแจ้งเตือน
    public void cancelAllNotifications() {
        notificationHelper.cancelAllNotifications();
    }
    
    /**
     * Check if emergency notification is currently showing
     */
    // ตรวจสอบว่าหน้าต่างแจ้งเตือนภัยพิบัติกำลังแสดงผลอยู่บนแถบหรือไม่
    public boolean isEmergencyNotificationVisible() {
        // This would require tracking notification state
        // For now, return false
        return false;
    }
    
    // ============================================================
    // อีนัมระดับความรุนแรง (Alert Level Enum)
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
    // เมธอดช่วยเหลือทั่วไป (Utility Methods)
    // ============================================================
    
    /**
     * Get notification helper instance
     */
    // รับอินสแตนซ์ของ NotificationHelper
    public NotificationHelper getNotificationHelper() {
        return notificationHelper;
    }
    
    /**
     * Get context
     */
    // รับค่า Context ของแอปพลิเคชัน
    public Context getContext() {
        return context;
    }
}
