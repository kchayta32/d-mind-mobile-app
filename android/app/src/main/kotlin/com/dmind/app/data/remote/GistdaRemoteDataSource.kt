package com.dmind.app.data.remote

import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.network.api.GistdaApi
import com.dmind.app.network.dto.GistdaFeatureResponseDto
import com.dmind.app.network.dto.GistdaFloodFeatureDto
import com.dmind.app.network.dto.GistdaViirsFeatureDto

class GistdaRemoteDataSource(
    private val api: GistdaApi = GistdaApi(),
) {
    suspend fun fetchViirsHotspots(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): List<GistdaViirsFeatureDto> {
        val body = api.getViirsFeatures(timeRange, limit, offset)
        return GistdaFeatureResponseDto.fromJson(body).features.mapIndexedNotNull { index, feature ->
            GistdaViirsFeatureDto.fromFeature(feature, index)
        }
    }

    suspend fun fetchFloodAreas(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): List<GistdaFloodFeatureDto> {
        val body = api.getFloodFeatures(timeRange, limit, offset)
        return GistdaFeatureResponseDto.fromJson(body).features.mapIndexedNotNull { index, feature ->
            GistdaFloodFeatureDto.fromFeature(feature, index)
        }
    }

    fun hasApiKey(): Boolean = api.hasApiKey()

    fun wmtsTileUrl(
        type: com.dmind.app.domain.model.DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): String? = api.wmtsTileUrl(type, timeRange, droughtProduct)
}
