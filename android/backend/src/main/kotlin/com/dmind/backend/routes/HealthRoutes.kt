package com.dmind.backend.routes

import com.dmind.backend.HealthResponse
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

fun Route.healthRoutes() {
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
