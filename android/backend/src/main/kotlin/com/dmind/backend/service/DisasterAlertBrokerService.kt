package com.dmind.backend.service

import com.dmind.backend.DeviceTokenRegistry
import com.dmind.backend.FcmHttpV1Sender
import com.dmind.backend.NotificationSendRequest
import com.dmind.backend.GatewayConfig
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.serialization.Serializable
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.*

/**
 * DisasterAlertBrokerService: ระบบโบรคเกอร์คิวจำลองและการทำงานร่วมกันระหว่าง Primary Agent และ 5 Subagents
 * ขับเคลื่อนแบบ Asynchronous / Non-blocking ด้วย Kotlin Coroutines และ Channels
 */
@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
object DisasterAlertBrokerService {

    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    // ─── 1. โครงสร้างคิวของข้อมูล (Message Queue Topics จำลอง) ───
    // คิวอินพุตแยกตามประเภทภัยพิบัติสำหรับ Subagents
    private val earthquakeChannel = Channel<DisasterInputEvent>(Channel.UNLIMITED)
    private val aqiChannel = Channel<DisasterInputEvent>(Channel.UNLIMITED)
    private val floodChannel = Channel<DisasterInputEvent>(Channel.UNLIMITED)
    private val weatherChannel = Channel<DisasterInputEvent>(Channel.UNLIMITED)
    private val landslideChannel = Channel<DisasterInputEvent>(Channel.UNLIMITED)

    // คิวรวมผลลัพธ์จาก Subagents ส่งกลับมายัง Primary Agent (Aggregator Queue)
    private val processedAlertsChannel = Channel<SubagentProcessedAlert>(Channel.UNLIMITED)

    // ─── 2. บันทึกข้อมูลพิกัดสมมติของอุปกรณ์ (Mock Device Location Registry) ───
    // ในระบบจริง ข้อมูลนี้จะดึงจากตำแหน่งล่าสุดของแอป หรือระบบลงทะเบียน Geofence
    private val deviceLocations = ConcurrentHashMap<String, Pair<Double, Double>>()

    // สถิติการประมวลผลสำหรับทำ Dashboard / Health Check
    private val eventCounter = ConcurrentHashMap<String, Long>()
    private val lastAlertTimestamps = ConcurrentHashMap<String, Long>() // Cooldown check: key = token:alertType

    // ระยะ Cooldown เพื่อไม่ให้ส่งแจ้งเตือนซ้ำภายใน 5 นาทีสำหรับการจำลอง (ในระบบจริงอาจเป็น 1 ชั่วโมง)
    private const val COOLDOWN_MS = 300_000L

    init {
        // เริ่มต้นการทำงานของ Subagents และ Primary Agent ในลักษณะ Asynchronous Workers
        startWorkers()
    }

    /**
     * ลงทะเบียน/อัปเดตตำแหน่งพิกัดของอุปกรณ์ผู้ใช้งานเพื่อใช้ในการตรวจสอบ Geofencing
     */
    fun updateDeviceLocation(token: String, latitude: Double, longitude: Double) {
        deviceLocations[token] = Pair(latitude, longitude)
    }

    /**
     * รับข้อมูลดิบภัยพิบัติ (Ingestion Point) และส่งต่อเข้าคิวของ Subagent ที่รับผิดชอบ
     */
    fun ingestDisasterEvent(event: DisasterInputEvent) {
        scope.launch {
            val countKey = "ingested_${event.disasterType}"
            eventCounter[countKey] = (eventCounter[countKey] ?: 0L) + 1L
            
            when (event.disasterType.lowercase()) {
                "earthquake" -> earthquakeChannel.send(event)
                "aqi" -> aqiChannel.send(event)
                "flood" -> floodChannel.send(event)
                "weather", "storm" -> weatherChannel.send(event)
                "landslide", "landsubsidence" -> landslideChannel.send(event)
            }
        }
    }

    /**
     * ดึงข้อมูลสรุปสถานะคิวและการประมวลผลในปัจจุบัน
     */
    fun getStatus(): Map<String, Any> {
        return mapOf(
            "monitored_devices_count" to deviceLocations.size,
            "processed_statistics" to eventCounter,
            "earthquake_queue_empty" to earthquakeChannel.isEmpty,
            "aqi_queue_empty" to aqiChannel.isEmpty,
            "flood_queue_empty" to floodChannel.isEmpty,
            "weather_queue_empty" to weatherChannel.isEmpty,
            "landslide_queue_empty" to landslideChannel.isEmpty
        )
    }

