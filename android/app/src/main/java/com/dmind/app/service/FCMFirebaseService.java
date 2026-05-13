package com.dmind.app.service;

import android.content.Intent;
import android.util.Log;

import com.dmind.app.util.EmergencyNotificationManager;
import com.dmind.app.util.FCMTokenRegistrar;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

/**
 * Handles Firebase data-only messages and escalates critical disaster alerts to
 * local emergency notifications/full-screen alerts.
 */
public class FCMFirebaseService extends FirebaseMessagingService {

    private static final String TAG = "FCMFirebaseService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        if (data == null || data.isEmpty()) {
            Log.d(TAG, "Ignoring FCM message without data payload");
            return;
        }

        String alertType = data.get("alert_type");
        if (alertType == null || alertType.trim().isEmpty()) {
            Log.d(TAG, "Ignoring FCM data message without alert_type");
            return;
        }

        String title = data.get("alert_title");
        String message = data.get("alert_message");
        EmergencyNotificationManager emergencyManager = new EmergencyNotificationManager(this);
        emergencyManager.triggerEmergencyAlert(
            title != null && !title.trim().isEmpty() ? title : "Emergency Disaster Alert",
            message != null && !message.trim().isEmpty() ? message : "You are in a danger zone. Seek safety immediately.",
            alertType
        );
    }

    @Override
    public void onNewToken(String token) {
        Log.d(TAG, "FCM token refreshed");
        new Thread(() -> FCMTokenRegistrar.registerTokenIfConfigured(this, token)).start();
    }

    public void triggerLocalTestAlert(String alertType, String title, String message) {
        EmergencyNotificationManager emergencyManager = new EmergencyNotificationManager(this);
        emergencyManager.triggerEmergencyAlert(title, message, alertType);
    }
}
