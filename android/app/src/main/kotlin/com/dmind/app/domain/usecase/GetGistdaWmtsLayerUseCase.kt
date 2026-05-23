package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.repository.GistdaDisasterRepository

class GetGistdaWmtsLayerUseCase(
    private val repository: GistdaDisasterRepository,
) {
    operator fun invoke(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): GistdaLayer = repository.getWmtsLayer(type, timeRange, droughtProduct)
}
