package com.dmind.app.data.map

// ช่วงเวลาในการรีเฟรชข้อมูลแผนที่ภัยพิบัติ (5 นาที)
const val MAP_REFRESH_INTERVAL_MS: Long = 5 * 60 * 1000L

// ประเภทประเภทของข้อมูลภัยพิบัติ
enum class DisasterDataType {
    Earthquake,
    Wildfire,
    Flood,
    Drought,
    Weather,
    Place,
}

// ระดับความรุนแรงของภัยพิบัติ
enum class DisasterSeverity {
    Low,
    Medium,
    High,
    VeryHigh,
}

// โมเดลพิกัดภัยพิบัติที่ใช้สำหรับแสดงหมุด (Marker) บนแผนที่
data class DisasterPoint(
    val id: String,
    val type: DisasterDataType,
    val title: String,
    val subtitle: String,
    val latitude: Double,
    val longitude: Double,
    val severity: DisasterSeverity,
    val metric: String,
    val source: String,
    val updatedAt: String,
)

// โมเดลข้อมูลสรุปสภาพอากาศ ณ พิกัดปัจจุบัน
data class WeatherSummary(
    val locationName: String,
    val temperatureCelsius: Double,
    val humidityPercent: Double,
    val rainMillimeters: Double,
    val windSpeedMps: Double,
    val conditionCode: Int,
    val conditionLabel: String,
    val forecastTime: String,
    val latitude: Double = 13.7563,
    val longitude: Double = 100.5018,
)

// โมเดลเก็บสถานะการดึงข้อมูลจากแหล่งภายนอก เพื่อรายงานในแอปพลิเคชัน
data class MapExternalSourceStatus(
    val name: String,
    val agency: String,
    val ok: Boolean,
    val count: Int,
    val detail: String,
)

// โมเดลข้อมูลผลลัพธ์การค้นหาสถานที่ในระเบียบการตั้งค่าพิกัดแผนที่
data class PlaceSearchResult(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val country: String,
    val state: String?,
)

// ระดับน้ำท่วมจากรายงานภาคประชาชน (Crowdsourced Ground Truth Water Levels)
enum class CitizenWaterLevel(val label: String, val levelCmDescription: String) {
    Ankle("ระดับข้อเท้า", "10-30 ซม."),
    Knee("ระดับหัวเข่า", "30-50 ซม."),
    Waist("ระดับเอว", "50-80 ซม."),
    Chest("ระดับอก", "80-100 ซม."),
    Critical("วิกฤติ", ">100 ซม.");

    fun toDisasterSeverity(): DisasterSeverity = when (this) {
        Critical -> DisasterSeverity.VeryHigh
        Chest -> DisasterSeverity.High
        Waist -> DisasterSeverity.High
        Knee -> DisasterSeverity.Medium
        Ankle -> DisasterSeverity.Low
    }
}

// สภาพการไหลของน้ำ (Water Flow Dynamics)
enum class CitizenWaterFlow(val label: String) {
    Calm("น้ำท่วมขังนิ่ง"),
    Flowing("น้ำไหลต่อเนื่อง"),
    Torrential("ไหลเชี่ยวกราก (อันตรายมาก)")
}

// รายงานน้ำท่วมจริงจากประชาชนในพื้นที่ (Citizen Ground Truth Flood Report)
data class CitizenFloodReport(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val locationName: String,
    val waterLevel: CitizenWaterLevel,
    val waterLevelCm: Int? = null,
    val waterFlow: CitizenWaterFlow = CitizenWaterFlow.Flowing,
    val situation: String,
    val imageUrl: String? = null,
    val reporterName: String? = null,
    val createdAt: String,
    val verifiedBySatellite: Boolean = false,
    val satelliteDistanceMeters: Int? = null,
)

