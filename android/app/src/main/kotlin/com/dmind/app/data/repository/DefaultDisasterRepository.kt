package com.dmind.app.data.repository

import com.dmind.app.data.map.DisasterMapRepository
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.data.mapper.recommendedActionFor
import com.dmind.app.data.mapper.toDomain
import com.dmind.app.data.mapper.toExternalSourceStatuses
import com.dmind.app.data.mapper.toWeatherSnapshot
import com.dmind.app.data.remote.AirQualityRemoteDataSource
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.DisasterSnapshot
import com.dmind.app.domain.model.ExternalSourceStatus
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.StationMetric
import com.dmind.app.domain.repository.DisasterRepository

// คลาส Repository เริ่มต้นสำหรับรวบรวมข้อมูลภัยพิบัติ สภาพอากาศ และระบบตรวจวัดรอบตัว เพื่อป้อนให้กับ Domain layer
class DefaultDisasterRepository(
    private val mapDataSource: DisasterMapRepository = DisasterMapRepository(),
    private val airQualityDataSource: AirQualityRemoteDataSource = AirQualityRemoteDataSource(),
) : DisasterRepository {
    // ดึงข้อมูลสถานะภัยพิบัติทั้งหมด ประกอบด้วยแผนที่ภัยพิบัติ คุณภาพอากาศ และข้อมูลสถานีตรวจวัด
    override suspend fun fetchSnapshot(): DisasterSnapshot {
        val mapResult = runCatching { mapDataSource.fetchSnapshot() }
        val airResult = airQualityDataSource.fetchAirQuality()
        val stations = monitoringStations()

        return mapResult.fold(
            onSuccess = { mapSnapshot ->
                val baseEvents = mapSnapshot.allPoints.map { it.toDomain() }
                val weather = mapSnapshot.toWeatherSnapshot()
                val heatEvent = weather?.let(::heatEventFromWeather)
                val stormEvent = weather?.let(::stormEventFromWeather)
                val syntheticEvents = listOfNotNull(heatEvent, stormEvent)
                val allEvents = baseEvents + airResult.events + syntheticEvents
                val eventsWithStorm = if (allEvents.none { it.type == HazardType.Storm }) {
                    allEvents + event(
                        id = "tmd-storm-gulf",
                        type = HazardType.Storm,
                        title = "Tropical Depression Watch",
                        description = "หย่อมความกดอากาศต่ำกำลังแรงบริเวณอ่าวไทยตอนบน",
                        lat = 11.5000,
                        lon = 100.8000,
                        severity = Severity.Watch,
                        metric = "38 mm • ลม 45 km/h",
                        source = "TMD Radar"
                    )
                } else allEvents

                DisasterSnapshot(
                    events = eventsWithStorm,
                    stations = stations,
                    weather = weather,
                    sources = mapSnapshot.toExternalSourceStatuses() + airResult.status + stationSourceStatus(stations),
                    lastUpdatedMillis = mapSnapshot.updatedAtMillis.takeIf { it > 0L } ?: System.currentTimeMillis(),
                    isFallback = airResult.fromFallback,
                    errorMessage = mapSnapshot.errorMessage,
                )
            },
            onFailure = { error ->
                DisasterSnapshot(
                    events = fallbackEvents() + airResult.events,
                    stations = stations,
                    sources = listOf(
                        ExternalSourceStatus(
                            name = "Core disaster feeds",
                            agency = "D-MIND",
                            isHealthy = false,
                            count = fallbackEvents().size,
                            detail = error.message ?: "Live disaster feeds unavailable; using local fallback events.",
                        ),
                        airResult.status,
                        stationSourceStatus(stations),
                    ),
                    lastUpdatedMillis = System.currentTimeMillis(),
                    isFallback = true,
                    errorMessage = error.message ?: "Live disaster feeds unavailable.",
                )
            },
        )
    }

    // ค้นหาชื่อสถานที่บนแผนที่ผ่าน DataSource
    override suspend fun searchPlaces(query: String): List<PlaceSearchResult> {
        return mapDataSource.searchPlaces(query)
    }

    // ดึงข้อมูลสภาพอากาศพยากรณ์ล่วงหน้าสำหรับพิกัดพิกัดที่กำหนด
    override suspend fun fetchWeatherForCoords(lat: Double, lon: Double): com.dmind.app.domain.model.SelectedWeatherInfo {
        return mapDataSource.fetchWeatherForCoords(lat, lon)
    }

    // สร้างรายงานเหตุการณ์ความร้อนจัดหากอุณหภูมิถึงเกณฑ์ที่กำหนด
    private fun heatEventFromWeather(weather: com.dmind.app.domain.model.WeatherSnapshot): DisasterEvent? {
        if (weather.temperatureCelsius < 35.0) return null
        val severity = when {
            weather.temperatureCelsius >= 40.0 -> Severity.Critical
            weather.temperatureCelsius >= 38.0 -> Severity.Affected
            else -> Severity.Watch
        }
        return DisasterEvent(
            id = "weather-heat-bangkok",
            type = HazardType.Heat,
            title = "Heat watch ${weather.locationName}",
            description = weather.conditionLabel,
            latitude = 13.7563,
            longitude = 100.5018,
            severity = severity,
            metric = "${weather.temperatureCelsius.formatOne()} C",
            source = "TMD",
            updatedAt = weather.forecastTime,
            recommendedAction = recommendedActionFor(HazardType.Heat, severity),
        )
    }

    // สร้างรายงานเหตุการณ์พายุหรือฝนตกหนักหากสภาพอากาศถึงเกณฑ์ที่กำหนด
    private fun stormEventFromWeather(weather: com.dmind.app.domain.model.WeatherSnapshot): DisasterEvent? {
        if (weather.rainMillimeters <= 0.0 && weather.windSpeedMps < 10.0) return null
        val severity = when {
            weather.rainMillimeters >= 35.0 || weather.windSpeedMps >= 20.0 -> Severity.Critical
            weather.rainMillimeters >= 15.0 || weather.windSpeedMps >= 14.0 -> Severity.Affected
            else -> Severity.Watch
        }
        return DisasterEvent(
            id = "weather-storm-bangkok",
            type = HazardType.Storm,
            title = "Storm and rain watch ${weather.locationName}",
            description = weather.conditionLabel,
            latitude = 13.7563,
            longitude = 100.5018,
            severity = severity,
            metric = "${weather.rainMillimeters.formatOne()} mm",
            source = "TMD",
            updatedAt = weather.forecastTime,
            recommendedAction = recommendedActionFor(HazardType.Storm, severity),
        )
    }

    // เหตุการณ์จำลองภัยพิบัติแบบ Local ครบทั้ง 6 ประเภทภัยพิบัติหลัก
    private fun fallbackEvents(): List<DisasterEvent> = listOf(
        event("fallback-earthquake-north", HazardType.Earthquake, "Earthquake Chiang Rai", "จุดศูนย์กลาง อ.แม่ลาว ความลึก 10 กม. รอยเลื่อนพะเยา", 19.7820, 99.7120, Severity.Affected, "4.8 Mw (ความลึก 10 กม.)", "USGS / TMD"),
        event("fallback-flood-ayutthaya", HazardType.Flood, "Flood watch Ayutthaya", "แม่น้ำเจ้าพระยาเอ่อล้นตลิ่ง พื้นที่ลุ่มต่ำริมแม่น้ำ", 14.3532, 100.5689, Severity.Watch, "42 ซม. (ล้นตลิ่ง)", "GISTDA / สสน."),
        event("fallback-fire-north", HazardType.Fire, "Hotspot watch Chiang Mai", "ตรวจพบจุดความร้อนดาวเทียม VIIRS ป่าสงวนแม่แจ่ม", 18.7953, 98.9986, Severity.Affected, "78% (VIIRS High)", "GISTDA Fire"),
        event("fallback-drought-korat", HazardType.Drought, "Drought risk Nakhon Ratchasima", "ดัชนีความแห้งแล้งดิน SMAP ต่ำกว่าเกณฑ์วิกฤต", 14.9799, 102.0977, Severity.Watch, "22% Soil Moisture", "GISTDA Drought"),
        event("fallback-storm-south", HazardType.Storm, "Tropical Depression Gulf of Thailand", "พายุดีเปรสชันอ่าวไทยตอนบน คลื่นลมแรง 2-3 เมตร ฝนตกหนักสะสม", 11.5000, 100.8000, Severity.Critical, "55 mm • ลม 65 km/h", "TMD Radar"),
        event("fallback-pm25-bkk", HazardType.AirQuality, "PM2.5 กรุงเทพมหานครและปริมณฑล", "ค่าฝุ่นละอองขนาดเล็กเกินมาตรฐานเริ่มมีผลกระทบต่อระบบทางเดินหายใจ", 13.7563, 100.5018, Severity.Affected, "58 µg/m³", "PCD Air4Thai"),
    )

    // ฟังก์ชันตัวช่วยสร้างเหตุการณ์ DisasterEvent แบบกำหนดเอง
    private fun event(
        id: String,
        type: HazardType,
        title: String,
        description: String,
        lat: Double,
        lon: Double,
        severity: Severity,
        metric: String,
        source: String,
    ) = DisasterEvent(
        id = id,
        type = type,
        title = title,
        description = description,
        latitude = lat,
        longitude = lon,
        severity = severity,
        metric = metric,
        source = source,
        updatedAt = "fallback",
        recommendedAction = recommendedActionFor(type, severity),
    )

    // จำลองพิกัดและข้อมูลของสถานีตรวจวัดทางสิ่งแวดล้อมต่างๆ ในไทย
    private fun monitoringStations(): List<MonitoringStation> = listOf(
        MonitoringStation(
            id = "dmind-bkk-01",
            name = "Bangkok Central Station",
            province = "Bangkok",
            latitude = 13.7563,
            longitude = 100.5018,
            status = Severity.Watch,
            metrics = listOf(
                StationMetric("Rain", "3.4 mm/h"),
                StationMetric("PM2.5", "42 ug/m3"),
                StationMetric("Humidity", "74%"),
            ),
            updatedAt = "recent",
        ),
        MonitoringStation(
            id = "dmind-cm-01",
            name = "Chiang Mai North Station",
            province = "Chiang Mai",
            latitude = 18.7883,
            longitude = 98.9853,
            status = Severity.Affected,
            metrics = listOf(
                StationMetric("PM2.5", "76 ug/m3"),
                StationMetric("Heat", "36 C"),
                StationMetric("Wind", "4 m/s"),
            ),
            updatedAt = "recent",
        ),
        MonitoringStation(
            id = "dmind-khonkaen-01",
            name = "Khon Kaen Basin Station",
            province = "Khon Kaen",
            latitude = 16.4419,
            longitude = 102.8359,
            status = Severity.Normal,
            metrics = listOf(
                StationMetric("Rain", "0.0 mm/h"),
                StationMetric("Soil", "43%"),
                StationMetric("Humidity", "69%"),
            ),
            updatedAt = "recent",
        ),
        MonitoringStation(
            id = "dmind-phuket-01",
            name = "Phuket Coastal Station",
            province = "Phuket",
            latitude = 7.8804,
            longitude = 98.3923,
            status = Severity.Watch,
            metrics = listOf(
                StationMetric("Rain", "11.2 mm/h"),
                StationMetric("Wind", "12 m/s"),
                StationMetric("Wave", "Moderate"),
            ),
            updatedAt = "recent",
        ),
    )

    // สร้างรายงานสถานะของแหล่งข้อมูลสำหรับสถานีตรวจวัด
    private fun stationSourceStatus(stations: List<MonitoringStation>) = ExternalSourceStatus(
        name = "D-MIND stations",
        agency = "D-MIND Sensor Network",
        isHealthy = true,
        count = stations.size,
        detail = "Station and sensor-style data are available locally until api-from-sensor provides production endpoints.",
    )

    // แปลงระดับค่าทศนิยมเป็น 1 ตำแหน่งสำหรับความเข้ากันได้
    private fun Double.formatOne(): String = java.lang.String.format(java.util.Locale.US, "%.1f", this)
}
