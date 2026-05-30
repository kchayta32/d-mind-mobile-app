package com.dmind.app.network

import com.dmind.app.BuildConfig

// ออบเจกต์จัดเก็บค่าคอนฟิกและการตั้งค่าที่เกี่ยวข้องสำหรับโมเดลปัญญาประดิษฐ์ภาษาไทย (Thai LLM)
object ThaiLlmConfig {
    // ที่อยู่โฮสต์ URL ของเซิร์ฟเวอร์ผู้ให้บริการ AI API
    val baseUrl: String = BuildConfig.DMIND_THAI_LLM_BASE_URL.trimEnd('/')
    // คีย์เข้าถึงข้อมูลความปลอดภัย (API Key) สำหรับเรียกใช้งาน AI
    val apiKey: String = BuildConfig.DMIND_THAI_LLM_API_KEY
    // ชื่อของโมเดล AI ที่ต้องการรันผลสนทนา (หากไม่ได้กรอกจะใช้โมเดลดีฟอลต์พยากรณ์เป็น Typhoon)
    val model: String = BuildConfig.DMIND_THAI_LLM_MODEL.ifBlank { "typhoon-s-thaillm-8b-instruct" }

    // ตรวจสอบว่าแอปมีรายละเอียดการตั้งค่า URL และ API Key ของโมเดล AI ครบถ้วนหรือไม่
    val isConfigured: Boolean
        get() = (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) && apiKey.isNotBlank()
}
