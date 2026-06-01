package com.dmind.app.data.supabase

import com.dmind.app.network.BackendRestClient
import com.dmind.app.network.SupabaseConfig
import com.dmind.app.network.SupabaseRestClient
import com.dmind.app.network.ThaiLlmChatClient
import com.dmind.app.network.ThaiLlmConfig
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant

// คลาส Repository สำหรับเชื่อมต่อและจัดการข้อมูลทั้งหมดกับ Supabase Database, Storage และ AI Edge Functions
class SupabaseRepository(
    private val client: SupabaseRestClient = SupabaseRestClient(),
    private val backendClient: BackendRestClient = BackendRestClient(),
    private val thaiLlmClient: ThaiLlmChatClient = ThaiLlmChatClient(),
) {
    // ดึงข้อมูลรายงานเหตุการณ์ภัยพิบัติสาธารณะล่าสุดจากตาราง incident_reports_public
    suspend fun fetchIncidentReports(limit: Int = 25): Result<List<IncidentReportRecord>> = runCatching {
        client.select(
            table = "incident_reports_public",
            query = "select=*&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toIncidentReportRecord() }
    }

    // ส่งข้อมูลแจ้งเหตุภัยพิบัติใหม่ขึ้นระบบ (โดยหากตั้งค่าเซิร์ฟเวอร์หลักไว้ จะส่งไปเซิร์ฟเวอร์หลักก่อน)
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

    // ดึงข้อมูลแจ้งเตือนภัยพิบัติแบบเรียลไทม์ที่ยังคงมีผลอยู่
    suspend fun fetchRealtimeAlerts(limit: Int = 30): Result<List<RealtimeAlertRecord>> = runCatching {
        client.select(
            table = "realtime_alerts",
            query = "select=*&is_active=eq.true&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toRealtimeAlertRecord() }
    }

    // ดึงประวัติการแจ้งเตือนส่วนบุคคล
    suspend fun fetchNotificationHistory(limit: Int = 40): Result<List<NotificationRecord>> = runCatching {
        client.select(
            table = "notifications",
            query = "select=*&order=created_at.desc&limit=$limit",
        ).mapObjects { it.toNotificationRecord() }
    }

    // ทำเครื่องหมายว่าอ่านแล้วสำหรับการแจ้งเตือนที่ระบุ
    suspend fun markNotificationAsRead(id: String): Result<NotificationRecord?> = runCatching {
        client.update(
            table = "notifications",
            filterQuery = "id=eq.$id",
            payload = JSONObject().put("read_at", Instant.now().toString()),
        ).firstObjectOrNull()?.toNotificationRecord()
    }

    // บันทึกตั้งค่าการรับข้อมูลแจ้งเตือนของผู้ใช้
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

    // ส่งข้อมูลขอความช่วยเหลือสำหรับผู้ประสบภัย
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

    // ส่งผลการประเมินความพึงพอใจการใช้งานของแอปพลิเคชัน
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

    // เรียกใช้งานการสนทนากับ Dr.Mind AI โดยค้นข้อมูลจากฐานข้อมูลมาเป็นบริบทในการตอบ
    suspend fun invokeAiChat(
        message: String,
        chatHistory: List<Pair<String, String>>,
    ): Result<String> = runCatching {
        check(SupabaseConfig.isConfigured) { "ยังไม่ได้ตั้งค่า DMIND_SUPABASE_URL และ DMIND_SUPABASE_PUBLISHABLE_KEY" }
        val supabaseContext = fetchDrMindSupabaseContext()
        if (ThaiLlmConfig.isConfigured) {
            try {
                thaiLlmClient.complete(
                    messages = DrMindPrompt.buildMessages(
                        userMessage = message,
                        chatHistory = chatHistory,
                        supabaseContext = supabaseContext,
                    ),
                    maxTokens = 2048,
                    temperature = 0.3,
                )
            } catch (e: Exception) {
                invokeAiChatEdgeFunction(message, chatHistory, supabaseContext)
            }
        } else {
            invokeAiChatEdgeFunction(message, chatHistory, supabaseContext)
        }
    }

    // ฟังก์ชันสำรองเรียกใช้ Edge Function ai-chat บน Supabase โดยตรง
    private suspend fun invokeAiChatEdgeFunction(
        message: String,
        chatHistory: List<Pair<String, String>>,
        supabaseContext: String,
    ): String {
        val payload = JSONObject()
            .put("message", message)
            .put("chatHistory", JSONArray().apply {
                chatHistory.takeLast(8).forEach { (role, content) ->
                    val mappedRole = when (role.lowercase()) {
                        "user" -> "user"
                        "assistant" -> "assistant"
                        else -> null
                    }
                    if (mappedRole != null) {
                        put(
                            JSONObject()
                                .put("role", mappedRole)
                                .put("content", content.take(1200))
                        )
                    }
                }
            })
            .put(
                "systemPrompt",
                """
                ${DrMindPrompt.SYSTEM_INSTRUCTION.trim()}
                
                SUPABASE_CONTEXT:
                $supabaseContext
                """.trimIndent()
            )

        val responseJson = client.invokeFunction("ai-chat", payload)
        val aiResponse = responseJson.optString("response").orEmpty().trim()
        if (aiResponse.isBlank()) {
            val error = responseJson.optString("error").orEmpty()
            throw IllegalStateException(
                if (error.isNotBlank()) "Edge function error: $error" 
                else "Edge function ai-chat returned an empty response."
            )
        }
        return aiResponse
    }

    // ส่งวิเคราะห์ภาพถ่ายความเสียหายจากภัยพิบัติด้วยบริการ AI
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

    // ดึงรายงานผลการประเมินความเสียหายทั้งหมด
    suspend fun fetchDamageAssessments(): Result<List<DamageAssessmentRecord>> = runCatching {
        client.select(
            table = "damage_assessments",
            query = "select=*&order=created_at.desc",
        ).mapObjects { it.toDamageAssessmentRecord() }
    }

    // ลบรายการประเมินความเสียหาย
    suspend fun deleteDamageAssessment(id: String): Result<Unit> = runCatching {
        client.delete(
            table = "damage_assessments",
            filterQuery = "id=eq.$id"
        )
        Unit
    }

    // ดึงรายการขอความช่วยเหลือฉุกเฉินทั้งหมด
    suspend fun fetchVictimReports(): Result<List<VictimReportRecord>> = runCatching {
        client.select(
            table = "victim_reports",
            query = "select=*&order=created_at.desc",
        ).mapObjects { it.toVictimReportRecord() }
    }

    // ดึงข้อมูลศูนย์พักพิงจากตาราง shelters หรือดึงข้อมูลจำลอง (Mock data) หากล้มเหลวหรือไม่มีข้อมูล
    suspend fun fetchShelters(): Result<List<ShelterRecord>> = runCatching {
        try {
            val response = client.select(
                table = "shelters",
                query = "select=*&status=eq.open"
            )
            val list = response.mapObjects { it.toShelterRecord() }
            if (list.isNotEmpty()) {
                list
            } else {
                getMockShelters()
            }
        } catch (e: Exception) {
            getMockShelters()
        }
    }

    // ดึงข้อมูลศูนย์พักพิงแบบ Mock สำหรับกรณีฉุกเฉินหรือไม่มีการเชื่อมต่อกับ Supabase
    fun getMockShelters(): List<ShelterRecord> {
        return listOf(
            ShelterRecord(
                id = "shelter-1",
                name = "ศูนย์พักพิงชั่วคราว วัดปากน้ำภาษีเจริญ",
                address = "12 ถ.เพชรเกษม เขตภาษีเจริญ",
                province = "กรุงเทพมหานคร",
                district = "ภาษีเจริญ",
                latitude = 13.7213,
                longitude = 100.4367,
                capacity = 500,
                currentOccupancy = 120,
                type = "temporary",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "เต็นท์"),
                contactPhone = "02-xxx-xxxx",
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-2",
                name = "ศูนย์อพยพ โรงเรียนวัดสังเวช",
                address = "456 ถ.สามเสน เขตพระนคร",
                province = "กรุงเทพมหานคร",
                district = "พระนคร",
                latitude = 13.7679,
                longitude = 100.4989,
                capacity = 300,
                currentOccupancy = 85,
                type = "evacuation",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "การแพทย์"),
                contactPhone = "02-xxx-xxxx",
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-3",
                name = "ศูนย์พักพิง อบต.แม่ริม",
                address = "หมู่ 4 ต.แม่ริม อ.แม่ริม",
                province = "เชียงใหม่",
                district = null,
                latitude = 18.9167,
                longitude = 98.9583,
                capacity = 200,
                currentOccupancy = 45,
                type = "temporary",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "เต็นท์"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-4",
                name = "ศูนย์อพยพ โรงพยาบาลพระนครศรีอยุธยา",
                address = "ถ.อู่ทอง อ.พระนครศรีอยุธยา",
                province = "พระนครศรีอยุธยา",
                district = null,
                latitude = 14.3532,
                longitude = 100.5687,
                capacity = 150,
                currentOccupancy = null,
                type = "medical",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "การแพทย์", "ยา"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-5",
                name = "ศูนย์พักพิงชั่วคราว วัดชลประทานรังสฤษดิ์",
                address = "ถ.ติวานนท์ อ.ปากเกร็ด",
                province = "นนทบุรี",
                district = null,
                latitude = 13.9060,
                longitude = 100.5035,
                capacity = 400,
                currentOccupancy = 180,
                type = "temporary",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "เต็นท์", "ไฟฟ้า"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-6",
                name = "ศูนย์อพยพ มหาวิทยาลัยขอนแก่น",
                address = "ถ.มิตรภาพ อ.เมืองขอนแก่น",
                province = "ขอนแก่น",
                district = null,
                latitude = 16.4722,
                longitude = 102.8225,
                capacity = 800,
                currentOccupancy = 200,
                type = "evacuation",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "การแพทย์", "ไฟฟ้า", "อินเทอร์เน็ต"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-7",
                name = "ศูนย์พักพิง โรงเรียนภูเก็ตวิทยาลัย",
                address = "ถ.เทพกระษัตรี อ.เมืองภูเก็ต",
                province = "ภูเก็ต",
                district = null,
                latitude = 7.9070,
                longitude = 98.3721,
                capacity = 350,
                currentOccupancy = null,
                type = "evacuation",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            ),
            ShelterRecord(
                id = "shelter-8",
                name = "ศูนย์อพยพ สนามกีฬาเทศบาล นครราชสีมา",
                address = "ถ.มิตรภาพ อ.เมืองนครราชสีมา",
                province = "นครราชสีมา",
                district = null,
                latitude = 14.9707,
                longitude = 102.0986,
                capacity = 1000,
                currentOccupancy = null,
                type = "evacuation",
                facilities = listOf("น้ำดื่ม", "ห้องน้ำ", "อาหาร", "การแพทย์", "ไฟฟ้า"),
                contactPhone = null,
                status = "open",
                lastUpdated = null
            )
        )
    }


    // อัปโหลดรูปภาพเหตุการณ์ไปยัง Bucket incident-images บน Supabase Storage
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

    // อัปโหลดรูปภาพประเมินความเสียหายไปยัง Storage ของ Supabase
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

    // แปลงพิกัดทางภูมิศาสตร์ให้อยู่ในรูปของ JSONObject
    private fun coordinateJson(lat: Double?, lng: Double?): JSONObject? {
        if (lat == null || lng == null) return null
        return JSONObject().put("lat", lat).put("lng", lng)
    }

    // ดึงข้อมูลเรียลไทม์จากตารางต่างๆ ใน Supabase เพื่อใช้เป็นเนื้อหาอ้างอิงให้ Dr.Mind AI
    private suspend fun fetchDrMindSupabaseContext(): String {
        val sections = listOf(
            "realtime_alerts" to runCatching {
                client.select(
                    table = "realtime_alerts",
                    query = "select=*&is_active=eq.true&order=created_at.desc&limit=12",
                )
            },
            "incident_reports_public" to runCatching {
                client.select(
                    table = "incident_reports_public",
                    query = "select=*&order=created_at.desc&limit=12",
                )
            },
            "notifications" to runCatching {
                client.select(
                    table = "notifications",
                    query = "select=*&order=created_at.desc&limit=10",
                )
            },
            "documents" to runCatching {
                client.select(
                    table = "documents",
                    query = "select=*&limit=5",
                )
            },
            "from_rain_sensor" to runCatching {
                client.select(
                    table = "from_rain_sensor",
                    query = "select=*&order=created_at.desc&limit=10",
                )
            },
        )

        return buildString {
            appendLine("ข้อมูลนี้ดึงจาก Supabase REST ของ D-MIND ในขณะถามเท่านั้น")
            sections.forEach { (table, result) ->
                appendLine()
                appendLine("[$table]")
                result
                    .onSuccess { rows ->
                        if (rows.length() == 0) {
                            appendLine("- ไม่มีข้อมูล")
                        } else {
                            rows.takeObjects(12).forEachIndexed { index, row ->
                                appendLine("${index + 1}. ${row.toDrMindContextLine(table)}")
                            }
                        }
                    }
                    .onFailure { error ->
                        appendLine("- อ่านข้อมูลไม่ได้: ${error.message?.take(120) ?: "unknown error"}")
                    }
            }
        }.take(10_000)
    }
}

