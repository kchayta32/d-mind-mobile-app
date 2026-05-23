package com.dmind.backend

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

fun main() {
    val port = setting("PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, module = Application::dmindModule).start(wait = true)
}

fun Application.dmindModule() {
    val config = GatewayConfig.fromEnvironment()
    val supabase = SupabaseGateway(config)
    val deviceRegistry = DeviceTokenRegistry(config.tokenStorePath, supabase)
    val cacheService = com.dmind.backend.service.CacheService()
    val dataAggregator = com.dmind.backend.service.DataAggregatorService()

    install(ContentNegotiation) {
        json(responseJson)
    }

    routing {
        analyticsRoutes(cacheService, dataAggregator)
        get("/health") {
            call.respond(
                HealthResponse(
                    status = "ok",
                    service = "d-mind-backend",
                    detail = "gateway ready",
                ),
            )
        }

        get("/alerts") {
            call.handleSafely {
                if (!supabase.isConfigured) {
                    call.respondError(
                        HttpStatusCode.ServiceUnavailable,
                        "supabase_not_configured",
                        "Supabase service role configuration is required for live alerts.",
                    )
                    return@handleSafely
                }
                call.respond(JsonDataResponse(status = "ok", detail = "live alerts", data = supabase.fetchActiveAlerts()))
            }
        }

        post("/sos") {
            call.handleSafely(rateLimited = true, config = config) {
                val request = call.receive<SosRequest>()
                validate(request.latitude in -90.0..90.0, "latitude must be between -90 and 90")
                validate(request.longitude in -180.0..180.0, "longitude must be between -180 and 180")
                validate(request.message.isNotBlank(), "message is required")
                call.respond(
                    GatewayResponse(
                        id = request.id ?: UUID.randomUUID().toString(),
                        status = "accepted",
                        detail = "SOS queued for downstream dispatch.",
                    ),
                )
            }
        }

        post("/reports") {
            call.handleSafely(rateLimited = true, config = config) {
                val request = call.receive<IncidentReportRequest>()
                validate(request.type.isNotBlank(), "type is required")
                validate(request.title.trim().length in 3..160, "title must be 3-160 characters")
                validate(request.description.trim().length in 5..4000, "description must be 5-4000 characters")
                validate(request.severityLevel in 1..5, "severityLevel must be between 1 and 5")

                if (!supabase.isConfigured) {
                    call.respondError(
                        HttpStatusCode.ServiceUnavailable,
                        "supabase_not_configured",
                        "Supabase service role configuration is required to store reports.",
                    )
                    return@handleSafely
                }

                val inserted = supabase.insertIncidentReport(request)
                val id = inserted.jsonArray.firstOrNull()
                    ?.jsonObject
                    ?.get("id")
                    ?.jsonPrimitive
                    ?.contentOrNull
                    ?: UUID.randomUUID().toString()
                call.respond(
                    ReportResponse(
                        id = id,
                        status = "accepted",
                        detail = "Incident report stored.",
                        report = inserted,
                    ),
                )
            }
        }

        get("/weather") {
            call.handleSafely {
                val token = config.tmdApiToken
                if (token.isBlank()) {
                    call.respondError(
                        HttpStatusCode.ServiceUnavailable,
                        "tmd_not_configured",
                        "TMD_API_TOKEN is required for live weather data.",
                    )
                    return@handleSafely
                }

                val lat = call.request.queryParameters["lat"]?.toDoubleOrNull() ?: 13.7563
                val lon = call.request.queryParameters["lon"]?.toDoubleOrNull() ?: 100.5018
                validate(lat in -90.0..90.0, "lat must be between -90 and 90")
                validate(lon in -180.0..180.0, "lon must be between -180 and 180")
                val duration = call.request.queryParameters["duration"]?.toIntOrNull()?.coerceIn(1, 48) ?: 24
                val date = call.request.queryParameters["date"]
                    ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()
                val fields = "tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond"
                val url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at" +
                    "?lat=$lat&lon=$lon&date=$date&fields=$fields&duration=$duration"
                val data = httpRequest(
                    method = "GET",
                    url = url,
                    headers = mapOf(
                        "accept" to "application/json",
                        "authorization" to "Bearer $token",
                    ),
                ).json()
                call.respond(JsonDataResponse(status = "ok", detail = "live TMD weather", data = data))
            }
        }

        post("/damage-assessment") {
            call.handleSafely(rateLimited = true, config = config) {
                call.respondError(
                    HttpStatusCode.ServiceUnavailable,
                    "damage_assessment_not_configured",
                    "Production damage assessment model endpoint is not configured. Mock analysis is disabled.",
                )
            }
        }

        post("/chat") {
            call.handleSafely(rateLimited = true, config = config) {
                call.respondError(
                    HttpStatusCode.ServiceUnavailable,
                    "chat_not_configured",
                    "Production chat gateway is not configured yet. Use the existing Supabase Edge Function until this backend route is wired.",
                )
            }
        }

        post("/media/incident-images") {
            call.handleSafely(rateLimited = true, config = config) {
                if (!supabase.isConfigured) {
                    call.respondError(
                        HttpStatusCode.ServiceUnavailable,
                        "supabase_not_configured",
                        "Supabase service role configuration is required to upload media.",
                    )
                    return@handleSafely
                }
                val fileName = call.request.queryParameters["fileName"]
                    ?.sanitizeFileName()
                    ?.takeIf { it.isNotBlank() }
                    ?: "incident-${UUID.randomUUID()}.jpg"
                val contentType = call.request.headers["Content-Type"]
                    ?.takeIf { it.startsWith("image/") }
                    ?: "application/octet-stream"
                validate(contentType.startsWith("image/"), "only image uploads are accepted")
                val bytes = call.receiveStream().readBytes()
                validate(bytes.isNotEmpty(), "image body is required")
                validate(bytes.size <= config.uploadMaxBytes, "image exceeds max upload size")

                val path = "android/${Instant.now().epochSecond}-${UUID.randomUUID()}-$fileName"
                val upload = supabase.uploadObject(
                    bucket = "incident-images",
                    path = path,
                    contentType = contentType,
                    bytes = bytes,
                )
                call.respond(
                    MediaUploadResponse(
                        id = UUID.randomUUID().toString(),
                        status = "uploaded",
                        detail = "Incident image uploaded.",
                        storagePath = upload.storagePath,
                        publicUrl = upload.publicUrl,
                    ),
                )
            }
        }

        post("/fcm/register") {
            call.handleSafely(rateLimited = true, config = config) {
                val request = call.receive<FcmRegistrationRequest>()
                validate(request.token.isNotBlank(), "token is required")
                validate(request.platform.isNotBlank(), "platform is required")
                val detail = deviceRegistry.register(request)
                call.respond(
                    GatewayResponse(
                        id = request.installationId ?: request.userId ?: "fcm-token",
                        status = "registered",
                        detail = detail,
                    ),
                )
            }
        }

        post("/notifications/send") {
            call.handleSafely(rateLimited = true, config = config) {
                if (!call.requireAdmin(config)) return@handleSafely
                val request = call.receive<NotificationSendRequest>()
                validate(request.title.trim().length in 1..160, "title is required and must be under 160 characters")
                validate(request.message.trim().length in 1..2000, "message is required and must be under 2000 characters")

                val targets = deviceRegistry.resolveTargets(request)
                if (targets.isEmpty()) {
                    call.respondError(HttpStatusCode.BadRequest, "no_targets", "No target device tokens found.")
                    return@handleSafely
                }

                val sender = FcmHttpV1Sender.fromConfig(config)
                if (!sender.isConfigured) {
                    call.respond(
                        HttpStatusCode.ServiceUnavailable,
                        NotificationSendResponse(
                            status = "not_configured",
                            detail = sender.configurationMessage,
                            requested = targets.size,
                            sent = 0,
                            failed = targets.size,
                            configured = false,
                            errors = listOf(sender.configurationMessage),
                        ),
                    )
                    return@handleSafely
                }

                val results = targets.map { token -> sender.send(token, request) }
                call.respond(
                    NotificationSendResponse(
                        status = if (results.any { it.success }) "sent" else "failed",
                        detail = "FCM HTTP v1 dispatch complete.",
                        requested = targets.size,
                        sent = results.count { it.success },
                        failed = results.count { !it.success },
                        configured = true,
                        errors = results.filterNot { it.success }.map { it.message },
                    ),
                )
            }
        }
    }
}

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

internal suspend fun ApplicationCall.respondError(status: HttpStatusCode, code: String, message: String) {
    respond(status, ErrorResponse(code = code, message = message, requestId = requestId()))
}

private fun ApplicationCall.requestId(): String =
    request.headers["X-Request-ID"]?.takeIf { it.isNotBlank() } ?: UUID.randomUUID().toString()

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

private fun ApplicationCall.rateLimitKey(): String =
    request.headers["X-Forwarded-For"]?.substringBefore(',')?.trim()?.takeIf { it.isNotBlank() }
        ?: request.headers["X-Real-IP"]?.takeIf { it.isNotBlank() }
        ?: "local"

internal fun validate(condition: Boolean, message: String) {
    if (!condition) throw ValidationException(message)
}

internal class ValidationException(message: String) : IllegalArgumentException(message)
internal class UpstreamException(val statusCode: Int, body: String) :
    IllegalStateException("HTTP $statusCode: ${body.take(240)}")

private object RateLimiter {
    private data class Bucket(var windowStartMillis: Long, var count: Int)
    private val buckets = ConcurrentHashMap<String, Bucket>()

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

@Serializable
data class HealthResponse(val status: String, val service: String, val detail: String)

@Serializable
data class GatewayResponse(val id: String, val status: String, val detail: String)

@Serializable
data class ReportResponse(
    val id: String,
    val status: String,
    val detail: String,
    val report: JsonElement,
)

@Serializable
data class JsonDataResponse(val status: String, val detail: String, val data: JsonElement)

@Serializable
data class MediaUploadResponse(
    val id: String,
    val status: String,
    val detail: String,
    val storagePath: String,
    val publicUrl: String,
)

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

@Serializable
data class ErrorResponse(val code: String, val message: String, val requestId: String)

@Serializable
data class SosRequest(
    val id: String? = null,
    val userId: String = "anonymous",
    val latitude: Double,
    val longitude: Double,
    val batteryLevel: Int = -1,
    val message: String,
)

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

@Serializable
data class Coordinates(val lat: Double? = null, val lng: Double? = null)

@Serializable
data class FcmRegistrationRequest(
    val token: String,
    val platform: String = "android",
    val userId: String? = null,
    val installationId: String? = null,
)

@Serializable
data class NotificationSendRequest(
    val title: String,
    val message: String,
    val alertType: String = "disaster",
    val userId: String? = null,
    val installationId: String? = null,
    val token: String? = null,
    val broadcast: Boolean = false,
)

@Serializable
internal data class RegisteredDevice(
    val token: String,
    val platform: String,
    val userId: String?,
    val installationId: String?,
    val updatedAt: String,
)

internal class DeviceTokenRegistry(
    private val storePath: Path,
    private val supabase: SupabaseGateway,
) {
    private val devices = ConcurrentHashMap<String, RegisteredDevice>()

    init {
        load()
    }

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

    private fun load() {
        if (!Files.exists(storePath)) return
        runCatching {
            val text = Files.readString(storePath, StandardCharsets.UTF_8)
            responseJson.decodeFromString<List<RegisteredDevice>>(text)
                .forEach { devices[it.token] = it }
        }
    }

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

internal data class GatewayConfig(
    val adminToken: String,
    val supabaseUrl: String,
    val supabaseServiceRoleKey: String,
    val tmdApiToken: String,
    val fcmProjectId: String,
    val tokenStorePath: Path,
    val rateLimitPerMinute: Int,
    val uploadMaxBytes: Int,
) {
    companion object {
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
                tmdApiToken = setting("TMD_API_TOKEN")
                    ?: setting("VITE_TMD_API_TOKEN")
                    ?: "",
                fcmProjectId = setting("FCM_PROJECT_ID")
                    ?: setting("FIREBASE_PROJECT_ID")
                    ?: "",
                tokenStorePath = Paths.get(tokenStore),
                rateLimitPerMinute = setting("DMIND_RATE_LIMIT_PER_MINUTE")?.toIntOrNull()?.let { max(it, 1) } ?: 60,
                uploadMaxBytes = setting("DMIND_UPLOAD_MAX_BYTES")?.toIntOrNull()?.let { max(it, 1) } ?: 8 * 1024 * 1024,
            )
        }
    }
}

internal class SupabaseGateway(private val config: GatewayConfig) {
    val isConfigured: Boolean =
        config.supabaseUrl.startsWith("https://") && config.supabaseServiceRoleKey.isNotBlank()

    fun fetchActiveAlerts(): JsonElement {
        ensureConfigured()
        return request(
            method = "GET",
            path = "/rest/v1/realtime_alerts?select=*&is_active=eq.true&order=created_at.desc&limit=50",
        ).json()
    }

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

    private fun ensureConfigured() {
        check(isConfigured) { "Supabase service role configuration is missing." }
    }
}

internal data class UploadedObject(val storagePath: String, val publicUrl: String)

internal class FcmHttpV1Sender private constructor(
    private val projectId: String,
    private val credentials: GoogleCredentials?,
    val configurationMessage: String,
) {
    val isConfigured: Boolean = projectId.isNotBlank() && credentials != null

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

internal data class SendResult(val success: Boolean, val message: String)

private fun NotificationSendRequest.toFcmMessage(token: String): FcmV1Message =
    FcmV1Message(
        token = token,
        data = mapOf(
            "alert_type" to alertType,
            "alert_title" to title,
            "alert_message" to message,
        ),
        android = FcmAndroidConfig(priority = "HIGH"),
    )

@Serializable
private data class FcmV1Request(
    val message: FcmV1Message,
    @SerialName("validate_only") val validateOnly: Boolean = false,
)

@Serializable
private data class FcmV1Message(
    val token: String,
    val data: Map<String, String>,
    val android: FcmAndroidConfig,
)

@Serializable
private data class FcmAndroidConfig(val priority: String)

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

internal fun String.json(): JsonElement = responseJson.parseToJsonElement(ifBlank { "{}" })

internal fun String.sanitizeFileName(): String =
    replace(Regex("[^A-Za-z0-9._-]"), "_").trim('_').take(120)

private fun setting(name: String): String? {
    val propertyName = "dmind." + name.lowercase().replace('_', '.')
    return System.getProperty(name)
        ?: System.getProperty(propertyName)
        ?: System.getenv(name)
}

private val responseJson = Json {
    prettyPrint = false
    ignoreUnknownKeys = true
    encodeDefaults = false
}