// ข้อมูลตัวอย่างรายงานน้ำท่วมภาคประชาชนในพื้นที่เสี่ยงอุทกภัยสำคัญของไทย (Ground Truth Basins)
val initialCitizenFloodReports: List<CitizenFloodReport> = listOf(
    CitizenFloodReport(
        id = "ct-flood-01",
        latitude = 14.3312,
        longitude = 100.4125,
        locationName = "ต.หัวเวียง อ.เสนา จ.พระนครศรีอยุธยา",
        waterLevel = CitizenWaterLevel.Waist,
        waterLevelCm = 85,
        waterFlow = CitizenWaterFlow.Flowing,
        situation = "แม่น้ำน้อยล้นตลิ่งท่วมใต้ถุนบ้านและถนนสายในหมู่บ้านสูงระดับเอว รถเล็กไม่สามารถผ่านได้",
        imageUrl = "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        reporterName = "กิตติศักดิ์ ชุมชนริมน้ำ",
        createdAt = "25 นาทีที่แล้ว",
        verifiedBySatellite = true,
        satelliteDistanceMeters = 120,
    ),
    CitizenFloodReport(
        id = "ct-flood-02",
        latitude = 17.0215,
        longitude = 99.8241,
        locationName = "ต.ปากแคว อ.เมือง จ.สุโขทัย",
        waterLevel = CitizenWaterLevel.Knee,
        waterLevelCm = 45,
        waterFlow = CitizenWaterFlow.Flowing,
        situation = "คันกั้นน้ำแม่น้ำยมรั่ว น้ำทะลักเข้าท่วมผิวจราจรและพื้นที่เกษตรกรรม เจ้าหน้าที่กำลังนำบิ๊กแบ็กอุดรอยรั่ว",
        imageUrl = "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
        reporterName = "ทีมอาสากู้ภัยสุโขทัย",
        createdAt = "48 นาทีที่แล้ว",
        verifiedBySatellite = true,
        satelliteDistanceMeters = 250,
    ),
    CitizenFloodReport(
        id = "ct-flood-03",
        latitude = 15.1950,
        longitude = 104.8610,
        locationName = "ชุมชนท่ากอไผ่ ต.วารินชำราบ จ.อุบลราชธานี",
        waterLevel = CitizenWaterLevel.Critical,
        waterLevelCm = 120,
        waterFlow = CitizenWaterFlow.Torrential,
        situation = "แม่น้ำมูลหนุนสูง ระดับน้ำท่วมชั้นล่างเกือบมิดหลังคา ชาวบ้านอพยพขึ้นศูนย์พักพิงชั่วคราวแล้ว",
        imageUrl = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
        reporterName = "สมศรี มั่นคง",
        createdAt = "1.8 ชม. ที่แล้ว",
        verifiedBySatellite = true,
        satelliteDistanceMeters = 80,
    ),
    CitizenFloodReport(
        id = "ct-flood-04",
        latitude = 19.9100,
        longitude = 99.8300,
        locationName = "ต.เวียง อ.เมือง จ.เชียงราย",
        waterLevel = CitizenWaterLevel.Knee,
        waterLevelCm = 50,
        waterFlow = CitizenWaterFlow.Flowing,
        situation = "น้ำสายหลากเข้าท่วมตลาดสายลมจอย ดินโคลนทับถม สูงประมาณหัวเข่า ต้องการจิตอาสาช่วยตักดิน",
        imageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
        reporterName = "ชาวบ้านแม่สายร่วมใจ",
        createdAt = "15 นาทีที่แล้ว",
        verifiedBySatellite = false,
        satelliteDistanceMeters = 450,
    ),
)

// คลาสเก็บข้อมูล Snapshot ของภัยพิบัติทุกประเภท ณ เวลาปัจจุบัน พร้อมฟังก์ชันกรองแบ่งตาม Layer บนแผนที่
data class MapDataSnapshot(
    val weather: WeatherSummary? = null,
    val earthquakes: List<DisasterPoint> = emptyList(),
    val wildfires: List<DisasterPoint> = emptyList(),
    val floods: List<DisasterPoint> = emptyList(),
    val floodFrequency: List<DisasterPoint> = emptyList(),
    val waterHyacinths: List<DisasterPoint> = emptyList(),
    val droughts: List<DisasterPoint> = emptyList(),
    val citizenFloodReports: List<CitizenFloodReport> = initialCitizenFloodReports,
    val statuses: List<MapExternalSourceStatus> = emptyList(),
    val updatedAtMillis: Long = 0L,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
) {
    // ดึงจุดภัยพิบัติทุกประเภทมารวมกันเป็นรายการเดียว
    val allPoints: List<DisasterPoint>
        get() = earthquakes + wildfires + floods + floodFrequency + waterHyacinths + droughts

    // ฟังก์ชันกรองพิกัดภัยพิบัติตาม Layer ที่ผู้ใช้เลือกแสดงบนแผนที่
    fun pointsForLayer(layer: String): List<DisasterPoint> = when (layer) {
        "แผ่นดินไหว" -> earthquakes
        "ฝนตกหนัก" -> weather?.let {
            listOf(
                DisasterPoint(
                    id = "tmd-current-weather",
                    type = DisasterDataType.Weather,
                    title = "พยากรณ์อากาศ ${it.locationName}",
                    subtitle = it.conditionLabel,
                    latitude = 13.7563,
                    longitude = 100.5018,
                    severity = if (it.rainMillimeters >= 35) {
                        DisasterSeverity.VeryHigh
                    } else if (it.rainMillimeters >= 10) {
                        DisasterSeverity.High
                    } else if (it.rainMillimeters > 0) {
                        DisasterSeverity.Medium
                    } else {
                        DisasterSeverity.Low
                    },
                    metric = "${it.rainMillimeters.formatOne()} มม.",
                    source = "TMD",
                    updatedAt = it.forecastTime,
                ),
            )
        } ?: emptyList()
        "ไฟป่า" -> wildfires
        "ภัยแล้ง" -> droughts
        "DRIPlus" -> droughts
        "NDWI" -> droughts
        "SMAP" -> droughts
        "น้ำท่วม" -> floods
        "น้ำท่วมซ้ำซาก" -> floodFrequency
        "ผักตบชวา" -> waterHyacinths
        "PM2.5",
        "พายุ",
        -> emptyList()
        "พื้นที่เสี่ยง" -> floods + droughts + wildfires
        "ความเสี่ยงสูง" -> (floods + droughts + wildfires).filter {
            it.severity == DisasterSeverity.High || it.severity == DisasterSeverity.VeryHigh
        }
        "ซ่อน" -> emptyList()
        else -> allPoints
    }

    companion object {
        // ค่าเริ่มต้นว่างเปล่าสำหรับสถานะการโหลดหรือข้อมูลแผนที่ไม่มีค่า
        val Empty = MapDataSnapshot()
    }
}

// ฟังก์ชันเสริมช่วยแปลง Double เป็น String ที่ระบุทศนิยม 1 ตำแหน่ง
fun Double.formatOne(): String = "%,.1f".format(this)

// โมเดลเก็บข้อมูลเชิงพื้นที่แบบเขตการปกครองของไทย (จังหวัด อำเภอ ตำบล)
data class PlaceInfo(
    val province: String,
    val amphoe: String?,
    val tambon: String?,
)
