package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.repository.GistdaDisasterRepository

class GetViirsHotspotsUseCase(
    private val repository: GistdaDisasterRepository,
) {
    suspend operator fun invoke(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<ViirsHotspot>> = repository.fetchViirsHotspots(timeRange, limit, offset)
}
