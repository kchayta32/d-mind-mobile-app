package com.dmind.app.network.dto

import org.json.JSONArray
import org.json.JSONObject

/**
 * DTO parsing functions for analytics API responses.
 * These parse raw JSON from the backend into domain models.
 */
// ออบเจกต์ทำหน้าที่เป็นโฮสต์วิเคราะห์โครงสร้างพาร์ทข้อมูลสถิติ/เชิงลึก (Analytics DTO)
object AnalyticsDto {

    // ฟังก์ชันวิเคราะห์และแกะข้อความ JSON ให้เป็นโครงสร้างข้อมูลสรุปภัยพิบัติ (SummaryDto)
    fun parseSummary(json: JSONObject): SummaryDto {
        val recentEvents = mutableListOf<RecentEventDto>()
        val arr = json.optJSONArray("recentEvents") ?: JSONArray()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            recentEvents.add(
                RecentEventDto(
                    title = obj.optString("title", ""),
                    type = obj.optString("type", ""),
                    severity = obj.optString("severity", ""),
                    location = obj.optString("location", ""),
                    timestamp = obj.optString("timestamp", ""),
                )
            )
        }
        val bySeverity = mutableMapOf<String, Int>()
        val sevObj = json.optJSONObject("bySeverity")
        if (sevObj != null) {
            for (key in sevObj.keys()) {
                bySeverity[key] = sevObj.optInt(key, 0)
            }
        }
        return SummaryDto(
            totalEvents = json.optInt("totalEvents", 0),
            earthquake = json.optInt("earthquake", 0),
            flood = json.optInt("flood", 0),
            wildfire = json.optInt("wildfire", 0),
            storm = json.optInt("storm", 0),
            drought = json.optInt("drought", 0),
            bySeverity = bySeverity,
            affectedAreaKm2 = json.optDouble("affectedAreaKm2", 0.0),
            recentEvents = recentEvents,
        )
    }

    // ฟังก์ชันวิเคราะห์ข้อความ JSON ให้เป็นโครงสร้างกราฟแนวโน้มภัยพิบัติย้อนหลัง (TrendDto)
    fun parseTrends(json: JSONObject): TrendDto {
        val points = mutableListOf<TrendPointDto>()
        val arr = json.optJSONArray("data") ?: JSONArray()
        for (i in 0 until arr.length()) {
            val obj = arr.getJSONObject(i)
            points.add(
                TrendPointDto(
                    date = obj.optString("date", ""),
                    total = obj.optInt("total", 0),
                    earthquake = obj.optInt("earthquake", 0),
                    flood = obj.optInt("flood", 0),
                    wildfire = obj.optInt("wildfire", 0),
                    storm = obj.optInt("storm", 0),
                    drought = obj.optInt("drought", 0),
                )
            )
        }
        return TrendDto(
            period = json.optString("period", "7d"),
            data = points,
        )
    }

    // ฟังก์ชันวิเคราะห์ข้อมูลสภาพแวดล้อม มลพิษ ดัชนีอากาศ และระดับน้ำ (EnvironmentalDto)
    fun parseEnvironmental(json: JSONObject): EnvironmentalDto {
        return EnvironmentalDto(
            pm25 = json.optDouble("pm25", 0.0),
            aqi = json.optInt("aqi", 0),
            aqiLevel = json.optString("aqiLevel", ""),
            temperature = json.optDouble("temperature", 0.0),
            humidity = json.optInt("humidity", 0),
            waterLevel = if (json.isNull("waterLevel")) null else json.optDouble("waterLevel"),
            rainfall = if (json.isNull("rainfall")) null else json.optDouble("rainfall"),
            openMeteoPm25 = if (json.isNull("openMeteoPm25")) null else json.optDouble("openMeteoPm25"),
            openMeteoAqi = if (json.isNull("openMeteoAqi")) null else json.optInt("openMeteoAqi"),
        )
    }
}

// โมเดล DTO สำหรับเก็บข้อมูลสรุปยอดตัวเลขอุบัติภัยจำแนกตามประเภทและความรุนแรง
data class SummaryDto(
    val totalEvents: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
    val bySeverity: Map<String, Int>,
    val affectedAreaKm2: Double,
    val recentEvents: List<RecentEventDto>,
)

// โมเดล DTO อธิบายสถิติของแต่ละรายการภัยพิบัติที่เพิ่งพบเร็วๆ นี้
data class RecentEventDto(
    val title: String,
    val type: String,
    val severity: String,
    val location: String,
    val timestamp: String,
)

// โมเดล DTO สรุประยะเวลารวมของสถิติแนวโน้มภัยพิบัติ
data class TrendDto(
    val period: String,
    val data: List<TrendPointDto>,
)

// โมเดล DTO จุดแสดงจำนวนเหตุการณ์แต่ละประเภทรายวัน
data class TrendPointDto(
    val date: String,
    val total: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
)

// โมเดล DTO สรุปผลการตรวจสภาพแวดล้อมรวม (ฝุ่น พารามิเตอร์อากาศ อุณหภูมิ ระดับน้ำและปริมาณฝน)
data class EnvironmentalDto(
    val pm25: Double,
    val aqi: Int,
    val aqiLevel: String,
    val temperature: Double,
    val humidity: Int,
    val waterLevel: Double?,
    val rainfall: Double?,
    val openMeteoPm25: Double?,
    val openMeteoAqi: Int?,
)
