package com.dmind.app.network.dto

import org.json.JSONArray
import org.json.JSONObject

// โมเดล DTO สำหรับรับข้อมูลรายการพิกัดเวกเตอร์ภูมิศาสตร์ (GeoJSON Features) จาก GISTDA
data class GistdaFeatureResponseDto(
    val numberMatched: Int, // จำนวนรวมรายการข้อมูลทั้งหมดที่ตรงเงื่อนไขสืบค้น
    val features: List<GistdaRawFeatureDto>, // รายการฟีเจอร์พิกัดภูมิศาสตร์ย่อย
) {
    companion object {
        // ฟังก์ชันช่วยแกะโครงสร้างผลลัพธ์ JSON ของ GeoJSON ฟีเจอร์
        fun fromJson(body: String): GistdaFeatureResponseDto {
            val json = JSONObject(body)
            val featureArray = json.optJSONArray("features")
                ?: json.optJSONObject("data")?.optJSONArray("features")
                ?: JSONArray()
            val features = (0 until featureArray.length()).mapNotNull { index ->
                featureArray.optJSONObject(index)?.let { GistdaRawFeatureDto.fromJson(it, index) }
            }
            return GistdaFeatureResponseDto(
                numberMatched = json.optInt("numberMatched", features.size),
                features = features,
            )
        }
    }
}

// โครงสร้างของข้อมูลดิบแต่ละพิกัดเวกเตอร์ (Raw Feature) และเครื่องมือหาจุดพิกัดกึ่งกลาง
data class GistdaRawFeatureDto(
    val id: String, // ไอดีเฉพาะระบุตัวตนเวกเตอร์
    val properties: JSONObject, // รายละเอียดค่าแอตทริบิวต์ (Properties) ย่อยของเวกเตอร์
    val geometry: JSONObject?, // ข้อมูลโครงสร้างเรขาคณิต (Geometry เช่น Point, Polygon)
    val centerLatitude: Double?, // ละติจูดกึ่งกลางที่ได้จากการคำนวณหาจุดเฉลี่ยรูปทรง
    val centerLongitude: Double?, // ลองจิจูดกึ่งกลางที่ได้จากการคำนวณหาจุดเฉลี่ยรูปทรง
) {
    companion object {
        // แปลงออบเจกต์ฟีเจอร์เดี่ยวจากรูปแบบ JSON มาเป็น DTO ของระบบพร้อมระบุไอดีอัตโนมัติ
        fun fromJson(feature: JSONObject, index: Int): GistdaRawFeatureDto {
            val geometry = feature.optJSONObject("geometry")
            val center = centroidFromGeometry(geometry)
            val properties = feature.optJSONObject("properties") ?: JSONObject()
            return GistdaRawFeatureDto(
                id = feature.optString("id").takeIf { it.isNotBlank() }
                    ?: properties.displayValue("_id", "id", default = "gistda-feature-$index"),
                properties = properties,
                geometry = geometry,
                centerLatitude = center?.first,
                centerLongitude = center?.second,
            )
        }
    }
}

// ฟังก์ชันขยายสำหรับใช้ตรวจสอบหาค่าความสำคัญลำดับแรกที่ค้นพบเพื่อทำเป็นข้อมูลข้อความ
internal fun JSONObject.displayValue(
    vararg names: String,
    default: String = "-",
): String {
    for (name in names) {
        if (!has(name) || isNull(name)) continue
        val value = opt(name) ?: continue
        val text = when (value) {
            is Number -> value.toString()
            else -> value.toString()
        }.trim()
        if (text.isNotBlank()) return text
    }
    return default
}

// ดึงค่าทศนิยม (Double) ลำดับแรกที่ตรวจพบคีย์ตามรายการลำดับชื่อคุณสมบัติ
internal fun JSONObject.firstDouble(vararg names: String): Double? {
    for (name in names) {
        if (!has(name) || isNull(name)) continue
        val value = opt(name)
        val number = when (value) {
            is Number -> value.toDouble()
            is String -> value.toDoubleOrNull()
            else -> null
        }
        if (number != null) return number
    }
    return null
}

// ดึงค่าจำนวนเต็ม (Integer) ลำดับแรกที่ตรวจพบคีย์ตามรายการลำดับชื่อคุณสมบัติ
internal fun JSONObject.firstInt(vararg names: String): Int? {
    for (name in names) {
        if (!has(name) || isNull(name)) continue
        val value = opt(name)
        val number = when (value) {
            is Number -> value.toInt()
            is String -> value.toDoubleOrNull()?.toInt()
            else -> null
        }
        if (number != null) return number
    }
    return null
}

// ฟังก์ชันช่วยหาจุดกึ่งกลาง (Centroid) ของอาร์เรย์พิกัด เพื่อหาค่าเฉลี่ยตำแหน่งละติจูด/ลองจิจูด
internal fun centroidFromGeometry(geometry: JSONObject?): Pair<Double, Double>? {
    val coordinates = geometry?.optJSONArray("coordinates") ?: return null
    val points = mutableListOf<Pair<Double, Double>>()
    collectCoordinatePairs(coordinates, points)
    if (points.isEmpty()) return null
    return points.map { it.first }.average() to points.map { it.second }.average()
}

// ฟังก์ชันวนซ้ำแบบ Recursion ค้นหาพิกัดคู่เลขทศนิยมละติจูด/ลองจิจูดจากข้อมูลอาร์เรย์พิกัดซ้อนย่อย
private fun collectCoordinatePairs(
    node: Any?,
    points: MutableList<Pair<Double, Double>>,
) {
    if (node !is JSONArray || node.length() == 0) return
    val first = node.opt(0)
    val second = node.opt(1)
    val lon = first.asCoordinateDouble()
    val lat = second.asCoordinateDouble()
    if (lon != null && lat != null) {
        points += lat to lon
        return
    }
    for (index in 0 until node.length()) {
        collectCoordinatePairs(node.opt(index), points)
    }
}

// แปลงค่าอินพุตพิกัดให้อยู่ในรูปทศนิยม Double
private fun Any?.asCoordinateDouble(): Double? = when (this) {
    is Number -> toDouble()
    is String -> toDoubleOrNull()
    else -> null
}