    /**
     * สั่งการรัน Workers (Subagents และ Primary Agent) ขนานกัน
     */
    private fun startWorkers() {
        // 1. Earthquake Subagent
        scope.launch {
            for (event in earthquakeChannel) {
                processEarthquake(event)
            }
        }

        // 2. AQI Subagent
        scope.launch {
            for (event in aqiChannel) {
                processAqi(event)
            }
        }

        // 3. Flood Subagent
        scope.launch {
            for (event in floodChannel) {
                processFlood(event)
            }
        }

        // 4. Weather Subagent
        scope.launch {
            for (event in weatherChannel) {
                processWeather(event)
            }
        }

        // 5. Landslide Subagent
        scope.launch {
            for (event in landslideChannel) {
                processLandslide(event)
            }
        }

        // 6. Primary Agent Aggregator / Listener
        // รับผิดชอบการดักฟังคิวรวม processed-alerts และรวบรวมผลลัพธ์ส่งไปยัง FCM
        scope.launch {
            // โหลด Config เพื่อนำมาสร้าง FCM Sender
            val config = GatewayConfig.fromEnvironment()
            val sender = FcmHttpV1Sender.fromConfig(config)
            
            for (alert in processedAlertsChannel) {
                val lastSentKey = "${alert.deviceToken}:${alert.alertType}"
                val now = System.currentTimeMillis()
                val lastSent = lastAlertTimestamps[lastSentKey] ?: 0L

                // จัดการ Cooldown และ Priority: ระดับ RED จะได้บายพาส Cooldown หรือขัดจังหวะการคิวก่อน
                if (alert.severity == "RED" || (now - lastSent > COOLDOWN_MS)) {
                    // ทำการส่งแจ้งเตือนจริงผ่าน FCM V1 Sender
                    if (sender.isConfigured) {
                        val request = NotificationSendRequest(
                            title = alert.title,
                            message = alert.message,
                            alertType = alert.alertType,
                            token = alert.deviceToken,
                            recommendation = alert.recommendation,
                            leadTimeSeconds = alert.leadTimeSeconds?.toString(),
                            extraActionUrl = alert.extraActionUrl,
                            extraIcon = alert.extraIcon,
                            mmi = alert.mmi,
                            severity = alert.severity
                        )
                        sender.send(alert.deviceToken, request)
                    } else {
                        // แสดงข้อความจำลองใน Log หากยังไม่ได้ผูกกุญแจ Firebase จริง
                        println("[SIMULATION PUSH] To: ${alert.deviceToken} | Type: ${alert.alertType} | Severity: ${alert.severity}")
                        println("Title: ${alert.title}")
                        println("Body: ${alert.message}")
                        alert.recommendation?.let { println("Recommendation: $it") }
                        alert.leadTimeSeconds?.let { println("Lead Time: $it seconds") }
                        alert.extraActionUrl?.let { println("Action URL: $it") }
                        alert.extraIcon?.let { println("Icon: $it") }
                        alert.mmi?.let { println("MMI Scale: $it") }
                        println("----------------------------------------")
                    }
                    
                    lastAlertTimestamps[lastSentKey] = now
                    val countKey = "dispatched_${alert.alertType}"
                    eventCounter[countKey] = (eventCounter[countKey] ?: 0L) + 1L
                }
            }
        }
    }

    // ─── 3. ฟังก์ชันประมวลผลย่อย Geofencing & Severity ของแต่ละ Subagent ───

