package com.dmind.backend.routes

import com.dmind.backend.GatewayConfig
import com.dmind.backend.MediaUploadResponse
import com.dmind.backend.SupabaseGateway
import com.dmind.backend.handleSafely
import com.dmind.backend.respondError
import com.dmind.backend.sanitizeFileName
import com.dmind.backend.validate
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receiveStream
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import java.time.Instant
import java.util.UUID

// กำหนดเส้นทาง URL (Routing) ทั้งหมดที่เกี่ยวข้องกับระบบจัดการไฟล์สื่อมีเดียและการอัปโหลดรูปภาพ
internal fun Route.mediaRoutes(config: GatewayConfig, supabase: SupabaseGateway) {
    // เส้นทางสำหรับการอัปโหลดรูปภาพรายงานเหตุการณ์ภัยพิบัติไปยัง Supabase Storage
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
}
