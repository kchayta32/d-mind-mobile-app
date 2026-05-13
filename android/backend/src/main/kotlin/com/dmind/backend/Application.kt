package com.dmind.backend

import com.google.auth.oauth2.GoogleCredentials
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
    embeddedServer(Netty, port = port, module = Application::dmindModule).start(wait = true)
}

fun Application.dmindModule() {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = false
            ignoreUnknownKeys = true
        })
    }

    routing {
        get("/health") {
            call.respond(HealthResponse(status = "ok", service = "d-mind-backend"))
        }

        get("/alerts") {
            call.respond(
                listOf(
                    AlertDto(
                        id = "demo-alert-1",
                        type = "flood",
                        level = "watch",
                        title = "Flood watch",
                        message = "No live backend source is configured yet.",
                    ),
                ),
            )
        }

        post("/sos") {
            val request = call.receive<SosRequest>()
            call.respond(HttpStatusCode.Accepted, AcceptedResponse(accepted = true, id = request.id ?: "queued"))
        }

        post("/reports") {
            call.respond(HttpStatusCode.Accepted, AcceptedResponse(accepted = true, id = "report-received"))
        }

        get("/weather") {
            call.respond(ProxyPlaceholder(endpoint = "weather", configured = hasEnv("TMD_API_TOKEN")))
        }

        post("/damage-assessment") {
            call.respond(ProxyPlaceholder(endpoint = "damage-assessment", configured = hasEnv("OPENAI_API_KEY")))
        }

        post("/chat") {
            call.respond(ProxyPlaceholder(endpoint = "chat", configured = hasEnv("OPENAI_API_KEY")))
        }

        post("/fcm/register") {
            val request = call.receive<FcmRegistrationRequest>()
            if (request.token.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("token is required"))
                return@post
            }

            DeviceRegistry.register(request)
            call.respond(
                AcceptedResponse(
                    accepted = true,
                    id = "fcm-token",
                    detail = "registered ${DeviceRegistry.count()} device token(s)",
                ),
            )
        }

        post("/notifications/send") {
            val request = call.receive<NotificationSendRequest>()
            val targets = DeviceRegistry.resolveTargets(request)
            if (targets.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, ErrorResponse("no target device tokens found"))
                return@post
            }

            val sender = FcmHttpV1Sender.fromEnvironment()
            if (!sender.isConfigured) {
                call.respond(
                    HttpStatusCode.ServiceUnavailable,
                    NotificationSendResponse(
                        requested = targets.size,
                        sent = 0,
                        failed = targets.size,
                        configured = false,
                        errors = listOf(sender.configurationMessage),
                    ),
                )
                return@post
            }

            val results = targets.map { token -> sender.send(token, request) }
            call.respond(
                NotificationSendResponse(
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

private fun hasEnv(name: String): Boolean = !System.getenv(name).isNullOrBlank()

@Serializable
data class HealthResponse(val status: String, val service: String)

@Serializable
data class AlertDto(
    val id: String,
    val type: String,
    val level: String,
    val title: String,
    val message: String,
)

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
data class FcmRegistrationRequest(
    val token: String,
    val platform: String = "android",
    val userId: String = "anonymous",
)

@Serializable
data class NotificationSendRequest(
    val title: String,
    val message: String,
    val alertType: String = "disaster",
    val userId: String? = null,
    val token: String? = null,
    val broadcast: Boolean = false,
)

@Serializable
data class AcceptedResponse(
    val accepted: Boolean,
    val id: String,
    val detail: String? = null,
)

@Serializable
data class NotificationSendResponse(
    val requested: Int,
    val sent: Int,
    val failed: Int,
    val configured: Boolean,
    val errors: List<String> = emptyList(),
)

@Serializable
data class ErrorResponse(val error: String)

@Serializable
data class ProxyPlaceholder(val endpoint: String, val configured: Boolean)

private data class RegisteredDevice(
    val token: String,
    val platform: String,
    val userId: String,
    val updatedAt: Instant,
)

private object DeviceRegistry {
    private val devices = ConcurrentHashMap<String, RegisteredDevice>()

    fun register(request: FcmRegistrationRequest) {
        devices[request.token] = RegisteredDevice(
            token = request.token,
            platform = request.platform.ifBlank { "android" },
            userId = request.userId.ifBlank { "anonymous" },
            updatedAt = Instant.now(),
        )
    }

    fun resolveTargets(request: NotificationSendRequest): List<String> {
        request.token?.takeIf { it.isNotBlank() }?.let { return listOf(it) }
        if (request.broadcast) return devices.keys().toList()
        val userId = request.userId?.takeIf { it.isNotBlank() } ?: return emptyList()
        return devices.values
            .filter { it.userId == userId }
            .map { it.token }
            .distinct()
    }

    fun count(): Int = devices.size
}

private class FcmHttpV1Sender private constructor(
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
            val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 10_000
                readTimeout = 10_000
                doOutput = true
                setRequestProperty("Authorization", "Bearer $accessToken")
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }

            OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use {
                it.write(fcmJson.encodeToString(FcmV1Request(message = request.toFcmMessage(token))))
            }

            val responseCode = connection.responseCode
            val body = if (responseCode in 200..299) {
                connection.inputStream.bufferedReader().use { it.readText() }
            } else {
                connection.errorStream?.bufferedReader()?.use { it.readText() }.orEmpty()
            }
            connection.disconnect()

            if (responseCode in 200..299) {
                SendResult(true, body)
            } else {
                SendResult(false, "FCM $responseCode: $body")
            }
        } catch (e: Exception) {
            SendResult(false, e.message ?: e.javaClass.simpleName)
        }
    }

    companion object {
        private const val FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"

        fun fromEnvironment(): FcmHttpV1Sender {
            val projectId = System.getenv("FCM_PROJECT_ID")
                ?: System.getenv("FIREBASE_PROJECT_ID")
                ?: ""

            if (projectId.isBlank()) {
                return FcmHttpV1Sender("", null, "FCM_PROJECT_ID or FIREBASE_PROJECT_ID is not configured")
            }

            val credentials = try {
                GoogleCredentials.getApplicationDefault()
                    .createScoped(listOf(FCM_SCOPE))
            } catch (e: Exception) {
                return FcmHttpV1Sender(projectId, null, "Google application credentials are not configured: ${e.message}")
            }

            return FcmHttpV1Sender(projectId, credentials, "configured")
        }
    }
}

private data class SendResult(val success: Boolean, val message: String)

private val fcmJson = Json {
    encodeDefaults = false
    ignoreUnknownKeys = true
}

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
private data class FcmAndroidConfig(
    val priority: String,
)
