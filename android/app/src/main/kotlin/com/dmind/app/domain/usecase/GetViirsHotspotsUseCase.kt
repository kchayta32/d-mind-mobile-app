package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.repository.GistdaDisasterRepository

// คลาส Use Case สำหรับเรียกสืบค้นข้อมูลพิกัดจุดความร้อน (Hotspots) ทางการรายงานภัยพิบัติของ VIIRS GISTDA
class GetViirsHotspotsUseCase(
    private val repository: GistdaDisasterRepository,
) {
    // ฟังก์ชันรันเรียกค้นหาจุดความร้อนผ่านอินสแตนซ์ของ Repository
    suspend operator fun invoke(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<ViirsHotspot>> = repository.fetchViirsHotspots(timeRange, limit, offset)
}
