package com.dmind.app.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

/**
 * PowerConnectionReceiver - Monitors power events for battery management.
 * 
 * This receiver tracks:
 * 1. ChargingConnected - User plugs in charger
 * 2. ChargingDisconnected - User unplugs charger
 * 
 * This helps optimize battery usage for the background services.
 */
// ตัวรับสัญญาณเหตุการณ์การเชื่อมต่อสายชาร์จและสถานะแบตเตอรี่ (Power Connection & Battery Status)
public class PowerConnectionReceiver extends BroadcastReceiver {
    
    private static final String TAG = "PowerConnectionReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        
        // ตรวจสอบว่ามีสัญญาณเชื่อมต่อสายชาร์จเข้ามาหรือไม่
        if (Intent.ACTION_POWER_CONNECTED.equals(action)) {
            Log.d(TAG, "Power connected - battery charging started");
            
            // เมื่อชาร์จไฟอยู่ สามารถปรับการทำงานของบริการเบื้องหลังให้ทำงานถี่ขึ้นได้ (ก้าวร้าวขึ้น)
            Toast.makeText(context, "D-MIND: Charging connected. Optimizing background services...", Toast.LENGTH_SHORT).show();
            
        // ตรวจสอบว่ามีการถอดสายชาร์จออกหรือไม่
        } else if (Intent.ACTION_POWER_DISCONNECTED.equals(action)) {
            Log.d(TAG, "Power disconnected - battery discharging started");
            
            // เมื่อถอดสายชาร์จ ควรปรับปรุงให้ใช้พลังงานอย่างประหยัดเพื่อยืดระยะเวลาเปิดเครื่อง
            Toast.makeText(context, "D-MIND: Charging disconnected. Power-saving mode enabled...", Toast.LENGTH_SHORT).show();
            
        // ตรวจสอบสัญญาณการเปลี่ยนแปลงระดับแบตเตอรี่
        } else if (Intent.ACTION_BATTERY_CHANGED.equals(action)) {
            // ค่าเปอร์เซ็นต์ปัจจุบันของแบตเตอรี่
            
            int level = intent.getIntExtra("level", -1);
            int scale = intent.getIntExtra("scale", -1);
            
            if (level != -1 && scale != -1) {
                int batteryPercent = (level * 100) / scale;
                
                // แจ้งเตือนผู้ใช้หากระดับแบตเตอรี่ต่ำกว่า 15% เนื่องจากอาจส่งผลต่อความถี่ในการตรวจสอบพิกัดเบื้องหลัง
                if (batteryPercent < 15) {
                    Log.w(TAG, "Low battery warning: " + batteryPercent + "%");
                    // แสดงข้อความเตือนบนหน้าจอ
                    Toast.makeText(context, "D-MIND: Low battery (" + batteryPercent + "%). Background services may be limited.", Toast.LENGTH_LONG).show();
                }
            }
        }
    }
}
