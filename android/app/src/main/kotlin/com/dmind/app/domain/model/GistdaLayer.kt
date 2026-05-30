package com.dmind.app.domain.model

// ขอบเขตช่วงย้อนหลังของข้อมูลภัยพิบัติระบบ GISTDA
enum class GistdaTimeRange(
    val thaiLabel: String, // ข้อความสั้นแสดงช่วงเวลาในภาษาไทย
    val featureSegment: String, // ค่าสคริปต์สเปกย่อยสำหรับเรียก API ข้อมูลเวกเตอร์ (Features)
    val floodWmtsSegment: String, // ค่าสคริปต์สเปกย่อยสำหรับเรียกแผนที่น้ำท่วม (Flood WMTS)
    val viirsWmtsSegment: String, // ค่าสคริปต์สเปกย่อยสำหรับเรียกแผนที่จุดความร้อน VIIRS (VIIRS WMTS)
) {
    OneDay("1 วัน", "1day", "1day", "1day"),
    ThreeDays("3 วัน", "3days", "3day", "3day"),
    SevenDays("7 วัน", "7days", "7day", "7day"),
    ThirtyDays("30 วัน", "30days", "30day", "30day"),
    FloodFrequency("น้ำท่วมซ้ำซาก", "flood-freq", "flood-freq", ""),
}

// ประเภทของผลผลิตเชิงสังเกตการณ์ภัยแล้งและการวัดความชื้น
enum class GistdaDroughtProduct(
    val thaiLabel: String, // ชื่อย่อหรือป้ายชื่อผลผลิต
    val description: String, // ข้อความรายละเอียดพารามิเตอร์
    val legendTitle: String, // คำอธิบายประกอบสัญลักษณ์สีบนแผนที่
) {
    // การวิเคราะห์ปริมาณดินเปียก/ชื้นผ่านดาวเทียม SMAP
    Smap(
        thaiLabel = "SMAP",
        description = "ความชื้นในดิน ราย 7 วันล่าสุด",
        legendTitle = "ความชื้นในดิน (SMAP) (%)",
    ),
    // การประเมินความแห้งแล้งของใบไม้และพืชพรรณผ่านค่าดัชนี NDWI
    Ndwi(
        thaiLabel = "NDWI",
        description = "ความชื้นพืชพรรณ ราย 7 วันล่าสุด",
        legendTitle = "ความชื้นพืชพรรณ (NDWI)",
    ),
    // พื้นที่วิเคราะห์ความเสี่ยงภัยแล้งในระบบ DRIPlus
    DriPlus(
        thaiLabel = "DRIPlus",
        description = "พื้นที่เสี่ยงภัยแล้ง ราย 7 วันล่าสุด",
        legendTitle = "พื้นที่เสี่ยงภัยแล้ง (DRIPlus)",
    ),
}

// โมเดลข้อมูลจำลองชั้นข้อมูลแผนที่ GISTDA
data class GistdaLayer(
    val type: DisasterLayerType, // ประเภทของสัญลักษณ์ภัยพิบัติหลัก
    val timeRange: GistdaTimeRange, // ช่วงเวลาในการวัดสถิติข้อมูล
    val title: String, // หัวข้ออธิบายชั้นข้อมูล
    val path: String, // พาร์ทที่ใช้เข้าถึง API ข้อมูลตัวนี้
    val tileUrl: String?, // ลิงก์ URL สำรับการโหลด Tile Map แผนที่ภาพถ่าย
    val isAvailable: Boolean, // สถานะระบบบริการพร้อมใช้งานหรือไม่
    val tileScheme: String = "xyz", // ระบบพิกัดของแผ่นภาพแผนที่ (เช่น xyz)
    val droughtProduct: GistdaDroughtProduct? = null, // ชนิดผลผลิตตรวจจับความแล้ง (ถ้ามี)
    val message: String? = null, // ข้อความเสริมหรือสาเหตุการออฟไลน์ของระบบ
)
