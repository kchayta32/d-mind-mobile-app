package com.dmind.app.domain.repository

import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterSnapshot

interface DisasterRepository {
    suspend fun fetchSnapshot(): DisasterSnapshot
    suspend fun searchPlaces(query: String): List<PlaceSearchResult>
    suspend fun fetchWeatherForCoords(lat: Double, lon: Double): com.dmind.app.domain.model.SelectedWeatherInfo
    suspend fun fetchSoilMoistureGrid(): String
    suspend fun fetchRiverDischargeGrid(): String
}
