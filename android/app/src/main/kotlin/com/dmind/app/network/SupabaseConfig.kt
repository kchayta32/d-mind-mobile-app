package com.dmind.app.network

import com.dmind.app.BuildConfig

// ออบเจกต์จัดเก็บค่าคอนฟิกูเรชันสำหรับการเข้าถึงบริการ Supabase
object SupabaseConfig {
    // ค่า URL หลักสำหรับโครงการ Supabase
    val url: String = BuildConfig.SUPABASE_URL.trimEnd('/')
    // ค่า Anonymous Key สำหรับเข้าถึงข้อมูลทั่วไปที่ไม่ได้ผ่านระบบยืนยันตัวตนระดับสูง
    val anonKey: String = BuildConfig.SUPABASE_ANON_KEY
    // รหัสประจำโครงการ (Project ID) ของ Supabase
    val projectId: String = BuildConfig.SUPABASE_PROJECT_ID

    // ตรวจสอบว่าแอปมีรายละเอียดข้อมูลเชื่อมต่อกับเซิร์ฟเวอร์ Supabase ครบถ้วนแล้วหรือไม่
    val isConfigured: Boolean
        get() = url.startsWith("https://") && anonKey.isNotBlank()
}
