package com.dmind.app.domain.model

enum class HazardType(
    val label: String,
) {
    Earthquake("Earthquake"),
    Flood("Flood"),
    Storm("Storm"),
    Fire("Fire"),
    AirQuality("PM2.5"),
    Heat("Heat"),
    Drought("Drought"),
    Sinkhole("Sinkhole"),
    Weather("Weather"),
    Other("Other"),
}

enum class Severity(
    val label: String,
    val rank: Int,
) {
    Normal("Normal", 0),
    Watch("Watch", 1),
    Affected("Affected", 2),
    Critical("Critical", 3),
}

data class DisasterEvent(
    val id: String,
    val type: HazardType,
    val title: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val severity: Severity,
    val metric: String,
    val source: String,
    val updatedAt: String,
    val recommendedAction: String,
    val distanceKm: Double? = null,
)

data class MonitoringStation(
    val id: String,
    val name: String,
    val province: String,
    val latitude: Double,
    val longitude: Double,
    val status: Severity,
    val metrics: List<StationMetric>,
    val updatedAt: String,
)

data class StationMetric(
    val label: String,
    val value: String,
)

data class WeatherSnapshot(
    val locationName: String,
    val temperatureCelsius: Double,
    val humidityPercent: Double,
    val rainMillimeters: Double,
    val windSpeedMps: Double,
    val conditionLabel: String,
    val forecastTime: String,
    val latitude: Double = 13.7563,
    val longitude: Double = 100.5018,
    val apparentTemperatureCelsius: Double = 0.0,
    val pressureHpa: Double = 0.0,
)

data class MapHourlyForecast(
    val time: String,
    val temperatureCelsius: Double,
    val conditionLabel: String,
    val conditionCode: Int,
    val rainMillimeters: Double,
)

data class MapDailyForecast(
    val date: String,
    val maxTempCelsius: Double,
    val minTempCelsius: Double,
    val conditionLabel: String,
    val conditionCode: Int,
)

data class SelectedWeatherInfo(
    val current: WeatherSnapshot,
    val hourly: List<MapHourlyForecast>,
    val daily: List<MapDailyForecast>,
)

data class ExternalSourceStatus(
    val name: String,
    val agency: String,
    val isHealthy: Boolean,
    val count: Int,
    val detail: String,
)

data class DisasterSnapshot(
    val events: List<DisasterEvent> = emptyList(),
    val stations: List<MonitoringStation> = emptyList(),
    val weather: WeatherSnapshot? = null,
    val sources: List<ExternalSourceStatus> = emptyList(),
    val lastUpdatedMillis: Long = 0L,
    val isFallback: Boolean = false,
    val errorMessage: String? = null,
) {
    val criticalCount: Int
        get() = events.count { it.severity == Severity.Critical }

    val affectedCount: Int
        get() = events.count { it.severity == Severity.Affected || it.severity == Severity.Critical }

    val healthySourceCount: Int
        get() = sources.count { it.isHealthy }
}

data class DisasterFilter(
    val selectedTypes: Set<HazardType> = defaultHazardTypes,
    val minimumSeverity: Severity = Severity.Normal,
    val showStations: Boolean = true,
) {
    fun accepts(event: DisasterEvent): Boolean {
        return event.type in selectedTypes && event.severity.rank >= minimumSeverity.rank
    }

    companion object {
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
