package com.dmind.app.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL

class SupabaseRestClient(
    private val config: SupabaseConfig = SupabaseConfig,
) {
    suspend fun select(
        table: String,
        query: String = "select=*",
    ): JSONArray = withContext(Dispatchers.IO) {
        ensureConfigured()
        val body = request(
            method = "GET",
            url = "${config.url}/rest/v1/$table?$query",
        )
        JSONArray(body)
    }

    suspend fun insert(
        table: String,
        payload: JSONObject,
        returnRepresentation: Boolean = true,
    ): JSONArray = withContext(Dispatchers.IO) {
        ensureConfigured()
        val body = request(
            method = "POST",
            url = "${config.url}/rest/v1/$table",
            body = payload.toString(),
            extraHeaders = mapOf(
                "Content-Type" to "application/json",
                "Prefer" to if (returnRepresentation) "return=representation" else "return=minimal",
            ),
        )
        if (body.isBlank()) JSONArray() else JSONArray(body)
    }

    suspend fun update(
        table: String,
        filterQuery: String,
        payload: JSONObject,
    ): JSONArray = withContext(Dispatchers.IO) {
        ensureConfigured()
        val separator = if (filterQuery.startsWith("?")) "" else "?"
        val body = request(
            method = "PATCH",
            url = "${config.url}/rest/v1/$table$separator$filterQuery",
            body = payload.toString(),
            extraHeaders = mapOf(
                "Content-Type" to "application/json",
                "Prefer" to "return=representation",
            ),
        )
        if (body.isBlank()) JSONArray() else JSONArray(body)
    }

    suspend fun invokeFunction(
        name: String,
        payload: JSONObject,
    ): JSONObject = withContext(Dispatchers.IO) {
        ensureConfigured()
        val body = request(
            method = "POST",
            url = "${config.url}/functions/v1/$name",
            body = payload.toString(),
            extraHeaders = mapOf("Content-Type" to "application/json"),
        )
        JSONObject(body.ifBlank { "{}" })
    }

    suspend fun uploadObject(
        bucket: String,
        path: String,
        contentType: String,
        bytes: ByteArray,
        upsert: Boolean = false,
    ): String = withContext(Dispatchers.IO) {
        ensureConfigured()
        val encodedPath = path.split('/').joinToString("/") { segment ->
            URLEncoder.encode(segment, "UTF-8").replace("+", "%20")
        }
        val url = URL("${config.url}/storage/v1/object/$bucket/$encodedPath")
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = if (upsert) "PUT" else "POST"
            connectTimeout = 20_000
            readTimeout = 30_000
            doOutput = true
            setBaseHeaders()
            setRequestProperty("Content-Type", contentType)
            setRequestProperty("x-upsert", upsert.toString())
        }
        try {
            connection.outputStream.use { it.write(bytes) }
            val response = connection.readBodyOrThrow()
            val uploadedPath = JSONObject(response.ifBlank { "{}" }).optString("Key", "$bucket/$path")
            publicUrl(bucket, uploadedPath.removePrefix("$bucket/"))
        } finally {
            connection.disconnect()
        }
    }

    fun publicUrl(bucket: String, path: String): String {
        val encodedPath = path.split('/').joinToString("/") { segment ->
            URLEncoder.encode(segment, "UTF-8").replace("+", "%20")
        }
        return "${config.url}/storage/v1/object/public/$bucket/$encodedPath"
    }

    private fun ensureConfigured() {
        check(config.isConfigured) { "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY." }
    }

    private fun request(
        method: String,
        url: String,
        body: String? = null,
        extraHeaders: Map<String, String> = emptyMap(),
    ): String {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 20_000
            readTimeout = 30_000
            setBaseHeaders()
            extraHeaders.forEach { (key, value) -> setRequestProperty(key, value) }
            if (body != null) {
                doOutput = true
            }
        }
        try {
            if (body != null) {
                connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            }
            return connection.readBodyOrThrow()
        } finally {
            connection.disconnect()
        }
    }

    private fun HttpURLConnection.setBaseHeaders() {
        setRequestProperty("apikey", config.anonKey)
        setRequestProperty("Authorization", "Bearer ${config.anonKey}")
        setRequestProperty("Accept", "application/json")
        setRequestProperty("User-Agent", "D-MIND Android Native/2.0")
    }

    private fun HttpURLConnection.readBodyOrThrow(): String {
        val code = responseCode
        val stream = if (code in 200..299) inputStream else errorStream
        val response = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
        if (code !in 200..299) {
            throw IllegalStateException("Supabase HTTP $code: ${response.take(220)}")
        }
        return response
    }
}
