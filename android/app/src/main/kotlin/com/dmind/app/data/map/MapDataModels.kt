package com.dmind.app.data.map

const val MAP_REFRESH_INTERVAL_MS: Long = 5 * 60 * 1000L

enum class DisasterDataType {
    Earthquake,
    Wildfire,
    Flood,
    Drought,
    Weather,
    Place,
}

enum class DisasterSeverity {
    Low,
    Medium,
    High,
    VeryHigh,
}

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

data class WeatherSummary(
    val locationName: String,
    val temperatureCelsius: Double,
    val humidityPercent: Double,
    val rainMillimeters: Double,
    val windSpeedMps: Double,
    val conditionCode: Int,
    val conditionLabel: String,
    val forecastTime: String,
)

data class MapExternalSourceStatus(
    val name: String,
    val agency: String,
    val ok: Boolean,
    val count: Int,
    val detail: String,
)

data class PlaceSearchResult(
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val country: String,
    val state: String?,
)

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
    val allPoints: List<DisasterPoint>
        get() = earthquakes + wildfires + floods + floodFrequency + waterHyacinths + droughts

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
        val Empty = MapDataSnapshot()
    }
}

fun Double.formatOne(): String = "%,.1f".format(this)
