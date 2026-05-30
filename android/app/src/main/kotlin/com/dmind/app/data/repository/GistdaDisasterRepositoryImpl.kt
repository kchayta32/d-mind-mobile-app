package com.dmind.app.data.repository

import com.dmind.app.data.remote.GistdaRemoteDataSource
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.repository.GistdaDisasterRepository
import com.dmind.app.network.api.GistdaEndpointPaths

// คลาสเชื่อมโยงการทำงานสำหรับการเรียกข้อมูล GISTDA และจัดการแผนที่ระดับชั้น (Layer) ตามเงื่อนไขต่างๆ
class GistdaDisasterRepositoryImpl(
    private val remoteDataSource: GistdaRemoteDataSource = GistdaRemoteDataSource(),
) : GistdaDisasterRepository {
    // ดึงข้อมูลจุดความร้อนและไฟป่า VIIRS จาก Remote Data Source และแปลงข้อมูลไปเป็น Domain
    override suspend fun fetchViirsHotspots(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): Result<List<ViirsHotspot>> = runCatching {
        remoteDataSource.fetchViirsHotspots(timeRange, limit, offset).map { it.toDomain() }
    }

    // ดึงข้อมูลพื้นที่ประสบอุทกภัยจาก Remote Data Source และแปลงข้อมูลไปเป็น Domain
    override suspend fun fetchFloodFeatures(
        timeRange: GistdaTimeRange,
        limit: Int,
        offset: Int,
    ): Result<List<FloodArea>> = runCatching {
        remoteDataSource.fetchFloodAreas(timeRange, limit, offset).map { it.toDomain(timeRange) }
    }

    // สร้างและส่งคืนข้อมูลชั้นแผนที่ GistdaLayer สำหรับแสดงบนแผนที่แอปพลิเคชัน (เช่น ลิงก์ชั้นภาพแผนที่ WMTS Tile)
    override fun getWmtsLayer(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct,
    ): GistdaLayer {
        val layerTimeRange = if (type == DisasterLayerType.DroughtSmap) GistdaTimeRange.SevenDays else timeRange
        val path = GistdaEndpointPaths.wmtsPath(type, layerTimeRange, droughtProduct).orEmpty()
        val tileUrl = remoteDataSource.wmtsTileUrl(type, layerTimeRange, droughtProduct)
        val tileScheme = GistdaEndpointPaths.tileScheme(type, droughtProduct)

        return GistdaLayer(
            type = type,
            timeRange = layerTimeRange,
            title = when (type) {
                DisasterLayerType.Flood -> "พื้นที่น้ำท่วม ${layerTimeRange.thaiLabel}"
                DisasterLayerType.WildfireViirs -> "จุดความร้อน VIIRS ${layerTimeRange.thaiLabel}"
                DisasterLayerType.DroughtSmap -> droughtProduct.legendTitle
                else -> type.thaiLabel
            },
            path = path,
            tileUrl = tileUrl,
            isAvailable = tileUrl != null,
            tileScheme = tileScheme,
            droughtProduct = if (type == DisasterLayerType.DroughtSmap) droughtProduct else null,
            message = when {
                tileUrl == null -> "ยังไม่ได้ตั้งค่า DMIND_GISTDA_API_KEY"
                type == DisasterLayerType.DroughtSmap -> "${droughtProduct.description} จาก GISTDA"
                else -> null
            },
        )
    }
}
