package com.dmind.app.network.dto

import org.json.JSONArray
import org.json.JSONObject

data class GistdaFeatureResponseDto(
    val numberMatched: Int,
    val features: List<GistdaRawFeatureDto>,
) {
    companion object {
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

data class GistdaRawFeatureDto(
    val id: String,
    val properties: JSONObject,
    val geometry: JSONObject?,
    val centerLatitude: Double?,
    val centerLongitude: Double?,
) {
    companion object {
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

internal fun centroidFromGeometry(geometry: JSONObject?): Pair<Double, Double>? {
    val coordinates = geometry?.optJSONArray("coordinates") ?: return null
    val points = mutableListOf<Pair<Double, Double>>()
    collectCoordinatePairs(coordinates, points)
    if (points.isEmpty()) return null
    return points.map { it.first }.average() to points.map { it.second }.average()
}

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

private fun Any?.asCoordinateDouble(): Double? = when (this) {
    is Number -> toDouble()
    is String -> toDoubleOrNull()
    else -> null
}
