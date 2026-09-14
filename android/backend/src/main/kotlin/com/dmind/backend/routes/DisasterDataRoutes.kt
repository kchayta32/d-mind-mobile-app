package com.dmind.backend.routes

import com.dmind.backend.GatewayConfig
import com.dmind.backend.JsonDataResponse
import com.dmind.backend.SupabaseGateway
import com.dmind.backend.handleSafely
import com.dmind.backend.respondError
import com.dmind.backend.validate
import com.dmind.backend.httpRequest
import com.dmind.backend.json
import com.dmind.backend.UpstreamException
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.request.receive
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import kotlinx.serialization.encodeToString
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.ConcurrentHashMap

// โครงสร้างข้อมูลแคชสำหรับจัดเก็บสภาพอากาศพร้อมเวลาหมดอายุ
private data class WeatherCacheEntry(
    val data: JsonElement,
    val status: String,
    val expiryTimeMillis: Long
)

// ตัวแปรสำหรับเก็บแคชสภาพอากาศเพื่อลดการส่งคำขอไปยัง API ปลายทางบ่อยเกินไป
private val weatherCache = ConcurrentHashMap<String, WeatherCacheEntry>()

// ค้นหาและดึงข้อมูลสภาพอากาศจากแคช หากหมดอายุแล้วจะลบทิ้งและส่งค่ากลับเป็น null
private fun getCachedWeather(key: String): WeatherCacheEntry? {
    val entry = weatherCache[key] ?: return null
    if (System.currentTimeMillis() > entry.expiryTimeMillis) {
        weatherCache.remove(key)
        return null
    }
    return entry
}

// บันทึกข้อมูลสภาพอากาศลงแคช โดยตั้งค่าเวลาหมดอายุไว้ที่ 15 นาที
private fun putCachedWeather(key: String, data: JsonElement, status: String) {
    if (weatherCache.size > 1000) {
        val now = System.currentTimeMillis()
        weatherCache.keys.removeIf { k ->
            val e = weatherCache[k]
            e == null || now > e.expiryTimeMillis
        }
    }
    val expiry = System.currentTimeMillis() + (15 * 60 * 1000) // 15 minutes
    weatherCache[key] = WeatherCacheEntry(data, status, expiry)
}

