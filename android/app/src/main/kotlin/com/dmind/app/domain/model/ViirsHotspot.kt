package com.dmind.app.domain.model

enum class ViirsTimeBucket(
    val label: String,
    val minHours: Double,
) {
    LessThanOne("<1", 0.0),
    OneToThree("1–3", 1.0),
    ThreeToSix("3–6", 3.0),
    SixToTwelve("6–12", 6.0),
    TwelveToTwentyFour("12–24", 12.0),
    MoreThanTwentyFour(">24", 24.0),
}

fun viirsTimeBucket(hoursSinceDetected: Double?): ViirsTimeBucket {
    val hours = hoursSinceDetected ?: return ViirsTimeBucket.MoreThanTwentyFour
    return when {
        hours < 1.0 -> ViirsTimeBucket.LessThanOne
        hours < 3.0 -> ViirsTimeBucket.OneToThree
        hours < 6.0 -> ViirsTimeBucket.ThreeToSix
        hours < 12.0 -> ViirsTimeBucket.SixToTwelve
        hours < 24.0 -> ViirsTimeBucket.TwelveToTwentyFour
        else -> ViirsTimeBucket.MoreThanTwentyFour
    }
}

data class ViirsHotspot(
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
    val timeBucket: ViirsTimeBucket
        get() = viirsTimeBucket(hoursSinceDetected)

    val googleMapsUrl: String
        get() = "https://www.google.com/maps/search/?api=1&query=$latitude,$longitude"
}
