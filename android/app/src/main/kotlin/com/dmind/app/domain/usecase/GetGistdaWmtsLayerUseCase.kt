package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.repository.GistdaDisasterRepository

// คลาส Use Case สำหรับรับข้อมูลแผนที่กระเบื้อง (WMTS Layer) ของ GISTDA เพื่อไปวาดแสดงผลบนแผนที่
class GetGistdaWmtsLayerUseCase(
    private val repository: GistdaDisasterRepository,
) {
    // ดำเนินการส่งข้อมูลกำหนดสิทธิ์ชั้นข้อมูลแผนที่อ้างอิงตามชนิดและระยะเวลาภัยพิบัติ
    operator fun invoke(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): GistdaLayer = repository.getWmtsLayer(type, timeRange, droughtProduct)
}