    private suspend fun processEarthquake(event: DisasterInputEvent) {
        val lat = event.latitude ?: return
        val lon = event.longitude ?: return
        val mag = event.magnitude ?: 0.0

        // กำหนดระดับความรุนแรงตามมาตรฐานกรมอุตุฯ, MMI และรัศมีรับผลกระทบ
        val (severity, radiusKm, mmi) = when {
            mag >= 5.0 -> Triple("RED", 200.0, "MMI VI-VII (สั่นไหวรุนแรงมาก โครงสร้างเสียหาย)")
            mag >= 3.0 -> Triple("ORANGE", 50.0, "MMI III-V (สั่นไหวปานกลาง สั่นสะเทือนในอาคาร)")
            else -> Triple("YELLOW", 10.0, "MMI I-II (สั่นไหวเล็กน้อย รู้สึกได้บางจุด)")
        }

        // คัดกรองอุปกรณ์ผู้ใช้อ้างอิง Geofencing
        deviceLocations.forEach { (token, loc) ->
            val dist = calculateDistance(lat, lon, loc.first, loc.second)
            if (dist <= radiusKm) {
                // คำนวณเวลาคลื่นเคลื่อนที่ล่วงหน้า (คลื่น S เดินทางประมาณ 4 กม./วินาที)
                val leadTime = (dist / 4.0).toInt().coerceIn(1, 60)
                
                val title = when (severity) {
                    "RED" -> "🔴 แผ่นดินไหวขนาดใหญ่ - อพยพด่วน"
                    "ORANGE" -> "🟧 เตือนภัยแผ่นดินไหว - เตรียมรับมือ"
                    else -> "⚠️ เฝ้าระวังแผ่นดินไหว"
                }
                
                val msg = "เกิดแผ่นดินไหวขนาด ${String.format("%.1f", mag)} ริกเตอร์ ($mmi) ห่างจากคุณ ${String.format("%.1f", dist)} กม. คาดว่าคลื่นหลักจะมาถึงในอีก $leadTime วินาที"
                val recommendation = "ขณะเกิดแผ่นดินไหว: หมอบใต้โต๊ะ อยู่ในที่โล่งแจ้ง ห้ามใช้ลิฟต์"

                processedAlertsChannel.send(
                    SubagentProcessedAlert(
                        eventId = event.eventId,
                        alertType = "earthquake",
                        severity = severity,
                        deviceToken = token,
                        title = title,
                        message = msg,
                        recommendation = recommendation,
                        leadTimeSeconds = leadTime,
                        mmi = mmi,
                        extraIcon = "earthquake_alert_icon"
                    )
                )
            }
        }
    }

    private suspend fun processAqi(event: DisasterInputEvent) {
        val lat = event.latitude ?: return
        val lon = event.longitude ?: return
        val pm25 = event.pm25 ?: 0.0
        val radiusKm = 15.0 // สถานีตรวจวัดคลุมพื้นที่รัศมี 15 กม.

        // เกณฑ์ดัชนีฝุ่นและระดับสีแจ้งเตือนกรมควบคุมมลพิษ (เกิน 50 µg/m³)
        val severity = when {
            pm25 > 75.0 -> "RED"         // มีผลกระทบต่อสุขภาพ (สีแดง)
            pm25 > 37.5 -> "ORANGE"      // เริ่มมีผลกระทบต่อสุขภาพ (สีส้ม)
            else -> "GREEN"
        }

        if (severity == "GREEN") return

        deviceLocations.forEach { (token, loc) ->
            val dist = calculateDistance(lat, lon, loc.first, loc.second)
            if (dist <= radiusKm) {
                val title = when (severity) {
                    "RED" -> "🔴 คุณภาพอากาศมีผลกระทบต่อสุขภาพ (สีแดง)"
                    else -> "🟧 คุณภาพอากาศเริ่มมีผลกระทบต่อสุขภาพ (สีส้ม)"
                }
                
                val msg = "ค่าฝุ่น PM2.5 ในพื้นที่ของท่านอยู่ที่ ${String.format("%.1f", pm25)} µg/m³ (เกินเกณฑ์มาตรฐาน 50 µg/m³)"
                val recommendation = when (severity) {
                    "RED" -> "มีผลกระทบต่อสุขภาพ: แนะนำผู้ใช้งานทุกคนสวมหน้ากาก N95 และจำกัดเวลาทำกิจกรรมกลางแจ้ง"
                    else -> "เริ่มมีผลกระทบต่อสุขภาพ: แนะนำผู้ป่วยระบบทางเดินหายใจ เด็ก และผู้สูงอายุ ให้หลีกเลี่ยงกิจกรรมกลางแจ้ง"
                }

                processedAlertsChannel.send(
                    SubagentProcessedAlert(
                        eventId = event.eventId,
                        alertType = "aqi",
                        severity = severity,
                        deviceToken = token,
                        title = title,
                        message = msg,
                        recommendation = recommendation,
                        extraIcon = "mask_icon"
                    )
                )
            }
        }
    }

