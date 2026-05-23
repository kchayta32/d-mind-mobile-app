package com.dmind.app.network.dto

import com.dmind.app.domain.model.ViirsHotspot
import org.json.JSONObject
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

data class GistdaViirsFeatureDto(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val country: String,
    val province: String,
    val district: String,
    val subdistrict: String,
    val detectedDate: String,
    val utmZone: String,
    val responsibleArea: String,
    val vAngle: String,
    val vDirect: String,
    val vDist: String,
    val hoursSinceDetected: Double?,
) {
    fun toDomain(): ViirsHotspot = ViirsHotspot(
        id = id,
        latitude = latitude,
        longitude = longitude,
        country = country,
        province = province,
        district = district,
        subdistrict = subdistrict,
        detectedDate = detectedDate,
        utmZone = utmZone,
        responsibleArea = responsibleArea,
        vAngle = vAngle,
        vDirect = vDirect,
        vDist = vDist,
        hoursSinceDetected = hoursSinceDetected,
    )

    companion object {
        fun fromFeature(feature: GistdaRawFeatureDto, index: Int): GistdaViirsFeatureDto? {
            val properties = feature.properties
            val lat = feature.centerLatitude
                ?: properties.firstDouble("latitude", "lat", "LATITUDE", "LAT")
                ?: return null
            val lon = feature.centerLongitude
                ?: properties.firstDouble("longitude", "long", "lon", "LON", "LONGITUDE")
                ?: return null
            return GistdaViirsFeatureDto(
                id = feature.id.ifBlank { "gistda-viirs-$index" },
                latitude = lat,
                longitude = lon,
                country = properties.displayValue("ct_tn", "country", default = "ราชอาณาจักรไทย"),
                province = properties.displayValue("pv_tn", "province", "changwat"),
                district = properties.displayValue("ap_tn", "district", "amphoe"),
                subdistrict = properties.displayValue("tb_tn", "subdistrict", "tambon"),
                detectedDate = detectedDate(properties),
                utmZone = properties.displayValue("utm_zone", "utm", "UTM_ZONE"),
                responsibleArea = properties.displayValue("area_resp", "responsible_area", "agency", "owner"),
                vAngle = properties.displayValue("v_angle", "V_Angle", "vAngle"),
                vDirect = properties.displayValue("v_direct", "V_Direct", "vDirect"),
                vDist = properties.displayValue("v_dist", "V_Dist", "vDist"),
                hoursSinceDetected = hoursSinceDetected(properties),
            )
        }

        private fun detectedDate(properties: JSONObject): String {
            val date = properties.displayValue("th_date", "acq_date", "date", "_createdAt")
            val time = properties.displayValue("th_time", "acq_time", "time", default = "")
            return listOf(date, time).filter { it.isNotBlank() && it != "-" }.joinToString(" ").ifBlank { "-" }
        }

        private fun hoursSinceDetected(properties: JSONObject): Double? {
            properties.firstDouble("hours_since_detected", "hours", "age_hours", "time_since_detected")?.let {
                return it
            }
            parseInstant(properties.displayValue("acq_datetime", "datetime", "_createdAt", "_updatedAt", default = ""))
                ?.let { detected ->
                    return Duration.between(detected, Instant.now()).toMinutes().coerceAtLeast(0) / 60.0
                }
            val acqDate = properties.displayValue("acq_date", default = "")
            val acqTime = properties.displayValue("acq_time", default = "")
            if (acqDate.isNotBlank() && acqTime.isNotBlank()) {
                parseAcquisitionDate(acqDate, acqTime)?.let { detected ->
                    return Duration.between(detected, Instant.now()).toMinutes().coerceAtLeast(0) / 60.0
                }
            }
            return null
        }

        private fun parseInstant(value: String): Instant? {
            if (value.isBlank() || value == "-") return null
            return runCatching { Instant.parse(value) }.getOrNull()
        }

        private fun parseAcquisitionDate(date: String, time: String): Instant? {
            val paddedTime = time.padStart(4, '0').take(4)
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HHmm", Locale.US)
            return runCatching {
                LocalDateTime.parse("$date $paddedTime", formatter)
                    .atZone(ZoneId.of("Asia/Bangkok"))
                    .toInstant()
            }.getOrNull()
        }
    }
}