// ตารางพิกัดศูนย์กลางประจำจังหวัดหลักของประเทศไทย (สำหรับกรณีเรียกพยากรณ์อากาศด้วยชื่อจังหวัดแต่ไม่ได้ส่งพิกัดมา)
private val PROVINCE_COORDINATES: Map<String, Pair<Double, Double>> = mapOf(
    // กรุงเทพมหานครและปริมณฑล / ภาคกลาง
    "กรุงเทพมหานคร" to (13.7563 to 100.5018),
    "กรุงเทพฯ" to (13.7563 to 100.5018),
    "bangkok" to (13.7563 to 100.5018),
    "นนทบุรี" to (13.8621 to 100.5144),
    "nonthaburi" to (13.8621 to 100.5144),
    "ปทุมธานี" to (14.0208 to 100.5250),
    "pathum thani" to (14.0208 to 100.5250),
    "สมุทรปราการ" to (13.5991 to 100.5998),
    "samut prakan" to (13.5991 to 100.5998),
    "สมุทรสาคร" to (13.5475 to 100.2744),
    "สมุทรสงคราม" to (13.4098 to 99.9976),
    "นครปฐม" to (13.8196 to 100.0601),
    "พระนครศรีอยุธยา" to (14.3532 to 100.5684),
    "อยุธยา" to (14.3532 to 100.5684),
    "สระบุรี" to (14.5289 to 100.9101),
    "ลพบุรี" to (14.7995 to 100.6534),
    "สิงห์บุรี" to (14.8863 to 100.4005),
    "อ่างทอง" to (14.5896 to 100.4550),
    "ชัยนาท" to (15.1852 to 100.1251),
    "นครนายก" to (14.2069 to 101.2131),
    // ภาคเหนือ
    "เชียงใหม่" to (18.7883 to 98.9853),
    "chiang mai" to (18.7883 to 98.9853),
    "เชียงราย" to (19.9105 to 99.8406),
    "chiang rai" to (19.9105 to 99.8406),
    "ลำปาง" to (18.2888 to 99.4928),
    "ลำพูน" to (18.5745 to 99.0087),
    "แม่ฮ่องสอน" to (19.3021 to 97.9654),
    "น่าน" to (18.7830 to 100.7782),
    "พะเยา" to (19.1664 to 99.9022),
    "แพร่" to (18.1446 to 100.1411),
    "อุตรดิตถ์" to (17.6256 to 100.0993),
    "พิษณุโลก" to (16.8211 to 100.2659),
    "สุโขทัย" to (17.0078 to 99.8230),
    "ตาก" to (16.8839 to 99.1258),
    "กำแพงเพชร" to (16.4828 to 99.5227),
    "พิจิตร" to (16.4429 to 100.3488),
    "เพชรบูรณ์" to (16.4193 to 101.1609),
    "นครสวรรค์" to (15.7029 to 100.1370),
    "อุทัยธานี" to (15.3835 to 100.0245),
    // ภาคตะวันออกเฉียงเหนือ (อีสาน)
    "ขอนแก่น" to (16.4419 to 102.8359),
    "khon kaen" to (16.4419 to 102.8359),
    "นครราชสีมา" to (14.9799 to 102.0977),
    "โคราช" to (14.9799 to 102.0977),
    "nakhon ratchasima" to (14.9799 to 102.0977),
    "อุดรธานี" to (17.4138 to 102.7877),
    "อุบลราชธานี" to (15.2448 to 104.8471),
    "หนองคาย" to (17.8783 to 102.7420),
    "บึงกาฬ" to (18.3633 to 103.6528),
    "เลย" to (17.4860 to 101.7223),
    "สกลนคร" to (17.1546 to 104.1486),
    "นครพนม" to (17.4042 to 104.7803),
    "มุกดาหาร" to (16.5436 to 104.7235),
    "กาฬสินธุ์" to (16.4322 to 103.5057),
    "ร้อยเอ็ด" to (16.0538 to 103.6520),
    "มหาสารคาม" to (16.1852 to 103.3007),
    "ชัยภูมิ" to (15.8070 to 102.0322),
    "บุรีรัมย์" to (14.9930 to 103.1029),
    "สุรินทร์" to (14.8818 to 103.4937),
    "ศรีสะเกษ" to (15.1186 to 104.3220),
    "ยโสธร" to (15.7926 to 104.1451),
    "อำนาจเจริญ" to (15.8585 to 104.6258),
    "หนองบัวลำภู" to (17.2034 to 102.4407),
    // ภาคตะวันออก
    "ชลบุรี" to (13.3611 to 100.9847),
    "chonburi" to (13.3611 to 100.9847),
    "ระยอง" to (12.6814 to 101.2816),
    "rayong" to (12.6814 to 101.2816),
    "จันทบุรี" to (12.6114 to 102.1039),
    "ตราด" to (12.2428 to 102.5175),
    "ฉะเชิงเทรา" to (13.6904 to 101.0779),
    "ปราจีนบุรี" to (14.0509 to 101.3716),
    "สระแก้ว" to (13.8140 to 102.0583),
    // ภาคตะวันตก
    "ราชบุรี" to (13.5283 to 99.8134),
    "กาญจนบุรี" to (14.0228 to 99.5328),
    "สุพรรณบุรี" to (14.4745 to 100.1177),
    "เพชรบุรี" to (13.1114 to 99.9397),
    "ประจวบคีรีขันธ์" to (11.8124 to 99.7972),
    // ภาคใต้
    "ภูเก็ต" to (7.8804 to 98.3923),
    "phuket" to (7.8804 to 98.3923),
    "สงขลา" to (7.1756 to 100.6143),
    "หาดใหญ่" to (7.0087 to 100.4747),
    "สุราษฎร์ธานี" to (9.1400 to 99.3333),
    "surat thani" to (9.1400 to 99.3333),
    "นครศรีธรรมราช" to (8.4304 to 99.9631),
    "กระบี่" to (8.0863 to 98.9063),
    "krabi" to (8.0863 to 98.9063),
    "พังงา" to (8.4501 to 98.5255),
    "ระนอง" to (9.9658 to 98.6348),
    "ชุมพร" to (10.4930 to 99.1800),
    "ตรัง" to (7.5594 to 99.6114),
    "พัทลุง" to (7.6167 to 100.0833),
    "สตูล" to (6.6238 to 100.0674),
    "ปัตตานี" to (6.8696 to 101.2501),
    "ยะลา" to (6.5411 to 101.2813),
    "นราธิวาส" to (6.4255 to 101.8253)
)

// พิกัดศูนย์กลางประจำภูมิภาคหลัก (ตามรหัสภูมิภาคของกรมอุตุนิยมวิทยา TMD: C, N, NE, E, S, W)
private val REGION_COORDINATES: Map<String, Pair<Double, Double>> = mapOf(
    "C" to (13.7563 to 100.5018),   // ภาคกลาง (กรุงเทพฯ)
    "N" to (18.7883 to 98.9853),    // ภาคเหนือ (เชียงใหม่)
    "NE" to (16.4419 to 102.8359),  // ภาคตะวันออกเฉียงเหนือ (ขอนแก่น)
    "E" to (13.3611 to 100.9847),   // ภาคตะวันออก (ชลบุรี)
    "S" to (8.4304 to 99.9631),     // ภาคใต้ (นครศรีธรรมราช)
    "W" to (14.0228 to 99.5328)     // ภาคตะวันตก (กาญจนบุรี)
)

