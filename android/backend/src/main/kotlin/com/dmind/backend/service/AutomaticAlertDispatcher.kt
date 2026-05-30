package com.dmind.backend.service

import com.dmind.backend.GatewayConfig
import com.dmind.backend.DeviceTokenRegistry
import com.dmind.backend.FcmHttpV1Sender
import com.dmind.backend.NotificationSendRequest
import kotlinx.coroutines.*
import java.util.concurrent.ConcurrentHashMap

// ออบเจกต์ระบบตรวจสอบเฝ้าระวังภัยและแจ้งเตือนภัยพิบัติอัตโนมัติ (เช่น แจ้งเตือนฝุ่นละออง PM2.5)
internal object AutomaticAlertDispatcher {
    // บันทึกเวลาที่ส่งการแจ้งเตือนล่าสุดแยกตามสถานที่และประเภท เพื่อใช้ในการทำ Cooldown
    private val lastSentAlerts = ConcurrentHashMap<String, Long>()
    // กำหนดเวลา Cooldown 1 ชั่วโมง เพื่อป้องกันไม่ให้ส่งแจ้งเตือนซ้ำๆ รบกวนผู้ใช้งานมากเกินไป
    private const val COOLDOWN_MS = 3600_000L

    // ข้อมูลของพิกัดสถานที่ในระบบที่ทำการเฝ้าระวังภัยพิบัติและสภาพแวดล้อม
    data class MonitoredLocation(
        val name: String,
        val latitude: Double,
        val longitude: Double
    )

    // รายการพิกัดพื้นที่หลักที่ระบบทำการตรวจสอบเป็นระยะ
    val monitoredLocations = listOf(
        MonitoredLocation("กรุงเทพมหานคร (Bangkok)", 13.7563, 100.5018),
        MonitoredLocation("เชียงใหม่ (Chiang Mai)", 18.7883, 98.9853),
        MonitoredLocation("สุราษฎร์ธานี (Surat Thani)", 9.1400, 99.3333)
    )

    // เริ่มการทำงานระบบเฝ้าระวังเบื้องหลัง (Background Worker) ด้วย Coroutine
    fun start(
        config: GatewayConfig,
        deviceRegistry: DeviceTokenRegistry,
        dataAggregator: DataAggregatorService,
        scope: CoroutineScope
    ) {
        scope.launch {
            // หน่วงเวลา 15 วินาทีเมื่อเซิร์ฟเวอร์เริ่มทำงาน เพื่อรอให้ส่วนอื่นพร้อมทำงานเต็มที่
            delay(15_000)
            while (isActive) {
                try {
                    evaluateAndDispatchAlerts(config, deviceRegistry, dataAggregator, force = false)
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    println("AutomaticAlertDispatcher background loop error: ${e.message}")
                }
                // ตรวจสอบข้อมูลความปลอดภัยซ้ำทุกๆ 10 นาที
                delay(600_000)
            }
        }
    }

    // ฟังก์ชันดึงข้อมูลสิ่งแวดล้อมมาประเมิน หากดัชนีฝุ่นละออง PM2.5 สูงเกินค่าปกติ จะแจ้งเตือนผู้ใช้ทันที
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
