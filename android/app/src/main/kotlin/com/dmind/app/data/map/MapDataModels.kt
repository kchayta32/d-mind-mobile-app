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

// คลาสเก็บข้อมูล Snapshot ของภัยพิบัติทุกประเภท ณ เวลาปัจจุบัน พร้อมฟังก์ชันกรองแบ่งตาม Layer บนแผนที่
data class MapDataSnapshot(
    val weather: WeatherSummary? = null,
    val earthquakes: List<DisasterPoint> = emptyList(),
    val wildfires: List<DisasterPoint> = emptyList(),
    val floods: List<DisasterPoint> = emptyList(),
    val floodFrequency: List<DisasterPoint> = emptyList(),
    val waterHyacinths: List<DisasterPoint> = emptyList(),
    val droughts: List<DisasterPoint> = emptyList(),
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
