package com.dmind.app.service;

import android.app.IntentService;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.Nullable;

import com.dmind.app.R;
import com.dmind.app.database.AlertsCacheDAO;
import com.dmind.app.util.EmergencyNotificationManager;
import com.dmind.app.worker.SOSQueueWorker;

/**
 * FCMDataMessageService - Handles Firebase Cloud Messaging data-only messages
 * for background processing of disaster alerts.
 * 
 * This service:
 * 1. Receives FCM data messages (no display notification)
 * 2. Processes alerts in the background
 * 3. Triggers emergency notifications if needed
 * 4. Works even when app is not running
 * 
 * NOTE: FCM data messages have size limit (~2KB total, ~1KB per key).
 * For larger payloads, use Firebase Storage or backend API.
 */
// คลาสสำหรับประมวลผลข้อความ Firebase Cloud Messaging (FCM) ชนิดข้อมูลอย่างเดียว (Data-Only Message) ในเบื้องหลัง
public class FCMDataMessageService extends IntentService {
    
    private static final String TAG = "FCMDataMessageService";
    
    public static final String ACTION_PROCESS_MESSAGE = "com.dmind.app.PROCESS_FCM_MESSAGE";
    public static final String ACTION_FLUSH_SOS_QUEUE = "com.dmind.app.FLUSH_SOS_QUEUE";
    public static final String EXTRA_FCM_DATA = "fcm_data";
    public static final String EXTRA_ALERT_TYPE = "alert_type";
    public static final String EXTRA_ALERT_MESSAGE = "alert_message";
    public static final String EXTRA_ALERT_RADIUS = "alert_radius";
    public static final String EXTRA_ALERT_POLYGON = "alert_polygon";
    
    /**
     * Constructor
     */
    // คอนสตรักเตอร์ของ Service เพื่อระบุชื่อสำหรับจัดการเธรดเบื้องหลัง
    public FCMDataMessageService() {
        super(TAG);
    }
    
