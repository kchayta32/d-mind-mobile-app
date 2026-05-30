package com.dmind.app.network.dto

import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaTimeRange

// โมเดลข้อมูล DTO สำหรับจัดการจับคู่พารามิเตอร์เวกเตอร์น้ำท่วมของ GISTDA
data class GistdaFloodFeatureDto(
    val id: String, // ไอดีประจำฟีเจอร์น้ำท่วม
    val latitude: Double, // ละติจูดของพิกัดพื้นที่น้ำท่วม
    val longitude: Double, // ลองจิจูดของพิกัดพื้นที่น้ำท่วม
    val province: String, // ชื่อจังหวัด
    val district: String, // ชื่ออำเภอ
    val subdistrict: String, // ชื่อตำบล
    val areaSquareMeters: Double?, // ขนาดพื้นที่ที่ได้รับผลกระทบเป็นตารางเมตร
    val recurrenceCount: Int?, // สถิติอัตราความถี่เกิดซ้ำ (ครั้ง)
    val updatedAt: String, // เวลาอัปเดตข้อมูลล่าสุด
) {
    // ฟังก์ชันสำหรับแปลงโมเดล DTO นี้ให้เป็นออบเจกต์ Domain Model ในเลเยอร์ธุรกิจ (Domain Layer)
    fun toDomain(timeRange: GistdaTimeRange): FloodArea = FloodArea(
        id = id,
        latitude = latitude,
        longitude = longitude,
        province = province,
        district = district,
        subdistrict = subdistrict,
        areaSquareMeters = areaSquareMeters,
        updatedAt = updatedAt,
        timeRange = timeRange,
        recurrenceCount = recurrenceCount,
    )

    companion object {
        // ฟังก์ชันวิเคราะห์ดึงข้อมูลพื้นที่น้ำท่วมจาก Raw GeoJSON Feature มาสร้าง DTO คอนสตรัคเตอร์
        fun fromFeature(feature: GistdaRawFeatureDto, index: Int): GistdaFloodFeatureDto? {
            val properties = feature.properties
            val lat = feature.centerLatitude
                ?: properties.firstDouble("latitude", "lat")
                ?: return null
            val lon = feature.centerLongitude
                ?: properties.firstDouble("longitude", "long", "lon")
                ?: return null
            return GistdaFloodFeatureDto(
                id = feature.id.ifBlank { "gistda-flood-$index" },
                latitude = lat,
                longitude = lon,
                province = properties.displayValue("pv_tn", "province", "LabelTH"),
                district = properties.displayValue("ap_tn", "district", "amphoe"),
                subdistrict = properties.displayValue("tb_tn", "subdistrict", "tambon"),
                areaSquareMeters = properties.firstDouble("f_area", "shape_area", "area_sqm", "area")
                    ?: properties.firstDouble("area_rai")?.let { it * 1600.0 },
                recurrenceCount = properties.firstInt(
                    "freq",
                    "frequency",
                    "flood_freq",
                    "flood_count",
                    "count",
                    "cnt",
                    "value",
                ),
                updatedAt = properties.displayValue("_updatedAt", "_createdAt", "date", default = "-"),
            )
        }
    }
}
