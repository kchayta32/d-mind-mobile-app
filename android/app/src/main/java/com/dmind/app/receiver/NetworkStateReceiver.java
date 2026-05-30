package com.dmind.app.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.dmind.app.worker.SOSQueueWorker;

/**
 * NetworkStateReceiver - Monitors network connectivity for SOS queue processing.
 */
// ตัวรับสัญญาณการเปลี่ยนแปลงการเชื่อมต่ออินเทอร์เน็ต (Network State Change) เพื่อจัดคิวส่งข้อความ SOS
public class NetworkStateReceiver extends BroadcastReceiver {
    
    private static final String TAG = "NetworkStateReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        // ดึงตัวจัดการการเชื่อมต่อเครือข่ายของระบบ Android
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        
        // ตรวจสอบว่ามีการเชื่อมต่ออินเทอร์เน็ตอยู่หรือไม่
        boolean isConnected = activeNetwork != null && activeNetwork.isConnectedOrConnecting();
        
        // หากกลับมาเชื่อมต่อเน็ตได้ ให้เริ่มส่งข้อความขอความช่วยเหลือ SOS ที่บันทึกค้างไว้ตอนออฟไลน์ทันที
        if (isConnected) {
            Log.d(TAG, "Network connected - processing offline SOS queue");
            SOSQueueWorker.enqueue(context);
        } else {
            Log.d(TAG, "Network disconnected - SOS messages will be queued");
        }
    }
}
