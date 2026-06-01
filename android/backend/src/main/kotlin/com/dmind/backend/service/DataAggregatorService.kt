package com.dmind.backend.service

import com.dmind.backend.models.AnalyticsSummaryResponse
import com.dmind.backend.models.EnvironmentalResponse
import com.dmind.backend.models.RecentEvent
import com.dmind.backend.models.TrendDataResponse
import com.dmind.backend.models.TrendPoint
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.double
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.int
import kotlinx.serialization.json.intOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.long
import kotlinx.serialization.json.longOrNull
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URI
import java.net.URLEncoder
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.max
import kotlin.math.roundToInt
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

/**
 * Aggregates disaster and environmental data from real external APIs:
 *
 * - **USGS**: Earthquake events (GeoJSON feed, no API key required)
 * - **GISTDA**: Wildfire hotspots (VIIRS), flood areas, flood frequency (API-Key required)
 * - **TMD**: Weather forecast — temperature, humidity, rainfall (Bearer token required)
 * - **Air4Thai**: PM2.5 / AQI real-time data (public, no key required)
 *
 * Graceful degradation: each API call is wrapped in runCatching;
 * if an API is unreachable or unconfigured, the service returns 0 for that category
 * instead of throwing.
 */
// บริการดึงข้อมูลจากแหล่งภายนอกต่างๆ (USGS, GISTDA, TMD, Air4Thai) มาวิเคราะห์ คำนวณ สรุปผลทางสถิติและแนวโน้มภัยพิบัติ
class DataAggregatorService {

    private val bangkokZone = ZoneId.of("Asia/Bangkok")
    private val json = Json { ignoreUnknownKeys = true }

    // ─── Trend history ──────────────────────────────────────────
    // Stores daily snapshots (date → category counts) so getTrendData can return
    // actual historical values. Each call to getAnalyticsSummary() appends today's counts.
    // แคชเก็บสถิติประวัติข้อมูลรายวันเพื่อใช้สำหรับแสดงกราฟแนวโน้ม
    private val trendHistory = ConcurrentHashMap<String, TrendPoint>()

    // ─── Config helpers ─────────────────────────────────────────
    // อ่านค่าตัวแปรสภาพแวดล้อมของระบบ
    private fun env(name: String): String =
        System.getProperty(name)
            ?: System.getenv(name)
            ?: ""

    // ค้นหาและดึง TMD Bearer Token
    private fun tmdToken(): String =
        env("TMD_API_TOKEN").ifBlank { env("VITE_TMD_API_TOKEN") }

    // ค้นหาและดึง GISTDA API Key
    private fun gistdaApiKey(): String =
        env("GISTDA_API_KEY")
            .ifBlank { env("VITE_GISTDA_API_KEY") }
            .ifBlank { env("GISTDA_WMS_API_KEY") }
            .ifBlank { env("GISTDA_DISASTER_API_KEY") }
            .ifBlank { env("GISTDA_FIRE_API_KEY") }

