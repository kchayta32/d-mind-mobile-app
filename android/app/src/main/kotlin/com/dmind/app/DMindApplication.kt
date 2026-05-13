package com.dmind.app

import android.app.Application
import android.util.Log
import com.dmind.app.util.EmergencyNotificationManager
import com.dmind.app.util.FCMTokenRegistrar
import com.google.firebase.messaging.FirebaseMessaging

class DMindApplication : Application() {
    private val tag = "DMindApplication"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        refreshFcmToken()
    }

    private fun createNotificationChannels() {
        val emergencyManager = EmergencyNotificationManager(this)
        emergencyManager.notificationHelper.createEmergencyNotificationChannel()
        emergencyManager.notificationHelper.createBackgroundChannel()
        emergencyManager.notificationHelper.createSOSChannel()
    }

    private fun refreshFcmToken() {
        try {
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    Log.w(tag, "Unable to refresh FCM token", task.exception)
                    return@addOnCompleteListener
                }

                val token = task.result
                if (!token.isNullOrBlank()) {
                    Thread {
                        FCMTokenRegistrar.registerTokenIfConfigured(this, token)
                    }.start()
                }
            }
        } catch (e: IllegalStateException) {
            Log.w(tag, "Firebase is not configured; skipping FCM token registration", e)
        }
    }
}