// ตัวแปลงค้นหาพิกัดศูนย์กลางตามชื่อจังหวัดหรือรหัสภูมิภาค เมื่อไม่มีการระบุพิกัดละติจูด/ลองจิจูดเข้ามาโดยตรง
private fun resolveCoordinates(
    province: String?,
    region: String?,
    rawLat: Double?,
    rawLon: Double?
): Pair<Double, Double> {
    if (rawLat != null && rawLon != null) {
        return rawLat to rawLon
    }
    if (province != null) {
        val cleanProvince = province.trim().lowercase()
        val match = PROVINCE_COORDINATES[cleanProvince] 
            ?: PROVINCE_COORDINATES.entries.firstOrNull { cleanProvince.contains(it.key) || it.key.contains(cleanProvince) }?.value
        if (match != null) return match
    }
    if (region != null) {
        val cleanRegion = region.trim().uppercase()
        val match = REGION_COORDINATES[cleanRegion]
        if (match != null) return match
    }
    return (rawLat ?: 13.7563) to (rawLon ?: 100.5018)
}

// กำหนดเส้นทาง URL (Routing) ที่เกี่ยวกับข้อมูลพยากรณ์อากาศ ภัยพิบัติ และการประเมินวิเคราะห์ผลด้วย AI
internal fun Route.disasterDataRoutes(config: GatewayConfig) {
    
    // เส้นทาง API สำหรับดึงข้อมูลสภาพอากาศ (รองรับ TMD API และ Open-Meteo เป็น Fallback)
    get("/weather") {
        call.handleSafely {
            val token = config.tmdApiToken
            val daily = call.request.queryParameters["daily"]?.toBoolean() ?: false
            val region = call.request.queryParameters["region"]
            val province = call.request.queryParameters["province"]
            val durationStr = call.request.queryParameters["duration"]

            val duration = durationStr?.toIntOrNull()?.let {
                if (daily) it.coerceIn(1, 10) else it.coerceIn(1, 48)
            } ?: (if (daily) 7 else 24)

            val defaultFields = if (daily) {
                "tc_max,tc_min,rh,slp,psfc,rain,ws10m,wd10m,ws925,wd925,ws850,wd850,ws700,wd700,ws500,wd500,ws200,wd200,cloudlow,cloudmed,cloudhigh,swdown,cond"
            } else {
                "tc,rh,slp,rain,ws10m,wd10m,ws925,wd925,ws850,wd850,ws700,wd700,ws500,wd500,ws200,wd200,cloudlow,cloudmed,cloudhigh,cond"
            }
            val fields = call.request.queryParameters["fields"] ?: defaultFields

            val rawLat = call.request.queryParameters["lat"]?.toDoubleOrNull()
            val rawLon = call.request.queryParameters["lon"]?.toDoubleOrNull()
            val (resolvedLat, resolvedLon) = resolveCoordinates(province, region, rawLat, rawLon)
            val lat = rawLat ?: resolvedLat
            val lon = rawLon ?: resolvedLon
            val provinceLabel = province ?: region

            // Determine cache key
            val cacheKey = when {
                region != null -> "region:$region:$daily:$duration:$fields"
                province != null -> {
                    val amphoe = call.request.queryParameters["amphoe"]
                    val tambon = call.request.queryParameters["tambon"]
                    val subarea = call.request.queryParameters["subarea"]
                    val date = call.request.queryParameters["date"]
                        ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()
                    "place:$province:$amphoe:$tambon:$subarea:$date:$daily:$duration:$fields"
                }
                else -> {
                    val roundedLat = String.format(java.util.Locale.US, "%.3f", lat)
                    val roundedLon = String.format(java.util.Locale.US, "%.3f", lon)
                    val date = call.request.queryParameters["date"]
                        ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()
                    "coords:$roundedLat:$roundedLon:$date:$daily:$duration:$fields"
                }
            }

            val cached = getCachedWeather(cacheKey)
            if (cached != null) {
                call.respond(JsonDataResponse(status = cached.status, detail = "cached weather", data = cached.data))
                return@handleSafely
            }

            if (token.isBlank()) {
                // Fallback to Open-Meteo when TMD token is unconfigured
                try {
                    val fallbackData = fetchOpenMeteoFallback(lat, lon, daily, duration, provinceLabel)
                    putCachedWeather(cacheKey, fallbackData, "fallback")
                    call.respond(JsonDataResponse(status = "fallback", detail = "fallback Open-Meteo weather", data = fallbackData))
                } catch (e: Exception) {
                    call.respondError(
                        HttpStatusCode.ServiceUnavailable,
                        "weather_service_failed",
                        "TMD not configured and Open-Meteo fallback failed: ${e.message}"
                    )
                }
                return@handleSafely
            }

            val url = when {
                region != null -> {
                    val apiType = if (daily) "daily" else "hourly"
                    "https://data.tmd.go.th/nwpapi/v1/forecast/location/$apiType/region?region=" +
                        java.net.URLEncoder.encode(region, "UTF-8") +
                        "&fields=" + java.net.URLEncoder.encode(fields, "UTF-8") +
                        "&duration=$duration"
                }
                province != null -> {
                    val apiType = if (daily) "daily" else "hourly"
                    val amphoe = call.request.queryParameters["amphoe"]
                    val tambon = call.request.queryParameters["tambon"]
                    val subarea = call.request.queryParameters["subarea"]
                    val hour = call.request.queryParameters["hour"]
                    val date = call.request.queryParameters["date"]
                        ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()

                    val params = mutableListOf<String>()
                    params.add("province=" + java.net.URLEncoder.encode(province, "UTF-8"))
                    if (amphoe != null) params.add("amphoe=" + java.net.URLEncoder.encode(amphoe, "UTF-8"))
                    if (tambon != null) params.add("tambon=" + java.net.URLEncoder.encode(tambon, "UTF-8"))
                    if (subarea != null) params.add("subarea=" + java.net.URLEncoder.encode(subarea, "UTF-8"))
                    params.add("date=" + java.net.URLEncoder.encode(date, "UTF-8"))
                    if (hour != null) params.add("hour=" + java.net.URLEncoder.encode(hour, "UTF-8"))
                    params.add("duration=$duration")
                    params.add("fields=" + java.net.URLEncoder.encode(fields, "UTF-8"))

                    "https://data.tmd.go.th/nwpapi/v1/forecast/location/$apiType/place?" + params.joinToString("&")
                }
                else -> {
                    val apiType = if (daily) "daily" else "hourly"
                    validate(lat in -90.0..90.0, "lat must be between -90 and 90")
                    validate(lon in -180.0..180.0, "lon must be between -180 and 180")
                    val date = call.request.queryParameters["date"]
                        ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()

                    "https://data.tmd.go.th/nwpapi/v1/forecast/location/$apiType/at" +
                        "?lat=$lat&lon=$lon&date=" + java.net.URLEncoder.encode(date, "UTF-8") +
                        "&fields=" + java.net.URLEncoder.encode(fields, "UTF-8") +
                        "&duration=$duration"
                }
            }

            try {
                val data = httpRequest(
                    method = "GET",
                    url = url,
                    headers = mapOf(
                        "accept" to "application/json",
                        "authorization" to "Bearer $token",
                    ),
                ).json()
                putCachedWeather(cacheKey, data, "ok")
                call.respond(JsonDataResponse(status = "ok", detail = "live TMD weather", data = data))
            } catch (e: Exception) {
                // Fallback to Open-Meteo when TMD API call fails
                try {
                    val fallbackData = fetchOpenMeteoFallback(lat, lon, daily, duration, provinceLabel)
                    putCachedWeather(cacheKey, fallbackData, "fallback")
                    call.respond(JsonDataResponse(status = "fallback", detail = "fallback Open-Meteo weather (TMD API failed)", data = fallbackData))
                } catch (fallbackEx: Exception) {
                    val statusCode = (e as? UpstreamException)?.statusCode ?: 502
                    call.respondError(
                        HttpStatusCode.fromValue(statusCode).takeIf { statusCode in 400..599 } ?: HttpStatusCode.BadGateway,
                        "weather_service_failed",
                        "TMD API error: ${e.message}. Open-Meteo fallback also failed: ${fallbackEx.message}"
                    )
                }
            }
        }
    }

    // เส้นทาง API สำหรับดึงข้อมูลเหตุการณ์แผ่นดินไหวล่าสุดทั่วโลกจาก USGS
    get("/usgs-earthquakes") {
        call.handleSafely {
            val data = httpRequest(
                method = "GET",
                url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
            )
            call.respond(
                JsonDataResponse(
                    status = "ok",
                    detail = "live USGS earthquakes",
                    data = data.json()
                )
            )
        }
    }

    // เส้นทาง API สำหรับขอรับการประเมินวิเคราะห์ระดับความเสียหายภัยพิบัติจากภาพถ่ายและคำอธิบายโดย AI
    post("/damage-assessment") {
        call.handleSafely(rateLimited = true, config = config) {
            val request = call.receive<DamageAssessmentRequest>()
            val openAiKey = config.openAiApiKey
            val thaiLlmKey = config.thaiLlmApiKey

            if (openAiKey.isNotBlank() || thaiLlmKey.isNotBlank()) {
                val analysisContent = proxyDamageAssessmentToExternalModel(
                    config = config,
                    imageUrl = request.imageUrl,
                    description = request.description
                )
                if (analysisContent.isNotBlank()) {
                    val severity = extractSeverityScore(analysisContent)
                    call.respond(
                        DamageAssessmentResponse(
                            status = "ok",
                            analysis = analysisContent,
                            severityScore = severity,
                            confidence = 0.85,
                            model = if (openAiKey.isNotBlank()) "gpt-4o-mini" else config.thaiLlmModel
                        )
                    )
                    return@handleSafely
                }
            }

            // Fallback response
            val fallbackAnalysis = """
                นี่คือข้อมูลวิเคราะห์ความเสียหายจำลอง (Mock Analysis) เนื่องจากไม่ได้ตั้งค่า API Key:
                - สถานะ: จำลองการวิเคราะห์สำเร็จ
                - รายละเอียดคำขอ: ${request.description ?: "ไม่มีรายละเอียดเพิ่มเติม"}
                - ลิงก์รูปภาพ: ${request.imageUrl ?: "ไม่ได้แนบรูปภาพ"}
                - ผลประเมินจำลอง: พบความเสียหายของโครงสร้างปานกลางบริเวณทางเท้าและป้ายโฆษณาภายนอกอาคาร ไม่มีรายงานโครงสร้างหลักทรุดตัว
                - คำแนะนำเบื้องต้น: ปิดกั้นพื้นที่เสี่ยงชั่วคราวและแนะนำให้ประชาชนหลีกเลี่ยงการสัญจรผ่านจุดดังกล่าวจนกว่าวิศวกรหรือเจ้าหน้าที่ท้องถิ่นจะทำการตรวจสอบความมั่นคงทางวิศวกรรมเรียบร้อยแล้ว
            """.trimIndent()

            call.respond(
                DamageAssessmentResponse(
                    status = "fallback",
                    analysis = fallbackAnalysis,
                    severityScore = 3,
                    confidence = 0.5,
                    model = "simulated-fallback-model"
                )
            )
        }
    }

    // เส้นทาง API สำหรับเปิดห้องสนทนาโต้ตอบแบบเรียลไทม์กับโมเดลปัญญาประดิษฐ์ (Chatbot) ด้านข้อมูลภัยพิบัติ
    post("/chat") {
        call.handleSafely(rateLimited = true, config = config) {
            val request = call.receive<ChatRequest>()
            validate(request.message.isNotBlank(), "message must not be blank")

            val openAiKey = config.openAiApiKey
            val thaiLlmKey = config.thaiLlmApiKey

            if (openAiKey.isNotBlank() || thaiLlmKey.isNotBlank()) {
                val responseContent = proxyChatToExternalModel(
                    config = config,
                    systemPrompt = request.systemPrompt,
                    userMessage = request.message,
                    chatHistory = request.chatHistory
                )
                if (responseContent.isNotBlank()) {
                    call.respond(
                        ChatResponse(
                            status = "ok",
                            response = responseContent,
                            model = if (openAiKey.isNotBlank()) "gpt-4o-mini" else config.thaiLlmModel
                        )
                    )
                    return@handleSafely
                }
            }

            // Fallback response
            val fallbackMessage = "นี่คือคำตอบจำลองของระบบ D-MIND AI: ได้รับข้อความของคุณแล้ว ('${request.message}') แต่ขณะนี้ระบบเชื่อมต่อโมเดลหลักยังไม่ได้ตั้งค่า API Key หากต้องการสนทนาจริง กรุณาตั้งค่า OPENAI_API_KEY หรือ DMIND_THAI_LLM_API_KEY ใน local.properties หรือสภาพแวดล้อม (Environment) ของระบบ"
            call.respond(
                ChatResponse(
                    status = "fallback",
                    response = fallbackMessage,
                    model = "simulated-fallback-model"
                )
            )
        }
    }
}

