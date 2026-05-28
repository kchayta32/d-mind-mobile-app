package com.dmind.app.domain.usecase

import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterSnapshot
import com.dmind.app.domain.repository.DisasterRepository

class GetDisasterSnapshotUseCase(
    private val repository: DisasterRepository,
) {
    suspend operator fun invoke(): DisasterSnapshot = repository.fetchSnapshot()
}

class SearchPlacesUseCase(
    private val repository: DisasterRepository,
) {
    suspend operator fun invoke(query: String): List<PlaceSearchResult> = repository.searchPlaces(query)
}

class FetchWeatherForCoordsUseCase(
    private val repository: DisasterRepository,
) {
    suspend operator fun invoke(lat: Double, lon: Double) = repository.fetchWeatherForCoords(lat, lon)
}
