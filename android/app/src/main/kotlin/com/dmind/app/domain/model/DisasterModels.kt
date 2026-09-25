package com.dmind.app.domain.model

// ประเภทความเสี่ยงภัยหรือเหตุการณ์สาธารณภัยต่างๆ ในระบบ
enum class HazardType(
    val label: String,
) {
    Earthquake("Earthquake"), // แผ่นดินไหว
    Flood("Flood"), // อุทกภัยหรือน้ำท่วม
    Storm("Storm"), // พายุและลมพัดแรง
    Fire("Fire"), // ไฟป่าหรืออัคคีภัย
    AirQuality("PM2.5"), // คุณภาพอากาศและฝุ่นควัน
    Heat("Heat"), // สภาวะคลื่นความร้อนสะสม
    Drought("Drought"), // ภัยแล้งและขาดแคลนน้ำ
    Sinkhole("Sinkhole"), // ดินหรือหลุมยุบตัว
    Weather("Weather"), // สภาพอากาศทั่วไป
    Other("Other"), // เหตุภัยพิบัติประเภทอื่น ๆ
}

// ระดับความรุนแรงของภัยพิบัติในการคัดกรองหรือแจ้งเตือน
enum class Severity(
    val label: String,
    val rank: Int,
) {
    Normal("Normal", 0), // สภาวะปกติ
    Watch("Watch", 1), // ระดับเฝ้าระวังหรือติดตามอย่างใกล้ชิด
    Affected("Affected", 2), // ได้รับผลกระทบในพื้นที่แล้ว
    Critical("Critical", 3), // ระดับวิกฤตหรืออันตรายสูงสุด
}

// โครงสร้างข้อมูลจำลองรายละเอียดเหตุการณ์ภัยพิบัติ
data class DisasterEvent(
    val id: String, // รหัสประจำเหตุการณ์
    val type: HazardType, // ประเภทของภัยพิบัติที่จัดกลุ่ม
    val title: String, // หัวข้อหรือหัวเรื่องการแจ้งเตือน
    val description: String, // รายละเอียดข้อเท็จจริงของเหตุการณ์
    val latitude: Double, // พิกัดละติจูดที่เกิดเหตุ
    val longitude: Double, // พิกัดลองจิจูดที่เกิดเหตุ
    val severity: Severity, // ระดับความรุนแรงของสถานการณ์
    val metric: String, // ค่าหน่วยวัดทางวิทยาศาสตร์ (เช่น ขนาดแผ่นดินไหว หรือระดับน้ำ)
    val source: String, // แหล่งข้อมูลต้นทางที่นำเข้า
    val updatedAt: String, // เวลาอัปเดตข้อมูลล่าสุด
    val recommendedAction: String, // ข้อแนะนำการปฏิบัติตนและแนวทางป้องกันตัว
    val distanceKm: Double? = null, // ระยะทางคำนวณห่างจากอุปกรณ์ผู้ใช้ (กิโลเมตร)
)

// โครงสร้างข้อมูลสถานีตรวจวัดสภาพแวดล้อมต่างๆ (เช่น สถานีวัดน้ำ, สถานีวัดอากาศ)
data class MonitoringStation(
    val id: String, // รหัสอ้างอิงสถานี
    val name: String, // ชื่อของสถานีตรวจวัด
    val province: String, // ชื่อจังหวัดที่ตั้งสถานี
    val latitude: Double, // พิกัดละติจูดของสถานี
    val longitude: Double, // พิกัดลองจิจูดของสถานี
    val status: Severity, // ระดับความรุนแรงประเมินจากสถานี
    val metrics: List<StationMetric>, // รายชื่อตัวชี้วัดและระดับค่าตรวจวัดต่างๆ
    val updatedAt: String, // วันที่และเวลาตรวจจับข้อมูลล่าสุด
)

// ค่ารายละเอียดพารามิเตอร์แต่ละรายการของสถานีตรวจวัด
data class StationMetric(
    val label: String, // ชื่อค่าพารามิเตอร์ตรวจวัด (เช่น ระดับน้ำ หรือ ปริมาณฝนสะสม)
    val value: String, // ค่าที่บันทึกได้พร้อมหน่วยวัด
)