// โมเดลสำหรับตัวรับส่งข้อความแชทเดี่ยว
@Serializable
data class ChatMessageItem(
    val role: String,
    val content: String
)

// โครงสร้างคำขอสำหรับฟังก์ชันสนทนากับ AI
@Serializable
data class ChatRequest(
    val message: String,
    val chatHistory: List<ChatMessageItem>? = null,
    val systemPrompt: String? = null
)

// โครงสร้างข้อมูลตอบกลับจากบริการแชท
@Serializable
data class ChatResponse(
    val status: String,
    val response: String,
    val model: String? = null
)

// โครงสร้างข้อมูลส่งคำขอวิเคราะห์ประเมินความเสียหาย
@Serializable
data class DamageAssessmentRequest(
    val imageUrl: String? = null,
    val description: String? = null,
    val incidentId: String? = null
)

// โครงสร้างข้อมูลที่ตอบกลับผลลัพธ์การประเมินภัยพิบัติ
@Serializable
data class DamageAssessmentResponse(
    val status: String,
    val analysis: String,
    val severityScore: Int? = null,
    val confidence: Double? = null,
    val model: String? = null
)

// ตัวแปลง JSON ส่วนตัว
private val jsonParser = Json {
    ignoreUnknownKeys = true
    encodeDefaults = false
}

