package com.dmind.app.domain.model

// โครงสร้างข้อมูลประเมินความรุนแรงของพื้นที่น้ำท่วม
data class FloodArea(
    val id: String, // รหัสของข้อมูลพื้นที่
    val latitude: Double, // ละติจูดของพิกัดพื้นที่น้ำท่วม
    val longitude: Double, // ลองจิจูดของพิกัดพื้นที่น้ำท่วม
    val province: String, // ชื่อจังหวัด
    val district: String, // ชื่ออำเภอ
    val subdistrict: String, // ชื่อตำบล
    val areaSquareMeters: Double?, // ขนาดพื้นที่ประสบภัย (ตารางเมตร)
    val updatedAt: String, // วันเวลาที่อัปเดตข้อมูลล่าสุด
    val timeRange: GistdaTimeRange, // ขอบเขตช่วงเวลาของข้อมูลภัยพิบัติจาก Gistda
    val recurrenceCount: Int? = null, // จำนวนรอบการเกิดซ้ำ (กรณีพื้นที่ท่วมซ้ำซาก)
) {
    // การคำนวณระดับความรุนแรงอัตโนมัติอ้างอิงจากขนาดพื้นที่หรือประวัติการท่วมซ้ำซาก
    val severity: Severity
        get() = when {
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) > 12 -> Severity.Critical
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) >= 9 -> Severity.Affected
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) >= 1 -> Severity.Watch
            (areaSquareMeters ?: 0.0) >= 1_000_000.0 -> Severity.Critical
            (areaSquareMeters ?: 0.0) >= 250_000.0 -> Severity.Affected
            (areaSquareMeters ?: 0.0) >= 50_000.0 -> Severity.Watch
            else -> Severity.Normal
        }

    // คืนค่ากลุ่มช่วงความถี่ในการท่วมซ้ำซาก
    val frequencyBucket: FloodFrequencyBucket
        get() = floodFrequencyBucket(recurrenceCount)
}

// ลำดับช่วงความถี่สำหรับจัดแสดงเป็นระดับบนแผนที่หรือตารางข้อมูล
enum class FloodFrequencyBucket(
    val label: String, // เลเบลป้ายสัญลักษณ์ช่วงตัวเลข
    val description: String, // รายละเอียดคำอธิบายภาษาไทย
) {
    LessThanOne("<1", "น้อยกว่า 1 ครั้ง"),
    OneToThree("1-3", "1 ถึง 3 ครั้ง"),
    ThreeToSix("3-6", "3 ถึง 6 ครั้ง"),
    SixToNine("6-9", "6 ถึง 9 ครั้ง"),
    NineToTwelve("9-12", "9 ถึง 12 ครั้ง"),
    MoreThanTwelve(">12", "มากกว่า 12 ครั้ง"),
}

// ฟังก์ชันแปลงจำนวนครั้งการเกิดท่วมซ้ำให้เป็น Enum ช่วงความถี่
fun floodFrequencyBucket(count: Int?): FloodFrequencyBucket {
    val value = count ?: 0
    return when {
        value < 1 -> FloodFrequencyBucket.LessThanOne
        value <= 3 -> FloodFrequencyBucket.OneToThree
        value <= 6 -> FloodFrequencyBucket.ThreeToSix
        value <= 9 -> FloodFrequencyBucket.SixToNine
        value <= 12 -> FloodFrequencyBucket.NineToTwelve
        else -> FloodFrequencyBucket.MoreThanTwelve
    }
}