// โครงสร้างข้อมูลภาพรวมสภาพอากาศปัจจุบัน
data class WeatherSnapshot(
    val locationName: String, // ชื่อพื้นที่หรือเขตการพยากรณ์
    val temperatureCelsius: Double, // อุณหภูมิปัจจุบัน (องศาเซลเซียส)
    val humidityPercent: Double, // เปอร์เซ็นต์ความชื้นสัมพัทธ์ในอากาศ
    val rainMillimeters: Double, // ปริมาณปริมาณน้ำฝน (มิลลิเมตร)
    val windSpeedMps: Double, // ความเร็วของกระแสลม (เมตรต่อวินาที)
    val conditionLabel: String, // คำอธิบายสถานภาพอากาศล่าสุด
    val forecastTime: String, // วันเวลาคาดหมายพยากรณ์
    val latitude: Double = 13.7563, // พิกัดละติจูด
    val longitude: Double = 100.5018, // พิกัดลองจิจูด
    val apparentTemperatureCelsius: Double = 0.0, // อุณหภูมิที่มนุษย์รู้สึกได้จริง
    val pressureHpa: Double = 0.0, // ค่าความกดอากาศทางอุตุนิยมวิทยา
    val openMeteoRiverDischarge: Double? = null, // อัตราการระบายน้ำของแม่น้ำที่คำนวณได้
    val openMeteoSoilMoisture: Double? = null, // อัตราส่วนความชื้นในดิน
    val openMeteoPm25: Double? = null, // ปริมาณฝุ่น PM2.5 จากบริการข้อมูลสภาพอากาศ OpenMeteo
    val openMeteoAqi: Int? = null, // ดัชนีคุณภาพอากาศจาก OpenMeteo
)

// ข้อมูลคาดการณ์สภาวะอากาศล่วงหน้ารายชั่วโมง
data class MapHourlyForecast(
    val time: String, // ช่วงเวลา
    val temperatureCelsius: Double, // อุณหภูมิ ณ ชั่วโมงนั้นๆ
    val conditionLabel: String, // คำบอกสภาวะอากาศ
    val conditionCode: Int, // รหัสโค้ดสัญลักษณ์สภาพอากาศ
    val rainMillimeters: Double, // อัตราส่วนการตกของฝน
)

// ข้อมูลคาดการณ์สภาพอากาศล่วงหน้ารายวัน
data class MapDailyForecast(
    val date: String, // วันที่พยากรณ์
    val maxTempCelsius: Double, // อุณหภูมิสูงสุดของวัน
    val minTempCelsius: Double, // อุณหภูมิต่ำสุดของวัน
    val conditionLabel: String, // คำบอกสภาพอากาศภาพรวมของวัน
    val conditionCode: Int, // รหัสโค้ดประเภทลักษณะอากาศของวัน
)

// ชุดข้อมูลรวบรวมเพื่อแสดงรายละเอียดสภาพอากาศแบบพยากรณ์รวม
data class SelectedWeatherInfo(
    val current: WeatherSnapshot, // ข้อมูลสภาพอากาศขณะนี้
    val hourly: List<MapHourlyForecast>, // รายการพยากรณ์รายชั่วโมงถัดไป
    val daily: List<MapDailyForecast>, // รายการพยากรณ์รายวันล่วงหน้า
)

// รายละเอียดสถานะการเชื่อมต่อข้อมูล API จากผู้ให้บริการรายอื่นๆ
data class ExternalSourceStatus(
    val name: String, // ชื่อแหล่งรับข้อมูล
    val agency: String, // ชื่อหน่วยงานที่ดูแลระบบข้อมูล
    val isHealthy: Boolean, // สถานะระบบปกติดี (True) หรือไม่ปกติ (False)
    val count: Int, // ปริมาณของข้อมูลที่ดึงมาสำเร็จ
    val detail: String, // คำอธิบายเชิงลึกเพิ่มเติมของสถานะการทำงาน
)

// โครงสร้างข้อมูลรวบรวมสถานะและข้อมูลภัยพิบัติทั้งหมด ณ เวลาที่ดึงข้อมูลล่าสุด
data class DisasterSnapshot(
    val events: List<DisasterEvent> = emptyList(), // รายชื่อเหตุการณ์ภัยพิบัติทั้งหมดที่พบ
    val stations: List<MonitoringStation> = emptyList(), // รายชื่อสถานีตรวจวัดทั้งหมด
    val weather: WeatherSnapshot? = null, // ภาพรวมอากาศในตำแหน่งปัจจุบัน
    val sources: List<ExternalSourceStatus> = emptyList(), // สถานะระบบและฐานข้อมูลภายนอก
    val lastUpdatedMillis: Long = 0L, // เวลาอัปเดตล่าสุดในรูปแบบ Millisecond
    val isFallback: Boolean = false, // ค่าแฟล็กระบุว่าข้อมูลที่ใช้มาจากแคชเดิมเพื่อสำรองข้อมูลหรือไม่
    val errorMessage: String? = null, // รายละเอียดความผิดพลาดกรณีเชื่อมต่อล้มเหลว
) {
    // นับจำนวนการแจ้งภัยพิบัติที่ถูกจัดเป็นระดับวิกฤต (Critical)
    val criticalCount: Int
        get() = events.count { it.severity == Severity.Critical }

    // นับจำนวนการแจ้งเตือนระดับเฝ้าระวังหรือวิกฤตที่ส่งผลกระทบต่อประชาชน
    val affectedCount: Int
        get() = events.count { it.severity == Severity.Affected || it.severity == Severity.Critical }

    // นับจำนวนช่องทางข้อมูลข่าวสารภายนอกที่ยังทำงานปกติ
    val healthySourceCount: Int
        get() = sources.count { it.isHealthy }
}

