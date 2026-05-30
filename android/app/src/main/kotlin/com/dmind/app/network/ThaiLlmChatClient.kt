package com.dmind.app.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// คลาสสำหรับการเชื่อมต่อสนทนากับโมเดลภาษาขนาดใหญ่ (Thai Large Language Model - LLM) ผ่านช่องทางเครือข่าย
class ThaiLlmChatClient(
    private val config: ThaiLlmConfig = ThaiLlmConfig,
) {
    // ส่งชุดลำดับข้อความการสนทนาทั้งหมดเพื่อรับคำตอบประมวลผลข้อความถัดไปจากโมเดล LLM
    suspend fun complete(
        messages: List<ThaiLlmMessage>,
        maxTokens: Int = 2048,
        temperature: Double = 0.3,
    ): String = withContext(Dispatchers.IO) {
        ensureConfigured()
        val payload = JSONObject()
            .put("model", config.model)
            .put("messages", JSONArray().apply {
                messages.forEach { message ->
                    put(
                        JSONObject()
                            .put("role", message.role)
                            .put("content", message.content),
                    )
                }
            })
            .put("max_tokens", maxTokens)
            .put("temperature", temperature)

        val response = JSONObject(
            request(
                path = "/chat/completions",
                body = payload.toString(),
            ),
        )
        response.optJSONArray("choices")
            ?.optJSONObject(0)
            ?.optJSONObject("message")
            ?.optString("content")
            ?.trim()
            ?.takeIf { it.isNotBlank() }
            ?: throw IllegalStateException("ThaiLLM response did not include assistant content.")
    }

    // ฟังก์ชันตรวจสอบว่าค่าคีย์และคอนฟิกของระบบ AI มีการกรอกข้อมูลอย่างถูกต้อง
    private fun ensureConfigured() {
        check(config.isConfigured) { "ยังไม่ได้ตั้งค่า DMIND_THAI_LLM_API_KEY" }
    }

    // ฟังก์ชันระดับต่ำสำหรับเขียนและส่ง HTTP Request ในระบบการสนทนากับเซิร์ฟเวอร์ AI
    private fun request(
        path: String,
        body: String,
    ): String {
        val connection = (URL("${config.baseUrl}$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 20_000
            readTimeout = 60_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json")
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Authorization", "Bearer ${config.apiKey}")
            setRequestProperty("User-Agent", "D-MIND Android Dr.Mind/2.1")
        }
        try {
            connection.outputStream.use { stream -> stream.write(body.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                val message = runCatching { JSONObject(response).optString("message") }.getOrNull()
                throw IllegalStateException(message?.takeIf { it.isNotBlank() } ?: "ThaiLLM HTTP $code")
            }
            return response
        } finally {
            connection.disconnect()
        }
    }
}

// โมเดลโครงสร้างข้อมูลข้อความแชทสนทนากับ AI
data class ThaiLlmMessage(
    val role: String, // บทบาทผู้ส่งข้อความ (เช่น user, system, assistant)
    val content: String, // เนื้อหาของบทสนทนา
)