// ส่งคำสั่งสนทนาผ่านไปยังโมเดลภาษาขนาดใหญ่ภายนอก (OpenAI หรือ Thai LLM)
private fun proxyChatToExternalModel(
    config: GatewayConfig,
    systemPrompt: String?,
    userMessage: String,
    chatHistory: List<ChatMessageItem>?
): String {
    val openAiKey = config.openAiApiKey
    val thaiLlmKey = config.thaiLlmApiKey

    val (url, model, apiKey) = when {
        openAiKey.isNotBlank() -> Triple("https://api.openai.com/v1/chat/completions", "gpt-4o-mini", openAiKey)
        thaiLlmKey.isNotBlank() -> {
            val base = config.thaiLlmBaseUrl.trimEnd('/')
            Triple("$base/chat/completions", config.thaiLlmModel, thaiLlmKey)
        }
        else -> return ""
    }

    val messagesArray = buildJsonArray {
        if (!systemPrompt.isNullOrBlank()) {
            add(buildJsonObject {
                put("role", "system")
                put("content", systemPrompt)
            })
        }
        chatHistory?.forEach { historyItem ->
            add(buildJsonObject {
                put("role", historyItem.role)
                put("content", historyItem.content)
            })
        }
        add(buildJsonObject {
            put("role", "user")
            put("content", userMessage)
        })
    }

    val requestBody = buildJsonObject {
        put("model", model)
        put("messages", messagesArray)
        put("temperature", 0.3)
    }.toString()

    return try {
        val responseStr = httpRequest(
            method = "POST",
            url = url,
            headers = mapOf(
                "Content-Type" to "application/json",
                "Authorization" to "Bearer $apiKey"
            ),
            body = requestBody
        )
        val responseJson = jsonParser.parseToJsonElement(responseStr).jsonObject
        val choices = responseJson["choices"]?.jsonArray
        val firstChoice = choices?.firstOrNull()?.jsonObject
        val message = firstChoice?.get("message")?.jsonObject
        message?.get("content")?.jsonPrimitive?.content ?: ""
    } catch (e: Exception) {
        ""
    }
}