// ตัวเลือกการกรองขนาดแผ่นดินไหวขั้นต่ำ
enum class EarthquakeMagnitudeFilter(val label: String, val threshold: Double) {
    All("ทั้งหมด", 0.0),
    Mag3Plus("3.0+", 3.0),
    Mag5Plus("5.0+", 5.0),
    Mag7Plus("7.0+", 7.0),
}

// ตัวเลือกการกรองความลึกแผ่นดินไหว
enum class EarthquakeDepthFilter(val label: String, val maxDepthKm: Double?) {
    All("ทุกระดับลึก", null),
    Shallow("ตื้น (<70 กม.)", 70.0),
    Intermediate("ปานกลาง (70-300 กม.)", 300.0),
    Deep("ลึก (>300 กม.)", Double.MAX_VALUE),
}

// โครงสร้างตัวกรองเฉพาะแผ่นดินไหว
data class EarthquakeFilterConfig(
    val minMagnitude: EarthquakeMagnitudeFilter = EarthquakeMagnitudeFilter.All,
    val depth: EarthquakeDepthFilter = EarthquakeDepthFilter.All,
)

// โครงสร้างตัวกรองเฉพาะอุทกภัย/น้ำท่วม
data class FloodFilterConfig(
    val timeRange: GistdaTimeRange = GistdaTimeRange.OneDay,
    val showFloodLayer: Boolean = true,
    val showWaterStations: Boolean = true,
)

// ตัวเลือกแหล่งที่มาดาวเทียมจุดความร้อนไฟป่า
enum class WildfireSatelliteSource(val label: String, val id: String) {
    All("ดาวเทียมทั้งหมด", "all"),
    SuomiNpp("Suomi-NPP", "suomi"),
    Noaa20("NOAA-20", "noaa20"),
}

// ตัวเลือกระดับความมั่นใจจุดความร้อนไฟป่า
enum class WildfireConfidenceFilter(val label: String, val minConfidence: Int) {
    All("ความมั่นใจทั้งหมด", 0),
    Nominal("ปานกลางขึ้นไป (Nominal+)", 50),
    High("สูงเท่านั้น (High)", 80),
}

// โครงสร้างตัวกรองเฉพาะไฟป่า
data class WildfireFilterConfig(
    val timeRange: GistdaTimeRange = GistdaTimeRange.OneDay,
    val satelliteSource: WildfireSatelliteSource = WildfireSatelliteSource.All,
    val confidence: WildfireConfidenceFilter = WildfireConfidenceFilter.All,
)

// ตัวเลือกเกณฑ์คุณภาพอากาศ PM2.5
enum class AirQualityThreshold(val label: String, val minPm25: Double) {
    All("ทั้งหมด", 0.0),
    Moderate("เริ่มมีผล (>37.5 µg)", 37.5),
    Unhealthy("มีผลต่อสุขภาพ (>75.0 µg)", 75.0),
}

// โครงสร้างตัวกรองเฉพาะคุณภาพอากาศ
data class AirQualityFilterConfig(
    val threshold: AirQualityThreshold = AirQualityThreshold.All,
)

// ตัวเลือกระดับความรุนแรงปริมาณน้ำฝนและพายุ
enum class StormRainIntensity(val label: String, val minRainMm: Double) {
    All("ทั้งหมด", 0.0),
    Light("ฝนเล็กน้อย (>0 มม.)", 0.1),
    Moderate("ฝนปานกลาง (≥10 มม.)", 10.0),
    Heavy("ฝนตกหนัก (≥35 มม.)", 35.0),
}

// โครงสร้างตัวกรองเฉพาะพายุ
data class StormFilterConfig(
    val rainIntensity: StormRainIntensity = StormRainIntensity.All,
)

