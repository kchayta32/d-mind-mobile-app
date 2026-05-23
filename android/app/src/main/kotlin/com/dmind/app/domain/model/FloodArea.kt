package com.dmind.app.domain.model

data class FloodArea(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val province: String,
    val district: String,
    val subdistrict: String,
    val areaSquareMeters: Double?,
    val updatedAt: String,
    val timeRange: GistdaTimeRange,
    val recurrenceCount: Int? = null,
) {
    val severity: Severity
        get() = when {
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) > 12 -> Severity.Critical
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) >= 9 -> Severity.Affected
            timeRange == GistdaTimeRange.FloodFrequency && (recurrenceCount ?: 0) >= 1 -> Severity.Watch
            (areaSquareMeters ?: 0.0) >= 1_000_000.0 -> Severity.Critical
            (areaSquareMeters ?: 0.0) >= 250_000.0 -> Severity.Affected
            (areaSquareMeters ?: 0.0) >= 50_000.0 -> Severity.Watch
            else -> Severity.Normal
        }

    val frequencyBucket: FloodFrequencyBucket
        get() = floodFrequencyBucket(recurrenceCount)
}

enum class FloodFrequencyBucket(
    val label: String,
    val description: String,
) {
    LessThanOne("<1", "น้อยกว่า 1 ครั้ง"),
    OneToThree("1-3", "1 ถึง 3 ครั้ง"),
    ThreeToSix("3-6", "3 ถึง 6 ครั้ง"),
    SixToNine("6-9", "6 ถึง 9 ครั้ง"),
    NineToTwelve("9-12", "9 ถึง 12 ครั้ง"),
    MoreThanTwelve(">12", "มากกว่า 12 ครั้ง"),
}

fun floodFrequencyBucket(count: Int?): FloodFrequencyBucket {
    val value = count ?: 0
    return when {
        value < 1 -> FloodFrequencyBucket.LessThanOne
        value <= 3 -> FloodFrequencyBucket.OneToThree
        value <= 6 -> FloodFrequencyBucket.ThreeToSix
        value <= 9 -> FloodFrequencyBucket.SixToNine
        value <= 12 -> FloodFrequencyBucket.NineToTwelve
        else -> FloodFrequencyBucket.MoreThanTwelve
    }
}
