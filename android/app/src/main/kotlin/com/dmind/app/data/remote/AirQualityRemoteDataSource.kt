package com.dmind.app.data.remote

import com.dmind.app.data.mapper.recommendedActionFor
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.ExternalSourceStatus
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.Severity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

class AirQualityRemoteDataSource {
    suspend fun fetchAirQuality(): AirQualityResult = withContext(Dispatchers.IO) {
        runCatching {
            val body = httpGet("https://air.gistda.or.th/rest/getPollution?lv=0&type=PM25&id=THA")
            val events = parseAirQuality(body).ifEmpty { fallbackAirQualityEvents() }
            AirQualityResult(
                events = events,
                fromFallback = events.firstOrNull()?.source == FALLBACK_SOURCE,
                status = ExternalSourceStatus(
                    name = "GISTDA PM2.5",
                    agency = "GISTDA Air Pollution",
                    isHealthy = events.firstOrNull()?.source != FALLBACK_SOURCE,
                    count = events.size,
                    detail = if (events.firstOrNull()?.source == FALLBACK_SOURCE) {
                        "Live PM2.5 feed returned no station rows; using local fallback stations."
                    } else {
                        "Live PM2.5 station feed loaded."
                    },
                ),
            )
        }.getOrElse { error ->
            val fallback = fallbackAirQualityEvents()
            AirQualityResult(
                events = fallback,
                fromFallback = true,
                status = ExternalSourceStatus(
                    name = "GISTDA PM2.5",
                    agency = "GISTDA Air Pollution",
                    isHealthy = false,
                    count = fallback.size,
                    detail = error.message ?: "PM2.5 feed unavailable; using local fallback stations.",
                ),
            )
        }
    }

    private fun parseAirQuality(body: String): List<DisasterEvent> {
        val trimmed = body.trim()
        val rows = when {
            trimmed.startsWith("[") -> JSONArray(trimmed)
            trimmed.startsWith("{") -> JSONObject(trimmed).firstArrayOf("data", "results", "stations", "features")
            else -> JSONArray()
        }

        return (0 until rows.length()).mapNotNull { index ->
            val raw = rows.optJSONObject(index) ?: return@mapNotNull null
            val item = raw.optJSONObject("properties") ?: raw
            val lat = item.optDoubleOrNull("LAT")
                ?: item.optDoubleOrNull("lat")
                ?: item.optDoubleOrNull("latitude")
                ?: return@mapNotNull null
            val lon = item.optDoubleOrNull("LON")
                ?: item.optDoubleOrNull("lng")
                ?: item.optDoubleOrNull("lon")
                ?: item.optDoubleOrNull("longitude")
                ?: return@mapNotNull null
            val pm25 = item.optDoubleOrNull("PM25")
                ?: item.optDoubleOrNull("pm25")
                ?: item.optDoubleOrNull("value")
                ?: return@mapNotNull null
            val stationId = item.optString("STATION_ID", item.optString("id", "pm25-$index"))
            val stationName = item.optString("STATION_NAME", item.optString("stationName", "Air station"))
            val province = item.optString("PROVINCE", item.optString("province", "Thailand"))
            val updatedAt = item.optString("DATETIME", item.optString("timestamp", "latest"))
            val severity = pm25Severity(pm25)

            DisasterEvent(
                id = "pm25-$stationId",
                type = HazardType.AirQuality,
                title = "PM2.5 $stationName",
                description = province,
                latitude = lat,
                longitude = lon,
                severity = severity,
                metric = "${pm25.oneDecimal()} ug/m3",
                source = "GISTDA PM2.5",
                updatedAt = updatedAt,
                recommendedAction = recommendedActionFor(HazardType.AirQuality, severity),
            )
        }
    }

    private fun httpGet(url: String): String {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 12_000
            readTimeout = 18_000
            setRequestProperty("Accept", "application/json")
            setRequestProperty("User-Agent", "D-MIND Android Native/2.0")
        }
        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            if (code !in 200..299) error("HTTP $code: ${body.take(160)}")
            return body
        } finally {
            connection.disconnect()
        }
    }

    private fun fallbackAirQualityEvents(): List<DisasterEvent> = listOf(
        airEvent("pm25-bkk", "Bangkok Central", "Bangkok", 13.7563, 100.5018, 42.0),
        airEvent("pm25-cm", "Chiang Mai City", "Chiang Mai", 18.7883, 98.9853, 76.0),
        airEvent("pm25-khonkaen", "Khon Kaen", "Khon Kaen", 16.4419, 102.8359, 38.0),
        airEvent("pm25-rayong", "Rayong Coast", "Rayong", 12.6814, 101.2816, 55.0),
        airEvent("pm25-songkhla", "Songkhla", "Songkhla", 7.1898, 100.5951, 24.0),
    )

    private fun airEvent(
        id: String,
        station: String,
        province: String,
        lat: Double,
        lon: Double,
        pm25: Double,
    ): DisasterEvent {
        val severity = pm25Severity(pm25)
        return DisasterEvent(
            id = id,
            type = HazardType.AirQuality,
            title = "PM2.5 $station",
            description = province,
            latitude = lat,
            longitude = lon,
            severity = severity,
            metric = "${pm25.oneDecimal()} ug/m3",
            source = FALLBACK_SOURCE,
            updatedAt = "fallback",
            recommendedAction = recommendedActionFor(HazardType.AirQuality, severity),
        )
    }

    private fun pm25Severity(pm25: Double): Severity = when {
        pm25 >= 75.0 -> Severity.Critical
        pm25 >= 50.0 -> Severity.Affected
        pm25 >= 25.0 -> Severity.Watch
        else -> Severity.Normal
    }

    private fun JSONObject.firstArrayOf(vararg names: String): JSONArray {
        for (name in names) {
            val array = optJSONArray(name)
            if (array != null) return array
        }
        return JSONArray()
    }

    private fun JSONObject.optDoubleOrNull(name: String): Double? {
        if (!has(name) || isNull(name)) return null
        return when (val value = opt(name)) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull()
            else -> null
        }
    }

    private fun Double.oneDecimal(): String = String.format(Locale.US, "%.1f", this)

    companion object {
        private const val FALLBACK_SOURCE = "Local PM2.5 fallback"
    }
}

data class AirQualityResult(
    val events: List<DisasterEvent>,
    val fromFallback: Boolean,
    val status: ExternalSourceStatus,
)
