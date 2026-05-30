package com.dmind.app.network.dto

import com.dmind.app.domain.model.ViirsHotspot
import org.json.JSONObject
import java.time.Duration
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

// คลาสโมเดล DTO สำหรับจัดกลุ่มพารามิเตอร์ข้อมูลจุดความร้อนไฟป่า (VIIRS Features)
data class GistdaViirsFeatureDto(
    val id: String, // รหัสประจำตัวจุดตรวจพบ
    val latitude: Double, // ละติจูดของพิกัด
    val longitude: Double, // ลองจิจูดของพิกัด
    val country: String, // ชื่อประเทศ
    val province: String, // ชื่อจังหวัด
    val district: String, // ชื่ออำเภอ
    val subdistrict: String, // ชื่อตำบล
    val detectedDate: String, // วันเวลาพิกัดสังเกตการณ์ดาวเทียม
    val utmZone: String, // รหัสโซนแผนที่ระบบ UTM
    val responsibleArea: String, // พื้นที่หน่วยงานและกฎหมายที่รับผิดชอบ
    val vAngle: String, // มุมตรวจวัด
    val vDirect: String, // ทิศทางพิกัด
    val vDist: String, // ระยะอ้างอิง
    val hoursSinceDetected: Double?, // ระยะเวลาหลังจากการตรวจจับได้ (ชั่วโมง)
) {
    // แปลงออบเจกต์ DTO ชนิดนี้ให้กลายเป็น Domain Model (ViirsHotspot) สำหรับระบบแผนที่และตาราง
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
        // วิเคราะห์ข้อมูลจุดความร้อนจาก Raw GeoJSON Feature มาป้อนเข้า DTO คอนสตรัคเตอร์
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

        // ดึงเฉพาะข้อมูลวันที่และเวลาที่บันทึกพิกัดดาวเทียม
        private fun detectedDate(properties: JSONObject): String {
            val date = properties.displayValue("th_date", "acq_date", "date", "_createdAt")
            val time = properties.displayValue("th_time", "acq_time", "time", default = "")
            return listOf(date, time).filter { it.isNotBlank() && it != "-" }.joinToString(" ").ifBlank { "-" }
        }

        // ตรวจสอบและประมวลผลคำนวณชั่วโมงที่ล่วงเลยหลังจากการพิกัดตรวจจับภัยพิบัติจนถึง ณ ขณะนี้
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

        // แปลงข้อความ ISO Time representation ให้อยู่ในรูป Instant Object
        private fun parseInstant(value: String): Instant? {
            if (value.isBlank() || value == "-") return null
            return runCatching { Instant.parse(value) }.getOrNull()
        }

        // พาร์ทวันที่และเวลา (Acquisition Time) ในรูปแบบทุ่งกว้างตามข้อกำหนดเขตเวลาเอเชีย/กรุงเทพฯ
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
