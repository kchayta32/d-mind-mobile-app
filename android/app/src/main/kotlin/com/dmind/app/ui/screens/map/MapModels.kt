package com.dmind.app.ui.screens.map

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Sensors
import androidx.compose.material.icons.filled.Thunderstorm
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import com.dmind.app.R
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.FloodFrequencyBucket
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.model.ViirsTimeBucket
import java.util.Locale
import kotlin.math.roundToInt

// ─── Data classes ───────────────────────────────────────────

// คลาสข้อมูลสำหรับเก็บข้อมูลแต่ละมาร์กเกอร์ที่จะวาดลงบนแผนที่ภัยพิบัติ
internal data class MapMarkerItem(
    val id: String,
    val latitude: Double,
    val longitude: Double,
    val title: String,
    val snippet: String,
    val severity: Severity,
    val type: HazardType,
    val count: Int,
    val event: DisasterEvent?,
    val station: MonitoringStation?,
    val hotspot: ViirsHotspot?,
    val floodArea: FloodArea?,
    val isStation: Boolean = false,
    val viirsBucket: ViirsTimeBucket? = null,
    val floodFrequencyBucket: FloodFrequencyBucket? = null,
)

// คลาสข้อมูลเก็บรหัสเหตุการณ์การซูมและควบคุมแผนที่
internal data class MapCameraAction(
    val id: Long,
    val kind: MapCameraActionKind,
)

// คลาสข้อมูลรวบรวมทรัพยากรข้อความสำหรับมาร์กเกอร์เดี่ยวและกลุ่มการรวมหมุด (Cluster)
internal data class MapMarkerText(
    val hazardLabels: Map<HazardType, String>,
    val clusterCountFormat: String,
    val clusterNearbyFormat: String,
    val clusterViirsFormat: String,
    val clusterFloodAreasFormat: String,
    val floodRecurrentTitleFormat: String,
    val floodShortTitleFormat: String,
    val timesPlaceFormat: String,
) {
    fun hazardLabel(type: HazardType): String = hazardLabels[type] ?: type.label
    fun clusterCount(count: Int, label: String): String = clusterCountFormat.format(Locale.US, count, label)
    fun clusterNearby(count: Int, label: String): String = clusterNearbyFormat.format(Locale.US, count, label)
    fun clusterViirs(count: Int): String = clusterViirsFormat.format(Locale.US, count)
    fun clusterFloodAreas(count: Int): String = clusterFloodAreasFormat.format(Locale.US, count)
    fun floodRecurrentTitle(province: String): String = floodRecurrentTitleFormat.format(Locale.US, province)
    fun floodShortTitle(province: String): String = floodShortTitleFormat.format(Locale.US, province)
    fun timesPlace(count: Int, district: String, subdistrict: String): String = timesPlaceFormat.format(Locale.US, count, district, subdistrict)
}

internal data class SmapLegendBand(
    val range: String,
    val label: String,
    val color: Color,
)

// ─── Enums ──────────────────────────────────────────────────

// รายการคำสั่งการย้ายกล้องแผนที่
internal enum class MapCameraActionKind {
    CenterThailand,
    ZoomIn,
    ZoomOut,
}

// รายการสไตล์สัญญะภาพพื้นหลังแผนที่ (Terrain, Satellite, Dark, Standard)
internal enum class MapTileStyle(
    val label: String,
    val description: String,
    val tileUrl: String,
    val attribution: String,
) {
    Terrain(
        label = "Terrain",
        description = "Terrain map with clearer topography",
        tileUrl = "https://tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution = "OpenTopoMap contributors",
    ),
    Standard(
        label = "Standard",
        description = "Road map from OpenStreetMap",
        tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution = "OpenStreetMap contributors",
    ),
    Satellite(
        label = "Satellite",
        description = "Satellite imagery for inspecting field conditions",
        tileUrl = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution = "Esri World Imagery",
    ),
    Dark(
        label = "Dark Mode",
        description = "Dark-themed map suitable for night use",
        tileUrl = "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        attribution = "CartoDB contributors",
    ),
}

// ─── Extension functions ────────────────────────────────────

// แปลงตัวเลขทศนิยมเป็นข้อความทศนิยม 1 ตำแหน่ง
internal fun Double.formatOne(): String = String.format(Locale.US, "%,.1f", this)

