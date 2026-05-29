package com.dmind.app.data.map

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DisasterMapRepositoryTest {
    @Test
    fun testSoilMoistureCoordinatesCount() {
        // Task 2 requires expanding coordinates list to ~50 points
        val coords = DisasterMapRepository.soilMoistureCoordinates
        assertEquals(50, coords.size)
    }

    @Test
    fun testRiverDischargeCoordinates() {
        // Task 1: Check river names and coordinate count
        val coords = DisasterMapRepository.riverDischargeCoordinates
        assertEquals(24, coords.size)
        
        // Check river name grouping logic
        val riverNames = coords.map { it.name.substringBefore(" - ").trim() }.distinct()
        assertEquals(7, riverNames.size)
        assertTrue(riverNames.contains("Ping River"))
        assertTrue(riverNames.contains("Yom River"))
        assertTrue(riverNames.contains("Nan River"))
        assertTrue(riverNames.contains("Chao Phraya River"))
        assertTrue(riverNames.contains("Chi River"))
        assertTrue(riverNames.contains("Mun River"))
        assertTrue(riverNames.contains("Mekong River"))
    }
}
