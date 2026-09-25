package com.dmind.app.ui.screens.dashboard

import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.HazardType
import java.time.Instant
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.Locale

// ข้อมูลสถิติของเหตุการณ์ในแต่ละช่วง 1 ชั่วโมง
data class HourlyHazardPoint(
    val hourLabel: String = "",
    val hour: Int = 0,
    val total: Int = 0,
    val earthquake: Int = 0,
    val flood: Int = 0,
    val wildfire: Int = 0,
    val storm: Int = 0,
)

// คลาสข้อมูลเก็บผลรวมจำนวนภัยพิบัติแต่ละประเภทเพื่อแสดงบนหน้าจอแดชบอร์ด พร้อมการแจกแจงรายชั่วโมง
data class HomeHazardCounts(
    val earthquake: Int = 0,
    val flood: Int = 0,
    val wildfire: Int = 0,
    val storm: Int = 0,
    val total: Int = earthquake + flood + wildfire + storm,
    val lastUpdated: String = "",
    val hourlyTrend: List<HourlyHazardPoint> = emptyList(),
)

/**
 * Aggregate event counts for the dashboard's 24-hour summary.
 *
 * Tries to parse ISO 8601 timestamps and filter to the last 24 hours.
 * Falls back to using all events when timestamps cannot be parsed,
 * avoiding the previous bug where the "contains T" check matched
 * every ISO timestamp and returned all events unconditionally.
 */
// ฟังก์ชันหลักสำหรับรวมผลสถิติภัยพิบัติที่อัปเดตล่าสุดในรอบ 24 ชั่วโมง
fun aggregateHomeHazardCounts(events: List<DisasterEvent>): HomeHazardCounts {
    return aggregateHomeHazardCounts(events, Instant.now())
}

internal fun aggregateHomeHazardCounts(
    events: List<DisasterEvent>,
    now: Instant,
): HomeHazardCounts {
    val cutoff = now.minusSeconds(24 * 60 * 60)
    val parsedEvents = events.mapNotNull { event ->
        parseEventInstant(event.updatedAt)?.let { event to it }
    }

    val recentEvents = if (parsedEvents.isEmpty()) {
        events
    } else {
        parsedEvents
            .filter { (_, eventTime) -> !eventTime.isBefore(cutoff) }
            .map { (event, _) -> event }
    }

    val zoneId = ZoneId.of("Asia/Bangkok")
    val hourFormatter = DateTimeFormatter.ofPattern("HH:00", Locale("th", "TH")).withZone(zoneId)
    val timeFormatter = DateTimeFormatter.ofPattern("HH:mm", Locale("th", "TH")).withZone(zoneId)
    val lastUpdatedStr = "${timeFormatter.format(now)} น."

    // สร้าง 24 ช่วงเวลาสำหรับสถิติรายชั่วโมง (จาก 23 ชม. ก่อน จนถึงชม. ปัจจุบัน)
    val hourlyBuckets = (23 downTo 0).map { hoursAgo ->
        val bucketInstant = now.minusSeconds(hoursAgo * 3600L)
        val zdt = bucketInstant.atZone(zoneId)
        HourlyHazardPoint(
            hourLabel = hourFormatter.format(bucketInstant),
            hour = zdt.hour,
            total = 0,
            earthquake = 0,
            flood = 0,
            wildfire = 0,
            storm = 0,
        )
    }.toMutableList()

    // กระจายเหตุการณ์ที่พาร์สเวลาได้ลงใน bucket
    parsedEvents
        .filter { (_, eventTime) -> !eventTime.isBefore(cutoff) && !eventTime.isAfter(now) }
        .forEach { (event, eventTime) ->
            val secondsSinceCutoff = eventTime.epochSecond - cutoff.epochSecond
            val bucketIndex = (secondsSinceCutoff / 3600).toInt().coerceIn(0, 23)
            val current = hourlyBuckets[bucketIndex]
            val isEq = event.type == HazardType.Earthquake
            val isFlood = event.type == HazardType.Flood
            val isFire = event.type == HazardType.Fire
            val isStorm = event.type == HazardType.Storm
            hourlyBuckets[bucketIndex] = current.copy(
                total = current.total + 1,
                earthquake = current.earthquake + if (isEq) 1 else 0,
                flood = current.flood + if (isFlood) 1 else 0,
                wildfire = current.wildfire + if (isFire) 1 else 0,
                storm = current.storm + if (isStorm) 1 else 0,
            )
        }

    val eqCount = recentEvents.count { it.type == HazardType.Earthquake }
    val floodCount = recentEvents.count { it.type == HazardType.Flood }
    val fireCount = recentEvents.count { it.type == HazardType.Fire }
    val stormCount = recentEvents.count { it.type == HazardType.Storm }

    return HomeHazardCounts(
        earthquake = eqCount,
        flood = floodCount,
        wildfire = fireCount,
        storm = stormCount,
        total = eqCount + floodCount + fireCount + stormCount,
        lastUpdated = lastUpdatedStr,
        hourlyTrend = hourlyBuckets,
    )
}

// ฟังก์ชันพาร์สวันที่และเวลาจากรูปแบบ String เป็นวัตถุ Instant
private fun parseEventInstant(value: String): Instant? {
    if (value.isBlank()) return null
    return parseOrNull { Instant.parse(value) }
        ?: parseOrNull { OffsetDateTime.parse(value).toInstant() }
        ?: parseOrNull { LocalDateTime.parse(value).atZone(ZoneId.systemDefault()).toInstant() }
}

private inline fun parseOrNull(block: () -> Instant): Instant? {
    return try {
        block()
    } catch (_: DateTimeParseException) {
        null
    }
}