// ฟังก์ชันขยายสำหรับแปลง JSONArray เป็น List ของวัตถุที่ระบุ
private fun <T> JSONArray.mapObjects(transform: (JSONObject) -> T): List<T> {
    val items = mutableListOf<T>()
    for (index in 0 until length()) {
        optJSONObject(index)?.let { items += transform(it) }
    }
    return items
}

// ฟังก์ชันขยายสำหรับดึงวัตถุตัวแรกจาก JSONArray
private fun JSONArray.firstObjectOrNull(): JSONObject? = if (length() > 0) optJSONObject(0) else null

// ฟังก์ชันขยายสำหรับดึงวัตถุตามจำนวนที่จำกัดจาก JSONArray
private fun JSONArray.takeObjects(limit: Int): List<JSONObject> {
    val items = mutableListOf<JSONObject>()
    for (index in 0 until length().coerceAtMost(limit)) {
        optJSONObject(index)?.let { items += it }
    }
    return items
}

// แปลงข้อมูลแถวในแต่ละตารางเป็นบรรทัดข้อความสำหรับส่งให้โมเดล AI
private fun JSONObject.toDrMindContextLine(table: String): String {
    val fields = when (table) {
        "realtime_alerts" -> listOf(
            "title",
            "message",
            "alert_type",
            "severity_level",
            "radius_km",
            "created_at",
            "location",
        )
        "incident_reports_public" -> listOf(
            "title",
            "description",
            "type",
            "location",
            "severity_level",
            "status",
            "is_verified",
            "created_at",
        )
        "notifications" -> listOf(
            "title",
            "message",
            "type",
            "severity_level",
            "created_at",
            "read_at",
        )
        "documents" -> listOf(
            "id",
            "content",
            "metadata",
        )
        "from_rain_sensor" -> listOf(
            "id",
            "humidity",
            "is_raining",
            "latitude",
            "longitude",
            "created_at",
        )
        else -> keys().asSequence().take(8).toList()
    }
    return fields
        .mapNotNull { key ->
            if (!has(key) || isNull(key)) return@mapNotNull null
            val value = opt(key)?.toString()?.trim()?.takeIf { it.isNotBlank() } ?: return@mapNotNull null
            "$key=$value"
        }
        .joinToString("; ")
        .ifBlank { toString().take(500) }
}

