package com.dmind.app.data.mapper

import com.dmind.app.data.map.DisasterDataType
import com.dmind.app.data.map.DisasterPoint
import com.dmind.app.data.map.DisasterSeverity
import com.dmind.app.data.map.MapDataSnapshot
import com.dmind.app.data.map.WeatherSummary
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.ExternalSourceStatus
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.WeatherSnapshot

fun MapDataSnapshot.toWeatherSnapshot(): WeatherSnapshot? = weather?.toDomain()

fun WeatherSummary.toDomain(): WeatherSnapshot = WeatherSnapshot(
    locationName = locationName,
    temperatureCelsius = temperatureCelsius,
    humidityPercent = humidityPercent,
    rainMillimeters = rainMillimeters,
    windSpeedMps = windSpeedMps,
    conditionLabel = conditionLabel,
    forecastTime = forecastTime,
)

fun MapDataSnapshot.toExternalSourceStatuses(): List<ExternalSourceStatus> = statuses.map {
    ExternalSourceStatus(
        name = it.name,
        agency = it.agency,
        isHealthy = it.ok,
        count = it.count,
        detail = it.detail,
    )
}

fun DisasterPoint.toDomain(): DisasterEvent = DisasterEvent(
    id = id,
    type = type.toHazardType(),
    title = title,
    description = subtitle,
    latitude = latitude,
    longitude = longitude,
    severity = severity.toDomain(),
    metric = metric,
    source = source,
    updatedAt = updatedAt,
    recommendedAction = recommendedActionFor(type.toHazardType(), severity.toDomain()),
)

fun DisasterSeverity.toDomain(): Severity = when (this) {
    DisasterSeverity.Low -> Severity.Normal
    DisasterSeverity.Medium -> Severity.Watch
    DisasterSeverity.High -> Severity.Affected
    DisasterSeverity.VeryHigh -> Severity.Critical
}

fun DisasterDataType.toHazardType(): HazardType = when (this) {
    DisasterDataType.Earthquake -> HazardType.Earthquake
    DisasterDataType.Wildfire -> HazardType.Fire
    DisasterDataType.Flood -> HazardType.Flood
    DisasterDataType.Drought -> HazardType.Drought
    DisasterDataType.Weather -> HazardType.Storm
    DisasterDataType.Place -> HazardType.Other
}

fun recommendedActionFor(type: HazardType, severity: Severity): String {
    val urgency = when (severity) {
        Severity.Critical -> "Avoid the affected area and follow official evacuation guidance."
        Severity.Affected -> "Limit travel nearby and monitor official updates."
        Severity.Watch -> "Stay aware and prepare emergency supplies."
        Severity.Normal -> "No immediate action required. Keep monitoring conditions."
    }
    return when (type) {
        HazardType.Earthquake -> "$urgency Drop, cover, and hold if shaking starts."
        HazardType.Flood -> "$urgency Move valuables upward and avoid floodwater."
        HazardType.Storm -> "$urgency Stay indoors away from windows during strong wind."
        HazardType.Fire -> "$urgency Avoid smoke exposure and keep escape routes open."
        HazardType.AirQuality -> "$urgency Use a mask outdoors if PM2.5 is elevated."
        HazardType.Heat -> "$urgency Drink water and avoid outdoor exertion at midday."
        HazardType.Drought -> "$urgency Conserve water and follow local advisories."
        HazardType.Sinkhole -> "$urgency Keep distance from cracks or subsidence."
        HazardType.Weather,
        HazardType.Other,
        -> urgency
    }
}