// แมปไอคอนประเภทชั้นข้อมูลสำหรับแสดงบนแผงควบคุม
internal fun DisasterLayerType.icon(): ImageVector = when (this) {
    DisasterLayerType.Earthquake -> Icons.Filled.Warning
    DisasterLayerType.Flood -> Icons.Filled.WaterDrop
    DisasterLayerType.WildfireViirs -> Icons.Filled.LocalFireDepartment
    DisasterLayerType.DroughtSmap -> Icons.Filled.WaterDrop
    DisasterLayerType.Storm -> Icons.Filled.Thunderstorm
    DisasterLayerType.AirQuality -> Icons.Filled.Air
    DisasterLayerType.Stations -> Icons.Filled.Sensors
}

// ข้อความป้ายกำกับของชั้นข้อมูลแต่ละประเภท
@Composable
internal fun DisasterLayerType.localizedLabel(): String = when (this) {
    DisasterLayerType.Earthquake -> stringResource(R.string.map_layer_earthquake)
    DisasterLayerType.Flood -> stringResource(R.string.map_layer_flood)
    DisasterLayerType.WildfireViirs -> stringResource(R.string.map_layer_wildfire_viirs)
    DisasterLayerType.DroughtSmap -> stringResource(R.string.map_layer_drought_smap)
    DisasterLayerType.Storm -> stringResource(R.string.map_layer_storm)
    DisasterLayerType.AirQuality -> stringResource(R.string.map_layer_air_quality)
    DisasterLayerType.Stations -> stringResource(R.string.map_layer_stations)
}

@Composable
internal fun DisasterLayerType.localizedDescription(): String = when (this) {
    DisasterLayerType.Earthquake -> stringResource(R.string.map_layer_earthquake_desc)
    DisasterLayerType.Flood -> stringResource(R.string.map_layer_flood_desc)
    DisasterLayerType.WildfireViirs -> stringResource(R.string.map_layer_wildfire_viirs_desc)
    DisasterLayerType.DroughtSmap -> stringResource(R.string.map_layer_drought_smap_desc)
    DisasterLayerType.Storm -> stringResource(R.string.map_layer_storm_desc)
    DisasterLayerType.AirQuality -> stringResource(R.string.map_layer_air_quality_desc)
    DisasterLayerType.Stations -> stringResource(R.string.map_layer_stations_desc)
}

// ข้อความช่วงเวลาภาษาไทย
@Composable
internal fun GistdaTimeRange.localizedLabel(): String = when (this) {
    GistdaTimeRange.OneDay -> stringResource(R.string.map_range_one_day)
    GistdaTimeRange.ThreeDays -> stringResource(R.string.map_range_three_days)
    GistdaTimeRange.SevenDays -> stringResource(R.string.map_range_seven_days)
    GistdaTimeRange.ThirtyDays -> stringResource(R.string.map_range_thirty_days)
    GistdaTimeRange.FloodFrequency -> stringResource(R.string.map_range_flood_frequency)
}

// ข้อความป้ายกำกับสินค้าภัยแล้ง
@Composable
internal fun GistdaDroughtProduct.localizedLabel(): String = when (this) {
    GistdaDroughtProduct.Smap -> stringResource(R.string.map_drought_smap_label)
    GistdaDroughtProduct.Ndwi -> stringResource(R.string.map_drought_ndwi_label)
    GistdaDroughtProduct.DriPlus -> stringResource(R.string.map_drought_driplus_label)
}

@Composable
internal fun GistdaDroughtProduct.localizedDescription(): String = when (this) {
    GistdaDroughtProduct.Smap -> stringResource(R.string.map_drought_smap_desc)
    GistdaDroughtProduct.Ndwi -> stringResource(R.string.map_drought_ndwi_desc)
    GistdaDroughtProduct.DriPlus -> stringResource(R.string.map_drought_driplus_desc)
}

@Composable
internal fun GistdaDroughtProduct.localizedLegendTitle(): String = when (this) {
    GistdaDroughtProduct.Smap -> stringResource(R.string.map_drought_smap_legend)
    GistdaDroughtProduct.Ndwi -> stringResource(R.string.map_drought_ndwi_legend)
    GistdaDroughtProduct.DriPlus -> stringResource(R.string.map_drought_driplus_legend)
}