    private suspend fun processFlood(event: DisasterInputEvent) {
        val lat = event.latitude ?: return
        val lon = event.longitude ?: return
        val rain24h = event.rain24h ?: 0.0
        val radiusKm = 5.0 // รัศมีประเมินน้ำท่วม 5 กม.

        // แยกการเตือนภัย 3 ระดับ (เฝ้าระวัง, วิกฤต, อพยพ)
        val (severity, levelText) = when {
            rain24h > 120.0 -> Pair("RED", "ระดับอพยพ (Evacuate)")
            rain24h > 90.0 -> Pair("ORANGE", "ระดับวิกฤต (Warning)")
            rain24h > 50.0 -> Pair("YELLOW", "ระดับเฝ้าระวัง (Watch)")
            else -> Pair("GREEN", "")
        }

        if (severity == "GREEN") return

        deviceLocations.forEach { (token, loc) ->
            val dist = calculateDistance(lat, lon, loc.first, loc.second)
            if (dist <= radiusKm) {
                val title = when (severity) {
                    "RED" -> "🔴 ประกาศอพยพน้ำท่วมด่วน! (Evacuate)"
                    "ORANGE" -> "🟧 เตือนภัยระดับน้ำวิกฤต - ยกของขึ้นที่สูง (Warning)"
                    else -> "⚠️ เฝ้าระวังน้ำป่าไหลหลาก/ท่วมขัง (Watch)"
                }
                
                val msg = when (severity) {
                    "RED" -> "ประกาศย้ายออกจากพื้นที่ด่วน มีมวลน้ำวิกฤตเอ่อล้นตลิ่งแม่น้ำสายหลักและปล่อยน้ำจากเขื่อน"
                    "ORANGE" -> "พบระดับน้ำล้นตลิ่งหรือฝนตกสะสมรุนแรงสูงถึง ${String.format("%.1f", rain24h)} มม. ในพื้นที่ใกล้เคียง"
                    else -> "ปริมาณน้ำฝนสะสมสูงเกิน 50 มม. ใน 24 ชม. เสี่ยงท่วมขัง"
                }

                val recommendation = "คำแนะนำ: ตัดสะพานไฟหลักทันที ย้ายสิ่งของขึ้นที่สูง และใช้ปุ่ม SOS เพื่อขอความช่วยเหลือหากติดค้าง"
                val evacUrl = "https://d-mind.or.th/evacuation?lat=${loc.first}&lng=${loc.second}"

                processedAlertsChannel.send(
                    SubagentProcessedAlert(
                        eventId = event.eventId,
                        alertType = "flood",
                        severity = severity,
                        deviceToken = token,
                        title = title,
                        message = msg,
                        recommendation = recommendation,
                        extraActionUrl = evacUrl,
                        extraIcon = "flood_alert_icon"
                    )
                )
            }
        }
    }

    private suspend fun processWeather(event: DisasterInputEvent) {
        val lat = event.latitude ?: return
        val lon = event.longitude ?: return
        val stormLevel = event.stormLevel ?: 1
        val radiusKm = 30.0 // ขอบเขตกลุ่มเมฆและเรดาร์ฝน

        // เตือนภัย Nowcast (1-2 ชม.) vs เตือนล่วงหน้า (24-48 ชม.)
        val (severity, typeText) = when (stormLevel) {
            3 -> Pair("RED", "ประกาศเตือนภัยล่วงหน้า (24-48 ชม.)")
            2 -> Pair("ORANGE", "พยากรณ์พายุฝน Nowcast (1-2 ชม.)")
            else -> Pair("YELLOW", "แจ้งเตือนเฝ้าระวัง")
        }

        deviceLocations.forEach { (token, loc) ->
            val dist = calculateDistance(lat, lon, loc.first, loc.second)
            if (dist <= radiusKm) {
                val title = when (severity) {
                    "RED" -> "🔴 ประกาศเตือนพายุฤดูร้อน/ดีเปรสชันล่วงหน้า"
                    "ORANGE" -> "🟧 พยากรณ์ฝนตกหนักด่วน Nowcast"
                    else -> "⚠️ เฝ้าระวังฝนฟ้าคะนอง"
                }

                val msg = when (severity) {
                    "RED" -> "มีประกาศเตือนภัยพายุกำลังแรงพาดผ่านจังหวัดของท่านใน 24-48 ชม. ข้างหน้า"
                    "ORANGE" -> "คาดว่าฝนจะตกหนักถึงหนักมากในพิกัดของท่าน ภายใน 1-2 ชั่วโมงนี้"
                    else -> "เรดาร์พบกลุ่มเมฆฝนรุนแรงก่อตัวในพื้นที่ ห่างจากตำแหน่งคุณ ${String.format("%.1f", dist)} กม."
                }

                val recommendation = "คำแนะนำ: เปิดแผนที่เรดาร์ฝนบนโมบายล์แอปเพื่อดูทิศทางการเคลื่อนตัวของลมพายุด้วยตัวเอง"
                val radarUrl = "https://tmd.go.th/weather-radar"

                processedAlertsChannel.send(
                    SubagentProcessedAlert(
                        eventId = event.eventId,
                        alertType = "storm",
                        severity = severity,
                        deviceToken = token,
                        title = title,
                        message = msg,
                        recommendation = recommendation,
                        extraActionUrl = radarUrl,
                        extraIcon = "radar_icon",
                        leadTimeSeconds = if (severity == "ORANGE") 7200 else 86400
                    )
                )
            }
        }
    }

