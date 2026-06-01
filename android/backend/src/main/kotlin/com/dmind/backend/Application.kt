package com.dmind.backend

// นำเข้าไลบรารีและแพ็กเกจที่จำเป็น
import com.google.auth.oauth2.GoogleCredentials
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.request.receiveStream
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.max
import com.dmind.backend.routes.analyticsRoutes
import com.dmind.backend.routes.disasterDataRoutes
import com.dmind.backend.routes.alertRoutes
import com.dmind.backend.routes.notificationRoutes
import com.dmind.backend.routes.mediaRoutes
import com.dmind.backend.routes.dashboardRoute
import kotlinx.coroutines.launch

// ฟังก์ชันหลัก (Entry Point) สำหรับเริ่มต้นทำงานเซิร์ฟเวอร์ Ktor บน Netty Engine
fun main() {
    val port = setting("PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, module = Application::dmindModule).start(wait = true)
}

// โมดูลหลักในการตั้งค่าเซิร์ฟเวอร์ Ktor (กำหนด Routing, Content Negotiation และบริการอื่นๆ)
fun Application.dmindModule() {
    val config = GatewayConfig.fromEnvironment()
    val supabase = SupabaseGateway(config)
    val deviceRegistry = DeviceTokenRegistry(config.tokenStorePath, supabase)
    val cacheService = com.dmind.backend.service.CacheService()
    val dataAggregator = com.dmind.backend.service.DataAggregatorService()

    // Start Automatic Alert Dispatcher in a background coroutine
    com.dmind.backend.service.AutomaticAlertDispatcher.start(
        config = config,
        deviceRegistry = deviceRegistry,
        dataAggregator = dataAggregator,
        scope = this
    )

    // ตั้งค่าสำหรับการแปลงข้อมูล Request/Response เป็น JSON
    install(ContentNegotiation) {
        json(responseJson)
    }

    // กำหนดเส้นทาง (Routing) ของ API แต่ละส่วน
    routing {
        analyticsRoutes(cacheService, dataAggregator)
        disasterDataRoutes(config)
        alertRoutes(config, supabase)
        notificationRoutes(config, deviceRegistry, dataAggregator)
        mediaRoutes(config, supabase)
        dashboardRoute()
        // เส้นทางสำหรับตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์
        get("/health") {
            call.respond(
                HealthResponse(
                    status = "ok",
                    service = "d-mind-backend",
                    detail = "gateway ready",
                ),
            )
        }
    }

}

// ฟังก์ชันตรวจสอบความถูกต้องของสิทธิ์ผู้ดูแลระบบ (Admin Bearer Token)
internal suspend fun ApplicationCall.requireAdmin(config: GatewayConfig): Boolean {
    if (config.adminToken.isBlank()) {
        respondError(
            HttpStatusCode.ServiceUnavailable,
            "admin_auth_not_configured",
            "DMIND_ADMIN_TOKEN is required for privileged notification dispatch.",
        )
        return false
    }
    val expected = "Bearer ${config.adminToken}"
    val actual = request.headers["Authorization"].orEmpty()
    if (actual != expected) {
        respondError(HttpStatusCode.Unauthorized, "unauthorized", "A valid admin bearer token is required.")
        return false
    }
    return true
}

// ฟังก์ชันส่ง response ข้อผิดพลาดกลับไปยังไคลเอนต์ในรูปแบบโครงสร้างมาตรฐาน
internal suspend fun ApplicationCall.respondError(status: HttpStatusCode, code: String, message: String) {
    respond(status, ErrorResponse(code = code, message = message, requestId = requestId()))
}

// ดึงค่า Request ID จาก Header หรือทำการสร้าง UUID ใหม่ขึ้นมา
private fun ApplicationCall.requestId(): String =
    request.headers["X-Request-ID"]?.takeIf { it.isNotBlank() } ?: UUID.randomUUID().toString()

// ฟังก์ชันตรวจสอบความปลอดภัย รันคำสั่งดักจับ Exception และจำกัดความถี่คำขอ (Rate Limit)
internal suspend fun ApplicationCall.handleSafely(
    rateLimited: Boolean = false,
    config: GatewayConfig = GatewayConfig.fromEnvironment(),
    block: suspend () -> Unit,
) {
    try {
        if (rateLimited && !RateLimiter.allow(rateLimitKey(), config.rateLimitPerMinute)) {
            respondError(HttpStatusCode.TooManyRequests, "rate_limited", "Too many requests. Try again later.")
            return
        }
        block()
    } catch (e: ValidationException) {
        respondError(HttpStatusCode.BadRequest, "bad_request", e.message ?: "Invalid request.")
    } catch (e: UpstreamException) {
        respondError(
            HttpStatusCode.fromValue(e.statusCode).takeIf { e.statusCode in 400..599 }
                ?: HttpStatusCode.BadGateway,
            "upstream_error",
            e.message ?: "Upstream request failed.",
        )
    } catch (e: Exception) {
        respondError(HttpStatusCode.BadRequest, "bad_request", e.message ?: e.javaClass.simpleName)
    }
}

// ค้นหาที่อยู่ IP หรือระบุคีย์เพื่อระบุตัวตนในการทำ Rate Limit
private fun ApplicationCall.rateLimitKey(): String =
    request.headers["X-Forwarded-For"]?.substringBefore(',')?.trim()?.takeIf { it.isNotBlank() }
        ?: request.headers["X-Real-IP"]?.takeIf { it.isNotBlank() }
        ?: "local"

// ฟังก์ชันสำหรับตรวจเช็คเงื่อนิวัด หากไม่เป็นจริงจะโยน ValidationException
internal fun validate(condition: Boolean, message: String) {
    if (!condition) throw ValidationException(message)
}

// คลาสข้อยกเว้นสำหรับข้อมูลที่ไม่ผ่านเกณฑ์ตรวจสอบ
internal class ValidationException(message: String) : IllegalArgumentException(message)
// คลาสข้อยกเว้นสำหรับกรณีที่การดึงข้อมูลจาก API ปลายทางล้มเหลว
internal class UpstreamException(val statusCode: Int, body: String) :
    IllegalStateException("HTTP $statusCode: ${body.take(240)}")

// ออบเจกต์สำหรับจำกัดจำนวนคำขอในแต่ละช่วงเวลา (Rate Limiting)
private object RateLimiter {
    private data class Bucket(var windowStartMillis: Long, var count: Int)
    private val buckets = ConcurrentHashMap<String, Bucket>()

    // ตรวจสอบและอัปเดตจำนวนคำขอในสไลดิ้งวินโดว์ของ IP ปลายทาง
    fun allow(key: String, limitPerMinute: Int): Boolean {
        if (limitPerMinute <= 0) return true
        val now = System.currentTimeMillis()
        val windowMillis = 60_000L
        val bucket = buckets.compute(key) { _, current ->
            if (current == null || now - current.windowStartMillis >= windowMillis) {
                Bucket(now, 1)
            } else {
                current.count += 1
                current
            }
        }
        return (bucket?.count ?: 0) <= limitPerMinute
    }
}

// โมเดลสำหรับส่งข้อมูลแสดงสถานะการทำงาน (Health Response)
@Serializable
data class HealthResponse(val status: String, val service: String, val detail: String)

// โมเดลข้อมูลตอบกลับของเกตเวย์
@Serializable
data class GatewayResponse(val id: String, val status: String, val detail: String)

// โมเดลรายงานรายละเอียดจากการวิเคราะห์ข้อมูลหรือเหตุการณ์
@Serializable
data class ReportResponse(
    val id: String,
    val status: String,
    val detail: String,
    val report: JsonElement,
)

// โมเดลข้อมูลตอบกลับแบบ JSON
@Serializable
data class JsonDataResponse(val status: String, val detail: String, val data: JsonElement)

// โมเดลข้อมูลตอบกลับเมื่ออัปโหลดไฟล์สื่อสำเร็จ
@Serializable
data class MediaUploadResponse(
    val id: String,
    val status: String,
    val detail: String,
    val storagePath: String,
    val publicUrl: String,
)

// โมเดลผลลัพธ์การส่งข้อความแจ้งเตือนผ่านระบบ Push Notification
@Serializable
data class NotificationSendResponse(
    val status: String,
    val detail: String,
    val requested: Int,
    val sent: Int,
    val failed: Int,
    val configured: Boolean,
    val errors: List<String> = emptyList(),
)

// โมเดลรายละเอียดความผิดพลาดที่เกิดขึ้น
@Serializable
data class ErrorResponse(val code: String, val message: String, val requestId: String)

// โมเดลคำขอช่วยเหลือฉุกเฉิน (SOS Request)
@Serializable
data class SosRequest(
    val id: String? = null,
    val userId: String = "anonymous",
    val latitude: Double,
    val longitude: Double,
    val batteryLevel: Int = -1,
    val message: String,
)

// โมเดลรายงานเหตุการณ์/ภัยพิบัติที่ผู้ใช้งานแจ้งเข้ามา
@Serializable
data class IncidentReportRequest(
    val type: String,
    val title: String,
    val description: String,
    val location: String? = null,
    val coordinates: Coordinates? = null,
    val severityLevel: Int = 3,
    val contactInfo: String? = null,
    val imageUrls: List<String> = emptyList(),
    val installationId: String? = null,
)

// โมเดลระบุพิกัดละติจูดและลองจิจูด
@Serializable
data class Coordinates(val lat: Double? = null, val lng: Double? = null)

// โมเดลคำขอลงทะเบียน Token ของอุปกรณ์เพื่อรับการแจ้งเตือนผ่าน FCM
@Serializable
data class FcmRegistrationRequest(
    val token: String,
    val platform: String = "android",
    val userId: String? = null,
    val installationId: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
)

// โมเดลคำขอส่งการแจ้งเตือนไปยังกลุ่มเป้าหมายหรือผู้ใช้งานรายคน
@Serializable
data class NotificationSendRequest(
    val title: String,
    val message: String,
    val alertType: String = "disaster",
    val userId: String? = null,
    val installationId: String? = null,
    val token: String? = null,
    val broadcast: Boolean = false,
    val recommendation: String? = null,
    val leadTimeSeconds: String? = null,
    val extraActionUrl: String? = null,
    val extraIcon: String? = null,
    val mmi: String? = null,
    val severity: String? = null,
)

// ข้อมูลของอุปกรณ์ที่ถูกบันทึกไว้ในระบบส่งข้อความแจ้งเตือน
@Serializable
internal data class RegisteredDevice(
    val token: String,
    val platform: String,
    val userId: String?,
    val installationId: String?,
    val updatedAt: String,
)

// คลาสจัดการการบันทึกและดึงข้อมูลโทเค็นของแต่ละอุปกรณ์ในระบบ
internal class DeviceTokenRegistry(
    private val storePath: Path,
    private val supabase: SupabaseGateway,
) {
    private val devices = ConcurrentHashMap<String, RegisteredDevice>()

    init {
        load()
    }

    // ลงทะเบียนหรืออัปเดตอุปกรณ์พร้อมบันทึกไฟล์โลคอลและซิงก์ข้อมูลไปที่ Supabase
    @Synchronized
    fun register(request: FcmRegistrationRequest): String {
        val device = RegisteredDevice(
            token = request.token,
            platform = request.platform.ifBlank { "android" },
            userId = request.userId?.takeIf { it.isNotBlank() },
            installationId = request.installationId?.takeIf { it.isNotBlank() },
            updatedAt = Instant.now().toString(),
        )
        devices[request.token] = device
        persist()

        val syncDetail = if (supabase.isConfigured) {
            runCatching { supabase.upsertDeviceToken(device); " synced to Supabase." }
                .getOrElse { " persisted locally; Supabase sync failed: ${it.message}" }
        } else {
            " persisted locally; Supabase not configured."
        }
        return "registered ${devices.size} device token(s);$syncDetail"
    }

    // ค้นหารายชื่อโทเค็นเป้าหมายตามเงื่อนไขในตัวแปรคำขอส่งแจ้งเตือน
    fun resolveTargets(request: NotificationSendRequest): List<String> {
        request.token?.takeIf { it.isNotBlank() }?.let { return listOf(it) }
        if (request.broadcast) return devices.keys().toList()
        request.installationId?.takeIf { it.isNotBlank() }?.let { installationId ->
            return devices.values.filter { it.installationId == installationId }.map { it.token }.distinct()
        }
        request.userId?.takeIf { it.isNotBlank() }?.let { userId ->
            return devices.values.filter { it.userId == userId }.map { it.token }.distinct()
        }
        return emptyList()
    }

    // โหลดโทเค็นที่บันทึกไว้ในเครื่องขึ้นมาที่หน่วยความจำเมื่อระบบเริ่มทำงาน
    private fun load() {
        if (!Files.exists(storePath)) return
        runCatching {
            val text = Files.readString(storePath, StandardCharsets.UTF_8)
            responseJson.decodeFromString<List<RegisteredDevice>>(text)
                .forEach { devices[it.token] = it }
        }
    }

    // เขียนโทเค็นปัจจุบันที่ถูกลงทะเบียนทั้งหมดลงไฟล์จัดเก็บแบบถาวร
    @Synchronized
    private fun persist() {
        Files.createDirectories(storePath.parent ?: Paths.get("."))
        Files.writeString(
            storePath,
            responseJson.encodeToString(devices.values.sortedBy { it.token }),
            StandardCharsets.UTF_8,
        )
    }
}

// คลาสเก็บบันทึกข้อมูลการตั้งค่าและคีย์ต่างๆ ที่ระบบจำเป็นต้องใช้
internal data class GatewayConfig(
    val adminToken: String,
    val supabaseUrl: String,
    val supabaseServiceRoleKey: String,
    val tmdApiToken: String,
    val fcmProjectId: String,
    val tokenStorePath: Path,
    val rateLimitPerMinute: Int,
    val uploadMaxBytes: Int,
    val openAiApiKey: String,
    val thaiLlmApiKey: String,
    val thaiLlmBaseUrl: String,
    val thaiLlmModel: String,
) {
    companion object {
        // อ่านการตั้งค่าทั้งหมดจากสภาพแวดล้อมระบบ (Environment Variables หรือไฟล์ local.properties)
        fun fromEnvironment(): GatewayConfig {
            val tokenStore = setting("DMIND_TOKEN_STORE_PATH") ?: "build/device-push-tokens.json"
            return GatewayConfig(
                adminToken = setting("DMIND_ADMIN_TOKEN").orEmpty(),
                supabaseUrl = setting("SUPABASE_URL")
                    ?: setting("VITE_SUPABASE_URL")
                    ?: "",
                supabaseServiceRoleKey = setting("SUPABASE_SERVICE_ROLE_KEY")
                    ?: setting("SUPABASE_SERVICE_KEY")
                    ?: "",
                tmdApiToken = setting("DMIND_TMD_API_TOKEN")
                    ?: setting("TMD_API_TOKEN")
                    ?: setting("VITE_TMD_API_TOKEN")
                    ?: "",
                fcmProjectId = setting("FCM_PROJECT_ID")
                    ?: setting("FIREBASE_PROJECT_ID")
                    ?: "",
                tokenStorePath = Paths.get(tokenStore),
                rateLimitPerMinute = setting("DMIND_RATE_LIMIT_PER_MINUTE")?.toIntOrNull()?.let { max(it, 1) } ?: 60,
                uploadMaxBytes = setting("DMIND_UPLOAD_MAX_BYTES")?.toIntOrNull()?.let { max(it, 1) } ?: 8 * 1024 * 1024,
                openAiApiKey = setting("OPENAI_API_KEY").orEmpty(),
                thaiLlmApiKey = setting("THAI_LLM_API_KEY").orEmpty(),
                thaiLlmBaseUrl = setting("THAI_LLM_BASE_URL")?.removeSuffix("/") ?: "https://api.opentyphoon.ai/v1",
                thaiLlmModel = setting("THAI_LLM_MODEL") ?: "typhoon-v1.5-instruct",
            )
        }
    }
}

// คลาสจัดการการเชื่อมต่อ ส่งคำขอ และจัดการข้อมูลต่างๆ ใน Supabase
internal class SupabaseGateway(private val config: GatewayConfig) {
    val isConfigured: Boolean =
        config.supabaseUrl.startsWith("https://") && config.supabaseServiceRoleKey.isNotBlank()

    // ดึงข้อมูลการแจ้งเตือนที่กำลังเปิดใช้งานอยู่ในปัจจุบัน
    fun fetchActiveAlerts(): JsonElement {
        ensureConfigured()
        return request(
            method = "GET",
            path = "/rest/v1/realtime_alerts?select=*&is_active=eq.true&order=created_at.desc&limit=50",
        ).json()
    }

    // บันทึกข้อมูลรายงานเหตุการณ์ใหม่ลงในฐานข้อมูล Supabase
    fun insertIncidentReport(request: IncidentReportRequest): JsonElement {
        ensureConfigured()
        val payload = buildJsonObject {
            put("type", request.type.trim())
            put("title", request.title.trim())
            put("description", request.description.trim())
            request.location?.trim()?.takeIf { it.isNotBlank() }?.let { put("location", it) }
            request.coordinates?.takeIf { it.lat != null && it.lng != null }?.let { coordinates ->
                put(
                    "coordinates",
                    buildJsonObject {
                        put("lat", coordinates.lat!!)
                        put("lng", coordinates.lng!!)
                    },
                )
            }
            put("severity_level", request.severityLevel)
            request.contactInfo?.trim()?.takeIf { it.isNotBlank() }?.let { put("contact_info", it) }
            put("image_urls", JsonArray(request.imageUrls.map { JsonPrimitive(it) }))
            put("status", "pending")
            put("is_verified", false)
        }
        return request(
            method = "POST",
            path = "/rest/v1/incident_reports",
            body = payload.toString(),
            headers = mapOf(
                "Content-Type" to "application/json",
                "Prefer" to "return=representation",
            ),
        ).json()
    }

    // ลงทะเบียนหรืออัปเดต Token อุปกรณ์ในฐานข้อมูล Supabase
    fun upsertDeviceToken(device: RegisteredDevice): JsonElement {
        ensureConfigured()
        val payload = buildJsonObject {
            put("token", device.token)
            put("platform", device.platform)
            device.userId?.let { put("user_id_text", it) }
            device.installationId?.let { put("installation_id", it) }
            put("updated_at", device.updatedAt)
            put("is_active", true)
        }
        return request(
            method = "POST",
            path = "/rest/v1/device_push_tokens?on_conflict=token",
            body = payload.toString(),
            headers = mapOf(
                "Content-Type" to "application/json",
                "Prefer" to "resolution=merge-duplicates,return=representation",
            ),
        ).json()
    }

    // อัปโหลดไฟล์วัตถุ (สื่อรูปภาพ/วิดีโอ) ไปจัดเก็บบน Supabase Storage
    fun uploadObject(bucket: String, path: String, contentType: String, bytes: ByteArray): UploadedObject {
        ensureConfigured()
        val encodedPath = path.split('/').joinToString("/") {
            URLEncoder.encode(it, "UTF-8").replace("+", "%20")
        }
        val response = request(
            method = "POST",
            path = "/storage/v1/object/$bucket/$encodedPath",
            bodyBytes = bytes,
            headers = mapOf(
                "Content-Type" to contentType,
                "x-upsert" to "false",
            ),
        )
        val uploadedPath = runCatching {
            response.json().jsonObject["Key"]?.jsonPrimitive?.contentOrNull?.removePrefix("$bucket/")
        }.getOrNull() ?: path
        return UploadedObject(
            storagePath = "$bucket/$uploadedPath",
            publicUrl = "${config.supabaseUrl.trimEnd('/')}/storage/v1/object/public/$bucket/$encodedPath",
        )
    }

    // ส่งคำขอแบบระบุ Auth Header เพื่อใช้เรียก Supabase API
    private fun request(
        method: String,
        path: String,
        body: String? = null,
        bodyBytes: ByteArray? = null,
        headers: Map<String, String> = emptyMap(),
    ): String {
        val base = config.supabaseUrl.trimEnd('/')
        return httpRequest(
            method = method,
            url = "$base$path",
            headers = mapOf(
                "apikey" to config.supabaseServiceRoleKey,
                "Authorization" to "Bearer ${config.supabaseServiceRoleKey}",
                "Accept" to "application/json",
            ) + headers,
            body = body,
            bodyBytes = bodyBytes,
        )
    }

    // ยืนยันว่าการตั้งค่า Supabase สมบูรณ์และพร้อมใช้งาน
    private fun ensureConfigured() {
        check(isConfigured) { "Supabase service role configuration is missing." }
    }
}

// โมเดลสำหรับเก็บผลลัพธ์การอัปโหลดไฟล์
internal data class UploadedObject(val storagePath: String, val publicUrl: String)

// คลาสบริการส่งการแจ้งเตือนด้วย Push Notification ผ่าน FCM HTTP v1 API
internal class FcmHttpV1Sender private constructor(
    private val projectId: String,
    private val credentials: GoogleCredentials?,
    val configurationMessage: String,
) {
    val isConfigured: Boolean = projectId.isNotBlank() && credentials != null

    // ทำการส่งแจ้งเตือนโดยใช้โทเค็นและเนื้อหาที่กำหนด
    fun send(token: String, request: NotificationSendRequest): SendResult {
        if (!isConfigured || credentials == null) {
            return SendResult(false, configurationMessage)
        }

        return try {
            credentials.refreshIfExpired()
            val accessToken = credentials.accessToken.tokenValue
            val endpoint = "https://fcm.googleapis.com/v1/projects/$projectId/messages:send"
            val body = responseJson.encodeToString(FcmV1Request(message = request.toFcmMessage(token)))
            val response = httpRequest(
                method = "POST",
                url = endpoint,
                headers = mapOf(
                    "Authorization" to "Bearer $accessToken",
                    "Content-Type" to "application/json; charset=utf-8",
                ),
                body = body,
            )
            SendResult(true, response)
        } catch (e: Exception) {
            SendResult(false, e.message ?: e.javaClass.simpleName)
        }
    }

    companion object {
        private const val FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"

        // สร้างอินสแตนซ์ผู้ส่งโดยอิงจากรายละเอียดสิทธิ์ของ Google
        fun fromConfig(config: GatewayConfig): FcmHttpV1Sender {
            if (config.fcmProjectId.isBlank()) {
                return FcmHttpV1Sender("", null, "FCM_PROJECT_ID or FIREBASE_PROJECT_ID is not configured")
            }

            val credentials = try {
                GoogleCredentials.getApplicationDefault()
                    .createScoped(listOf(FCM_SCOPE))
            } catch (e: Exception) {
                return FcmHttpV1Sender(
                    config.fcmProjectId,
                    null,
                    "Google application credentials are not configured: ${e.message}",
                )
            }

            return FcmHttpV1Sender(config.fcmProjectId, credentials, "configured")
        }
    }
}

// โมเดลรายงานผลการส่งแจ้งเตือนรายโทเค็น
internal data class SendResult(val success: Boolean, val message: String)

// ฟังก์ชันส่วนขยายช่วยแปลง NotificationSendRequest เป็นโครงสร้าง FCM Message
private fun NotificationSendRequest.toFcmMessage(token: String): FcmV1Message {
    val dataMap = mutableMapOf(
        "alert_type" to alertType,
        "alert_title" to title,
        "alert_message" to message
    )
    recommendation?.let { dataMap["recommendation"] = it }
    leadTimeSeconds?.let { dataMap["lead_time_seconds"] = it }
    extraActionUrl?.let { dataMap["extra_action_url"] = it }
    extraIcon?.let { dataMap["extra_icon"] = it }
    mmi?.let { dataMap["mmi"] = it }
    severity?.let { dataMap["severity"] = it }

    return FcmV1Message(
        token = token,
        data = dataMap,
        android = FcmAndroidConfig(priority = "HIGH"),
    )
}

// คลาสส่งคำขอของระบบ FCM V1
@Serializable
private data class FcmV1Request(
    val message: FcmV1Message,
    @SerialName("validate_only") val validateOnly: Boolean = false,
)

// ข้อมูลข้อความใน API ของ FCM V1
@Serializable
private data class FcmV1Message(
    val token: String,
    val data: Map<String, String>,
    val android: FcmAndroidConfig,
)

// การตั้งค่าลำดับความสำคัญของข้อความแจ้งเตือนบน Android
@Serializable
private data class FcmAndroidConfig(val priority: String)

// ฟังก์ชันแบบ Low-level สำหรับส่งคำขอ HTTP Request
internal fun httpRequest(
    method: String,
    url: String,
    headers: Map<String, String> = emptyMap(),
    body: String? = null,
    bodyBytes: ByteArray? = null,
): String {
    val connection = (URI(url).toURL().openConnection() as HttpURLConnection).apply {
        requestMethod = method
        connectTimeout = 15_000
        readTimeout = 30_000
        headers.forEach { (key, value) -> setRequestProperty(key, value) }
        if (body != null || bodyBytes != null) {
            doOutput = true
        }
    }
    try {
        body?.let {
            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer -> writer.write(it) }
        }
        bodyBytes?.let {
            connection.outputStream.use { stream -> stream.write(it) }
        }
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val response = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
        if (code !in 200..299) {
            throw UpstreamException(code, response)
        }
        return response
    } finally {
        connection.disconnect()
    }
}