// ส่งภาพและรายละเอียดภัยพิบัติไปให้โมเดล AI เพื่อประเมินความเสียหาย
private fun proxyDamageAssessmentToExternalModel(
    config: GatewayConfig,
    imageUrl: String?,
    description: String?
): String {
    val openAiKey = config.openAiApiKey
    val thaiLlmKey = config.thaiLlmApiKey

    val (url, model, apiKey) = when {
        openAiKey.isNotBlank() -> Triple("https://api.openai.com/v1/chat/completions", "gpt-4o-mini", openAiKey)
        thaiLlmKey.isNotBlank() -> {
            val base = config.thaiLlmBaseUrl.trimEnd('/')
            Triple("$base/chat/completions", config.thaiLlmModel, thaiLlmKey)
        }
        else -> return ""
    }

    val prompt = """
        You are an expert disaster damage assessment AI.
        Analyze the damage of the disaster incident.
        ${if (!description.isNullOrBlank()) "Incident Details: $description" else ""}
        Provide a concise analysis of the damage, estimated severity score (1 to 5, where 1 is minimal and 5 is catastrophic/total destruction), and safety recommendations.
        Format your response starting with 'Estimated Severity: <score>' followed by the analysis details.
    """.trimIndent()

    val messagesArray = buildJsonArray {
        add(buildJsonObject {
            put("role", "user")
            put("content", if (openAiKey.isNotBlank() && !imageUrl.isNullOrBlank()) {
                buildJsonArray {
                    add(buildJsonObject {
                        put("type", "text")
                        put("text", prompt)
                    })
                    add(buildJsonObject {
                        put("type", "image_url")
                        put("image_url", buildJsonObject {
                            put("url", imageUrl)
                        })
                    })
                }
            } else {
                JsonPrimitive(prompt + if (!imageUrl.isNullOrBlank()) "\nImage URL: $imageUrl" else "")
            })
        })
    }

    val requestBody = buildJsonObject {
        put("model", model)
        put("messages", messagesArray)
        put("temperature", 0.2)
    }.toString()

    return try {
        val responseStr = httpRequest(
            method = "POST",
            url = url,
            headers = mapOf(
                "Content-Type" to "application/json",
                "Authorization" to "Bearer $apiKey"
            ),
            body = requestBody
        )
        val responseJson = jsonParser.parseToJsonElement(responseStr).jsonObject
        val choices = responseJson["choices"]?.jsonArray
        val firstChoice = choices?.firstOrNull()?.jsonObject
        val message = firstChoice?.get("message")?.jsonObject
        message?.get("content")?.jsonPrimitive?.content ?: ""
    } catch (e: Exception) {
        ""
    }
}

// แยกดึงเฉพาะคะแนนระดับความรุนแรงภัยพิบัติออกมาจากข้อความวิเคราะห์ของโมเดลภาษา
private fun extractSeverityScore(text: String): Int {
    val regex = Regex("""Estimated Severity:\s*([1-5])""", RegexOption.IGNORE_CASE)
    val match = regex.find(text)
    return match?.groupValues?.get(1)?.toIntOrNull() ?: 3
}

