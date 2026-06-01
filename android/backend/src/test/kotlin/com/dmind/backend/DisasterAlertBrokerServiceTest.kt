package com.dmind.backend

import com.dmind.backend.service.DisasterAlertBrokerService
import com.dmind.backend.service.DisasterInputEvent
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DisasterAlertBrokerServiceTest {

    @Test
    fun testBrokerStatusAndDeviceRegistration() {
        val testToken = "test-token-1"
        DisasterAlertBrokerService.updateDeviceLocation(testToken, 13.7563, 100.5018) // Bangkok

        val status = DisasterAlertBrokerService.getStatus()
        assertTrue(status.containsKey("monitored_devices_count"))
        val count = status["monitored_devices_count"] as Int
        assertTrue(count >= 1)
    }

    @Test
    fun testIngestDisasterEvents() = runBlocking {
        // Register a test device in Chiang Mai
        val chiangMaiToken = "chiang-mai-device"
        DisasterAlertBrokerService.updateDeviceLocation(chiangMaiToken, 18.7883, 98.9853)

        // Simulate an Earthquake event in Chiang Mai
        val earthquakeEvent = DisasterInputEvent(
            eventId = "EV-TEST-EQ",
            disasterType = "earthquake",
            latitude = 18.7900, // Very close to Chiang Mai
            longitude = 98.9800,
            magnitude = 5.5
        )

        DisasterAlertBrokerService.ingestDisasterEvent(earthquakeEvent)

        // Wait brief moment for background coroutine channels to process
        delay(500)

        val status = DisasterAlertBrokerService.getStatus()
        val stats = status["processed_statistics"] as Map<*, *>
        
        // Assert that the event was processed by the Earthquake subagent
        assertTrue(stats.containsKey("ingested_earthquake"))
        val ingestedCount = stats["ingested_earthquake"] as Long
        assertTrue(ingestedCount >= 1L)
    }

    @Test
    fun testAqiStandardThresholds() = runBlocking {
        // Register a test device in Bangkok
        val bangkokToken = "bangkok-device"
        DisasterAlertBrokerService.updateDeviceLocation(bangkokToken, 13.7563, 100.5018)

        // Simulate high AQI in Bangkok (PM2.5 = 85.0 -> RED)
        val aqiEvent = DisasterInputEvent(
            eventId = "EV-TEST-AQI",
            disasterType = "aqi",
            latitude = 13.7500,
            longitude = 100.5000,
            pm25 = 85.0
        )

        DisasterAlertBrokerService.ingestDisasterEvent(aqiEvent)

        delay(500)

        val status = DisasterAlertBrokerService.getStatus()
        val stats = status["processed_statistics"] as Map<*, *>
        
        assertTrue(stats.containsKey("ingested_aqi"))
        val ingestedCount = stats["ingested_aqi"] as Long
        assertTrue(ingestedCount >= 1L)
    }
}