    // ═════════════════════════════════════════════════════════════
    // 1) SUMMARY  — aggregate counts from USGS + GISTDA + TMD
    // ═════════════════════════════════════════════════════════════
    // คำนวณรวบรวมข้อมูลสรุปสถิติภัยพิบัติทั้งหมดในปัจจุบัน (แผ่นดินไหว, น้ำท่วม, ไฟป่า, พายุ, ภัยแล้ง)
    suspend fun getAnalyticsSummary(): AnalyticsSummaryResponse {
        // Fetch all sources in parallel-safe manner (each wrapped independently)
        val earthquakeResult = fetchUsgsEarthquakes()
        val wildfireResult = fetchGistdaWildfires()
        val floodResult = fetchGistdaFloods()
        val stormResult = fetchTmdStormWarnings()
        val droughtResult = fetchGistdaDrought()

        val earthquake = earthquakeResult.count
        val flood = floodResult.count
        val wildfire = wildfireResult.count
        val storm = stormResult.count
        val drought = droughtResult.count
        val total = earthquake + flood + wildfire + storm + drought

        // Build severity breakdown from real data
        val allEvents = earthquakeResult.events + wildfireResult.events +
            floodResult.events + stormResult.events + droughtResult.events
        val bySeverity = allEvents.groupBy { it.severity }
            .mapValues { it.value.size }
            .let { map ->
                mapOf(
                    "critical" to (map["critical"] ?: 0),
                    "high" to (map["high"] ?: 0),
                    "moderate" to (map["moderate"] ?: 0),
                    "low" to (map["low"] ?: 0),
                )
            }

        // Estimate affected area from flood + wildfire data
        val affectedAreaKm2 = floodResult.areaKm2 + wildfireResult.areaKm2 + droughtResult.areaKm2

        // Top 5 most recent events → map to response model
        val recentEvents = allEvents
            .sortedByDescending { it.timestamp }
            .take(5)
            .map { event ->
                RecentEvent(
                    title = event.title,
                    type = event.type,
                    severity = event.severity,
                    location = event.location,
                    timestamp = event.timestamp,
                )
            }

        // Record today's snapshot for trend history
        val todayKey = LocalDate.now(bangkokZone).format(DateTimeFormatter.ISO_LOCAL_DATE)
        trendHistory[todayKey] = TrendPoint(
            date = todayKey,
            total = total,
            earthquake = earthquake,
            flood = flood,
            wildfire = wildfire,
            storm = storm,
            drought = drought,
        )

        return AnalyticsSummaryResponse(
            totalEvents = total,
            earthquake = earthquake,
            flood = flood,
            wildfire = wildfire,
            storm = storm,
            drought = drought,
            bySeverity = bySeverity,
            affectedAreaKm2 = affectedAreaKm2,
            recentEvents = recentEvents,
        )
    }

    // ═════════════════════════════════════════════════════════════
    // 2) TRENDS  — historical data from snapshot cache
    // ═════════════════════════════════════════════════════════════
    // ดึงประวัติข้อมูลแนวโน้มสถิติย้อนหลังตามช่วงเวลา เช่น 7 วัน, 30 วัน, 1 ปี
    suspend fun getTrendData(period: String): TrendDataResponse {
        val today = LocalDate.now(bangkokZone)
        val formatter = DateTimeFormatter.ISO_LOCAL_DATE

        // If no history yet, fetch once to seed today's data
        if (trendHistory.isEmpty()) {
            runCatching { getAnalyticsSummary() }
        }

        val dates = when (period) {
            "30d" -> (29 downTo 0).map { today.minusDays(it.toLong()) }
            "1y" -> (11 downTo 0).map { today.minusMonths(it.toLong()).withDayOfMonth(1) }
            else -> (6 downTo 0).map { today.minusDays(it.toLong()) }
        }

        val points = dates.map { date ->
            val key = date.format(formatter)
            trendHistory[key] ?: TrendPoint(
                date = key,
                total = 0, earthquake = 0, flood = 0,
                wildfire = 0, storm = 0, drought = 0,
            )
        }

        return TrendDataResponse(period = period.ifBlank { "7d" }, data = points)
    }

    // ═════════════════════════════════════════════════════════════
    // 3) ENVIRONMENTAL — Air4Thai + TMD real data
    // ═════════════════════════════════════════════════════════════
    // รวบรวมข้อมูลคุณภาพสิ่งแวดล้อม (คุณภาพอากาศ PM2.5 / AQI และข้อมูลภูมิอากาศจาก TMD/Open-Meteo) ณ พิกัดที่กำหนด
    suspend fun getEnvironmentalData(latitude: Double = 13.7563, longitude: Double = 100.5018): EnvironmentalResponse = coroutineScope {
        val airDataDeferred = async { fetchAir4ThaiData() }
        val weatherDataDeferred = async { fetchTmdWeatherForecast(latitude, longitude) }
        val openMeteoAirQualityDeferred = async { fetchOpenMeteoAirQuality(latitude, longitude) }

        val airData = airDataDeferred.await()
        val weatherData = weatherDataDeferred.await()
        val openMeteoAirQuality = openMeteoAirQualityDeferred.await()

        val pm25 = airData.pm25
        val aqi = airData.aqi
        val aqiLevel = when {
            aqi <= 25 -> "ดีมาก"
            aqi <= 50 -> "ดี"
            aqi <= 100 -> "ปานกลาง"
            aqi <= 200 -> "มีผลต่อกลุ่มเสี่ยง"
            else -> "มีผลต่อสุขภาพ"
        }

        EnvironmentalResponse(
            pm25 = pm25,
            aqi = aqi,
            aqiLevel = aqiLevel,
            temperature = weatherData.temperature,
            humidity = weatherData.humidity,
            waterLevel = null, // Hydro-informatics API not yet integrated
            rainfall = weatherData.rainfall,
            updatedAt = Instant.now().toString(),
            openMeteoPm25 = openMeteoAirQuality.pm25,
            openMeteoAqi = openMeteoAirQuality.aqi,
        )
    }

