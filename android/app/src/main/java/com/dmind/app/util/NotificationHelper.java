package com.dmind.app.util;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.dmind.app.R;
import com.dmind.app.activity.EmergencyAlertActivity;

/**
 * NotificationHelper - Manages emergency notification channels, DND bypass, 
 * and full-screen intent functionality for D-MIND disaster alerts.
 */
// คลาสช่วยเหลือสำหรับสร้างช่องการแจ้งเตือน (Notification Channels) และจัดองค์ประกอบหน้าจอแจ้งเตือนประเภทต่างๆ
public class NotificationHelper {
    
    public static final String CHANNEL_ID_EMERGENCY = "emergency_alerts";
    public static final String CHANNEL_ID_BACKGROUND = "background_operations";
    public static final String CHANNEL_ID_SOS = "sos_messages";
    
    public static final int NOTIFICATION_ID_BACKGROUND = 1000;
    public static final int NOTIFICATION_ID_SOS_PENDING = 1001;
    public static final int NOTIFICATION_ID_DISASTER_IMMINENT = 1002;
    
    private Context context;
    private NotificationManager notificationManager;
    
    // คอนสตรักเตอร์สำหรับกำหนดค่าเริ่มต้นให้กับตัวช่วยจัดการแจ้งเตือน
    public NotificationHelper(Context context) {
        this.context = context;
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
    }
    
    // ============================================================
    // การสร้างช่องการแจ้งเตือน (Android 8.0+) (Notification Channel Creation)
    // ============================================================
    