// ฟังก์ชันส่วนขยายช่วยแปลง String ไปเป็นโครงสร้าง JsonElement
internal fun String.json(): JsonElement = responseJson.parseToJsonElement(ifBlank { "{}" })

// ฟังก์ชันทำความสะอาดชื่อไฟล์โดยแทนที่ตัวอักษรพิเศษที่ไม่ปลอดภัยด้วยเครื่องหมายขีดล่าง
internal fun String.sanitizeFileName(): String =
    replace(Regex("[^A-Za-z0-9._-]"), "_").trim('_').take(120)

// ดึงค่าการตั้งค่าจากระบบหรือแหล่งไฟล์ตั้งค่าแบบเรียงลำดับความสำคัญ
private fun setting(name: String): String? {
    val propertyName = "dmind." + name.lowercase().replace('_', '.')
    val raw = System.getProperty(name)
        ?: System.getProperty(propertyName)
        ?: System.getenv(name)
        ?: loadFromLocalProperties(name)
        ?: loadFromLocalProperties(propertyName)
    return raw?.trim()?.removeSurrounding("\"")?.removeSurrounding("'")?.trim()
}

// ช่วยดึงค่าคอนฟิกจากการอ่านไฟล์ local.properties ในระบบ
private fun loadFromLocalProperties(name: String): String? {
    val paths = listOf(
        Paths.get("local.properties"),
        Paths.get("../local.properties")
    )
    for (path in paths) {
        if (Files.exists(path)) {
            try {
                val properties = java.util.Properties()
                Files.newInputStream(path).use { properties.load(it) }
                val value = properties.getProperty(name) ?: properties.getProperty("DMIND_$name")
                if (value != null) return value
            } catch (e: Exception) {
                // Ignore configuration loading errors
            }
        }
    }
    return null
}

// การตั้งค่าพารามิเตอร์เริ่มต้นสำหรับการประมวลผล JSON
private val responseJson = Json {
    prettyPrint = false
    ignoreUnknownKeys = true
    encodeDefaults = false
}
