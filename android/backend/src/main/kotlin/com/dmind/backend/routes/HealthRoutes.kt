package com.dmind.backend.routes

import com.dmind.backend.HealthResponse
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

// กำหนดเส้นทาง URL (Routing) สำหรับตรวจสอบความพร้อมใช้งานและสถานะสุขภาพของระบบ
fun Route.healthRoutes() {
    // เส้นทางสำหรับตอบกลับสถานะการทำงานเพื่อความสะดวกในการทำ Health Check
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
