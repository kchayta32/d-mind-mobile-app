package com.dmind.app.domain.model

// ประเภทของชั้นข้อมูลแผนที่จำแนกตามประเภทภัยพิบัติและสถานีวัดผล
enum class DisasterLayerType(
    // ข้อความแสดงชื่อประเภทในภาษาไทยสำหรับใช้แสดงผลบนเมนูหรือปุ่มควบคุมแผนที่
    val thaiLabel: String,
    // คำอธิบายย่อยเกี่ยวกับข้อมูลในชั้นนี้
    val description: String,
    // อ้างอิงประเภทของภัยพิบัติหลักที่เชื่อมโยง (ถ้ามี)
    val hazardType: HazardType? = null,
) {
    // ข้อมูลแผ่นดินไหวล่าสุด
    Earthquake(
        thaiLabel = "แผ่นดินไหว",
        description = "ข้อมูลแผ่นดินไหวล่าสุด",
        hazardType = HazardType.Earthquake,
    ),
    // ข้อมูลจำลองพื้นที่น้ำท่วมหรืออุทกภัย
    Flood(
        thaiLabel = "น้ำท่วม",
        description = "พื้นที่น้ำท่วมจาก GISTDA",
        hazardType = HazardType.Flood,
    ),
    // ข้อมูลจุดความร้อนจากการตรวจวัดด้วยดาวเทียม VIIRS (ไฟป่า)
    WildfireViirs(
        thaiLabel = "ไฟป่า VIIRS",
        description = "จุดความร้อน Time Based VIIRS",
        hazardType = HazardType.Fire,
    ),
    // ข้อมูลภัยแล้งประเมินจากความชื้นในดินระบบ SMAP
    DroughtSmap(
        thaiLabel = "ภัยแล้ง SMAP",
        description = "ความชื้นในดินจาก SMAP",
        hazardType = HazardType.Drought,
    ),
    // ข้อมูลประเมินความเร็วลมและปริมาณน้ำฝน (พายุ)
    Storm(
        thaiLabel = "พายุ",
        description = "สัญญาณฝนและลมแรง",
        hazardType = HazardType.Storm,
    ),
    // ข้อมูลค่าฝุ่นละออง PM2.5 และดัชนีคุณภาพอากาศ
    AirQuality(
        thaiLabel = "PM2.5",
        description = "ค่าฝุ่นและคุณภาพอากาศ",
        hazardType = HazardType.AirQuality,
    ),
    // ตำแหน่งที่ตั้งของสถานีเซ็นเซอร์วัดผลและสถานีตรวจวัดภาคสนาม
    Stations(
        thaiLabel = "สถานีตรวจวัด",
        description = "สถานีและเซนเซอร์ภาคสนาม",
    );
}