    // ─────────────────────────────────────────────────────────────
    // USGS Earthquake Feed
    // https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
    // No API key required. Returns GeoJSON FeatureCollection.
    // ─────────────────────────────────────────────────────────────
    // เรียกดึงข้อมูลแผ่นดินไหวล่าสุดย้อนหลัง 1 สัปดาห์จาก USGS และกรองข้อมูลเฉพาะโซนประเทศไทย
    private fun fetchUsgsEarthquakes(): ApiResult {
        return runCatching {
            val url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
            val body = httpGet(url)
            val root = json.parseToJsonElement(body).jsonObject
            val features = root["features"]?.jsonArray ?: JsonArray(emptyList())

            // Filter: only events within Thailand + nearby region (5°–21°N, 96°–106°E)
            val thaiEvents = features.mapNotNull { feature ->
                val obj = feature.jsonObject
                val props = obj["properties"]?.jsonObject ?: return@mapNotNull null
                val geometry = obj["geometry"]?.jsonObject ?: return@mapNotNull null
                val coords = geometry["coordinates"]?.jsonArray ?: return@mapNotNull null
                val lon = coords.getOrNull(0)?.jsonPrimitive?.doubleOrNull ?: return@mapNotNull null
                val lat = coords.getOrNull(1)?.jsonPrimitive?.doubleOrNull ?: return@mapNotNull null

                // Bounding box: Thailand + Andaman + Laos/Myanmar border
                if (lat !in 4.0..22.0 || lon !in 95.0..107.0) return@mapNotNull null

                val mag = props["mag"]?.jsonPrimitive?.doubleOrNull ?: 0.0
                val place = props["place"]?.jsonPrimitive?.contentOrNull ?: "Unknown"
                val time = props["time"]?.jsonPrimitive?.longOrNull ?: 0L
                val severity = when {
                    mag >= 6.0 -> "critical"
                    mag >= 5.0 -> "high"
                    mag >= 4.0 -> "moderate"
                    else -> "low"
                }

                EventInfo(
                    title = "แผ่นดินไหว ${"%.1f".format(mag)} Mw",
                    type = "earthquake",
                    severity = severity,
                    location = place,
                    timestamp = Instant.ofEpochMilli(time).toString(),
                    areaKm2 = 0.0,
                )
            }

            ApiResult(
                count = thaiEvents.size,
                events = thaiEvents,
                areaKm2 = 0.0,
            )
        }.getOrElse {
            ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GISTDA VIIRS Hotspots (Wildfire)
    // https://api-gateway.gistda.or.th/api/2.0/resources/features/viirs/1day
    // Requires API-Key header.
    // ─────────────────────────────────────────────────────────────
    // ดึงข้อมูลจุดความร้อนสะสมย้อนหลัง 1 วันของประเทศจาก GISTDA (วิเคราะห์ภัยไฟป่า)
    private fun fetchGistdaWildfires(): ApiResult {
        val apiKey = gistdaApiKey()
        return runCatching {
            val country = URLEncoder.encode("ราชอาณาจักรไทย", "UTF-8")
            val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/viirs/1day" +
                "?limit=1000&offset=0&ct_tn=$country"

            val headers = buildMap<String, String> {
                put("accept", "application/json")
                if (apiKey.isNotBlank()) put("API-Key", apiKey)
            }

            val body = httpGet(url, headers)
            val root = json.parseToJsonElement(body).jsonObject
            val features = root["features"]?.jsonArray ?: JsonArray(emptyList())

            val events = features.mapNotNull { feature ->
                val obj = feature.jsonObject
                val props = obj["properties"]?.jsonObject ?: return@mapNotNull null
                val confidence = parseConfidence(props["confidence"])
                val frp = props["frp"]?.jsonPrimitive?.doubleOrNull ?: 0.0
                val brightness = props["bright_ti4"]?.jsonPrimitive?.doubleOrNull ?: 0.0
                val province = props["pv_tn"]?.jsonPrimitive?.contentOrNull
                    ?: props["changwat"]?.jsonPrimitive?.contentOrNull
                    ?: "ไม่ระบุจังหวัด"
                val dateStr = props["th_date"]?.jsonPrimitive?.contentOrNull
                    ?: props["acq_date"]?.jsonPrimitive?.contentOrNull ?: ""
                val timeStr = props["th_time"]?.jsonPrimitive?.contentOrNull ?: ""

                val severity = when {
                    confidence >= 80 && frp >= 50 && brightness >= 350 -> "critical"
                    confidence >= 70 && frp >= 30 -> "high"
                    confidence >= 50 -> "moderate"
                    else -> "low"
                }

                // Each hotspot roughly covers ~375m VIIRS pixel ≈ 0.14 km²
                EventInfo(
                    title = "จุดความร้อน $province",
                    type = "wildfire",
                    severity = severity,
                    location = province,
                    timestamp = "$dateStr $timeStr",
                    areaKm2 = 0.14,
                )
            }

            ApiResult(
                count = events.size,
                events = events,
                areaKm2 = events.size * 0.14,
            )
        }.getOrElse {
            ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GISTDA Flood Features
    // https://api-gateway.gistda.or.th/api/2.0/resources/features/flood/1day
    // ─────────────────────────────────────────────────────────────
    // ดึงข้อมูลวิเคราะห์พื้นที่น้ำท่วมล่าสุดรายวันจาก GISTDA
    private fun fetchGistdaFloods(): ApiResult {
        val apiKey = gistdaApiKey()
        return runCatching {
            val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/flood/1day" +
                "?limit=1000&offset=0"
            val headers = buildMap<String, String> {
                put("accept", "application/json")
                if (apiKey.isNotBlank()) put("API-Key", apiKey)
            }

            val body = httpGet(url, headers)
            val root = json.parseToJsonElement(body).jsonObject
            val features = root["features"]?.jsonArray ?: JsonArray(emptyList())

            var totalAreaKm2 = 0.0
            val events = features.mapNotNull { feature ->
                val obj = feature.jsonObject
                val props = obj["properties"]?.jsonObject ?: return@mapNotNull null
                // f_area is in square meters
                val areaSqm = props["f_area"]?.jsonPrimitive?.doubleOrNull
                    ?: props["shape_area"]?.jsonPrimitive?.doubleOrNull
                    ?: 0.0
                val areaKm2 = areaSqm / 1_000_000.0
                totalAreaKm2 += areaKm2

                val province = props["pv_tn"]?.jsonPrimitive?.contentOrNull
                    ?: props["LabelTH"]?.jsonPrimitive?.contentOrNull
                    ?: "พื้นที่น้ำท่วม"
                val severity = when {
                    areaSqm >= 1_000_000 -> "critical"
                    areaSqm >= 250_000 -> "high"
                    areaSqm >= 50_000 -> "moderate"
                    else -> "low"
                }

                EventInfo(
                    title = "พื้นที่น้ำท่วม $province",
                    type = "flood",
                    severity = severity,
                    location = province,
                    timestamp = props["_updatedAt"]?.jsonPrimitive?.contentOrNull
                        ?: props["_createdAt"]?.jsonPrimitive?.contentOrNull ?: "",
                    areaKm2 = areaKm2,
                )
            }

            ApiResult(
                count = events.size,
                events = events,
                areaKm2 = totalAreaKm2,
            )
        }.getOrElse {
            ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GISTDA Drought (flood-freq as proxy for drought-risk areas)
    // ─────────────────────────────────────────────────────────────
    // ดึงพื้นที่เฝ้าระวังภัยแล้ง/ภัยแล้งซ้ำซากจาก GISTDA
    private fun fetchGistdaDrought(): ApiResult {
        val apiKey = gistdaApiKey()
        return runCatching {
            val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/flood-freq" +
                "?limit=300&offset=0"
            val headers = buildMap<String, String> {
                put("accept", "application/json")
                if (apiKey.isNotBlank()) put("API-Key", apiKey)
            }

            val body = httpGet(url, headers)
            val root = json.parseToJsonElement(body).jsonObject
            val features = root["features"]?.jsonArray ?: JsonArray(emptyList())

            // Count flood-freq features as drought-risk indicator areas
            var totalAreaKm2 = 0.0
            val events = features.mapNotNull { feature ->
                val obj = feature.jsonObject
                val props = obj["properties"]?.jsonObject ?: return@mapNotNull null
                val freq = props["freq"]?.jsonPrimitive?.intOrNull ?: 0
                val areaRai = props["area_rai"]?.jsonPrimitive?.doubleOrNull
                    ?: ((props["shape_area"]?.jsonPrimitive?.doubleOrNull ?: 0.0) / 1600.0)
                val areaKm2 = areaRai * 0.0016  // 1 rai = 0.0016 km²
                totalAreaKm2 += areaKm2

                val province = props["pv_tn"]?.jsonPrimitive?.contentOrNull ?: "พื้นที่ภัยแล้ง"
                val severity = when {
                    freq >= 5 || areaRai >= 1_000 -> "critical"
                    freq >= 3 || areaRai >= 250 -> "high"
                    freq >= 1 -> "moderate"
                    else -> "low"
                }

                EventInfo(
                    title = "ภัยแล้ง/น้ำท่วมซ้ำซาก $province",
                    type = "drought",
                    severity = severity,
                    location = province,
                    timestamp = props["_updatedAt"]?.jsonPrimitive?.contentOrNull ?: "",
                    areaKm2 = areaKm2,
                )
            }

            ApiResult(
                count = events.size,
                events = events,
                areaKm2 = totalAreaKm2,
            )
        }.getOrElse {
            ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TMD Storm / Weather Warnings
    // https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at
    // Uses condition codes 5-8 (rain/storm) to count storm-like events.
    // ─────────────────────────────────────────────────────────────
    // ตรวจสอบและดึงข้อมูลรายงานการพยากรณ์พายุฝนระดับรุนแรงจากกรมอุตุนิยมวิทยา (TMD)
    private fun fetchTmdStormWarnings(): ApiResult {
        val token = tmdToken()
        if (token.isBlank()) {
            return fetchOpenMeteoStormWarnings(13.7563, 100.5018)
        }

        return runCatching {
            val today = DateTimeFormatter.ISO_LOCAL_DATE
                .withZone(bangkokZone)
                .format(Instant.now())
            val fields = "tc,rh,rain,ws10m,cond"
            val url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at" +
                "?lat=13.7563&lon=100.5018&date=$today&fields=$fields&duration=24"

            val body = httpGet(url, mapOf(
                "accept" to "application/json",
                "authorization" to "Bearer $token",
            ))

            val root = json.parseToJsonElement(body).jsonObject
            val weatherForecasts = root["WeatherForecasts"]?.jsonArray
            val rootForecast = weatherForecasts?.getOrNull(0)?.jsonObject
            val forecasts = rootForecast?.get("forecasts")?.jsonArray ?: JsonArray(emptyList())

            // Count hours with storm conditions (cond 5=light rain, 6=mod rain, 7=heavy rain, 8=thunderstorm)
            val stormEvents = forecasts.mapNotNull { fc ->
                val fcObj = fc.jsonObject
                val data = fcObj["data"]?.jsonObject ?: return@mapNotNull null
                val cond = data["cond"]?.jsonPrimitive?.intOrNull ?: 1
                val rain = data["rain"]?.jsonPrimitive?.doubleOrNull ?: 0.0
                val windSpeed = data["ws10m"]?.jsonPrimitive?.doubleOrNull ?: 0.0

                // Only count significant weather (heavy rain, thunderstorm, or high wind)
                if (cond >= 7 || rain >= 20.0 || windSpeed >= 15.0) {
                    val severity = when {
                        cond == 8 || rain >= 50 || windSpeed >= 25 -> "critical"
                        cond == 7 || rain >= 30 || windSpeed >= 20 -> "high"
                        else -> "moderate"
                    }
                    val time = fcObj["time"]?.jsonPrimitive?.contentOrNull ?: ""
                    EventInfo(
                        title = "พายุ/ฝนหนัก กรุงเทพฯ",
                        type = "storm",
                        severity = severity,
                        location = "กรุงเทพมหานคร",
                        timestamp = time,
                        areaKm2 = 0.0,
                    )
                } else null
            }

            ApiResult(
                count = stormEvents.size,
                events = stormEvents,
                areaKm2 = 0.0,
            )
        }.getOrElse {
            fetchOpenMeteoStormWarnings(13.7563, 100.5018)
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TMD Weather Forecast (temperature, humidity, rainfall)
    // ─────────────────────────────────────────────────────────────
    // ดึงข้อมูลพยากรณ์สภาพอากาศจาก TMD ตามจุดพิกัด
    private fun fetchTmdWeatherForecast(lat: Double = 13.7563, lon: Double = 100.5018): WeatherInfo {
        val token = tmdToken()
        if (token.isBlank()) {
            return fetchOpenMeteoWeatherForecast(lat, lon)
        }

        return runCatching {
            val today = DateTimeFormatter.ISO_LOCAL_DATE
                .withZone(bangkokZone)
                .format(Instant.now())
            val fields = "tc,rh,rain"
            val url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at" +
                "?lat=$lat&lon=$lon&date=$today&fields=$fields&duration=24"

            val body = httpGet(url, mapOf(
                "accept" to "application/json",
                "authorization" to "Bearer $token",
            ))

            val root = json.parseToJsonElement(body).jsonObject
            val weatherForecasts = root["WeatherForecasts"]?.jsonArray
            val rootForecast = weatherForecasts?.getOrNull(0)?.jsonObject
            val forecasts = rootForecast?.get("forecasts")?.jsonArray ?: JsonArray(emptyList())

            if (forecasts.isEmpty()) return@runCatching fetchOpenMeteoWeatherForecast(lat, lon)

            // Use the latest forecast entry
            val latest = forecasts.last().jsonObject
            val data = latest["data"]?.jsonObject ?: return@runCatching fetchOpenMeteoWeatherForecast(lat, lon)

            WeatherInfo(
                temperature = data["tc"]?.jsonPrimitive?.doubleOrNull ?: 0.0,
                humidity = (data["rh"]?.jsonPrimitive?.doubleOrNull ?: 0.0).roundToInt(),
                rainfall = data["rain"]?.jsonPrimitive?.doubleOrNull,
            )
        }.getOrElse {
            fetchOpenMeteoWeatherForecast(lat, lon)
        }
    }

    // ดึงข้อมูลพยากรณ์อากาศพิกัดที่กำหนดผ่าน Open-Meteo API (ใช้เป็น Fallback)
    private fun fetchOpenMeteoWeatherForecast(lat: Double, lon: Double): WeatherInfo {
        return runCatching {
            val url = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,relative_humidity_2m,rain&timezone=Asia/Bangkok"
            val body = httpGet(url)
            val root = json.parseToJsonElement(body).jsonObject
            val current = root["current"]?.jsonObject ?: return WeatherInfo()
            WeatherInfo(
                temperature = current["temperature_2m"]?.jsonPrimitive?.doubleOrNull ?: 0.0,
                humidity = (current["relative_humidity_2m"]?.jsonPrimitive?.doubleOrNull ?: 0.0).roundToInt(),
                rainfall = current["rain"]?.jsonPrimitive?.doubleOrNull,
            )
        }.getOrElse { WeatherInfo() }
    }

    // ตรวจหาคำแจ้งเตือนฝนตกหนักพายุรุนแรงผ่าน Open-Meteo API (ใช้เป็น Fallback)
    private fun fetchOpenMeteoStormWarnings(lat: Double, lon: Double): ApiResult {
        return runCatching {
            val url = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&hourly=rain,wind_speed_10m,weather_code&forecast_days=1&timezone=Asia/Bangkok"
            val body = httpGet(url)
            val root = json.parseToJsonElement(body).jsonObject
            val hourly = root["hourly"]?.jsonObject ?: return ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
            val timeArr = hourly["time"]?.jsonArray ?: return ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0)
            val rainArr = hourly["rain"]?.jsonArray
            val windArr = hourly["wind_speed_10m"]?.jsonArray
            val codeArr = hourly["weather_code"]?.jsonArray

            val stormEvents = mutableListOf<EventInfo>()
            for (i in 0 until timeArr.size) {
                val time = timeArr[i].jsonPrimitive.content
                val rain = rainArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val windSpeed = (windArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6 // km/h to m/s
                val code = codeArr?.getOrNull(i)?.jsonPrimitive?.intOrNull ?: 0

                if (code in listOf(95, 96, 99) || rain >= 20.0 || windSpeed >= 15.0) {
                    val severity = when {
                        code in listOf(96, 99) || rain >= 50.0 || windSpeed >= 25.0 -> "critical"
                        code == 95 || rain >= 30.0 || windSpeed >= 20.0 -> "high"
                        else -> "moderate"
                    }
                    stormEvents.add(
                        EventInfo(
                            title = "พายุ/ฝนหนัก กรุงเทพฯ",
                            type = "storm",
                            severity = severity,
                            location = "กรุงเทพมหานคร",
                            timestamp = time,
                            areaKm2 = 0.0,
                        )
                    )
                }
            }
            ApiResult(
                count = stormEvents.size,
                events = stormEvents,
                areaKm2 = 0.0,
            )
        }.getOrElse { ApiResult(count = 0, events = emptyList(), areaKm2 = 0.0) }
    }

    // ─────────────────────────────────────────────────────────────
    // Air4Thai  PM2.5 / AQI
    // http://air4thai.pcd.go.th/forappV2/getAQI_JSON.php
    // Public API, no key required. Returns array of station readings.
    // ─────────────────────────────────────────────────────────────
    // เรียกดึงข้อมูลคุณภาพอากาศแบบเรียลไทม์จากระบบกรมควบคุมมลพิษ (Air4Thai) เพื่อนำมาคำนวณฝุ่น PM2.5 และดัชนี AQI เฉลี่ยของเมือง
    private fun fetchAir4ThaiData(): AirQualityInfo {
        return runCatching {
            val url = "http://air4thai.pcd.go.th/forappV2/getAQI_JSON.php"
            val body = httpGet(url, mapOf("accept" to "application/json"))
            val root = json.parseToJsonElement(body).jsonObject
            val stations = root["stations"]?.jsonArray ?: JsonArray(emptyList())

            // Find Bangkok stations (station IDs starting with "t" are central Bangkok)
            // or fall back to averaging all stations
            val bangkokStations = stations.filter { station ->
                val obj = station.jsonObject
                val areaEn = obj["areaEN"]?.jsonPrimitive?.contentOrNull?.lowercase() ?: ""
                areaEn.contains("bangkok") || areaEn.contains("krung thep")
            }.ifEmpty {
                // Fallback: just use first few stations for a national average
                stations.take(5)
            }

            if (bangkokStations.isEmpty()) return@runCatching AirQualityInfo()

            val pm25Values = bangkokStations.mapNotNull { station ->
                val obj = station.jsonObject
                val lastUpdate = obj["LastUpdate"]?.jsonObject
                    ?: obj["AQILast"]?.jsonObject
                    ?: return@mapNotNull null
                // Try different field names
                lastUpdate["PM25"]?.jsonPrimitive?.contentOrNull?.toDoubleOrNull()
                    ?: lastUpdate["pm25"]?.jsonPrimitive?.contentOrNull?.toDoubleOrNull()
            }

            val aqiValues = bangkokStations.mapNotNull { station ->
                val obj = station.jsonObject
                val lastUpdate = obj["LastUpdate"]?.jsonObject
                    ?: obj["AQILast"]?.jsonObject
                    ?: return@mapNotNull null
                lastUpdate["AQI"]?.jsonPrimitive?.contentOrNull?.toIntOrNull()
                    ?: lastUpdate["aqi"]?.jsonPrimitive?.contentOrNull?.toIntOrNull()
            }

            val avgPm25 = if (pm25Values.isNotEmpty()) pm25Values.average() else 0.0
            val avgAqi = if (aqiValues.isNotEmpty()) {
                aqiValues.average().roundToInt()
            } else {
                // Estimate AQI from PM2.5 using Thailand's standard
                estimateAqiFromPm25(avgPm25)
            }

            AirQualityInfo(pm25 = avgPm25, aqi = avgAqi)
        }.getOrElse { AirQualityInfo() }
    }

    // ─────────────────────────────────────────────────────────────
    // HTTP helper  (reusable GET with timeout + User-Agent)
    // ─────────────────────────────────────────────────────────────
    // ฟังก์ชันช่วยจัดการส่ง HTTP GET Request พร้อมกำหนด Header และดักจับความผิดพลาดพื้นฐาน
    private fun httpGet(
        url: String,
        headers: Map<String, String> = emptyMap(),
    ): String {
        val connection = (URI(url).toURL().openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15_000
            readTimeout = 20_000
            setRequestProperty("User-Agent", "D-MIND Backend Analytics/2.0")
            headers.forEach { (key, value) -> setRequestProperty(key, value) }
        }

        return try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                throw IllegalStateException("HTTP $code: ${body.take(200)}")
            }
            body
        } finally {
            connection.disconnect()
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────
    // แปลงข้อมูลระดับความน่าเชื่อถือ (Confidence) ของจุดความร้อน GISTDA ให้เป็นคะแนนตัวเลข
    private fun parseConfidence(raw: kotlinx.serialization.json.JsonElement?): Int {
        if (raw == null) return 50
        val content = raw.jsonPrimitive.contentOrNull ?: return 50
        content.toIntOrNull()?.let { return it }
        return when (content.lowercase()) {
            "high", "nominal" -> 85
            "low" -> 40
            else -> 50
        }
    }

    // ฟังก์ชันคำนวณประเมินระดับดัชนีคุณภาพอากาศ (AQI) จากปริมาณฝุ่น PM2.5
    private fun estimateAqiFromPm25(pm25: Double): Int = when {
        pm25 <= 15.0 -> (pm25 / 15.0 * 25).roundToInt()
        pm25 <= 25.0 -> (25 + (pm25 - 15.0) / 10.0 * 25).roundToInt()
        pm25 <= 37.5 -> (50 + (pm25 - 25.0) / 12.5 * 50).roundToInt()
        pm25 <= 75.0 -> (100 + (pm25 - 37.5) / 37.5 * 100).roundToInt()
        else -> (200 + (pm25 - 75.0) / 50.0 * 100).roundToInt().coerceAtMost(500)
    }

    // ─── Internal data classes ──────────────────────────────────
    // โมเดลข้อมูลเหตุการณ์ภัยพิบัติภายในคลาส
    private data class EventInfo(
        val title: String,
        val type: String,
        val severity: String,
        val location: String,
        val timestamp: String,
        val areaKm2: Double,
    )

    // ผลลัพธ์ข้อมูลภัยพิบัติที่ได้จาก API แต่ละแหล่ง
    private data class ApiResult(
        val count: Int,
        val events: List<EventInfo>,
        val areaKm2: Double,
    )

    // ข้อมูลคุณภาพอากาศเบื้องต้น
    private data class AirQualityInfo(
        val pm25: Double = 0.0,
        val aqi: Int = 0,
    )

    // ข้อมูลพยากรณ์อากาศเบื้องต้น
    private data class WeatherInfo(
        val temperature: Double = 0.0,
        val humidity: Int = 0,
        val rainfall: Double? = null,
    )

    // โมเดลข้อมูลคุณภาพอากาศจาก Open-Meteo
    private data class OpenMeteoAirQualityInfo(
        val pm25: Double? = null,
        val aqi: Int? = null,
    )

    // ─────────────────────────────────────────────────────────────
    // Open-Meteo API Fetchers
    // ─────────────────────────────────────────────────────────────
    // ดึงค่าคุณภาพอากาศจาก Open-Meteo (ใช้เป็นข้อมูลสำรอง)
    private fun fetchOpenMeteoAirQuality(lat: Double, lon: Double): OpenMeteoAirQualityInfo {
        return runCatching {
            val url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=$lat&longitude=$lon&current=pm2_5,us_aqi"
            val body = httpGet(url)
            val root = json.parseToJsonElement(body).jsonObject
            val current = root["current"]?.jsonObject
            val pm25 = current?.get("pm2_5")?.jsonPrimitive?.doubleOrNull
            val aqi = current?.get("us_aqi")?.jsonPrimitive?.intOrNull
            OpenMeteoAirQualityInfo(pm25, aqi)
        }.getOrElse { OpenMeteoAirQualityInfo() }
    }

    // ดึงพยากรณ์อากาศจาก Open-Meteo (ใช้เป็นข้อมูลสำรอง)
    private fun fetchOpenMeteoWeatherForecastInfo(lat: Double, lon: Double): WeatherInfo {
        return runCatching {
            val url = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&current=temperature_2m,relative_humidity_2m,rain"
            val body = httpGet(url)
            val root = json.parseToJsonElement(body).jsonObject
            val current = root["current"]?.jsonObject
            val temp = current?.get("temperature_2m")?.jsonPrimitive?.doubleOrNull ?: 0.0
            val humidity = current?.get("relative_humidity_2m")?.jsonPrimitive?.doubleOrNull?.roundToInt() ?: 0
            val rain = current?.get("rain")?.jsonPrimitive?.doubleOrNull
            WeatherInfo(temp, humidity, rain)
        }.getOrElse { WeatherInfo() }
    }
}
