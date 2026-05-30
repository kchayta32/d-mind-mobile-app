package com.dmind.app

import android.app.Application
import android.util.Log
import com.dmind.app.util.EmergencyNotificationManager
import com.dmind.app.util.FCMTokenRegistrar
import com.google.firebase.messaging.FirebaseMessaging

// คลาส Application หลักของแอปพลิเคชัน DMind
class DMindApplication : Application() {
    // ชื่อแท็กสำหรับใช้ในการบันทึก Log
    private val tag = "DMindApplication"

    companion object {
        // ตัวแปร instance สำหรับเข้าถึงอินสแตนซ์ของ DMindApplication แบบ Singleton
        lateinit var instance: DMindApplication
            private set
    }

    // ฟังก์ชันที่ทำงานเมื่อเริ่มต้นแอปพลิเคชัน
    override fun onCreate() {
        instance = this
        super.onCreate()
        // สร้างช่องทางสำหรับการแจ้งเตือนต่างๆ
        createNotificationChannels()
        // อัปเดตและลงทะเบียน FCM Token
        refreshFcmToken()
    }

    // ฟังก์ชันสร้างช่องทางสำหรับการแจ้งเตือนเหตุฉุกเฉินและบริการพื้นหลัง
    private fun createNotificationChannels() {
        val emergencyManager = EmergencyNotificationManager(this)
        emergencyManager.notificationHelper.createEmergencyNotificationChannel()
        emergencyManager.notificationHelper.createBackgroundChannel()
        emergencyManager.notificationHelper.createSOSChannel()
    }

    // ฟังก์ชันสำหรับดึงและลงทะเบียน FCM Token เพื่อใช้ในการส่งการแจ้งเตือน
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
