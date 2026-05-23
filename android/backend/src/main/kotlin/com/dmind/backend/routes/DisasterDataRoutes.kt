package com.dmind.backend.routes

import com.dmind.backend.GatewayConfig
import com.dmind.backend.JsonDataResponse
import com.dmind.backend.SupabaseGateway
import com.dmind.backend.handleSafely
import com.dmind.backend.respondError
import com.dmind.backend.validate
import com.dmind.backend.httpRequest
import com.dmind.backend.json
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import java.time.LocalDate
import java.time.ZoneId

internal fun Route.disasterDataRoutes(config: GatewayConfig) {
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
}
