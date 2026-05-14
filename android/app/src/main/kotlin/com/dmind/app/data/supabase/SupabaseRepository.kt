package com.dmind.app.data.supabase

import com.dmind.app.network.SupabaseRestClient
import com.dmind.app.network.BackendRestClient
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

class SupabaseRepository(
    private val client: SupabaseRestClient = SupabaseRestClient(),
    private val backendClient: BackendRestClient = BackendRestClient(),
) {
    suspend fun fetchIncidentReports(limit: Int = 25): Result<List<IncidentReportRecord>> = runCatching {
        client.select(
            table = "incident_reports_public",
            query = "select=*&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toIncidentReportRecord() }
    }

    suspend fun submitIncidentReport(draft: IncidentReportDraft): Result<IncidentReportRecord?> = runCatching {
        if (backendClient.isConfigured) {
            return@runCatching backendClient.submitIncidentReport(draft)
        }

        val payload = JSONObject()
            .put("type", draft.type)
            .put("title", draft.title)
            .put("description", draft.description)
            .put("location", draft.location)
            .put("coordinates", coordinateJson(draft.latitude, draft.longitude))
            .put("severity_level", draft.severityLevel)
            .put("contact_info", draft.contactInfo)
            .put("image_urls", JSONArray(draft.imageUrls))
            .put("status", "pending")
            .put("is_verified", false)

        client.insert("incident_reports", payload)
            .firstObjectOrNull()
            ?.toIncidentReportRecord()
    }

    suspend fun fetchRealtimeAlerts(limit: Int = 30): Result<List<RealtimeAlertRecord>> = runCatching {
        client.select(
            table = "realtime_alerts",
            query = "select=*&is_active=eq.true&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toRealtimeAlertRecord() }
    }

    suspend fun fetchNotificationHistory(limit: Int = 40): Result<List<NotificationRecord>> = runCatching {
        client.select(
            table = "notifications",
            query = "select=*&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toNotificationRecord() }
    }

    suspend fun markNotificationAsRead(id: String): Result<NotificationRecord?> = runCatching {
        client.update(
            table = "notifications",
            filterQuery = "id=eq.$id",
            payload = JSONObject().put("read_at", Instant.now().toString()),
        ).firstObjectOrNull()?.toNotificationRecord()
    }

    suspend fun saveNotificationSettings(draft: NotificationSettingsDraft): Result<Unit> = runCatching {
        client.insert(
            table = "user_notification_settings",
            payload = JSONObject()
                .put("email", draft.email ?: "android-user@d-mind.local")
                .put("enabled", draft.pushEnabled || draft.emailEnabled || draft.smsEnabled)
                .put("radius_km", draft.locationRadiusKm.toInt()),
            returnRepresentation = false,
        )
        Unit
    }

    suspend fun submitVictimReport(draft: VictimReportDraft): Result<Unit> = runCatching {
        client.insert(
            table = "victim_reports",
            payload = JSONObject()
                .put("name", draft.name)
                .put("contact", draft.contact)
                .put("description", draft.description)
                .put("coordinates", coordinateJson(draft.latitude, draft.longitude))
                .put("status", draft.status),
            returnRepresentation = false,
        )
        Unit
    }

    suspend fun submitSatisfactionSurvey(draft: SatisfactionSurveyDraft): Result<Unit> = runCatching {
        client.insert(
            table = "satisfaction_surveys",
            payload = JSONObject()
                .put("overall_rating", draft.overallRating)
                .put("user_interface_rating", draft.userInterfaceRating)
                .put("map_visualization_rating", draft.mapVisualizationRating)
                .put("alert_system_rating", draft.alertSystemRating)
                .put("emergency_info_rating", draft.emergencyInfoRating)
                .put("ai_assistant_rating", draft.aiAssistantRating)
                .put("most_useful_feature", draft.mostUsefulFeature)
                .put("suggestions", draft.suggestions)
                .put("would_recommend", draft.wouldRecommend),
            returnRepresentation = false,
        )
        Unit
    }

    suspend fun invokeAiChat(
        message: String,
        chatHistory: List<Pair<String, String>>,
    ): Result<String> = runCatching {
        val history = JSONArray().apply {
            chatHistory.forEach { (role, content) ->
                put(JSONObject().put("role", role).put("content", content))
            }
        }
        val response = client.invokeFunction(
            name = "ai-chat",
            payload = JSONObject()
                .put("message", message)
                .put("chatHistory", history)
                .put(
                    "systemPrompt",
                    "คุณคือ Dr.Mind ผู้ช่วยด้านภัยพิบัติและเหตุฉุกเฉิน ให้คำแนะนำสั้น กระชับ ปฏิบัติได้จริง และปลอดภัย",
                ),
        )
        response.optString("response").ifBlank {
            response.optString("message").ifBlank { "ยังไม่ได้รับคำตอบจาก Dr.Mind" }
        }
    }

    suspend fun invokeDamageAssessment(draft: DamageAssessmentDraft): Result<JSONObject> = runCatching {
        val assessment = client.insert(
            table = "damage_assessments",
            payload = JSONObject()
                .put("image_url", draft.imageUrl)
                .put("original_filename", draft.originalFilename)
                .put("incident_id", draft.incidentId)
                .put("processing_status", "pending"),
        ).firstObjectOrNull()
        val assessmentId = assessment?.optString("id").orEmpty()
        check(assessmentId.isNotBlank()) { "ไม่สามารถสร้างรายการ damage_assessments ได้" }

        client.invokeFunction(
            name = "analyze-damage",
            payload = JSONObject()
                .put("assessmentId", assessmentId)
                .put("imageUrl", draft.imageUrl)
                .put("originalFilename", draft.originalFilename)
                .put("incidentId", draft.incidentId),
        )
    }

    suspend fun uploadIncidentImage(
        fileName: String,
        contentType: String,
        bytes: ByteArray,
    ): Result<String> = runCatching {
        if (backendClient.isConfigured) {
            return@runCatching backendClient.uploadIncidentImage(fileName, contentType, bytes)
        }

        client.uploadObject(
            bucket = "incident-images",
            path = "android/$fileName",
            contentType = contentType,
            bytes = bytes,
        )
    }

    suspend fun uploadDamageAssessmentImage(
        fileName: String,
        contentType: String,
        bytes: ByteArray,
    ): Result<String> = runCatching {
        client.uploadObject(
            bucket = "damage-assessment-images",
            path = "android/$fileName",
            contentType = contentType,
            bytes = bytes,
        )
    }

    private fun coordinateJson(lat: Double?, lng: Double?): JSONObject? {
        if (lat == null || lng == null) return null
        return JSONObject().put("lat", lat).put("lng", lng)
    }
}

private fun <T> JSONArray.mapObjects(transform: (JSONObject) -> T): List<T> {
    val items = mutableListOf<T>()
    for (index in 0 until length()) {
        optJSONObject(index)?.let { items += transform(it) }
    }
    return items
}

private fun JSONArray.firstObjectOrNull(): JSONObject? = if (length() > 0) optJSONObject(0) else null

private fun JSONObject.toIncidentReportRecord(): IncidentReportRecord = IncidentReportRecord(
    id = optString("id"),
    type = optString("type"),
    title = optString("title"),
    description = optString("description"),
    location = optNullableString("location"),
    severityLevel = optInt("severity_level", 3),
    status = optString("status", "pending"),
    isVerified = optBoolean("is_verified", false),
    createdAt = optString("created_at"),
)

private fun JSONObject.toRealtimeAlertRecord(): RealtimeAlertRecord = RealtimeAlertRecord(
    id = optString("id"),
    alertType = optString("alert_type"),
    title = optString("title"),
    message = optString("message"),
    severityLevel = optInt("severity_level", 3),
    radiusKm = optDouble("radius_km", 0.0),
    isActive = optBoolean("is_active", true),
    createdAt = optNullableString("created_at"),
)

private fun JSONObject.toNotificationRecord(): NotificationRecord = NotificationRecord(
    id = optString("id"),
    title = optString("title"),
    message = optString("message"),
    type = optString("type", "general"),
    severityLevel = optInt("severity_level", 1),
    readAt = optNullableString("read_at"),
    createdAt = optString("created_at"),
)

private fun JSONObject.optNullableString(name: String): String? {
    if (!has(name) || isNull(name)) return null
    return optString(name).takeIf { it.isNotBlank() }
}