// ข้อความระดับภัยพิบัติย่อย
@Composable
internal fun HazardType.localizedLabel(): String = when (this) {
    HazardType.Earthquake -> stringResource(R.string.hazard_earthquake)
    HazardType.Flood -> stringResource(R.string.hazard_flood)
    HazardType.Storm -> stringResource(R.string.hazard_storm)
    HazardType.Fire -> stringResource(R.string.hazard_fire)
    HazardType.AirQuality -> stringResource(R.string.hazard_air_quality)
    HazardType.Heat -> stringResource(R.string.hazard_heat)
    HazardType.Drought -> stringResource(R.string.hazard_drought)
    HazardType.Sinkhole -> stringResource(R.string.hazard_sinkhole)
    HazardType.Weather -> stringResource(R.string.hazard_weather)
    HazardType.Other -> stringResource(R.string.hazard_other)
}

@Composable
internal fun FloodFrequencyBucket.localizedDescription(): String = when (this) {
    FloodFrequencyBucket.LessThanOne -> stringResource(R.string.map_flood_freq_less_than_one_desc)
    FloodFrequencyBucket.OneToThree -> stringResource(R.string.map_flood_freq_one_to_three_desc)
    FloodFrequencyBucket.ThreeToSix -> stringResource(R.string.map_flood_freq_three_to_six_desc)
    FloodFrequencyBucket.SixToNine -> stringResource(R.string.map_flood_freq_six_to_nine_desc)
    FloodFrequencyBucket.NineToTwelve -> stringResource(R.string.map_flood_freq_nine_to_twelve_desc)
    FloodFrequencyBucket.MoreThanTwelve -> stringResource(R.string.map_flood_freq_more_than_twelve_desc)
}

// กำหนดสีประจำช่วงเวลาของจุดความร้อนไฟป่า
internal fun ViirsTimeBucket.color(): Color = when (this) {
    ViirsTimeBucket.LessThanOne -> Color(0xFFC40000)
    ViirsTimeBucket.OneToThree -> Color(0xFFFF3B3B)
    ViirsTimeBucket.ThreeToSix -> Color(0xFFFF7A00)
    ViirsTimeBucket.SixToTwelve -> Color(0xFFFFBF3F)
    ViirsTimeBucket.TwelveToTwentyFour -> Color(0xFFFFE36A)
    ViirsTimeBucket.MoreThanTwentyFour -> Color(0xFFFFF3A6)
}

// กำหนดสีประจำระดับความถี่น้ำท่วมสะสม
internal fun FloodFrequencyBucket.color(): Color = when (this) {
    FloodFrequencyBucket.LessThanOne -> Color(0xFF0B73D9)
    FloodFrequencyBucket.OneToThree -> Color(0xFF2396FF)
    FloodFrequencyBucket.ThreeToSix -> Color(0xFF55C8FF)
    FloodFrequencyBucket.SixToNine -> Color(0xFFFFD400)
    FloodFrequencyBucket.NineToTwelve -> Color(0xFFFFA000)
    FloodFrequencyBucket.MoreThanTwelve -> Color(0xFFD7191C)
}

@Composable
internal fun MapTileStyle.localizedLabel(): String = when (this) {
    MapTileStyle.Terrain -> stringResource(R.string.map_tile_terrain)
    MapTileStyle.Standard -> stringResource(R.string.map_tile_standard)
    MapTileStyle.Satellite -> stringResource(R.string.map_tile_satellite)
    MapTileStyle.Dark -> stringResource(R.string.map_tile_dark)
}

@Composable
internal fun MapTileStyle.localizedDescription(): String = when (this) {
    MapTileStyle.Terrain -> stringResource(R.string.map_tile_terrain_desc)
    MapTileStyle.Standard -> stringResource(R.string.map_tile_standard_desc)
    MapTileStyle.Satellite -> stringResource(R.string.map_tile_satellite_desc)
    MapTileStyle.Dark -> stringResource(R.string.map_tile_dark_desc)
}

// แปลงมิลลิวินาทีเป็นข้อความความเหมาะสมของเวลา เช่น "เมื่อ 5 นาทีที่แล้ว"
@Composable
internal fun Long.toRelativeTimeLabel(): String {
    if (this <= 0L) return stringResource(R.string.map_time_soon)
    val minutes = ((System.currentTimeMillis() - this) / 60_000).coerceAtLeast(0)
    return when {
        minutes == 0L -> stringResource(R.string.map_time_just_now)
        minutes < 60L -> stringResource(R.string.map_minutes_ago_format, minutes.toInt())
        else -> stringResource(R.string.map_hours_ago_format, (minutes / 60.0).roundToInt())
    }
}

