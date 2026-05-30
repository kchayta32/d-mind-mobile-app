package com.dmind.app.ui.screens.dashboard

import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.HazardType
import java.time.Instant
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

// คลาสข้อมูลเก็บผลรวมจำนวนภัยพิบัติแต่ละประเภทเพื่อแสดงบนหน้าจอแดชบอร์ด
data class HomeHazardCounts(
    val earthquake: Int = 0,
    val flood: Int = 0,
    val wildfire: Int = 0,
    val storm: Int = 0,
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

    return HomeHazardCounts(
        earthquake = recentEvents.count { it.type == HazardType.Earthquake },
        flood = recentEvents.count { it.type == HazardType.Flood },
        wildfire = recentEvents.count { it.type == HazardType.Fire },
        storm = recentEvents.count { it.type == HazardType.Storm },
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
