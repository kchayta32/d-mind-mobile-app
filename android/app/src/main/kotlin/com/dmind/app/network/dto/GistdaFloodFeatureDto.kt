package com.dmind.app.network.dto

import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaTimeRange

data class GistdaFloodFeatureDto(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val province: String,
    val district: String,
    val subdistrict: String,
    val areaSquareMeters: Double?,
    val recurrenceCount: Int?,
    val updatedAt: String,
) {
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