// แปลง JSONObject เป็นโมเดลรายงานเหตุการณ์ระดับภัยพิบัติ
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

// แปลง JSONObject เป็นโมเดลรายงานแจ้งเตือนภัยพิบัติแบบเรียลไทม์
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

// แปลง JSONObject เป็นโมเดลข้อมูลจดบันทึกการแจ้งเตือนในระบบ
private fun JSONObject.toNotificationRecord(): NotificationRecord = NotificationRecord(
    id = optString("id"),
    title = optString("title"),
    message = optString("message"),
    type = optString("type", "general"),
    severityLevel = optInt("severity_level", 1),
    readAt = optNullableString("read_at"),
    createdAt = optString("created_at"),
)

// ฟังก์ชันตัวช่วยดึงข้อความจาก JSONObject หรือส่งคืนค่าว่าง/Null หากไม่มีข้อมูล
private fun JSONObject.optNullableString(name: String): String? {
    if (!has(name) || isNull(name)) return null
    return optString(name).takeIf { it.isNotBlank() }
}

// แปลง JSONObject เป็นโมเดลผลสรุปการประเมินความเสียหาย
private fun JSONObject.toDamageAssessmentRecord(): DamageAssessmentRecord {
    val detectedCategoriesJson = optJSONArray("detected_categories")
    val categories = mutableListOf<String>()
    if (detectedCategoriesJson != null) {
        for (i in 0 until detectedCategoriesJson.length()) {
            categories.add(detectedCategoriesJson.optString(i))
        }
    }
    return DamageAssessmentRecord(
        id = optString("id"),
        incidentId = optNullableString("incident_id"),
        imageUrl = optString("image_url"),
        originalFilename = optNullableString("original_filename"),
        assessmentResult = optNullableString("assessment_result") ?: optJSONObject("assessment_result")?.toString(),
        damageLevel = optNullableString("damage_level"),
        confidenceScore = if (has("confidence_score") && !isNull("confidence_score")) optDouble("confidence_score") else null,
        detectedCategories = categories,
        estimatedCost = if (has("estimated_cost") && !isNull("estimated_cost")) optDouble("estimated_cost") else null,
        processingStatus = optString("processing_status", "pending"),
        errorMessage = optNullableString("error_message"),
        processedAt = optNullableString("processed_at"),
        createdAt = optString("created_at"),
    )
}

