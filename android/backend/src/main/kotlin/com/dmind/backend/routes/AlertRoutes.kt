package com.dmind.backend.routes

import com.dmind.backend.GatewayConfig
import com.dmind.backend.GatewayResponse
import com.dmind.backend.JsonDataResponse
import com.dmind.backend.ReportResponse
import com.dmind.backend.SupabaseGateway
import com.dmind.backend.handleSafely
import com.dmind.backend.respondError
import com.dmind.backend.validate
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import com.dmind.backend.SosRequest
import com.dmind.backend.IncidentReportRequest
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import java.util.UUID

internal fun Route.alertRoutes(config: GatewayConfig, supabase: SupabaseGateway) {
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
}
