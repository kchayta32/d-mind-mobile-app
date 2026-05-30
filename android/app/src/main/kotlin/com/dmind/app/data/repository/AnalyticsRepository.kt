package com.dmind.app.data.repository

import com.dmind.app.domain.model.AnalyticsSummary
import com.dmind.app.domain.model.EnvironmentalData
import com.dmind.app.domain.model.RecentEventSummary
import com.dmind.app.domain.model.TrendDataPoint
import com.dmind.app.network.BackendConfig
import com.dmind.app.network.dto.AnalyticsDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Repository for fetching analytics data from the Ktor backend.
 * Uses the same base URL as BackendRestClient.
 */
// คลาสหลักสำหรับดึงข้อมูลสรุปสถิติ แนวโน้ม และข้อมูลสิ่งแวดล้อมจาก Ktor Backend
class AnalyticsRepository(
    private val baseUrl: String = BackendConfig.baseUrl,
) {
    // ตรวจสอบว่ามีการกำหนดที่อยู่เบส URL ของ Backend แล้วหรือไม่
    val isConfigured: Boolean
        get() = baseUrl.startsWith("http://") || baseUrl.startsWith("https://")

    // ดึงข้อมูลสถิติภาพรวมภัยพิบัติ (Summary) และแปลงข้อมูลเป็นระดับ Domain
    suspend fun fetchSummary(): Result<AnalyticsSummary> = withContext(Dispatchers.IO) {
        runCatching {
            val json = JSONObject(httpGet("/api/analytics/summary"))
            val dto = AnalyticsDto.parseSummary(json)
            AnalyticsSummary(
                totalEvents = dto.totalEvents,
                byType = mapOf(
                    "earthquake" to dto.earthquake,
                    "flood" to dto.flood,
                    "wildfire" to dto.wildfire,
                    "storm" to dto.storm,
                    "drought" to dto.drought,
                ),
                bySeverity = dto.bySeverity,
                affectedAreaKm2 = dto.affectedAreaKm2,
                recentEvents = dto.recentEvents.map {
                    RecentEventSummary(
                        title = it.title,
                        type = it.type,
                        severity = it.severity,
                        location = it.location,
                        timestamp = it.timestamp,
                    )
                },
            )
        }
    }

    // ดึงข้อมูลแนวโน้มภัยพิบัติแยกตามหมวดหมู่ในช่วงเวลาที่กำหนด (Trends)
    suspend fun fetchTrends(period: String): Result<List<TrendDataPoint>> = withContext(Dispatchers.IO) {
        runCatching {
            val json = JSONObject(httpGet("/api/analytics/trends?period=$period"))
            val dto = AnalyticsDto.parseTrends(json)
            dto.data.map {
                TrendDataPoint(
                    date = it.date,
                    total = it.total,
                    earthquake = it.earthquake,
                    flood = it.flood,
                    wildfire = it.wildfire,
                    storm = it.storm,
                    drought = it.drought,
                )
            }
        }
    }

    // ดึงข้อมูลวัดสถิติสิ่งแวดล้อม เช่น ฝุ่น PM2.5, คุณภาพอากาศ AQI, อุณหภูมิ และปริมาณน้ำฝน
    suspend fun fetchEnvironmental(): Result<EnvironmentalData> = withContext(Dispatchers.IO) {
        runCatching {
            val json = JSONObject(httpGet("/api/analytics/environmental"))
            val dto = AnalyticsDto.parseEnvironmental(json)
            EnvironmentalData(
                pm25 = dto.pm25,
                aqi = dto.aqi,
                aqiLevel = dto.aqiLevel,
                temperature = dto.temperature,
                humidity = dto.humidity,
                waterLevel = dto.waterLevel,
                rainfall = dto.rainfall,
                openMeteoPm25 = dto.openMeteoPm25,
                openMeteoAqi = dto.openMeteoAqi,
            )
        }
    }

    // ฟังก์ชันเชื่อมต่อและอ่านข้อมูลจากเซิร์ฟเวอร์ด้วยคำสั่ง HTTP GET
    private fun httpGet(path: String): String {
        val connection = (URL("${baseUrl.trimEnd('/')}$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15_000
            readTimeout = 30_000
            setRequestProperty("Accept", "application/json")
        }
        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val response = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                throw IllegalStateException("Backend HTTP $code: ${response.take(240)}")
            }
            return response
        } finally {
            connection.disconnect()
        }
    }
}
