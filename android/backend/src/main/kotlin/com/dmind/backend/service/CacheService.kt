package com.dmind.backend.service

import java.util.concurrent.ConcurrentHashMap

/**
 * Simple in-memory cache with TTL support.
 * Thread-safe via ConcurrentHashMap.
 */
class CacheService(private val defaultTtlMs: Long = 5 * 60 * 1000L) {
    private data class CacheEntry(val value: Any, val expiresAt: Long)

    private val cache = ConcurrentHashMap<String, CacheEntry>()

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

    fun invalidate(key: String) {
        cache.remove(key)
    }

    fun invalidateAll() {
        cache.clear()
    }
}