    /**
     * Create emergency alert channel with importance HIGH
     * This bypasses Do Not Disturb and lights up the screen
     */
    // สร้างช่องทางแจ้งเตือนระดับภัยพิบัติฉุกเฉิน (ตั้งค่าความสำคัญสูงพิเศษ ละเว้นโหมดห้ามรบกวน เปิดไฟแฟลชและระบบสั่นสะเทือน)
    public void createEmergencyNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        if (notificationManager.getNotificationChannel(CHANNEL_ID_EMERGENCY) != null) {
            return; // Channel already exists
        }
        
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID_EMERGENCY,
            "Emergency Alerts",
            NotificationManager.IMPORTANCE_HIGH
        );
        
        channel.setDescription("Critical disaster alerts that override DND mode");
        channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
        channel.enableLights(true);
        channel.setLightColor(context.getResources().getColor(R.color.emergencyRed));
        channel.enableVibration(true);
        channel.setVibrationPattern(new long[]{0, 100, 200, 300});
        channel.setBypassDnd(true); // Bypass DND
        
        notificationManager.createNotificationChannel(channel);
    }
    
    /**
     * Create background operations channel (lower priority for notifications)
     */
    // สร้างช่องทางแจ้งเตือนแบบทำงานเบื้องหลัง (ความสำคัญระดับต่ำ ปิดระบบสั่นเตือน)
    public void createBackgroundChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        if (notificationManager.getNotificationChannel(CHANNEL_ID_BACKGROUND) != null) {
            return;
        }
        
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID_BACKGROUND,
            "Background Operations",
            NotificationManager.IMPORTANCE_LOW
        );
        
        channel.setDescription("Background location tracking and monitoring");
        channel.enableVibration(false);
        
        notificationManager.createNotificationChannel(channel);
    }
    
    /**
     * Create SOS message channel
     */
    // สร้างช่องทางแจ้งเตือนระบบส่งสัญญาณช่วยเหลือฉุกเฉิน (SOS) (ความสำคัญสูง ปลุกโหมดห้ามรบกวน)
    public void createSOSChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        if (notificationManager.getNotificationChannel(CHANNEL_ID_SOS) != null) {
            return;
        }
        
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID_SOS,
            "SOS Messages",
            NotificationManager.IMPORTANCE_HIGH
        );
        
        channel.setDescription("Pending SOS messages awaiting transmission");
        channel.enableLights(true);
        channel.setLightColor(context.getResources().getColor(R.color.warningOrange));
        channel.enableVibration(true);
        channel.setBypassDnd(true);
        
        notificationManager.createNotificationChannel(channel);
    }
    
    // ============================================================
    // การหลีกเลี่ยงโหมดห้ามรบกวน (DND Bypass)
    // ============================================================
    
    /**
     * Check if notification policy access is granted (for DND bypass)
     */
    // ตรวจสอบว่าแอปได้รับสิทธิ์การละเว้นโหมดห้ามรบกวน (Do Not Disturb Bypass) หรือมีสิทธิ์แล้วหรือไม่
    public boolean isNotificationPolicyAccessGranted() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return notificationManager.isNotificationPolicyAccessGranted();
        }
        return true; // Assume granted on older devices
    }
    
    /**
     * Request notification policy access (for DND bypass)
     */
    // ขอสิทธิ์การละเว้นโหมดห้ามรบกวน เพื่อนำทางผู้ใช้ไปยังการตั้งค่าของ Android
    public void requestNotificationPolicyAccess(int requestCode) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(
                Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }
    
    /**
     * Request notification access settings
     */
    // เปิดหน้าการตั้งค่าเพื่อให้สิทธิ์การฟัง/เข้าถึงการแจ้งเตือน (Notification Listener Settings)
    public void requestNotificationAccess() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            Intent intent = new Intent(
                Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }
    
    // ============================================================
    // การประกอบการแจ้งเตือน (Notification Building)
    // ============================================================
    
    /**
     * Build emergency notification with full-screen intent
     * This will wake the screen and show over lock screen
     */
    // ประกอบการแจ้งเตือนภัยพิบัติ (ปรับไอคอนตามประเภทภัยพิบัติ เล่นเสียงสัญญาณเตือน และตั้งพารามิเตอร์แบบเต็มหน้าจอ)
    public NotificationCompat.Builder buildEmergencyNotification(
        String title,
        String message,
        String actionType,
        boolean showFullScreen
    ) {
        int iconRes = R.drawable.ic_stat_notification;
        int colorRes = R.color.emergencyRed;
        
        if (actionType != null) {
            String typeLower = actionType.toLowerCase();
            if (typeLower.contains("flood")) {
                iconRes = R.drawable.ic_flood;
                colorRes = R.color.infoBlue;
            } else if (typeLower.contains("landslide")) {
                iconRes = R.drawable.ic_landslide;
                colorRes = R.color.warningOrange;
            } else if (typeLower.contains("pm25") || typeLower.contains("pm2_5") || typeLower.contains("pollution") || typeLower.contains("pm2.5")) {
                iconRes = R.drawable.ic_pollution;
                colorRes = R.color.warningOrange;
            } else if (typeLower.contains("storm")) {
                iconRes = R.drawable.ic_storm;
                colorRes = R.color.warningOrange;
            } else if (typeLower.contains("tsunami") || typeLower.contains("earthquake")) {
                iconRes = R.drawable.ic_stat_notification;
                colorRes = R.color.emergencyRed;
            }
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID_EMERGENCY)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(iconRes)
            .setColor(context.getResources().getColor(colorRes))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ERROR)
            .setAutoCancel(true)
            .setShowWhen(true)
            .setWhen(System.currentTimeMillis())
            .setDefaults(NotificationCompat.DEFAULT_LIGHTS | NotificationCompat.DEFAULT_VIBRATE)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(message));
        
        Uri alarmUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_ALARM);
        if (alarmUri == null) {
            alarmUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION);
        }
        builder.setSound(alarmUri);
        
        // Add action button
        Intent acknowledgeIntent = new Intent(context, context.getClass());
        acknowledgeIntent.setAction("ACKNOWLEDGE_ALERT");
        acknowledgeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        PendingIntent acknowledgePendingIntent = PendingIntent.getActivity(
            context,
            0,
            acknowledgeIntent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_CANCEL_CURRENT
        );
        builder.addAction(R.drawable.ic_stat_notification, "Acknowledge", acknowledgePendingIntent);
        
        // Full-screen intent for critical alerts
        if (showFullScreen) {
            Intent fullScreenIntent = new Intent(context, EmergencyAlertActivity.class);
            fullScreenIntent.putExtra("alert_title", title);
            fullScreenIntent.putExtra("alert_message", message);
            fullScreenIntent.putExtra("alert_type", actionType);
            fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                1,
                fullScreenIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_CANCEL_CURRENT
            );
            
            builder.setFullScreenIntent(fullScreenPendingIntent, true); // true = bypass DND
        }
        
        return builder;
    }
    
    /**
     * Build background service notification (persistent in status bar)
     */
    // ประกอบการแจ้งเตือนสำหรับบริการเบื้องหลังแบบทำงานค้าง (Persistent Service Notification)
    public NotificationCompat.Builder buildBackgroundNotification(String title, String subtitle) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID_BACKGROUND)
            .setContentTitle(title)
            .setContentText(subtitle)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE);
        
        return builder;
    }
    
    /**
     * Build SOS pending notification
     */
    // ประกอบการแจ้งเตือนสัญญาณ SOS ที่ค้างอยู่ในคิวเตรียมพร้อมรอการส่งออก
    public NotificationCompat.Builder buildSOSNotification(String title, String message) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID_SOS)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(R.drawable.ic_stat_notification)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setCategory(NotificationCompat.CATEGORY_REMINDER);
        
        // Add vibration pattern for SOS
        builder.setVibrate(new long[]{0, 200, 100, 200, 100, 500});
        
        return builder;
    }
    
    // ============================================================
    // Show/Cancel Notifications
    // ============================================================
    
    /**
     * Show emergency notification (with full-screen intent)
     */
    // สั่งให้ระบบแสดงผลการแจ้งเตือนภัยพิบัติฉุกเฉินออกไปยังหน้าจอ (รวมการส่งเสียงไซเรนและตัวสั่น)
    public void showEmergencyNotification(
        String title,
        String message,
        String actionType,
        boolean showFullScreen
    ) {
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        
        // Check if we have permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return; // No permission
            }
        }
        
        Notification notification = buildEmergencyNotification(title, message, actionType, showFullScreen).build();
        notificationManager.notify(NOTIFICATION_ID_DISASTER_IMMINENT, notification);
        
        // Play siren sound
        playSirenSound();
        
        // Trigger haptics
        triggerEmergencyVibration();
    }
    
    /**
     * Show background service notification
     */
    // แสดงผลการแจ้งเตือนการทำงานเบื้องหลังบนแถบแจ้งเตือน
    public void showBackgroundNotification(String title, String subtitle) {
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        Notification notification = buildBackgroundNotification(title, subtitle).build();
        notificationManager.notify(NOTIFICATION_ID_BACKGROUND, notification);
    }
    
    /**
     * Cancel background notification
     */
    // ยกเลิกและซ่อนแถบการแจ้งเตือนการทำงานเบื้องหลัง
    public void cancelBackgroundNotification() {
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.cancel(NOTIFICATION_ID_BACKGROUND);
    }
    
    /**
     * Show SOS pending notification
     */
    // แสดงผลการแจ้งเตือนระบบ SOS พิกัดฉุกเฉิน
    public void showSOSNotification(String title, String message) {
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        
        Notification notification = buildSOSNotification(title, message).build();
        notificationManager.notify(NOTIFICATION_ID_SOS_PENDING, notification);
    }
    
    /**
     * Cancel all notifications
     */
    // สั่งล้างหรือยกเลิกการแสดงผลการแจ้งเตือนทั้งหมดของแอปนี้
    public void cancelAllNotifications() {
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.cancelAll();
    }
    
    // ============================================================
    // Sound & Vibration
    // ============================================================
    
    /**
     * Play siren sound (5 seconds looped)
     */
    // เล่นเสียงไซเรนแจ้งเตือนภัยพิบัติฉุกเฉิน
    public void playSirenSound() {
        // Implementation will be handled by AudioAttributes if needed
        // For now, relies on notification sound configuration
    }
    
    /**
     * Trigger emergency-level vibration pattern
     */
    // เปิดระบบสั่นเตือนภัยฉุกเฉิน
    public void triggerEmergencyVibration() {
        // Implementation will be handled by Haptics plugin if needed
        // Vibration pattern: 0ms delay, 100ms, 200ms, 300ms
        // This is handled in the notification builder
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if device has notification access
     */
    // ตรวจสอบความถูกต้องว่าแอปได้รับสิทธิ์ในการโพสต์/แสดงการแจ้งเตือน (Notification Access) แล้วหรือยัง
    public boolean hasNotificationAccess() {
        // This is checked via Settings.Secure.getEnabledNotificationListeners
        // For now, assume true if POST_NOTIFICATIONS permission is granted
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
               context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }
}
