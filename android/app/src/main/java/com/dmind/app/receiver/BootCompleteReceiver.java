package com.dmind.app.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.dmind.app.service.BackgroundLocationService;
import com.dmind.app.worker.SOSQueueWorker;

/**
 * BootCompleteReceiver - Restarts background services after device reboot.
 * 
 * This ensures continuous operation even after device restart.
 */
// ตัวรับสัญญาณแจ้งเตือนระบบบูตเครื่องเสร็จสิ้น (Boot Complete) เพื่อเปิดการทำงานของระบบตรวจสอบภัยพิบัติเบื้องหลังใหม่อัตโนมัติ
public class BootCompleteReceiver extends BroadcastReceiver {
    
    private static final String TAG = "BootCompleteReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        
        // ตรวจสอบสัญญาณว่าตรงกับบูตระบบเสร็จสิ้น รีสตาร์ตอุปกรณ์ หรือการบูตด่วน (Quickboot)
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            Intent.ACTION_REBOOT.equals(action)) {
            
            Log.d(TAG, "Device boot completed. Restarting background services...");

            // หากสถานะเดิมก่อนปิดเครื่องไม่ได้บันทึกว่าเปิดทำงานเบื้องหลัง ให้ข้ามการเริ่มบริการเบื้องหลังและเรียกตัวส่ง SOS ที่ค้างไว้
            if (!BackgroundLocationService.isMarkedRunning(context)) {
                Log.d(TAG, "Background monitoring was not enabled before reboot; skipping service restart");
                SOSQueueWorker.enqueue(context);
                return;
            }
            
            // เตรียมเรียกการรันบริการตรวจจับตำแหน่งเบื้องหลัง (BackgroundLocationService)
            Intent bgServiceIntent = new Intent(context, BackgroundLocationService.class);
            bgServiceIntent.setAction(BackgroundLocationService.ACTION_START);
            
            // เปิดใช้งานบริการแบบ Foreground Service ตามรุ่นของระบบปฏิบัติการ Android
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(bgServiceIntent);
            } else {
                context.startService(bgServiceIntent);
            }

            // รันคิวระบบส่งข้อมูลช่วยเหลือฉุกเฉิน (SOS) ที่ตกค้าง
            SOSQueueWorker.enqueue(context);
            
            Log.d(TAG, "Background services restarted successfully");
        }
    }
}
