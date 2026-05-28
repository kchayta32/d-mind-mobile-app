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
import io.ktor.server.request.receive
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.*
import kotlinx.serialization.encodeToString
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

            val province = call.request.queryParameters["province"]
            if (province != null) {
                val amphoe = call.request.queryParameters["amphoe"]
                val tambon = call.request.queryParameters["tambon"]
                val subarea = call.request.queryParameters["subarea"]
                val date = call.request.queryParameters["date"]
                    ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()
                val hour = call.request.queryParameters["hour"]
                val duration = call.request.queryParameters["duration"]?.toIntOrNull()?.coerceIn(1, 48) ?: 24
                val fields = call.request.queryParameters["fields"]
                    ?: "tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond"

                val params = mutableListOf<String>()
                params.add("province=" + java.net.URLEncoder.encode(province, "UTF-8"))
                if (amphoe != null) params.add("amphoe=" + java.net.URLEncoder.encode(amphoe, "UTF-8"))
                if (tambon != null) params.add("tambon=" + java.net.URLEncoder.encode(tambon, "UTF-8"))
                if (subarea != null) params.add("subarea=" + java.net.URLEncoder.encode(subarea, "UTF-8"))
                params.add("date=" + java.net.URLEncoder.encode(date, "UTF-8"))
                if (hour != null) params.add("hour=" + java.net.URLEncoder.encode(hour, "UTF-8"))
                params.add("duration=" + duration.toString())
                params.add("fields=" + java.net.URLEncoder.encode(fields, "UTF-8"))

                val url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/place?" + params.joinToString("&")
                val data = httpRequest(
                    method = "GET",
                    url = url,
                    headers = mapOf(
                        "accept" to "application/json",
                        "authorization" to "Bearer $token",
                    ),
                ).json()
                call.respond(JsonDataResponse(status = "ok", detail = "live TMD weather", data = data))
            } else {
                val lat = call.request.queryParameters["lat"]?.toDoubleOrNull() ?: 13.7563
                val lon = call.request.queryParameters["lon"]?.toDoubleOrNull() ?: 100.5018
                validate(lat in -90.0..90.0, "lat must be between -90 and 90")
                validate(lon in -180.0..180.0, "lon must be between -180 and 180")
                val duration = call.request.queryParameters["duration"]?.toIntOrNull()?.coerceIn(1, 48) ?: 24
                val date = call.request.queryParameters["date"]
                    ?: LocalDate.now(ZoneId.of("Asia/Bangkok")).toString()
                val fields = call.request.queryParameters["fields"]
                    ?: "tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond"
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
    }

    post("/damage-assessment") {
        call.handleSafely(rateLimited = true, config = config) {
            val request = call.receive<DamageAssessmentRequest>()
            val openAiKey = config.openAiApiKey
            val thaiLlmKey = config.thaiLlmApiKey

            if (openAiKey.isNotBlank() || thaiLlmKey.isNotBlank()) {
                val analysisContent = proxyDamageAssessmentToExternalModel(
                    config = config,
                    imageUrl = request.imageUrl,
                    description = request.description
                )
                if (analysisContent.isNotBlank()) {
                    val severity = extractSeverityScore(analysisContent)
                    call.respond(
                        DamageAssessmentResponse(
                            status = "ok",
                            analysis = analysisContent,
                            severityScore = severity,
                            confidence = 0.85,
                            model = if (openAiKey.isNotBlank()) "gpt-4o-mini" else config.thaiLlmModel
                        )
                    )
                    return@handleSafely
                }
            }

            // Fallback response
            val fallbackAnalysis = """
                นี่คือข้อมูลวิเคราะห์ความเสียหายจำลอง (Mock Analysis) เนื่องจากไม่ได้ตั้งค่า API Key:
                - สถานะ: จำลองการวิเคราะห์สำเร็จ
                - รายละเอียดคำขอ: ${request.description ?: "ไม่มีรายละเอียดเพิ่มเติม"}
                - ลิงก์รูปภาพ: ${request.imageUrl ?: "ไม่ได้แนบรูปภาพ"}
                - ผลประเมินจำลอง: พบความเสียหายของโครงสร้างปานกลางบริเวณทางเท้าและป้ายโฆษณาภายนอกอาคาร ไม่มีรายงานโครงสร้างหลักทรุดตัว
                - คำแนะนำเบื้องต้น: ปิดกั้นพื้นที่เสี่ยงชั่วคราวและแนะนำให้ประชาชนหลีกเลี่ยงการสัญจรผ่านจุดดังกล่าวจนกว่าวิศวกรหรือเจ้าหน้าที่ท้องถิ่นจะทำการตรวจสอบความมั่นคงทางวิศวกรรมเรียบร้อยแล้ว
            """.trimIndent()

            call.respond(
                DamageAssessmentResponse(
                    status = "fallback",
                    analysis = fallbackAnalysis,
                    severityScore = 3,
                    confidence = 0.5,
                    model = "simulated-fallback-model"
                )
            )
        }
    }

    post("/chat") {
        call.handleSafely(rateLimited = true, config = config) {
            val request = call.receive<ChatRequest>()
            validate(request.message.isNotBlank(), "message must not be blank")

            val openAiKey = config.openAiApiKey
            val thaiLlmKey = config.thaiLlmApiKey

            if (openAiKey.isNotBlank() || thaiLlmKey.isNotBlank()) {
                val responseContent = proxyChatToExternalModel(
                    config = config,
                    systemPrompt = request.systemPrompt,
                    userMessage = request.message,
                    chatHistory = request.chatHistory
                )
                if (responseContent.isNotBlank()) {
                    call.respond(
                        ChatResponse(
                            status = "ok",
                            response = responseContent,
                            model = if (openAiKey.isNotBlank()) "gpt-4o-mini" else config.thaiLlmModel
                        )
                    )
                    return@handleSafely
                }
            }

            // Fallback response
            val fallbackMessage = "นี่คือคำตอบจำลองของระบบ D-MIND AI: ได้รับข้อความของคุณแล้ว ('${request.message}') แต่ขณะนี้ระบบเชื่อมต่อโมเดลหลักยังไม่ได้ตั้งค่า API Key หากต้องการสนทนาจริง กรุณาตั้งค่า OPENAI_API_KEY หรือ DMIND_THAI_LLM_API_KEY ใน local.properties หรือสภาพแวดล้อม (Environment) ของระบบ"
            call.respond(
                ChatResponse(
                    status = "fallback",
                    response = fallbackMessage,
                    model = "simulated-fallback-model"
                )
            )
        }
    }
}