// โครงสร้างการกรองสำหรับการค้นหาหรือการคัดเลือกข้อมูลภัยพิบัติบน UI
data class DisasterFilter(
    val selectedTypes: Set<HazardType> = defaultHazardTypes, // เซ็ตของประเภทเหตุภัยพิบัติที่ผู้ใช้เปิดตัวกรองไว้
    val minimumSeverity: Severity = Severity.Normal, // ระดับขั้นต่ำความรุนแรงในการกรองข้อมูลขึ้นมาแสดงผล
    val showStations: Boolean = true, // แสดงหรือปิดตำแหน่งสถานีตรวจวัดต่างๆ บนแผนที่
    val earthquake: EarthquakeFilterConfig = EarthquakeFilterConfig(), // ตัวกรองเฉพาะแผ่นดินไหว
    val flood: FloodFilterConfig = FloodFilterConfig(), // ตัวกรองเฉพาะอุทกภัย
    val wildfire: WildfireFilterConfig = WildfireFilterConfig(), // ตัวกรองเฉพาะไฟป่า
    val airQuality: AirQualityFilterConfig = AirQualityFilterConfig(), // ตัวกรองเฉพาะฝุ่น PM2.5
    val storm: StormFilterConfig = StormFilterConfig(), // ตัวกรองเฉพาะพายุ
) {
    // นับจำนวนตัวกรองที่มีการปรับเปลี่ยนจากค่าเริ่มต้น
    val activeFilterCount: Int
        get() {
            var count = 0
            if (selectedTypes.size != defaultHazardTypes.size) count++
            if (minimumSeverity != Severity.Normal) count++
            if (!showStations) count++
            if (earthquake.minMagnitude != EarthquakeMagnitudeFilter.All || earthquake.depth != EarthquakeDepthFilter.All) count++
            if (flood.timeRange != GistdaTimeRange.OneDay || !flood.showFloodLayer || !flood.showWaterStations) count++
            if (wildfire.timeRange != GistdaTimeRange.OneDay || wildfire.satelliteSource != WildfireSatelliteSource.All || wildfire.confidence != WildfireConfidenceFilter.All) count++
            if (airQuality.threshold != AirQualityThreshold.All) count++
            if (storm.rainIntensity != StormRainIntensity.All) count++
            return count
        }

    val isDefault: Boolean
        get() = activeFilterCount == 0

    // ฟังก์ชันตรวจสอบความสอดคล้องของข้อมูลภัยพิบัติกับตัวกรองปัจจุบัน
    fun accepts(event: DisasterEvent): Boolean {
        if (event.type !in selectedTypes) return false
        if (event.severity.rank < minimumSeverity.rank) return false

        when (event.type) {
            HazardType.Earthquake -> {
                if (earthquake.minMagnitude != EarthquakeMagnitudeFilter.All) {
                    val mag = extractMetricValue(event.metric) ?: extractMetricValue(event.title)
                    if (mag != null && mag < earthquake.minMagnitude.threshold) return false
                }
                if (earthquake.depth != EarthquakeDepthFilter.All) {
                    val depth = extractDepthValue(event.description) ?: extractDepthValue(event.metric)
                    if (depth != null) {
                        when (earthquake.depth) {
                            EarthquakeDepthFilter.Shallow -> if (depth >= 70.0) return false
                            EarthquakeDepthFilter.Intermediate -> if (depth < 70.0 || depth > 300.0) return false
                            EarthquakeDepthFilter.Deep -> if (depth <= 300.0) return false
                            EarthquakeDepthFilter.All -> Unit
                        }
                    }
                }
            }
            HazardType.Flood -> {
                if (!flood.showFloodLayer && event.source.contains("GISTDA", ignoreCase = true)) {
                    return false
                }
            }
            HazardType.Fire -> {
                if (wildfire.confidence != WildfireConfidenceFilter.All) {
                    val conf = extractMetricValue(event.metric) ?: extractMetricValue(event.description)
                    if (conf != null && conf < wildfire.confidence.minConfidence) return false
                }
            }
            HazardType.AirQuality -> {
                if (airQuality.threshold != AirQualityThreshold.All) {
                    val pm = extractMetricValue(event.metric) ?: extractMetricValue(event.title)
                    if (pm != null && pm < airQuality.threshold.minPm25) return false
                }
            }
            HazardType.Storm -> {
                if (storm.rainIntensity != StormRainIntensity.All) {
                    val rain = extractMetricValue(event.metric)
                    if (rain != null && rain < storm.rainIntensity.minRainMm) return false
                }
            }
            else -> Unit
        }
        return true
    }

    companion object {
        private fun extractMetricValue(text: String): Double? {
            val match = Regex("""(\d+(\.\d+)?)""").find(text)
            return match?.value?.toDoubleOrNull()
        }

        private fun extractDepthValue(text: String): Double? {
            val match = Regex("""(\d+(\.\d+)?)\s*(km|กม)""", RegexOption.IGNORE_CASE).find(text)
            return match?.groupValues?.get(1)?.toDoubleOrNull()
        }

        // ประเภทภัยพิบัติเริ่มต้นทั้งหมดที่กำหนดให้ตรวจสอบโดยไม่มีการปิด
        val defaultHazardTypes = setOf(
            HazardType.Earthquake,
            HazardType.Flood,
            HazardType.Storm,
            HazardType.Fire,
            HazardType.AirQuality,
            HazardType.Heat,
            HazardType.Drought,
            HazardType.Other,
        )
    }
}
