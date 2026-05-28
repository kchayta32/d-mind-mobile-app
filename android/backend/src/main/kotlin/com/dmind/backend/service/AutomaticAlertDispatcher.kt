package com.dmind.backend.service

import com.dmind.backend.GatewayConfig
import com.dmind.backend.DeviceTokenRegistry
import com.dmind.backend.FcmHttpV1Sender
import com.dmind.backend.NotificationSendRequest
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap

object AutomaticAlertDispatcher {
    private val lastSentAlerts = ConcurrentHashMap<String, Long>()
    private const val COOLDOWN_MS = 3600_000L // 1 hour cooldown for duplicate alerts

    data class MonitoredLocation(
        val name: String,
        val latitude: Double,
        val longitude: Double
    )

    val monitoredLocations = listOf(
        MonitoredLocation("กรุงเทพมหานคร (Bangkok)", 13.7563, 100.5018),
        MonitoredLocation("เชียงใหม่ (Chiang Mai)", 18.7883, 98.9853),
        MonitoredLocation("สุราษฎร์ธานี (Surat Thani)", 9.1400, 99.3333)
    )

    fun start(
        config: GatewayConfig,
        deviceRegistry: DeviceTokenRegistry,
        dataAggregator: DataAggregatorService,
        scope: CoroutineScope
    ) {
        scope.launch {
            // Initial delay to let application start up completely
            delay(15_000)
            while (isActive) {
                try {
                    evaluateAndDispatchAlerts(config, deviceRegistry, dataAggregator, force = false)
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    println("AutomaticAlertDispatcher background loop error: ${e.message}")
                }
                // Check every 10 minutes (600,000 ms) in background
                delay(600_000)
            }
        }
    }

    suspend fun evaluateAndDispatchAlerts(
        config: GatewayConfig,
        deviceRegistry: DeviceTokenRegistry,
        dataAggregator: DataAggregatorService,
        force: Boolean = false
    ): String = coroutineScope {
        var alertCount = 0
        var notificationCount = 0
        val details = mutableListOf<String>()

        val sender = FcmHttpV1Sender.fromConfig(config)
        val now = System.currentTimeMillis()

        for (location in monitoredLocations) {
            try {
                // Fetch environmental metrics using DataAggregatorService
                val metrics = dataAggregator.getEnvironmentalData(location.latitude, location.longitude)
                
                // 1. River Discharge check
                val discharge = metrics.openMeteoRiverDischarge
                if (discharge != null) {
                    if (discharge > 5.0) {
                        val key = "${location.name}:flood"
                        val lastSent = lastSentAlerts[key] ?: 0L
                        if (force || (now - lastSent > COOLDOWN_MS)) {
                            val title = "เฝ้าระวังน้ำท่วมขัง/น้ำล้นตลิ่ง"
                            val message = "ตรวจพบอัตราการไหลของน้ำที่ ${location.name} สูงถึง ${String.format("%.2f", discharge)} m³/s (เกณฑ์เฝ้าระวัง 5.0 m³/s) โปรดระมัดระวัง"
                            
                            val targets = deviceRegistry.resolveTargets(NotificationSendRequest(title, message, "flood", broadcast = true))
                            if (targets.isNotEmpty() && sender.isConfigured) {
                                targets.forEach { token ->
                                    sender.send(token, NotificationSendRequest(title, message, "flood", token = token))
                                }
                                notificationCount += targets.size
                            }
                            lastSentAlerts[key] = now
                            alertCount++
                            details.add("Triggered flood alert for ${location.name} (${discharge} m3/s)")
                        } else {
                            details.add("Flood threshold exceeded at ${location.name} but on cooldown")
                        }
                    }
                }

                // 2. Soil Moisture landslide check
                val soilMoisture = metrics.openMeteoSoilMoisture
                if (soilMoisture != null) {
                    if (soilMoisture > 0.40) {
                        val key = "${location.name}:landslide"
                        val lastSent = lastSentAlerts[key] ?: 0L
                        if (force || (now - lastSent > COOLDOWN_MS)) {
                            val title = "แจ้งเตือนความเสี่ยงดินสไลด์"
                            val message = "ตรวจพบปริมาณความชื้นในดินที่ ${location.name} สูงถึง ${String.format("%.2f", soilMoisture)} m³/m³ บ่งชี้ความเสี่ยงดินสไลด์สูง"
                            
                            val targets = deviceRegistry.resolveTargets(NotificationSendRequest(title, message, "landslide", broadcast = true))
                            if (targets.isNotEmpty() && sender.isConfigured) {
                                targets.forEach { token ->
                                    sender.send(token, NotificationSendRequest(title, message, "landslide", token = token))
                                }
                                notificationCount += targets.size
                            }
                            lastSentAlerts[key] = now
                            alertCount++
                            details.add("Triggered landslide alert for ${location.name} (${soilMoisture} m3/m3)")
                        } else {
                            details.add("Landslide threshold exceeded at ${location.name} but on cooldown")
                        }
                    }
                }

                // 3. PM2.5 check
                val pm25 = metrics.openMeteoPm25 ?: metrics.pm25
                if (pm25 > 50.0) {
                    val key = "${location.name}:pm25"
                    val lastSent = lastSentAlerts[key] ?: 0L
                    if (force || (now - lastSent > COOLDOWN_MS)) {
                        val title = "แจ้งเตือนคุณภาพอากาศเกินมาตรฐาน"
                        val message = "ดัชนีฝุ่นละออง PM2.5 ที่ ${location.name} สูงถึง ${String.format("%.1f", pm25)} µg/m³ ซึ่งเกินค่ามาตรฐานความปลอดภัย"
                        
                        val targets = deviceRegistry.resolveTargets(NotificationSendRequest(title, message, "pm25", broadcast = true))
                        if (targets.isNotEmpty() && sender.isConfigured) {
                            targets.forEach { token ->
                                sender.send(token, NotificationSendRequest(title, message, "pm25", token = token))
                            }
                            notificationCount += targets.size
                        }
                        lastSentAlerts[key] = now
                        alertCount++
                        details.add("Triggered PM2.5 alert for ${location.name} (${pm25} ug/m3)")
                    } else {
                        details.add("PM2.5 threshold exceeded at ${location.name} but on cooldown")
                    }
                }

            } catch (e: Exception) {
                details.add("Error evaluating ${location.name}: ${e.message}")
            }
        }

        if (details.isEmpty()) {
            return@coroutineScope "No thresholds exceeded. Evaluated ${monitoredLocations.size} locations."
        } else {
            return@coroutineScope "Evaluated ${monitoredLocations.size} locations. Sent $alertCount alert types, dispatched $notificationCount push notifications. Details: ${details.joinToString("; ")}"
        }
    }
}
