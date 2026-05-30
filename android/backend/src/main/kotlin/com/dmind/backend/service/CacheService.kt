package com.dmind.backend.service

import java.util.concurrent.ConcurrentHashMap

/**
 * Simple in-memory cache with TTL support.
 * Thread-safe via ConcurrentHashMap.
 */
// ระบบหน่วยความจำแคชภายในหน่วยความจำรองรับการกำหนดอายุข้อมูล (TTL) และมีความปลอดภัยในการเรียกใช้แบบมัลติเธรด
class CacheService(private val defaultTtlMs: Long = 5 * 60 * 1000L) {
    // โครงสร้างของข้อมูลที่จัดเก็บในแคชพร้อมกับระบุเวลาหมดอายุ (Expires Timestamp)
    private data class CacheEntry(val value: Any, val expiresAt: Long)

    // ตัวแปรสำหรับจัดเก็บข้อมูลแคชประเภท Key-Value ในรูปแบบ ConcurrentHashMap
    private val cache = ConcurrentHashMap<String, CacheEntry>()

    // ฟังก์ชันค้นหาข้อมูลในแคชตาม Key หากพบข้อมูลที่ไม่หมดอายุจะส่งคืนทันที มิฉะนั้นจะดึงข้อมูลใหม่จากแหล่งอื่นมาบันทึกและส่งคืน
    @Suppress("UNCHECKED_CAST")
    suspend fun <T> getOrFetch(key: String, ttlMs: Long = defaultTtlMs, fetcher: suspend () -> T): T {
        val entry = cache[key]
        if (entry != null && System.currentTimeMillis() < entry.expiresAt) {
            return entry.value as T
        }
        val value = fetcher()
        cache[key] = CacheEntry(value as Any, System.currentTimeMillis() + ttlMs)
        return value
    }

    // ลบข้อมูลที่บันทึกอยู่ในแคชด้วย Key ที่เจาะจง
    fun invalidate(key: String) {
        cache.remove(key)
    }

    // ล้างข้อมูลในแคชทั้งหมดเพื่อเคลียร์หน่วยความจำ
    fun invalidateAll() {
        cache.clear()
    }
}
