package com.dmind.app.network

import android.content.Context
import java.util.UUID

// ออบเจกต์จัดหาและสร้างรหัสประจำการติดตั้งของอุปกรณ์เครื่องนี้ (Installation ID) เพื่อใช้จำแนกอุปกรณ์ในการทำรายงาน
object InstallationIdProvider {
    // ชื่อของไฟล์ SharedPreferences ที่ใช้บันทึกค่าสถานะเฉพาะของแอป
    private const val PREFS = "dmind_native"
    // คีย์ที่ใช้เก็บค่า Installation ID
    private const val KEY_INSTALLATION_ID = "installation_id"

    // ฟังก์ชันตรวจสอบและดึงไอดีประจำการติดตั้ง หากเป็นครั้งแรกของการใช้งาน จะทำการสุ่มขึ้นใหม่ด้วย UUID และบันทึกเก็บไว้
    @JvmStatic
    fun get(context: Context): String {
        val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val existing = prefs.getString(KEY_INSTALLATION_ID, null)
        if (!existing.isNullOrBlank()) return existing

        val created = UUID.randomUUID().toString()
        prefs.edit().putString(KEY_INSTALLATION_ID, created).apply()
        return created
    }
}
