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

class DefaultDisasterRepository(
    private val mapDataSource: DisasterMapRepository = DisasterMapRepository(),
    private val airQualityDataSource: AirQualityRemoteDataSource = AirQualityRemoteDataSource(),
) : DisasterRepository {
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
                DisasterSnapshot(
                    events = baseEvents + airResult.events + listOfNotNull(heatEvent, stormEvent),
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

    override suspend fun searchPlaces(query: String): List<PlaceSearchResult> {
        return mapDataSource.searchPlaces(query)
    }

    override suspend fun fetchWeatherForCoords(lat: Double, lon: Double): com.dmind.app.domain.model.SelectedWeatherInfo {
        return mapDataSource.fetchWeatherForCoords(lat, lon)
    }

    override suspend fun fetchSoilMoistureGrid(): String {
        return mapDataSource.fetchSoilMoistureGrid()
    }

    override suspend fun fetchRiverDischargeGrid(): String {
        return mapDataSource.fetchRiverDischargeGrid()
    }

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

    private fun fallbackEvents(): List<DisasterEvent> = listOf(
        event("fallback-flood-ayutthaya", HazardType.Flood, "Flood watch Ayutthaya", "River basin watch zone", 14.3532, 100.5689, Severity.Watch, "42 cm", "Local fallback"),
        event("fallback-fire-north", HazardType.Fire, "Hotspot watch Chiang Mai", "Satellite fallback estimate", 18.7953, 98.9986, Severity.Affected, "68%", "Local fallback"),
        event("fallback-drought-korat", HazardType.Drought, "Drought risk Nakhon Ratchasima", "Soil moisture watch", 14.9799, 102.0977, Severity.Watch, "55%", "Local fallback"),
    )

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

    private fun stationSourceStatus(stations: List<MonitoringStation>) = ExternalSourceStatus(
        name = "D-MIND stations",
        agency = "D-MIND Sensor Network",
        isHealthy = true,
        count = stations.size,
        detail = "Station and sensor-style data are available locally until api-from-sensor provides production endpoints.",
    )

    private fun Double.formatOne(): String = java.lang.String.format(java.util.Locale.US, "%.1f", this)
}
