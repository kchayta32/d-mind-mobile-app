package com.dmind.app.network

import com.dmind.app.data.supabase.IncidentReportDraft
import com.dmind.app.data.supabase.IncidentReportRecord
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import java.util.UUID

class BackendRestClient(
    private val baseUrl: String = BackendConfig.baseUrl,
    private val installationId: String? = null,
) {
    val isConfigured: Boolean
        get() = baseUrl.startsWith("http://") || baseUrl.startsWith("https://")

    suspend fun submitIncidentReport(draft: IncidentReportDraft): IncidentReportRecord = withContext(Dispatchers.IO) {
        ensureConfigured()
        val payload = JSONObject()
            .put("type", draft.type)
            .put("title", draft.title)
            .put("description", draft.description)
            .put("severityLevel", draft.severityLevel)
            .put("imageUrls", JSONArray(draft.imageUrls))
        draft.location?.let { payload.put("location", it) }
        draft.contactInfo?.let { payload.put("contactInfo", it) }
        installationId?.let { payload.put("installationId", it) }
        if (draft.latitude != null && draft.longitude != null) {
            payload.put(
                "coordinates",
                JSONObject()
                    .put("lat", draft.latitude)
                    .put("lng", draft.longitude),
            )
        }

        val response = JSONObject(
            request(
                method = "POST",
                path = "/reports",
                body = payload.toString(),
                contentType = "application/json",
            ),
        )
        val report = response.optJSONArray("report")?.optJSONObject(0)
        IncidentReportRecord(
            id = response.optString("id", report?.optString("id") ?: UUID.randomUUID().toString()),
            type = report?.optString("type") ?: draft.type,
            title = report?.optString("title") ?: draft.title,
            description = report?.optString("description") ?: draft.description,
            location = report?.optNullableString("location") ?: draft.location,
            severityLevel = report?.optInt("severity_level", draft.severityLevel) ?: draft.severityLevel,
            status = report?.optString("status", response.optString("status", "accepted")) ?: "accepted",
            isVerified = report?.optBoolean("is_verified", false) ?: false,
            createdAt = report?.optString("created_at") ?: "",
        )
    }

    suspend fun uploadIncidentImage(
        fileName: String,
        contentType: String,
        bytes: ByteArray,
    ): String = withContext(Dispatchers.IO) {
        ensureConfigured()
        val encodedFileName = URLEncoder.encode(fileName, "UTF-8").replace("+", "%20")
        val response = JSONObject(
            request(
                method = "POST",
                path = "/media/incident-images?fileName=$encodedFileName",
                bodyBytes = bytes,
                contentType = contentType,
            ),
        )
        response.optString("publicUrl").ifBlank {
            throw IllegalStateException("Backend upload response did not include publicUrl")
        }
    }

    private fun ensureConfigured() {
        check(isConfigured) { "Backend gateway is not configured." }
    }

    private fun request(
        method: String,
        path: String,
        body: String? = null,
        bodyBytes: ByteArray? = null,
        contentType: String,
    ): String {
        val connection = (URL("${baseUrl.trimEnd('/')}$path").openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15_000
            readTimeout = 30_000
            setRequestProperty("Accept", "application/json")
            setRequestProperty("Content-Type", contentType)
            if (body != null || bodyBytes != null) {
                doOutput = true
            }
        }
        try {
            body?.let { connection.outputStream.use { stream -> stream.write(it.toByteArray(Charsets.UTF_8)) } }
            bodyBytes?.let { connection.outputStream.use { stream -> stream.write(it) } }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                val message = runCatching { JSONObject(response).optString("message") }.getOrNull()
                throw IllegalStateException(message?.takeIf { it.isNotBlank() } ?: "Backend HTTP $code")
            }
            return response
        } finally {
            connection.disconnect()
        }
    }
}

private fun JSONObject.optNullableString(name: String): String? {
    if (!has(name) || isNull(name)) return null
    return optString(name).takeIf { it.isNotBlank() }
}