// ดึงข้อมูลสภาพอากาศแบบสำรองจากบริการพับลิก Open-Meteo ในกรณีที่ TMD API ขัดข้องหรือไม่มี Token
private fun fetchOpenMeteoFallback(
    lat: Double,
    lon: Double,
    daily: Boolean,
    duration: Int,
    provinceName: String? = null
): JsonElement {
    val days = if (daily) duration else ((duration + 23) / 24).coerceAtLeast(1)
    val url = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon" +
            "&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,wind_direction_10m," +
            "wind_speed_925hPa,wind_direction_925hPa,wind_speed_850hPa,wind_direction_850hPa," +
            "wind_speed_700hPa,wind_direction_700hPa,wind_speed_500hPa,wind_direction_500hPa," +
            "wind_speed_200hPa,wind_direction_200hPa,pressure_msl,surface_pressure," +
            "cloud_cover_low,cloud_cover_mid,cloud_cover_high,shortwave_radiation,weather_code" +
            "&forecast_days=$days&timezone=Asia/Bangkok"

    val raw = httpRequest("GET", url)
    val root = Json.parseToJsonElement(raw).jsonObject
    val hourlyObj = root["hourly"]?.jsonObject ?: return buildJsonObject { }
    val timeArr = hourlyObj["time"]?.jsonArray ?: return buildJsonObject { }

    val tempArr = hourlyObj["temperature_2m"]?.jsonArray
    val rhArr = hourlyObj["relative_humidity_2m"]?.jsonArray
    val rainArr = hourlyObj["rain"]?.jsonArray
    val ws10mArr = hourlyObj["wind_speed_10m"]?.jsonArray
    val wd10mArr = hourlyObj["wind_direction_10m"]?.jsonArray
    val ws925Arr = hourlyObj["wind_speed_925hPa"]?.jsonArray
    val wd925Arr = hourlyObj["wind_direction_925hPa"]?.jsonArray
    val ws850Arr = hourlyObj["wind_speed_850hPa"]?.jsonArray
    val wd850Arr = hourlyObj["wind_direction_850hPa"]?.jsonArray
    val ws700Arr = hourlyObj["wind_speed_700hPa"]?.jsonArray
    val wd700Arr = hourlyObj["wind_direction_700hPa"]?.jsonArray
    val ws500Arr = hourlyObj["wind_speed_500hPa"]?.jsonArray
    val wd500Arr = hourlyObj["wind_direction_500hPa"]?.jsonArray
    val ws200Arr = hourlyObj["wind_speed_200hPa"]?.jsonArray
    val wd200Arr = hourlyObj["wind_direction_200hPa"]?.jsonArray
    val slpArr = hourlyObj["pressure_msl"]?.jsonArray
    val psfcArr = hourlyObj["surface_pressure"]?.jsonArray
    val cloudlowArr = hourlyObj["cloud_cover_low"]?.jsonArray
    val cloudmedArr = hourlyObj["cloud_cover_mid"]?.jsonArray
    val cloudhighArr = hourlyObj["cloud_cover_high"]?.jsonArray
    val swdownArr = hourlyObj["shortwave_radiation"]?.jsonArray
    val codeArr = hourlyObj["weather_code"]?.jsonArray

    val forecastsArray = buildJsonArray {
        if (daily) {
            val groupedIndices = mutableMapOf<String, MutableList<Int>>()
            for (i in 0 until timeArr.size) {
                val t = timeArr[i].jsonPrimitive.content
                if (t.length >= 10) {
                    val date = t.substring(0, 10)
                    groupedIndices.getOrPut(date) { mutableListOf() }.add(i)
                }
            }

            val sortedDates = groupedIndices.keys.sorted().take(duration)
            for (date in sortedDates) {
                val indices = groupedIndices[date] ?: continue

                val temps = indices.mapNotNull { tempArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val tcMax = if (temps.isNotEmpty()) temps.maxOrNull() ?: 0.0 else 0.0
                val tcMin = if (temps.isNotEmpty()) temps.minOrNull() ?: 0.0 else 0.0

                val rhs = indices.mapNotNull { rhArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val rh = if (rhs.isNotEmpty()) rhs.average() else 70.0

                val slps = indices.mapNotNull { slpArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val slp = if (slps.isNotEmpty()) slps.average() else 1013.25

                val psfcs = indices.mapNotNull { psfcArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val psfc = if (psfcs.isNotEmpty()) psfcs.average() else 1010.0

                val rains = indices.mapNotNull { rainArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val rain = rains.sum()

                fun maxWindSpeed(arr: JsonArray?): Double {
                    val values = indices.mapNotNull { arr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                    return if (values.isNotEmpty()) (values.maxOrNull() ?: 0.0) / 3.6 else 0.0
                }

                fun avgWindDirection(arr: JsonArray?): Double {
                    val values = indices.mapNotNull { arr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                    return if (values.isNotEmpty()) values.average() else 0.0
                }

                val ws10m = maxWindSpeed(ws10mArr)
                val wd10m = avgWindDirection(wd10mArr)
                val ws925 = maxWindSpeed(ws925Arr)
                val wd925 = avgWindDirection(wd925Arr)
                val ws850 = maxWindSpeed(ws850Arr)
                val wd850 = avgWindDirection(wd850Arr)
                val ws700 = maxWindSpeed(ws700Arr)
                val wd700 = avgWindDirection(wd700Arr)
                val ws500 = maxWindSpeed(ws500Arr)
                val wd500 = avgWindDirection(wd500Arr)
                val ws200 = maxWindSpeed(ws200Arr)
                val wd200 = avgWindDirection(wd200Arr)

                val cloudlows = indices.mapNotNull { cloudlowArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val cloudlow = if (cloudlows.isNotEmpty()) cloudlows.average() else 0.0

                val cloudmeds = indices.mapNotNull { cloudmedArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val cloudmed = if (cloudmeds.isNotEmpty()) cloudmeds.average() else 0.0

                val cloudhighs = indices.mapNotNull { cloudhighArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val cloudhigh = if (cloudhighs.isNotEmpty()) cloudhighs.average() else 0.0

                val swdowns = indices.mapNotNull { swdownArr?.getOrNull(it)?.jsonPrimitive?.doubleOrNull }
                val swdown = if (swdowns.isNotEmpty()) swdowns.average() else 0.0

                val codes = indices.mapNotNull { codeArr?.getOrNull(it)?.jsonPrimitive?.intOrNull }
                val code = if (codes.isNotEmpty()) {
                    codes.groupBy { it }.maxByOrNull { it.value.size }?.key ?: 0
                } else 0

                val cond = when (code) {
                    0 -> 1
                    1, 2 -> 2
                    3 -> 3
                    45, 48 -> 3
                    51, 53, 55 -> 5
                    61, 63 -> 6
                    65 -> 7
                    80, 81 -> 6
                    82 -> 7
                    95, 96, 99 -> 8
                    else -> 1
                }

                // Convert cloud cover % to TMD scale of eighths (0-8)
                val cloudlowOctas = (cloudlow / 12.5).toInt().coerceIn(0, 8)
                val cloudmedOctas = (cloudmed / 12.5).toInt().coerceIn(0, 8)
                val cloudhighOctas = (cloudhigh / 12.5).toInt().coerceIn(0, 8)

                add(buildJsonObject {
                    put("time", date + "T00:00:00+07:00")
                    put("data", buildJsonObject {
                        put("tc_max", tcMax)
                        put("tc_min", tcMin)
                        put("rh", rh)
                        put("slp", slp)
                        put("psfc", psfc)
                        put("rain", rain)
                        put("ws10m", ws10m)
                        put("wd10m", wd10m)
                        put("ws925", ws925)
                        put("wd925", wd925)
                        put("ws850", ws850)
                        put("wd850", wd850)
                        put("ws700", ws700)
                        put("wd700", wd700)
                        put("ws500", ws500)
                        put("wd500", wd500)
                        put("ws200", ws200)
                        put("wd200", wd200)
                        put("cloudlow", cloudlowOctas)
                        put("cloudmed", cloudmedOctas)
                        put("cloudhigh", cloudhighOctas)
                        put("swdown", swdown)
                        put("cond", cond)
                    })
                })
            }
        } else {
            val count = minOf(timeArr.size, duration)
            for (i in 0 until count) {
                val time = timeArr[i].jsonPrimitive.content
                val tc = tempArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val rh = rhArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 70.0
                val rain = rainArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0

                val ws10m = (ws10mArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd10m = wd10mArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val ws925 = (ws925Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd925 = wd925Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val ws850 = (ws850Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd850 = wd850Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val ws700 = (ws700Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd700 = wd700Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val ws500 = (ws500Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd500 = wd500Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val ws200 = (ws200Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0) / 3.6
                val wd200 = wd200Arr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0

                val slp = slpArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 1013.25
                val cloudlow = cloudlowArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val cloudmed = cloudmedArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0
                val cloudhigh = cloudhighArr?.getOrNull(i)?.jsonPrimitive?.doubleOrNull ?: 0.0

                val code = codeArr?.getOrNull(i)?.jsonPrimitive?.intOrNull ?: 0
                val cond = when (code) {
                    0 -> 1
                    1, 2 -> 2
                    3 -> 3
                    45, 48 -> 3
                    51, 53, 55 -> 5
                    61, 63 -> 6
                    65 -> 7
                    80, 81 -> 6
                    82 -> 7
                    95, 96, 99 -> 8
                    else -> 1
                }

                // Convert cloud cover % to TMD scale of eighths (0-8)
                val cloudlowOctas = (cloudlow / 12.5).toInt().coerceIn(0, 8)
                val cloudmedOctas = (cloudmed / 12.5).toInt().coerceIn(0, 8)
                val cloudhighOctas = (cloudhigh / 12.5).toInt().coerceIn(0, 8)

                val formattedTime = if (time.contains("T")) {
                    if (time.length == 16) time + ":00+07:00" else time
                } else {
                    time + ":00+07:00"
                }

                add(buildJsonObject {
                    put("time", formattedTime)
                    put("data", buildJsonObject {
                        put("tc", tc)
                        put("rh", rh)
                        put("slp", slp)
                        put("rain", rain)
                        put("ws10m", ws10m)
                        put("wd10m", wd10m)
                        put("ws925", ws925)
                        put("wd925", wd925)
                        put("ws850", ws850)
                        put("wd850", wd850)
                        put("ws700", ws700)
                        put("wd700", wd700)
                        put("ws500", ws500)
                        put("wd500", wd500)
                        put("ws200", ws200)
                        put("wd200", wd200)
                        put("cloudlow", cloudlowOctas)
                        put("cloudmed", cloudmedOctas)
                        put("cloudhigh", cloudhighOctas)
                        put("cond", cond)
                    })
                })
            }
        }
    }

    return buildJsonObject {
        put("WeatherForecasts", buildJsonArray {
            add(buildJsonObject {
                put("location", buildJsonObject {
                    put("lat", lat)
                    put("lon", lon)
                    put("province", provinceName ?: "Bangkok")
                })
                put("forecasts", forecastsArray)
            })
        })
    }
}
