package com.dmind.app.data

import android.Manifest
import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.dmind.app.R
import com.dmind.app.activity.BatteryOptimizationSettingsActivity
import com.dmind.app.database.AlertsCacheDAO
import com.dmind.app.domain.ReliabilityStatus
import com.dmind.app.network.BackendConfig
import com.dmind.app.service.BackgroundLocationService
import com.dmind.app.util.EmergencyNotificationManager
import com.dmind.app.util.FCMTokenRegistrar
import com.dmind.app.worker.SOSQueueWorker
import com.google.firebase.messaging.FirebaseMessaging

class NativeStatusRepository(private val context: Context) {
    private val appContext = context.applicationContext

    fun refreshStatus(): ReliabilityStatus {
        val dao = AlertsCacheDAO(appContext)
        return ReliabilityStatus(
            locationGranted = hasLocationPermission(),
            backgroundLocationGranted = hasBackgroundLocationPermission(),
            notificationGranted = hasNotificationPermission(),
            batteryIgnoring = isIgnoringBatteryOptimizations(),
            dndGranted = hasDndAccess(),
            monitoring = BackgroundLocationService.isMarkedRunning(appContext),
            pendingSOSCount = dao.pendingSOSMessages.size,
            sosEndpointConfigured = BackendConfig.baseUrl.isNotBlank(),
            fcmTokenEndpointConfigured = FCMTokenRegistrar.isEndpointConfigured(appContext),
            fcmTokenAvailable = FCMTokenRegistrar.getToken(appContext).isNotEmpty(),
        )
    }

    fun startMonitoring(): Boolean {
        if (!hasLocationPermission()) return false

        val intent = Intent(appContext, BackgroundLocationService::class.java)
            .setAction(BackgroundLocationService.ACTION_START)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            appContext.startForegroundService(intent)
        } else {
            appContext.startService(intent)
        }
        return true
    }

    fun stopMonitoring() {
        val intent = Intent(appContext, BackgroundLocationService::class.java)
            .setAction(BackgroundLocationService.ACTION_STOP)
        appContext.startService(intent)
    }

    fun queueDemoSOS(): Long {
        val batteryLevel = getBatteryLevel()
        val id = AlertsCacheDAO(appContext).enqueueSOS(
            "native-user",
            13.7563,
            100.5018,
            batteryLevel,
            "SOS requested from the native D-MIND app",
        )
        SOSQueueWorker.enqueue(appContext)
        EmergencyNotificationManager(appContext)
            .triggerSOSNotification("SOS queued", "SOS will be sent when the backend is reachable.")
        return id
    }

    fun triggerDemoAlert() {
        EmergencyNotificationManager(appContext).triggerEmergencyAlert(
            "D-MIND emergency test",
            "This is a native full-screen alert test.",
            "flood",
        )
    }

    fun refreshFcmToken(onComplete: (Boolean) -> Unit) {
        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                val token = task.result
                val ok = task.isSuccessful && !token.isNullOrBlank()
                if (ok) {
                    Thread {
                        FCMTokenRegistrar.registerTokenIfConfigured(appContext, token)
                        onComplete(true)
                    }.start()
                } else {
                    onComplete(false)
                }
            }
    }

    fun openBatterySettings(activity: Activity) {
        activity.startActivity(Intent(activity, BatteryOptimizationSettingsActivity::class.java))
    }

    fun openAppSettings(activity: Activity) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
        intent.data = android.net.Uri.parse("package:${activity.packageName}")
        activity.startActivity(intent)
    }

    fun openDndSettings(activity: Activity) {
        activity.startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
    }

    private fun hasLocationPermission(): Boolean =
        ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun hasBackgroundLocationPermission(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
            ContextCompat.checkSelfPermission(appContext, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun hasNotificationPermission(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(appContext, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    private fun isIgnoringBatteryOptimizations(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
        val powerManager = appContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
        return powerManager?.isIgnoringBatteryOptimizations(appContext.packageName) == true
    }

    private fun hasDndAccess(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true
        val manager = appContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        return manager?.isNotificationPolicyAccessGranted == true
    }

    private fun getBatteryLevel(): Int {
        val batteryManager = appContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
    }
}
