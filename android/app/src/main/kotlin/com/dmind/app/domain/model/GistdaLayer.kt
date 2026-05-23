package com.dmind.app.domain.model

enum class GistdaTimeRange(
    val thaiLabel: String,
    val featureSegment: String,
    val floodWmtsSegment: String,
    val viirsWmtsSegment: String,
) {
    OneDay("1 วัน", "1day", "1day", "1day"),
    ThreeDays("3 วัน", "3days", "3day", "3day"),
    SevenDays("7 วัน", "7days", "7day", "7day"),
    ThirtyDays("30 วัน", "30days", "30day", "30day"),
    FloodFrequency("น้ำท่วมซ้ำซาก", "flood-freq", "flood-freq", ""),
}

enum class GistdaDroughtProduct(
    val thaiLabel: String,
    val description: String,
    val legendTitle: String,
) {
    Smap(
        thaiLabel = "SMAP",
        description = "ความชื้นในดิน ราย 7 วันล่าสุด",
        legendTitle = "ความชื้นในดิน (SMAP) (%)",
    ),
    Ndwi(
        thaiLabel = "NDWI",
        description = "ความชื้นพืชพรรณ ราย 7 วันล่าสุด",
        legendTitle = "ความชื้นพืชพรรณ (NDWI)",
    ),
    DriPlus(
        thaiLabel = "DRIPlus",
        description = "พื้นที่เสี่ยงภัยแล้ง ราย 7 วันล่าสุด",
        legendTitle = "พื้นที่เสี่ยงภัยแล้ง (DRIPlus)",
    ),
}

data class GistdaLayer(
    val type: DisasterLayerType,
    val timeRange: GistdaTimeRange,
    val title: String,
    val path: String,
    val tileUrl: String?,
    val isAvailable: Boolean,
    val tileScheme: String = "xyz",
    val droughtProduct: GistdaDroughtProduct? = null,
    val message: String? = null,
)
