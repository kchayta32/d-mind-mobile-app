package com.dmind.app.domain.model

/**
 * Summary of all disaster events aggregated from GISTDA/USGS/TMD.
 */
data class AnalyticsSummary(
    val totalEvents: Int,
    val byType: Map<String, Int>,
    val bySeverity: Map<String, Int>,
    val affectedAreaKm2: Double,
    val recentEvents: List<RecentEventSummary>,
)

data class RecentEventSummary(
    val title: String,
    val type: String,
    val severity: String,
    val location: String,
    val timestamp: String,
)

/**
 * Single data point in the trend timeline.
 */
data class TrendDataPoint(
    val date: String,
    val total: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
)

/**
 * Environmental monitoring data (PM2.5, AQI, weather).
 */
data class EnvironmentalData(
    val pm25: Double,
    val aqi: Int,
    val aqiLevel: String,
    val temperature: Double,
    val humidity: Int,
    val waterLevel: Double?,
    val rainfall: Double?,
)
