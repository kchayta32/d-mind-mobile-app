package com.dmind.app.domain.repository

import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsHotspot

interface GistdaDisasterRepository {
    suspend fun fetchViirsHotspots(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<ViirsHotspot>>

    suspend fun fetchFloodFeatures(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<FloodArea>>

    fun getWmtsLayer(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): GistdaLayer
}
