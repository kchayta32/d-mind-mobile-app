package com.dmind.app.domain.repository

import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterSnapshot

interface DisasterRepository {
    suspend fun fetchSnapshot(): DisasterSnapshot
    suspend fun searchPlaces(query: String): List<PlaceSearchResult>
}
