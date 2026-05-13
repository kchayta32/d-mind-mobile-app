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
public class PowerConnectionReceiver extends BroadcastReceiver {
    
    private static final String TAG = "PowerConnectionReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        
        if (Intent.ACTION_POWER_CONNECTED.equals(action)) {
            Log.d(TAG, "Power connected - battery charging started");
            
            // User is charging - optimize battery usage
            // Background services can run more aggressively
            Toast.makeText(context, "D-MIND: Charging connected. Optimizing background services...", Toast.LENGTH_SHORT).show();
            
        } else if (Intent.ACTION_POWER_DISCONNECTED.equals(action)) {
            Log.d(TAG, "Power disconnected - battery discharging started");
            
            // User unplugged - optimize battery usage
            // Background services should be more conservative
            Toast.makeText(context, "D-MIND: Charging disconnected. Power-saving mode enabled...", Toast.LENGTH_SHORT).show();
            
        } else if (Intent.ACTION_BATTERY_CHANGED.equals(action)) {
            // Battery level changed (for all battery events)
            // This is a sticky broadcast, so handle carefully
            
            int level = intent.getIntExtra("level", -1);
            int scale = intent.getIntExtra("scale", -1);
            
            if (level != -1 && scale != -1) {
                int batteryPercent = (level * 100) / scale;
                
                if (batteryPercent < 15) {
                    Log.w(TAG, "Low battery warning: " + batteryPercent + "%");
                    // Show low battery warning to user
                    Toast.makeText(context, "D-MIND: Low battery (" + batteryPercent + "%). Background services may be limited.", Toast.LENGTH_LONG).show();
                }
            }
        }
    }
}
