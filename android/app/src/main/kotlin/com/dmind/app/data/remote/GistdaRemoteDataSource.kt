package com.dmind.app.data.remote

import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.network.api.GistdaApi
import com.dmind.app.network.dto.GistdaFeatureResponseDto
import com.dmind.app.network.dto.GistdaFloodFeatureDto
import com.dmind.app.network.dto.GistdaViirsFeatureDto

// คลาส Remote Data Source สำหรับดึงข้อมูลเหตุการณ์ภัยพิบัติและข้อมูลชั้นแผนที่ (WMS/WMTS) จาก GISTDA API
class GistdaRemoteDataSource(
    private val api: GistdaApi = GistdaApi(),
) {
    // ดึงข้อมูลจุดความร้อนและไฟป่า VIIRS จาก GISTDA ตามช่วงเวลาที่กำหนด
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

    // ดึงข้อมูลพื้นที่ประสบอุทกภัย/น้ำท่วม จาก GISTDA ตามช่วงเวลาที่กำหนด
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

    // ตรวจสอบว่ามีการกำหนด API Key สำหรับเรียกใช้ API ของ GISTDA หรือไม่
    fun hasApiKey(): Boolean = api.hasApiKey()

    // สร้างลิงก์ URL สำหรับชั้นแผนที่ WMTS Tile ตามประเภทภัยพิบัติและผลิตภัณฑ์ภัยแล้งที่ระบุ
    fun wmtsTileUrl(
        type: com.dmind.app.domain.model.DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): String? = api.wmtsTileUrl(type, timeRange, droughtProduct)
}
