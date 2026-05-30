package com.dmind.app.domain.usecase

import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.repository.GistdaDisasterRepository

// คลาส Use Case สำหรับดึงข้อมูลรายละเอียดพิกัดและพื้นที่น้ำท่วมที่รายงานโดย GISTDA
class GetFloodFeaturesUseCase(
    private val repository: GistdaDisasterRepository,
) {
    // ฟังก์ชันรัน Use Case เพื่อดึงข้อมูลพื้นที่น้ำท่วมแบบจำกัดจำนวนและระบุช่วงเวลา
    suspend operator fun invoke(
        timeRange: GistdaTimeRange,
        limit: Int = 1000,
        offset: Int = 0,
    ): Result<List<FloodArea>> = repository.fetchFloodFeatures(timeRange, limit, offset)
}
