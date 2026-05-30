package com.dmind.backend.routes

import com.dmind.backend.DeviceTokenRegistry
import com.dmind.backend.FcmHttpV1Sender
import com.dmind.backend.GatewayConfig
import com.dmind.backend.GatewayResponse
import com.dmind.backend.NotificationSendResponse
import com.dmind.backend.handleSafely
import com.dmind.backend.respondError
import com.dmind.backend.validate
import com.dmind.backend.FcmRegistrationRequest
import com.dmind.backend.NotificationSendRequest
import com.dmind.backend.requireAdmin
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import kotlinx.serialization.Serializable

// โมเดลรายงานผลการวิเคราะห์และประเมินระบบเตือนภัยฉุกเฉิน
@Serializable
data class AlertEvaluationResponse(
    val status: String,
    val detail: String
)

// กำหนดเส้นทาง URL (Routing) ทั้งหมดสำหรับการแจ้งเตือนผ่าน FCM และการทำงานของระบบเตือนภัยอัตโนมัติ
internal fun Route.notificationRoutes(
    config: GatewayConfig,
    deviceRegistry: DeviceTokenRegistry,
    dataAggregator: com.dmind.backend.service.DataAggregatorService
) {
    // เส้นทางสำหรับการลงทะเบียน FCM Token ของผู้ใช้เพื่อรองรับการรับข้อความแจ้งเตือนภัยพิบัติ
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

    // เส้นทางสำหรับผู้ดูแลระบบ (Admin) ส่งแจ้งเตือนทั่วไปหรือแจ้งเตือนเหตุเจาะจงไปยังอุปกรณ์ต่างๆ
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

    // เส้นทางด่วนสำหรับการรันฟังก์ชันวิเคราะห์สภาพอากาศสะสม/พยากรณ์อากาศเพื่อส่งสัญญาณเตือนภัยโดยอัตโนมัติ
    post("/alerts/evaluate") {
        call.handleSafely(rateLimited = true, config = config) {
            if (!call.requireAdmin(config)) return@handleSafely
            val force = call.request.queryParameters["force"]?.toBoolean() ?: false
            val result = com.dmind.backend.service.AutomaticAlertDispatcher.evaluateAndDispatchAlerts(
                config = config,
                deviceRegistry = deviceRegistry,
                dataAggregator = dataAggregator,
                force = force
            )
            call.respond(
                HttpStatusCode.OK,
                AlertEvaluationResponse(
                    status = "evaluated",
                    detail = result
                )
            )
        }
    }
}