    // เรียกใช้งานเมื่อสร้าง Service เพื่อตั้งค่าเริ่มต้นและบันทึก Log
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service created");
    }
    
    // จัดการอินเทนต์ที่ถูกส่งเข้ามาทำงานในคิวงาน (Background Thread ของ IntentService)
    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        if (intent != null) {
            String action = intent.getAction();
            
            if (ACTION_PROCESS_MESSAGE.equals(action)) {
                handleFCMDataMessage(intent);
            } else if (ACTION_FLUSH_SOS_QUEUE.equals(action)) {
                flushSOSQueue();
            }
        }
        
        // Release the wake lock
        // FCM handles this automatically, but good practice to clean up
    }
    
    // เรียกใช้งานเมื่อทำลาย Service เพื่อบันทึก Log และเคลียร์ทรัพยากร
    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "Service destroyed");
    }
    
    // ============================================================
    // การจัดการข้อความ (Message Handling)
    // ============================================================
    
    /**
     * Process FCM data message
     */
    // แยกและตรวจสอบข้อมูลการแจ้งเตือนจาก FCM data message เพื่อนำไปประมวลผลต่อ
    private void handleFCMDataMessage(Intent intent) {
        try {
            // Get FCM data bundle
            // Note: In production, use FirebaseMessagingService for real FCM messages
            // This IntentService is for handling pre-received messages
            
            // For actual FCM integration, use FirebaseMessagingService instead
            // See example below:
            
            Log.d(TAG, "Processing FCM data message...");
            
            // Extract alert data (in production, get from RemoteMessage.getData())
            String alertType = intent.getStringExtra(EXTRA_ALERT_TYPE);
            String alertMessage = intent.getStringExtra(EXTRA_ALERT_MESSAGE);
            double alertRadius = intent.getDoubleExtra(EXTRA_ALERT_RADIUS, 0);
            String alertPolygon = intent.getStringExtra(EXTRA_ALERT_POLYGON);
            
            // Process the alert
            if (alertType != null && !alertType.isEmpty()) {
                processAlert(alertType, alertMessage, alertRadius, alertPolygon);
            } else {
                Log.w(TAG, "Received FCM message with no alert type");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error processing FCM message", e);
        }
    }
    
    /**
     * Process disaster alert from FCM
     */
    // ประมวลผลและตัดสินใจว่าจะส่งการแจ้งเตือนภัยพิบัติโดยอิงตามประเภท ขอบเขตพื้นที่ หรือพิกัดของผู้ใช้หรือไม่
    private void processAlert(String alertType, String message, double radius, String polygon) {
        Log.d(TAG, "Processing alert: " + alertType);
        
        // Check if user is in danger zone (if polygon provided)
        if (polygon != null && !polygon.isEmpty()) {
            // Parse polygon and check location
            // This will be implemented with GeofenceUtils
            Log.d(TAG, "Checking user location against danger zone polygon");
        } else if (radius > 0) {
            // Check if user is within radius of alert center
            Log.d(TAG, "Checking user location against radius: " + radius + "m");
        }
        
        // Trigger emergency notification if needed
        if (alertType != null) {
            EmergencyNotificationManager emergencyManager = new EmergencyNotificationManager(this);
            emergencyManager.triggerEmergencyAlert(
                getAlertTitle(alertType),
                message != null ? message : getAlertMessage(alertType),
                alertType
            );
        }
    }

    // สั่งให้ WorkManager ทำการส่งสัญญาณ SOS ที่ค้างอยู่ในคิวออกไปทันที
    private void flushSOSQueue() {
        SOSQueueWorker.enqueue(this);
    }
    
    /**
     * Get alert title based on type
     */
    // คืนค่าหัวข้อข้อความแจ้งเตือนตามประเภทภัยพิบัติ (ไทย / อังกฤษ)
    private String getAlertTitle(String alertType) {
        switch (alertType.toLowerCase()) {
            case "flood":
            case "flooding":
                return "น้ำท่วมฉุกเฉิน! / EmergencyFlooding!";
            case "tsunami":
                return "สึนามิ! / Tsunami!";
            case "earthquake":
                return "แผ่นดินไหว! / Earthquake!";
            case "landslide":
                return "ดินถล่ม! / Landslide!";
            case "storm":
                return "พายุ! / Storm!";
            default:
                return "ภัยพิบัติ! / Disaster!";
        }
    }
    
    /**
     * Get default alert message based on type
     */
    // คืนค่าเนื้อหาข้อความแจ้งเตือนเริ่มต้นตามประเภทภัยพิบัติ (ไทย / อังกฤษ)
    private String getAlertMessage(String alertType) {
        switch (alertType.toLowerCase()) {
            case "flood":
            case "flooding":
                return "น้ำท่วมกำลังapproachพื้นที่ของคุณ! 抓紧เวลาอพยพ! / Flooding approaching your area! Evacuate immediately!";
            case "tsunami":
                return "สึนามิถูกตรวจจับ! ทันทีหลบหนีไปยังพื้นที่สูง! / Tsunami detected! Move to high ground immediately!";
            case "earthquake":
                return "แผ่นดินไหว! หาที่กำบังและอยู่ในปลอดภัย! / Earthquake! Find cover and stay safe!";
            case "landslide":
                return "ดินถล่มใกล้พื้นที่ของคุณ! หลบหนีทันที! / Landslide near your area! Evacuate immediately!";
            case "storm":
                return "พายุรุนแรงกำลังapproach! หาที่กำบัง! / Severe storm approaching! Seek shelter!";
            default:
                return "ภัยพิบัติใกล้พื้นที่ของคุณ! เตรียมพร้อมรับมือ! / Disaster approaching your area! Prepare for impact!";
        }
    }
    
    // ============================================================
    // FCM Integration (for actual Firebase implementation)
    // ============================================================
    
    /**
     * This is how you would implement actual FCM message handling
     * using FirebaseMessagingService (recommended approach)
     * 
     * To use, create FCMFirebaseService.java:
     */
    
    /**
     * Example FCMMessageHandler class (create this separately):
     * 
     * public class FCMFirebaseService extends FirebaseMessagingService {
     * 
     *     @Override
     *     public void onMessageReceived(RemoteMessage remoteMessage) {
     *         // Check if message is a data message
     *         if (remoteMessage.getData().size() > 0) {
     *             // Process data message
     *             Map<String, String> data = remoteMessage.getData();
     *             
     *             // Start IntentService to process message
     *             Intent intent = new Intent(this, FCMDataMessageService.class);
     *             intent.setAction(FCMDataMessageService.ACTION_PROCESS_MESSAGE);
     *             intent.putExtra(FCMDataMessageService.EXTRA_FCM_DATA, data);
     *             startService(intent);
     *         }
     *     }
     * 
     *     @Override
     *     public void onNewToken(String token) {
     *         // Send token to your backend
     *         sendRegistrationToServer(token);
     *     }
     * 
     *     private void sendRegistrationToServer(String token) {
     *         // Implement token registration with your backend
     *         // Your backend will use this token to send targeted FCM messages
     *     }
     * }
     * 
     * AndroidManifest.xml:
     * <service
     *     android:name=".service.FCMFirebaseService"
     *     android:exported="false">
     *     <intent-filter>
     *         <action android:name="com.google.firebase.MESSAGING_EVENT" />
     *     </intent-filter>
     * </service>
     */
}