@Serializable
data class ChatMessageItem(
    val role: String,
    val content: String
)

@Serializable
data class ChatRequest(
    val message: String,
    val chatHistory: List<ChatMessageItem>? = null,
    val systemPrompt: String? = null
)

@Serializable
data class ChatResponse(
    val status: String,
    val response: String,
    val model: String? = null
)

@Serializable
data class DamageAssessmentRequest(
    val imageUrl: String? = null,
    val description: String? = null,
    val incidentId: String? = null
)

@Serializable
data class DamageAssessmentResponse(
    val status: String,
    val analysis: String,
    val severityScore: Int? = null,
    val confidence: Double? = null,
    val model: String? = null
)

private val jsonParser = Json {
    ignoreUnknownKeys = true
    encodeDefaults = false
}

private fun proxyChatToExternalModel(
    config: GatewayConfig,
    systemPrompt: String?,
    userMessage: String,
    chatHistory: List<ChatMessageItem>?
): String {
    val openAiKey = config.openAiApiKey
    val thaiLlmKey = config.thaiLlmApiKey

    val (url, model, apiKey) = when {
        openAiKey.isNotBlank() -> Triple("https://api.openai.com/v1/chat/completions", "gpt-4o-mini", openAiKey)
        thaiLlmKey.isNotBlank() -> {
            val base = config.thaiLlmBaseUrl.trimEnd('/')
            Triple("$base/chat/completions", config.thaiLlmModel, thaiLlmKey)
        }
        else -> return ""
    }

    val messagesArray = buildJsonArray {
        if (!systemPrompt.isNullOrBlank()) {
            add(buildJsonObject {
                put("role", "system")
                put("content", systemPrompt)
            })
        }
        chatHistory?.forEach { historyItem ->
            add(buildJsonObject {
                put("role", historyItem.role)
                put("content", historyItem.content)
            })
        }
        add(buildJsonObject {
            put("role", "user")
            put("content", userMessage)
        })
    }

    val requestBody = buildJsonObject {
        put("model", model)
        put("messages", messagesArray)
        put("temperature", 0.3)
    }.toString()

    return try {
        val responseStr = httpRequest(
            method = "POST",
            url = url,
            headers = mapOf(
                "Content-Type" to "application/json",
                "Authorization" to "Bearer $apiKey"
            ),
            body = requestBody
        )
        val responseJson = jsonParser.parseToJsonElement(responseStr).jsonObject
        val choices = responseJson["choices"]?.jsonArray
        val firstChoice = choices?.firstOrNull()?.jsonObject
        val message = firstChoice?.get("message")?.jsonObject
        message?.get("content")?.jsonPrimitive?.content ?: ""
    } catch (e: Exception) {
        ""
    }
}

