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
public class BootCompleteReceiver extends BroadcastReceiver {
    
    private static final String TAG = "BootCompleteReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        
        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            Intent.ACTION_REBOOT.equals(action)) {
            
            Log.d(TAG, "Device boot completed. Restarting background services...");

            if (!BackgroundLocationService.isMarkedRunning(context)) {
                Log.d(TAG, "Background monitoring was not enabled before reboot; skipping service restart");
                SOSQueueWorker.enqueue(context);
                return;
            }
            
            // Restart BackgroundLocationService
            Intent bgServiceIntent = new Intent(context, BackgroundLocationService.class);
            bgServiceIntent.setAction(BackgroundLocationService.ACTION_START);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(bgServiceIntent);
            } else {
                context.startService(bgServiceIntent);
            }

            SOSQueueWorker.enqueue(context);
            
            Log.d(TAG, "Background services restarted successfully");
        }
    }
}