    private suspend fun processLandslide(event: DisasterInputEvent) {
        val lat = event.latitude ?: return
        val lon = event.longitude ?: return
        val rain24h = event.rain24h ?: 0.0
        val radiusKm = 10.0 // ขอบเขตทางธรณีวิทยา

        // สัญญาณความเสี่ยงดินสไลด์/ทรุดตัวในพื้นที่ลาดชันหรือเขตสูบน้ำบาดาลสะสม
        val severity = when {
            rain24h > 150.0 -> "RED"
            rain24h > 100.0 -> "ORANGE"
            else -> "YELLOW"
        }

        deviceLocations.forEach { (token, loc) ->
            val dist = calculateDistance(lat, lon, loc.first, loc.second)
            if (dist <= radiusKm) {
                val title = when (severity) {
                    "RED" -> "🔴 เตือนภัยดินโคลนถล่ม - อพยพด่วน"
                    "ORANGE" -> "🟧 เฝ้าระวังพื้นที่ลาดเชิงเขาและโครงสร้างดิน"
                    else -> "⚠️ เฝ้าระวังจุดเสี่ยงแผ่นดินทรุด"
                }

                val msg = "พิกัดของคุณอยู่ในพื้นที่เสี่ยงภัยทางธรณีวิทยาเนื่องจากความอ่อนไหวของดินและชั้นน้ำบาดาล"
                val recommendation = "คำแนะนำสังเกต: ตรวจสอบรอยแตกร้าวตามอาคาร ถนนทรุดตัว หรือระดับน้ำในบ่อลดลงเร็วผิดปกติ"

                processedAlertsChannel.send(
                    SubagentProcessedAlert(
                        eventId = event.eventId,
                        alertType = "landslide",
                        severity = severity,
                        deviceToken = token,
                        title = title,
                        message = msg,
                        recommendation = recommendation,
                        extraIcon = "soil_crack_icon"
                    )
                )
            }
        }
    }

    /**
     * ฟังก์ชันคำนวณระยะทางภูมิศาสตร์ Haversine (กิโลเมตร)
     */
    private fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val earthRadius = 6371.0
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earthRadius * c
    }
}

/**
 * โมเดลข้อมูลภัยพิบัตินำเข้าคิว (Disaster Input Event)
 */
@Serializable
data class DisasterInputEvent(
    val eventId: String,
    val disasterType: String, // earthquake, aqi, flood, weather, landslide
    val latitude: Double? = null,
    val longitude: Double? = null,
    val magnitude: Double? = null,  // สำหรับแผ่นดินไหว
    val pm25: Double? = null,       // สำหรับฝุ่นละออง PM2.5
    val rain24h: Double? = null,    // สำหรับน้ำท่วมและดินถล่ม
    val stormLevel: Int? = null     // สำหรับพยากรณ์อากาศ Nowcast (1, 2, 3)
)

/**
 * โมเดลข้อมูลผลการประมวลผลส่งกลับให้ Primary Agent (Subagent Output Alert)
 */
data class SubagentProcessedAlert(
    val eventId: String,
    val alertType: String,
    val severity: String,
    val deviceToken: String,
    val title: String,
    val message: String,
    val recommendation: String? = null,
    val leadTimeSeconds: Int? = null,
    val extraActionUrl: String? = null,
    val extraIcon: String? = null,
    val mmi: String? = null
)
