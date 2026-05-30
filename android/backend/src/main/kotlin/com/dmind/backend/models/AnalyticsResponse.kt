package com.dmind.backend.models

// นำเข้าไลบรารีสำหรับการทำ Serialization (แปลงเป็น JSON)
import kotlinx.serialization.Serializable

// โมเดลรายงานสรุปสถิติภัยพิบัติ (รวมทุกประเภท, การแบ่งตามความรุนแรง, และเหตุการณ์ล่าสุด)
@Serializable
data class AnalyticsSummaryResponse(
    val totalEvents: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
    val bySeverity: Map<String, Int>,
    val affectedAreaKm2: Double,
    val recentEvents: List<RecentEvent>,
)

// โมเดลรายละเอียดของเหตุการณ์ภัยพิบัติล่าสุดที่เกิดขึ้น
@Serializable
data class RecentEvent(
    val title: String,
    val type: String,
    val severity: String,
    val location: String,
    val timestamp: String,
)

// โมเดลข้อมูลแนวโน้มสถิติของภัยพิบัติในช่วงเวลาที่ระบุ
@Serializable
data class TrendDataResponse(
    val period: String,
    val data: List<TrendPoint>,
)

// โมเดลสถิติภัยพิบัติรายช่วงเวลา (เช่น รายวัน) เพื่อใช้แสดงผลกราฟแนวโน้ม
@Serializable
data class TrendPoint(
    val date: String,
    val total: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
)

// โมเดลรายงานข้อมูลและคุณภาพสิ่งแวดล้อม (PM2.5, ดัชนี AQI, อุณหภูมิ, น้ำ, ฝน)
@Serializable
data class EnvironmentalResponse(
    val pm25: Double,
    val aqi: Int,
    val aqiLevel: String,
    val temperature: Double,
    val humidity: Int,
    val waterLevel: Double?,
    val rainfall: Double?,
    val updatedAt: String,
    val openMeteoPm25: Double? = null,
    val openMeteoAqi: Int? = null,
)
