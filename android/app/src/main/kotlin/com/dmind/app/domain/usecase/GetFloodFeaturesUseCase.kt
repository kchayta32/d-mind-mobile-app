package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.repository.GistdaDisasterRepository

class GetFloodFeaturesUseCase(
    private val repository: GistdaDisasterRepository,
) {
    suspend operator fun invoke(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<FloodArea>> = repository.fetchFloodFeatures(timeRange, limit, offset)
}
