package com.dmind.app.ui.screens.dashboard

import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.Severity
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

class HomeSummaryTest {
    @Test
    fun `aggregates home hazard counts by type`() {
        val counts = aggregateHomeHazardCounts(
            listOf(
                event("eq", HazardType.Earthquake),
                event("flood", HazardType.Flood),
                event("fire", HazardType.Fire),
                event("storm", HazardType.Storm),
                event("heat", HazardType.Heat),
            ),
            now = Instant.parse("2026-05-16T12:00:00Z"),
        )

        assertEquals(1, counts.earthquake)
        assertEquals(1, counts.flood)
        assertEquals(1, counts.wildfire)
        assertEquals(1, counts.storm)
    }

    @Test
    fun `filters parseable events to last 24 hours`() {
        val now = Instant.parse("2026-05-16T12:00:00Z")
        val counts = aggregateHomeHazardCounts(
            listOf(
                event("recent-flood", HazardType.Flood, "2026-05-16T03:00:00Z"),
                event("old-fire", HazardType.Fire, "2026-05-14T03:00:00Z"),
                event("recent-storm", HazardType.Storm, "2026-05-15T12:00:00Z"),
            ),
            now = now,
        )

        assertEquals(0, counts.earthquake)
        assertEquals(1, counts.flood)
        assertEquals(0, counts.wildfire)
        assertEquals(1, counts.storm)
    }

    @Test
    fun `falls back to all events when timestamps cannot be parsed`() {
        val counts = aggregateHomeHazardCounts(
            listOf(
                event("eq", HazardType.Earthquake, "recent"),
                event("flood", HazardType.Flood, ""),
            ),
            now = Instant.parse("2026-05-16T12:00:00Z"),
        )

        assertEquals(1, counts.earthquake)
        assertEquals(1, counts.flood)
    }

    private fun event(
        id: String,
        type: HazardType,
        updatedAt: String = "recent",
    ) = DisasterEvent(
        id = id,
        type = type,
        title = id,
        description = id,
        latitude = 13.0,
        longitude = 100.0,
        severity = Severity.Watch,
        metric = "-",
        source = "test",
        updatedAt = updatedAt,
        recommendedAction = "-",
    )
}
