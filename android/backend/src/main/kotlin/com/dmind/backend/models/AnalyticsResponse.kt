package com.dmind.backend.models

import kotlinx.serialization.Serializable

@Serializable
data class AnalyticsSummaryResponse(
    val totalEvents: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
    val bySeverity: Map<String, Int>,
    val affectedAreaKm2: Double,
    val recentEvents: List<RecentEvent>,
)

@Serializable
data class RecentEvent(
    val title: String,
    val type: String,
    val severity: String,
    val location: String,
    val timestamp: String,
)

@Serializable
data class TrendDataResponse(
    val period: String,
    val data: List<TrendPoint>,
)

@Serializable
data class TrendPoint(
    val date: String,
    val total: Int,
    val earthquake: Int,
    val flood: Int,
    val wildfire: Int,
    val storm: Int,
    val drought: Int,
)

@Serializable
data class EnvironmentalResponse(
    val pm25: Double,
    val aqi: Int,
    val aqiLevel: String,
    val temperature: Double,
    val humidity: Int,
    val waterLevel: Double?,
    val rainfall: Double?,
    val updatedAt: String,
)
