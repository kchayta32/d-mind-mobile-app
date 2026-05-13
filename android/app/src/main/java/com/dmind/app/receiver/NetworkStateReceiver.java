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
public class NetworkStateReceiver extends BroadcastReceiver {
    
    private static final String TAG = "NetworkStateReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        
        boolean isConnected = activeNetwork != null && activeNetwork.isConnectedOrConnecting();
        
        if (isConnected) {
            Log.d(TAG, "Network connected - processing offline SOS queue");
            SOSQueueWorker.enqueue(context);
        } else {
            Log.d(TAG, "Network disconnected - SOS messages will be queued");
        }
    }
}