private fun proxyDamageAssessmentToExternalModel(
    config: GatewayConfig,
    imageUrl: String?,
    description: String?
): String {
    val openAiKey = config.openAiApiKey
    val thaiLlmKey = config.thaiLlmApiKey

    val (url, model, apiKey) = when {
        openAiKey.isNotBlank() -> Triple("https://api.openai.com/v1/chat/completions", "gpt-4o-mini", openAiKey)
        thaiLlmKey.isNotBlank() -> {
            val base = config.thaiLlmBaseUrl.trimEnd('/')
            Triple("$base/chat/completions", config.thaiLlmModel, thaiLlmKey)
        }
        else -> return ""
    }

    val prompt = """
        You are an expert disaster damage assessment AI.
        Analyze the damage of the disaster incident.
        ${if (!description.isNullOrBlank()) "Incident Details: $description" else ""}
        Provide a concise analysis of the damage, estimated severity score (1 to 5, where 1 is minimal and 5 is catastrophic/total destruction), and safety recommendations.
        Format your response starting with 'Estimated Severity: <score>' followed by the analysis details.
    """.trimIndent()

    val messagesArray = buildJsonArray {
        add(buildJsonObject {
            put("role", "user")
            put("content", if (openAiKey.isNotBlank() && !imageUrl.isNullOrBlank()) {
                buildJsonArray {
                    add(buildJsonObject {
                        put("type", "text")
                        put("text", prompt)
                    })
                    add(buildJsonObject {
                        put("type", "image_url")
                        put("image_url", buildJsonObject {
                            put("url", imageUrl)
                        })
                    })
                }
            } else {
                JsonPrimitive(prompt + if (!imageUrl.isNullOrBlank()) "\nImage URL: $imageUrl" else "")
            })
        })
    }

    val requestBody = buildJsonObject {
        put("model", model)
        put("messages", messagesArray)
        put("temperature", 0.2)
    }.toString()

    return try {
        val responseStr = httpRequest(
            method = "POST",
            url = url,
            headers = mapOf(
                "Content-Type" to "application/json",
                "Authorization" to "Bearer $apiKey"
            ),
            body = requestBody
        )
        val responseJson = jsonParser.parseToJsonElement(responseStr).jsonObject
        val choices = responseJson["choices"]?.jsonArray
        val firstChoice = choices?.firstOrNull()?.jsonObject
        val message = firstChoice?.get("message")?.jsonObject
        message?.get("content")?.jsonPrimitive?.content ?: ""
    } catch (e: Exception) {
        ""
    }
}

private fun extractSeverityScore(text: String): Int {
    val regex = Regex("""Estimated Severity:\s*([1-5])""", RegexOption.IGNORE_CASE)
    val match = regex.find(text)
    return match?.groupValues?.get(1)?.toIntOrNull() ?: 3
}
