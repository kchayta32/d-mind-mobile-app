package com.dmind.app.network

import com.dmind.app.BuildConfig

// ออบเจกต์สำหรับกำหนดค่าคอนฟิกหลักระบบ Backend ของแอปพลิเคชัน
object BackendConfig {
    // ที่อยู่ URL หลัก (Base URL) ของระบบหลังบ้านโดยตัดเครื่องหมาย '/' ตัวสุดท้ายออกเพื่อความถูกต้องในการนำไปเชื่อมต่อ
    val baseUrl: String = BuildConfig.BACKEND_BASE_URL.trimEnd('/')
}