// จดจำข้อความป้ายกำกับมาร์กเกอร์ภัยพิบัติ
@Composable
internal fun rememberMapMarkerText(): MapMarkerText {
    return MapMarkerText(
        hazardLabels = mapOf(
            HazardType.Earthquake to stringResource(R.string.hazard_earthquake),
            HazardType.Flood to stringResource(R.string.hazard_flood),
            HazardType.Storm to stringResource(R.string.hazard_storm),
            HazardType.Fire to stringResource(R.string.hazard_fire),
            HazardType.AirQuality to stringResource(R.string.hazard_air_quality),
            HazardType.Heat to stringResource(R.string.hazard_heat),
            HazardType.Drought to stringResource(R.string.hazard_drought),
            HazardType.Sinkhole to stringResource(R.string.hazard_sinkhole),
            HazardType.Weather to stringResource(R.string.hazard_weather),
            HazardType.Other to stringResource(R.string.hazard_other),
        ),
        clusterCountFormat = stringResource(R.string.map_cluster_count_format),
        clusterNearbyFormat = stringResource(R.string.map_cluster_nearby_format),
        clusterViirsFormat = stringResource(R.string.map_cluster_viirs_format),
        clusterFloodAreasFormat = stringResource(R.string.map_cluster_flood_area_format),
        floodRecurrentTitleFormat = stringResource(R.string.map_flood_recurrent_title_format),
        floodShortTitleFormat = stringResource(R.string.map_flood_short_title_format),
        timesPlaceFormat = stringResource(R.string.map_marker_times_place_format),
    )
}

// ฟังก์ชันกำหนดแถบช่วงระดับสีและคำอธิบายสัญญะภัยแล้ง
@Composable
internal fun droughtLegendBands(product: GistdaDroughtProduct): List<SmapLegendBand> = when (product) {
    GistdaDroughtProduct.Smap -> listOf(
        SmapLegendBand(stringResource(R.string.map_band_0_to_8), stringResource(R.string.map_band_minimum), Color(0xFFFF1E1E)),
        SmapLegendBand(stringResource(R.string.map_band_9_to_22), stringResource(R.string.map_band_low_class), Color(0xFFFFD400)),
        SmapLegendBand(stringResource(R.string.map_band_23_to_37), stringResource(R.string.map_band_medium_class), Color(0xFFFFFF9E)),
        SmapLegendBand(stringResource(R.string.map_band_38_to_51), stringResource(R.string.map_band_high_class), Color(0xFF70C17B)),
        SmapLegendBand(stringResource(R.string.map_band_52_to_100), stringResource(R.string.map_band_maximum), Color(0xFF0E3A8A)),
    )
    GistdaDroughtProduct.Ndwi -> listOf(
        SmapLegendBand(stringResource(R.string.map_band_very_low), stringResource(R.string.map_band_dry), Color(0xFF8C510A)),
        SmapLegendBand(stringResource(R.string.map_band_low), stringResource(R.string.map_band_slightly_moist), Color(0xFFD8B365)),
        SmapLegendBand(stringResource(R.string.map_band_medium), stringResource(R.string.map_band_moderate), Color(0xFFF6E8C3)),
        SmapLegendBand(stringResource(R.string.map_band_high), stringResource(R.string.map_band_very_moist), Color(0xFF80CDC1)),
        SmapLegendBand(stringResource(R.string.map_band_very_high), stringResource(R.string.map_band_most_moist), Color(0xFF01665E)),
    )
    GistdaDroughtProduct.DriPlus -> listOf(
        SmapLegendBand(stringResource(R.string.map_band_very_low), stringResource(R.string.map_band_watch), Color(0xFF2E7D32)),
        SmapLegendBand(stringResource(R.string.map_band_low), stringResource(R.string.map_band_low_risk), Color(0xFF9CCC65)),
        SmapLegendBand(stringResource(R.string.map_band_medium), stringResource(R.string.map_band_medium_risk), Color(0xFFFFEB3B)),
        SmapLegendBand(stringResource(R.string.map_band_high), stringResource(R.string.map_band_high_risk), Color(0xFFFF9800)),
        SmapLegendBand(stringResource(R.string.map_band_very_high), stringResource(R.string.map_band_severe_risk), Color(0xFFE53935)),
    )
}
