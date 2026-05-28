package com.dmind.app.domain.model

enum class DisasterLayerType(
    val thaiLabel: String,
    val description: String,
    val hazardType: HazardType? = null,
) {
    Earthquake(
        thaiLabel = "แผ่นดินไหว",
        description = "ข้อมูลแผ่นดินไหวล่าสุด",
        hazardType = HazardType.Earthquake,
    ),
    Flood(
        thaiLabel = "น้ำท่วม",
        description = "พื้นที่น้ำท่วมจาก GISTDA",
        hazardType = HazardType.Flood,
    ),
    WildfireViirs(
        thaiLabel = "ไฟป่า VIIRS",
        description = "จุดความร้อน Time Based VIIRS",
        hazardType = HazardType.Fire,
    ),
    DroughtSmap(
        thaiLabel = "ภัยแล้ง SMAP",
        description = "ความชื้นในดินจาก SMAP",
        hazardType = HazardType.Drought,
    ),
    Storm(
        thaiLabel = "พายุ",
        description = "สัญญาณฝนและลมแรง",
        hazardType = HazardType.Storm,
    ),
    AirQuality(
        thaiLabel = "PM2.5",
        description = "ค่าฝุ่นและคุณภาพอากาศ",
        hazardType = HazardType.AirQuality,
    ),
    Stations(
        thaiLabel = "สถานีตรวจวัด",
        description = "สถานีและเซนเซอร์ภาคสนาม",
    ),
    RiverDischarge(
        thaiLabel = "การไหลของแม่น้ำ",
        description = "อัตราการไหลของน้ำในแม่น้ำสายหลัก",
        hazardType = HazardType.Flood,
    ),
    SoilMoistureHeatmap(
        thaiLabel = "ความชื้นในดิน",
        description = "ความชื้นสะสมในดินระดับ 0-7 ซม. แบบ Heatmap",
        hazardType = HazardType.Drought,
    );
}
