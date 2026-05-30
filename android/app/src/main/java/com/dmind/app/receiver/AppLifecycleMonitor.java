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
// ตัวตรวจจับวงจรชีวิตของแอปพลิเคชันเพื่อจัดการการแจ้งเตือนภัยพิบัติฉุกเฉินตามสถานะการเปิด/ปิดแอป
public class AppLifecycleMonitor implements DefaultLifecycleObserver {
    
    private static final String TAG = "AppLifecycleMonitor";
    
    // ตัวแปรการจัดการแจ้งเตือนฉุกเฉินและสถานะเบื้องหลัง
    private EmergencyNotificationManager emergencyManager;
    private boolean isBackground = false;
    
    // คอนสตรักเตอร์เตรียมตัวจัดการสำหรับการแจ้งเตือนภัย
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
        
        // สร้างช่องทางการแจ้งเตือนภัยฉุกเฉินและการทำงานเบื้องหลังเมื่อสร้างหน้าจอ
        emergencyManager.getNotificationHelper().createEmergencyNotificationChannel();
        emergencyManager.getNotificationHelper().createBackgroundChannel();
    }
    
    @Override
    public void onStart(LifecycleOwner owner) {
        Log.d(TAG, "Application onStart");
        
        // กำหนดสถานะว่าแอปไม่ได้ทำงานอยู่ในเบื้องหลังแล้ว
        isBackground = false;
    }
    
    @Override
    public void onResume(LifecycleOwner owner) {
        Log.d(TAG, "Application onResume");
        
        isBackground = false;
        
        // ตรวจสอบความถูกต้องของการตั้งค่าประหยัดแบตเตอรี่ในอุปกรณ์
        checkBatteryOptimization();
    }
    
    @Override
    public void onPause(LifecycleOwner owner) {
        Log.d(TAG, "Application onPause");
        
        isBackground = true;
        
        // ยกเลิกข้อความแจ้งเตือนด่วนบนแถบแจ้งเตือนเมื่อแอปถูกพักไว้ชั่วคราว
        emergencyManager.cancelAllNotifications();
    }
    
    @Override
    public void onStop(LifecycleOwner owner) {
        Log.d(TAG, "Application onStop");
        
        // กำหนดสถานะว่าแอปพลิเคชันลงไปทำงานอยู่ในเบื้องหลัง (Background)
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
    // ตรวจสอบว่าแอปถูกจำกัดพลังงานหรือประหยัดแบตเตอรี่โดยระบบปฏิบัติการหรือไม่
    private void checkBatteryOptimization() {
        // การตรวจสอบนี้แยกไปทำในระดับหน้าจอ BatteryOptimizationSettingsActivity
        
        Log.d(TAG, "Battery optimization check (handled separately)");
    }
    
    // ============================================================
    // Emergency Alert Management
    // ============================================================
    
    /**
     * Check if emergency alert should trigger full-screen intent
     * This should be called from EmergencyNotificationManager
     */
    // ตรวจสอบว่าประเภทการเตือนภัยที่ได้รับ ควรเปิดการเตือนภัยแบบเต็มหน้าจอทันทีหรือไม่
    public boolean shouldTriggerFullScreenAlert(String alertType) {
        // เหตุการณ์วิกฤติ เช่น สึนามิ แผ่นดินไหว และน้ำท่วม จะบังคับเปิดเต็มหน้าจอเสมอ
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
    // ยกเลิกการแสดงผลการแจ้งเตือนฉุกเฉินทั้งหมดที่ค้างอยู่
    public void cancelEmergencyAlerts() {
        emergencyManager.cancelAllNotifications();
    }
    
    // ============================================================
    // Utility Methods
    // ============================================================
    
    /**
     * Check if app is in background
     */
    // ตรวจสอบว่าปัจจุบันแอปพลิเคชันทำงานอยู่ในเบื้องหลังหรือไม่
    public boolean isAppInBackground() {
        return isBackground;
    }
    
    /**
     * Get emergency notification manager
     */
    // เข้าถึงตัวจัดการการส่งข้อมูลแจ้งเตือนฉุกเฉิน
    public EmergencyNotificationManager getEmergencyManager() {
        return emergencyManager;
    }
}
