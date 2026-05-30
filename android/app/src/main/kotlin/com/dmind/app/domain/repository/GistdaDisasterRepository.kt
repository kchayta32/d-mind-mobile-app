package com.dmind.app.domain.repository

import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsHotspot

// อินเตอร์เฟซกำหนดฟังก์ชันสำหรับการทำงานกับบริการและข้อมูลภัยพิบัติทางภูมิศาสตร์จากระบบ GISTDA
interface GistdaDisasterRepository {
    // ดึงรายการข้อมูลจุดความร้อน (Hotspots) จากดาวเทียม VIIRS ตามเวลาและปริมาณที่กำหนด
    suspend fun fetchViirsHotspots(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<ViirsHotspot>>

    // ดึงข้อมูลขอบเขตพื้นที่อุทกภัย (Flood Area Features) ตามเวลาและปริมาณที่กำหนด
    suspend fun fetchFloodFeatures(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<FloodArea>>

    // สร้างและดึงรูปแบบรายละเอียดคอนฟิกของแผนที่ภาพถ่าย (WMTS Layer) สำหรับใช้แสดงผลในจุดต่างๆ ของแผนที่
    fun getWmtsLayer(
        type: DisasterLayerType,
        timeRange: GistdaTimeRange,
        droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    ): GistdaLayer
}
