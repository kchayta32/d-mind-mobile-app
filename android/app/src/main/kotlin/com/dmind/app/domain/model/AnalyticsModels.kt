package com.dmind.app.domain.model

/**
 * Summary of all disaster events aggregated from GISTDA/USGS/TMD.
 */
// ข้อมูลสรุปภาพรวมเชิงวิเคราะห์ของภัยพิบัติที่รวบรวมจากแหล่งข้อมูลต่างๆ เช่น GISTDA, USGS และ TMD
data class AnalyticsSummary(
    // จำนวนเหตุการณ์ภัยพิบัติทั้งหมด
    val totalEvents: Int,
    // แผนภาพจับคู่แยกประเภทภัยพิบัติและจำนวนครั้งที่เกิด
    val byType: Map<String, Int>,
    // แผนภาพจับคู่แยกความรุนแรงของภัยพิบัติและจำนวนครั้งที่เกิด
    val bySeverity: Map<String, Int>,
    // พื้นที่ที่ได้รับผลกระทบทั้งหมดคำนวณเป็นตารางกิโลเมตร
    val affectedAreaKm2: Double,
    // รายการย่อเหตุการณ์ภัยพิบัติล่าสุด
    val recentEvents: List<RecentEventSummary>,
)

// ข้อมูลรายละเอียดของแต่ละเหตุการณ์ภัยพิบัติล่าสุด
data class RecentEventSummary(
    // หัวข้อหรือชื่อของเหตุการณ์ภัยพิบัติ
    val title: String,
    // ประเภทของภัยพิบัติ (เช่น อุทกภัย, แผ่นดินไหว)
    val type: String,
    // ระดับความรุนแรงของภัยพิบัติ
    val severity: String,
    // พิกัดหรือชื่อสถานที่เกิดเหตุ
    val location: String,
    // วันและเวลาที่เกิดเหตุการณ์
    val timestamp: String,
)

/**
 * Single data point in the trend timeline.
 */
// จุดข้อมูลแสดงสถิติแนวโน้มการเกิดภัยพิบัติตามช่วงเวลา
data class TrendDataPoint(
    // วันที่ที่บันทึกสถิติ
    val date: String,
    // ยอดรวมเหตุการณ์ภัยพิบัติทั้งหมดในวันดังกล่าว
    val total: Int,
    // จำนวนเหตุแผ่นดินไหว
    val earthquake: Int,
    // จำนวนเหตุอุทกภัย
    val flood: Int,
    // จำนวนเหตุไฟป่า
    val wildfire: Int,
    // จำนวนเหตุพายุ
    val storm: Int,
    // จำนวนเหตุภัยแล้ง
    val drought: Int,
)

/**
 * Environmental monitoring data (PM2.5, AQI, weather).
 */
// ข้อมูลเฝ้าระวังสภาพแวดล้อม สภาพอากาศ มลพิษทางอากาศ และระดับน้ำ
data class EnvironmentalData(
    // ค่าความเข้มข้นของฝุ่น PM2.5
    val pm25: Double,
    // ดัชนีคุณภาพอากาศ (AQI)
    val aqi: Int,
    // ข้อความระบุระดับคุณภาพอากาศ (เช่น ปานกลาง, เริ่มมีผลกระทบต่อสุขภาพ)
    val aqiLevel: String,
    // อุณหภูมิ ณ ขณะนั้น
    val temperature: Double,
    // ความชื้นในอากาศในหน่วยเปอร์เซ็นต์
    val humidity: Int,
    // ระดับน้ำในแม่น้ำหรือคลองตรวจวัด (ถ้ามี)
    val waterLevel: Double?,
    // ปริมาณน้ำฝนตกสะสม (ถ้ามี)
    val rainfall: Double?,
    // ค่าฝุ่น PM2.5 เสริมที่ได้จากเซ็นเซอร์หรือแหล่งข้อมูลภายนอก OpenMeteo (ถ้ามี)
    val openMeteoPm25: Double? = null,
    // ดัชนีคุณภาพอากาศจาก OpenMeteo (ถ้ามี)
    val openMeteoAqi: Int? = null,
)
