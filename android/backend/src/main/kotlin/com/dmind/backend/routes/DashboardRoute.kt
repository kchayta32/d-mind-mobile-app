package com.dmind.backend.routes

import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get

// กำหนดเส้นทาง URL (Routing) สำหรับแสดงหน้าจอ Dashboard ของระบบ
fun Route.dashboardRoute() {
    // บริการดึงไฟล์ HTML เพื่อแสดงหน้าแดชบอร์ด
    get("/dashboard") {
        val htmlStream = this::class.java.classLoader.getResourceAsStream("dashboard.html")
        if (htmlStream != null) {
            val htmlText = htmlStream.bufferedReader().use { it.readText() }
            call.respondText(htmlText, ContentType.Text.Html)
        } else {
            call.respond(HttpStatusCode.NotFound, "Dashboard resource not found")
        }
    }
}