// แปลง JSONObject เป็นโมเดลรายการคำร้องขอความช่วยเหลือจากผู้ประสบภัย
private fun JSONObject.toVictimReportRecord(): VictimReportRecord {
    val coords = optJSONObject("coordinates")
    val lat = coords?.optDouble("lat") ?: 0.0
    val lng = coords?.optDouble("lng") ?: 0.0
    return VictimReportRecord(
        id = optString("id"),
        name = optString("name"),
        contact = optNullableString("contact"),
        description = optNullableString("description"),
        latitude = lat,
        longitude = lng,
        status = optString("status", "pending"),
        createdAt = optString("created_at"),
    )
}

// แปลง JSONObject เป็นโมเดลศูนย์พักพิง (ShelterRecord)
private fun JSONObject.toShelterRecord(): ShelterRecord {
    val coords = optJSONObject("coordinates")
    val lat = coords?.optDouble("lat") ?: optDouble("latitude", 0.0)
    val lng = coords?.optDouble("lng") ?: optDouble("longitude", 0.0)
    
    val facilitiesJson = optJSONArray("facilities")
    val facilitiesList = mutableListOf<String>()
    if (facilitiesJson != null) {
        for (i in 0 until facilitiesJson.length()) {
            facilitiesList.add(facilitiesJson.optString(i))
        }
    }
    
    return ShelterRecord(
        id = optString("id"),
        name = optString("name"),
        address = optString("address"),
        province = optString("province"),
        district = optNullableString("district"),
        latitude = lat,
        longitude = lng,
        capacity = optInt("capacity", 0),
        currentOccupancy = if (has("current_occupancy") && !isNull("current_occupancy")) optInt("current_occupancy") else null,
        type = optString("type", "temporary"),
        facilities = facilitiesList,
        contactPhone = optNullableString("contact_phone"),
        status = optString("status", "open"),
        lastUpdated = optNullableString("last_updated") ?: optNullableString("created_at")
    )
}

