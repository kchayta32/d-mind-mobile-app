package com.dmind.app.ui.screens.map

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.FloodFrequencyBucket
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.model.ViirsTimeBucket
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.color
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import org.maplibre.android.MapLibre
import org.maplibre.android.annotations.IconFactory
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style
import kotlin.math.floor

// คอมโพสเซเบิลสำหรับติดตั้งแผนที่เชิงพื้นที่ด้วย SDK MapLibre รองรับการพล็อตรุ่นมาร์กเกอร์และชั้นข้อมูล GeoJSON / WMTS
@Composable
internal fun MapLibreTerrainView(
    markers: List<MapMarkerItem>,
    mapStyle: MapTileStyle,
    wmtsLayer: GistdaLayer?,
    focusedPlace: PlaceSearchResult?,
    cameraAction: MapCameraAction?,
    onMarkerClick: (MapMarkerItem) -> Unit,
    onMapClick: (Double, Double) -> Unit,
    showRadarOverlay: Boolean,
    radarHost: String,
    activeRadarPath: String?,
    soilMoistureGeoJson: String? = null,
    riverDischargeGeoJson: String? = null,
    showSentinel1Sar: Boolean = false,
    showSentinel2TrueColor: Boolean = false,
    activeLayer: DisasterLayerType = DisasterLayerType.Flood,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val markerLookup = remember { mutableMapOf<Long, MapMarkerItem>() }
    val currentMarkerClick by rememberUpdatedState(onMarkerClick)
    val currentMapClick by rememberUpdatedState(onMapClick)
    var mapLibreMap by remember { mutableStateOf<MapLibreMap?>(null) }
    val overlayTileUrl = wmtsLayer?.tileUrl
    val overlayTileScheme = wmtsLayer?.tileScheme
    // ตัวเริ่มและกำหนดค่าแผนที่ MapLibre (MapLibre View) และเพิ่มการดักรับเหตุการณ์แตะมาร์กเกอร์/แผนที่
    val mapView = remember {
        MapLibre.getInstance(context)
        MapView(context).apply {
            onCreate(null)
            getMapAsync { map ->
                mapLibreMap = map
                map.uiSettings.isAttributionEnabled = false
                map.uiSettings.isLogoEnabled = false
                map.uiSettings.isCompassEnabled = false
                map.setStyle(Style.Builder().fromJson(mapStyleJson(
                    style = mapStyle,
                    wmtsLayer = wmtsLayer,
                    showRadarOverlay = showRadarOverlay,
                    radarHost = radarHost,
                    activeRadarPath = activeRadarPath,
                    soilMoistureGeoJson = soilMoistureGeoJson,
                    riverDischargeGeoJson = riverDischargeGeoJson,
                    showSentinel1Sar = showSentinel1Sar,
                    showSentinel2TrueColor = showSentinel2TrueColor,
                    activeLayer = activeLayer,
                )))
                map.cameraPosition = thailandCamera()
                map.setOnMarkerClickListener { marker ->
                    markerLookup[marker.id]?.let { currentMarkerClick(it) }
                    true
                }
                map.addOnMapClickListener { latLng ->
                    currentMapClick(latLng.latitude, latLng.longitude)
                    true
                }
            }
        }
    }

    // อัปเดตรูปแบบสไตล์แผนที่หรือการแสดงชั้นข้อมูลแบบไดนามิก
    LaunchedEffect(mapLibreMap, mapStyle, overlayTileUrl, overlayTileScheme, showRadarOverlay, activeRadarPath, soilMoistureGeoJson, riverDischargeGeoJson, showSentinel1Sar, showSentinel2TrueColor, activeLayer) {
        val map = mapLibreMap ?: return@LaunchedEffect
        map.setStyle(Style.Builder().fromJson(mapStyleJson(
            style = mapStyle,
            wmtsLayer = wmtsLayer,
            showRadarOverlay = showRadarOverlay,
            radarHost = radarHost,
            activeRadarPath = activeRadarPath,
            soilMoistureGeoJson = soilMoistureGeoJson,
            riverDischargeGeoJson = riverDischargeGeoJson,
            showSentinel1Sar = showSentinel1Sar,
            showSentinel2TrueColor = showSentinel2TrueColor,
            activeLayer = activeLayer,
        )))
    }

    // อัปเดตและเคลียร์หมุด/มาร์กเกอร์บนแผนที่เมื่อข้อมูลเปลี่ยน
    LaunchedEffect(mapLibreMap, markers, mapStyle, overlayTileUrl, overlayTileScheme) {
        val map = mapLibreMap ?: return@LaunchedEffect
        markerLookup.clear()
        map.clear()
        addSoftFocusMarker(context, map)
        val markerLimit = if (markers.any { it.floodFrequencyBucket != null }) 1200 else 420
        markers.take(markerLimit).forEach { item ->
            val marker = map.addMarker(
                MarkerOptions()
                    .position(LatLng(item.latitude, item.longitude))
                    .title(item.title)
                    .snippet(item.snippet)
                    .icon(markerIcon(context, item)),
            )
            markerLookup[marker.id] = item
        }
    }

    // ย้ายและซูมกล้องแผนที่ไปยังตำแหน่งที่ผู้ใช้ค้นหา
    LaunchedEffect(mapLibreMap, focusedPlace) {
        val map = mapLibreMap ?: return@LaunchedEffect
        val place = focusedPlace ?: return@LaunchedEffect
        map.cameraPosition = CameraPosition.Builder()
            .target(LatLng(place.latitude, place.longitude))
            .zoom(10.0)
            .build()
    }

    // ดำเนินการย้ายกล้อง ซูมเข้า/ออกตามคำสั่งของปุ่มควบคุม
    LaunchedEffect(mapLibreMap, cameraAction) {
        val map = mapLibreMap ?: return@LaunchedEffect
        val action = cameraAction ?: return@LaunchedEffect
        val current = map.cameraPosition
        map.cameraPosition = when (action.kind) {
            MapCameraActionKind.CenterThailand -> thailandCamera()
            MapCameraActionKind.ZoomIn -> CameraPosition.Builder()
                .target(current.target)
                .zoom((current.zoom + 1.0).coerceAtMost(16.0))
                .build()
            MapCameraActionKind.ZoomOut -> CameraPosition.Builder()
                .target(current.target)
                .zoom((current.zoom - 1.0).coerceAtLeast(3.4))
                .build()
        }
    }

    DisposableEffect(lifecycle, mapView) {
        var destroyed = false
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_START -> mapView.onStart()
                Lifecycle.Event.ON_RESUME -> mapView.onResume()
                Lifecycle.Event.ON_PAUSE -> mapView.onPause()
                Lifecycle.Event.ON_STOP -> mapView.onStop()
                Lifecycle.Event.ON_DESTROY -> {
                    if (!destroyed) {
                        destroyed = true
                        mapView.onDestroy()
                    }
                }
                else -> Unit
            }
        }
        lifecycle.addObserver(observer)
        onDispose {
            lifecycle.removeObserver(observer)
            // เมื่อออกจากหน้าแผนที่ขณะ Activity ยังทำงานอยู่ ต้องไล่สถานะ MapView ลงตามลำดับ
            // (pause -> stop -> destroy) เพื่อหยุด render thread ก่อนทำลาย และไม่เรียก onDestroy ซ้ำ
            if (!destroyed) {
                val state = lifecycle.currentState
                if (state.isAtLeast(Lifecycle.State.RESUMED)) mapView.onPause()
                if (state.isAtLeast(Lifecycle.State.STARTED)) mapView.onStop()
                destroyed = true
                mapView.onDestroy()
            }
        }
    }

    AndroidView(factory = { mapView }, modifier = modifier)
}

// ─── Marker building ────────────────────────────────────────

// ฟังก์ชันหลักสร้างและจับกลุ่ม (Cluster) รายการมาร์กเกอร์ตามประเภทชั้นข้อมูลปัจจุบัน
internal fun buildMapMarkerItems(
    state: DisasterMapUiState,
    text: MapMarkerText,
): List<MapMarkerItem> {
    return when (state.activeLayer) {
        DisasterLayerType.WildfireViirs -> {
            val hotspotMarkers = clusterHotspots(state.viirsHotspots, text)
            hotspotMarkers.ifEmpty {
                clusterEvents(state.visibleEvents.filter { it.type == HazardType.Fire }, text)
            }
        }
        DisasterLayerType.Flood -> {
            val floodMarkers = if (state.layerTimeRange == GistdaTimeRange.FloodFrequency) {
                state.floodAreas.map { it.toMarkerItem(text) }
            } else {
                clusterFloodAreas(state.floodAreas, text)
            }
            // หมุดรายงานน้ำท่วมจริงภาคประชาชน (Crowdsourced Citizen Flood Ground Truth)
            val citizenMarkers = if (state.filter.flood.showCitizenReports) {
                state.citizenFloodReports.map { it.toMarkerItem() }
            } else {
                emptyList()
            }
            // สถานีตรวจวัดน้ำและอัตราการไหล
            val waterStations = if (state.filter.showStations && state.filter.flood.showWaterStations) {
                state.visibleStations.filter { station ->
                    station.metrics.any { metric ->
                        metric.label.contains("น้ำ", ignoreCase = true) ||
                        metric.label.contains("water", ignoreCase = true) ||
                        metric.label.contains("ไหล", ignoreCase = true) ||
                        metric.label.contains("Rain", ignoreCase = true)
                    }
                }.map { it.toMarkerItem() }
            } else emptyList()

            val combined = floodMarkers + citizenMarkers + waterStations
            combined.ifEmpty {
                clusterEvents(state.visibleEvents.filter { it.type == HazardType.Flood }, text)
            }
        }
        DisasterLayerType.Storm -> {
            val stormEvents = clusterEvents(state.activeEvents(), text)
            val stormStations = if (state.filter.showStations && state.filter.storm.showStormStations) {
                state.visibleStations.filter { station ->
                    station.metrics.any { metric ->
                        metric.label.contains("Rain", ignoreCase = true) ||
                        metric.label.contains("Wind", ignoreCase = true) ||
                        metric.label.contains("Wave", ignoreCase = true) ||
                        metric.label.contains("ฝน", ignoreCase = true) ||
                        metric.label.contains("ลม", ignoreCase = true)
                    }
                }.map { it.toMarkerItem() }
            } else emptyList()
            (stormEvents + stormStations).ifEmpty {
                state.visibleEvents.filter { it.type == HazardType.Storm }.map { it.toMarkerItem() }
            }
        }
        DisasterLayerType.Earthquake -> {
            clusterEvents(state.activeEvents(), text)
        }
        DisasterLayerType.AirQuality -> {
            val airEvents = clusterEvents(state.activeEvents(), text)
            val airStations = if (state.filter.showStations) {
                state.visibleStations.filter { station ->
                    station.metrics.any { metric ->
                        metric.label.contains("PM2.5", ignoreCase = true) ||
                        metric.label.contains("AQI", ignoreCase = true) ||
                        metric.label.contains("ฝุ่น", ignoreCase = true)
                    }
                }.map { it.toMarkerItem() }
            } else emptyList()
            (airEvents + airStations).ifEmpty {
                clusterEvents(state.visibleEvents.filter { it.type == HazardType.AirQuality }, text)
            }
        }
        DisasterLayerType.DroughtSmap -> {
            clusterEvents(state.activeEvents(), text)
        }
        DisasterLayerType.Stations -> state.visibleStations.map { it.toMarkerItem() }
    }
}

// ─── Clustering ─────────────────────────────────────────────

// ฟังก์ชันรวมกลุ่มจุดเหตุการณ์ภัยพิบัติที่พิกัดใกล้กัน
private fun clusterEvents(
    events: List<DisasterEvent>,
    text: MapMarkerText,
): List<MapMarkerItem> {
    return events
        .groupBy { event -> "${floor(event.latitude / CLUSTER_CELL)}:${floor(event.longitude / CLUSTER_CELL)}:${event.type}" }
        .flatMap { (_, group) ->
            if (group.size <= 1) {
                group.map { it.toMarkerItem() }
            } else {
                val headline = group.maxBy { it.severity.rank }
                listOf(
                    headline.toMarkerItem().copy(
                        id = "cluster-${headline.id}",
                        latitude = group.map { it.latitude }.average(),
                        longitude = group.map { it.longitude }.average(),
                        title = text.clusterCount(group.size, text.hazardLabel(headline.type)),
                        count = group.size,
                        event = headline.copy(
                            title = text.clusterNearby(group.size, text.hazardLabel(headline.type)),
                            description = group.joinToString(limit = 3) { it.title },
                        ),
                    ),
                )
            }
        }
}

// ฟังก์ชันรวมกลุ่มจุดความร้อน (VIIRS Hotspot) ใกล้กันเพื่อการแสดงผลสะอาดตา
private fun clusterHotspots(
    hotspots: List<ViirsHotspot>,
    text: MapMarkerText,
): List<MapMarkerItem> {
    return hotspots
        .groupBy { hotspot -> "${floor(hotspot.latitude / VIIRS_CLUSTER_CELL)}:${floor(hotspot.longitude / VIIRS_CLUSTER_CELL)}" }
        .flatMap { (_, group) ->
            val headline = group.minByOrNull { it.timeBucket.ordinal } ?: return@flatMap emptyList()
            if (group.size <= 1) {
                listOf(headline.toMarkerItem())
            } else {
                listOf(
                    headline.toMarkerItem().copy(
                        id = "cluster-viirs-${headline.id}",
                        latitude = group.map { it.latitude }.average(),
                        longitude = group.map { it.longitude }.average(),
                        title = text.clusterViirs(group.size),
                        snippet = headline.province,
                        count = group.size,
                    ),
                )
            }
        }
}

// ฟังก์ชันรวมกลุ่มพื้นที่ประสบภัยน้ำท่วม
private fun clusterFloodAreas(
    floodAreas: List<FloodArea>,
    text: MapMarkerText,
): List<MapMarkerItem> {
    return floodAreas
        .groupBy { flood -> "${floor(flood.latitude / CLUSTER_CELL)}:${floor(flood.longitude / CLUSTER_CELL)}" }
        .flatMap { (_, group) ->
            val headline = group.maxByOrNull { it.severity.rank } ?: return@flatMap emptyList()
            if (group.size <= 1) {
                listOf(headline.toMarkerItem(text))
            } else {
                listOf(
                    headline.toMarkerItem(text).copy(
                        id = "cluster-flood-${headline.id}",
                        latitude = group.map { it.latitude }.average(),
                        longitude = group.map { it.longitude }.average(),
                        title = text.clusterFloodAreas(group.size),
                        count = group.size,
                    ),
                )
            }
        }
}

// ─── toMarkerItem extensions ────────────────────────────────

// แปลงเหตุการณ์ภัยพิบัติ (DisasterEvent) ไปเป็นข้อมูลมาร์กเกอร์
private fun DisasterEvent.toMarkerItem(): MapMarkerItem {
    val snip = when (type) {
        HazardType.Earthquake -> "สถานที่: $description | พิกัด: $latitude, $longitude | ลึก: $metric | แหล่งข้อมูล: $source"
        HazardType.Fire -> "$description | แหล่งข้อมูล: $source"
        HazardType.AirQuality -> "ฝุ่น PM2.5: $metric | จังหวัด: $description | แหล่งข้อมูล: $source"
        HazardType.Flood -> "พื้นที่น้ำท่วม: $metric | จังหวัด: $description | แหล่งข้อมูล: $source"
        else -> "$metric - $source"
    }
    return MapMarkerItem(
        id = id, latitude = latitude, longitude = longitude,
        title = title, snippet = snip,
        severity = severity, type = type, count = 1,
        event = this, station = null, hotspot = null, floodArea = null,
    )
}

// แปลงข้อมูลสถานีตรวจวัดทางกายภาพไปเป็นมาร์กเกอร์
private fun MonitoringStation.toMarkerItem(): MapMarkerItem {
    val snip = if (metrics.isNotEmpty()) {
        "${province} | " + metrics.joinToString(" • ") { "${it.label}: ${it.value}" }
    } else {
        province
    }
    return MapMarkerItem(
        id = id, latitude = latitude, longitude = longitude,
        title = name, snippet = snip,
        severity = status, type = HazardType.Other, count = 1,
        event = null, station = this, hotspot = null, floodArea = null,
        isStation = true,
    )
}

// แปลงข้อมูลจุดความร้อนไปเป็นมาร์กเกอร์
private fun ViirsHotspot.toMarkerItem(): MapMarkerItem = MapMarkerItem(
    id = id, latitude = latitude, longitude = longitude,
    title = "VIIRS $detectedDate",
    snippet = "ต. $subdistrict | โซนรับผิดชอบ: $responsibleArea | ตรวจพบเมื่อ $detectedDate (${hoursSinceDetected?.formatOne() ?: "?"} ชม. ที่แล้ว)",
    severity = if (timeBucket.ordinal <= ViirsTimeBucket.OneToThree.ordinal) Severity.Critical else Severity.Watch,
    type = HazardType.Fire, count = 1,
    event = null, station = null, hotspot = this, floodArea = null,
    viirsBucket = timeBucket,
)

// แปลงข้อมูลพื้นที่น้ำท่วมไปเป็นมาร์กเกอร์
private fun FloodArea.toMarkerItem(text: MapMarkerText): MapMarkerItem = MapMarkerItem(
    id = id, latitude = latitude, longitude = longitude,
    title = when (timeRange) {
        GistdaTimeRange.FloodFrequency -> text.floodRecurrentTitle(province)
        GistdaTimeRange.WaterHyacinth -> "สิ่งกีดขวาง/ผักตบชวา $province"
        else -> text.floodShortTitle(province)
    },
    snippet = when (timeRange) {
        GistdaTimeRange.FloodFrequency -> text.timesPlace(recurrenceCount ?: 0, district, subdistrict)
        GistdaTimeRange.WaterHyacinth -> "สิ่งกีดขวางทางน้ำ: $district $subdistrict"
        else -> "$district $subdistrict"
    },
    severity = severity, type = HazardType.Flood, count = 1,
    event = null, station = null, hotspot = null, floodArea = this,
    floodFrequencyBucket = if (timeRange == GistdaTimeRange.FloodFrequency) frequencyBucket else null,
)

// ─── Marker icon rendering ─────────────────────────────────

// ฟังก์ชันวาดบิตแมปไอคอนมาร์กเกอร์แบบกำหนดเอง เช่น วาดตามระดับความรุนแรงและขนาดกลุ่ม
private fun markerIcon(context: Context, item: MapMarkerItem): org.maplibre.android.annotations.Icon {
    val size = when {
        item.isCitizenReport -> 56
        item.floodFrequencyBucket != null -> 20
        item.count > 1 -> 62
        item.hotspot != null -> 30
        item.isStation -> 52
        else -> 48
    }
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    // หมุดรายงานน้ำท่วมจริงภาคประชาชน (Crowdsourced Citizen Flood Ground Truth)
    if (item.isCitizenReport) {
        val isVerified = item.citizenReport?.verifiedBySatellite == true
        val coreColor = if (isVerified) android.graphics.Color.parseColor("#059669") else android.graphics.Color.parseColor("#0284C7")
        val haloColor = if (isVerified) android.graphics.Color.parseColor("#34D399") else android.graphics.Color.parseColor("#38BDF8")

        // 1. วงแหวนกระจายคลื่นรอบนอก (Pulsing halo)
        paint.color = haloColor
        paint.alpha = 75
        canvas.drawCircle(size / 2f, size / 2f, size * 0.46f, paint)

        // 2. วงแหวนกระจายคลื่นชั้นกลาง
        paint.color = haloColor
        paint.alpha = 150
        canvas.drawCircle(size / 2f, size / 2f, size * 0.36f, paint)

        // 3. ขอบสีขาวคมชัด
        paint.color = android.graphics.Color.WHITE
        paint.alpha = 255
        canvas.drawCircle(size / 2f, size / 2f, size * 0.28f, paint)

        // 4. วงกลมหลักสีมรกต/น้ำเงินทะเล (Emerald / Ocean Badge Core)
        paint.color = coreColor
        canvas.drawCircle(size / 2f, size / 2f, size * 0.23f, paint)

        // 5. สัญลักษณ์กลางหมุด (✓ หรือ 🌊)
        paint.color = android.graphics.Color.WHITE
        paint.textAlign = Paint.Align.CENTER
        paint.textSize = 14f
        paint.isFakeBoldText = true
        val textY = size / 2f - (paint.descent() + paint.ascent()) / 2f
        if (isVerified) {
            canvas.drawText("✓", size / 2f, textY, paint)
        } else {
            canvas.drawText("🌊", size / 2f, textY, paint)
        }
        return IconFactory.getInstance(context).fromBitmap(bitmap)
    }

    val color = when {
        item.floodFrequencyBucket != null -> item.floodFrequencyBucket.color()
        item.hotspot != null -> item.viirsBucket?.color() ?: ViirsTimeBucket.MoreThanTwentyFour.color()
        item.isStation -> DmindBlue
        else -> item.severity.color()
    }

    if (item.floodFrequencyBucket != null) {
        paint.color = android.graphics.Color.WHITE
        canvas.drawCircle(size / 2f, size / 2f, size * 0.45f, paint)
        paint.color = color.toArgb()
        canvas.drawCircle(size / 2f, size / 2f, size * 0.34f, paint)
    } else if (item.hotspot != null && item.count == 1) {
        paint.color = android.graphics.Color.WHITE
        canvas.drawCircle(size / 2f, size / 2f, size * 0.42f, paint)
        paint.color = color.toArgb()
        canvas.drawCircle(size / 2f, size / 2f, size * 0.34f, paint)
    } else {
        paint.color = color.copy(alpha = 0.22f).toArgb()
        canvas.drawCircle(size / 2f, size / 2f, size * 0.46f, paint)
        paint.color = android.graphics.Color.WHITE
        canvas.drawCircle(size / 2f, size / 2f, size * 0.32f, paint)
        paint.color = color.toArgb()
        canvas.drawCircle(size / 2f, size / 2f, size * 0.24f, paint)
    }

    if (item.count > 1) {
        paint.color = android.graphics.Color.WHITE
        paint.textAlign = Paint.Align.CENTER
        paint.textSize = 18f
        paint.isFakeBoldText = true
        val textY = size / 2f - (paint.descent() + paint.ascent()) / 2f
        canvas.drawText(item.count.coerceAtMost(99).toString(), size / 2f, textY, paint)
    }

    return IconFactory.getInstance(context).fromBitmap(bitmap)
}

private fun addSoftFocusMarker(context: Context, map: MapLibreMap) {
    map.addMarker(
        MarkerOptions()
            .position(LatLng(13.7563, 100.5018))
            .title("Thailand focus")
            .snippet("D-MIND monitoring center")
            .icon(softFocusIcon(context)),
    )
}

private fun softFocusIcon(context: Context): org.maplibre.android.annotations.Icon {
    val size = 92
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    paint.color = DmindBlue.copy(alpha = 0.16f).toArgb()
    canvas.drawCircle(size / 2f, size / 2f, size * 0.45f, paint)
    paint.color = DmindBlue.copy(alpha = 0.32f).toArgb()
    canvas.drawCircle(size / 2f, size / 2f, size * 0.2f, paint)
    return IconFactory.getInstance(context).fromBitmap(bitmap)
}

// ─── Map style ──────────────────────────────────────────────

private fun thailandCamera(): CameraPosition = CameraPosition.Builder()
    .target(LatLng(15.8700, 100.9925))
    .zoom(5.35)
    .build()

// สร้าง JSON รูปแบบสไตล์แผนที่ MapLibre พร้อมชั้นข้อมูล Raster Overlay
private fun mapStyleJson(
    style: MapTileStyle,
    wmtsLayer: GistdaLayer?,
    showRadarOverlay: Boolean,
    radarHost: String,
    activeRadarPath: String?,
    soilMoistureGeoJson: String? = null,
    riverDischargeGeoJson: String? = null,
    showSentinel1Sar: Boolean = false,
    showSentinel2TrueColor: Boolean = false,
    activeLayer: DisasterLayerType = DisasterLayerType.Flood,
): String {
    val isFlood = activeLayer == DisasterLayerType.Flood || wmtsLayer?.type == DisasterLayerType.Flood
    val overlayTile = wmtsLayer?.tileUrl?.replace("\\", "\\\\")?.replace("\"", "\\\"")
    // สำหรับ GISTDA API 2.0 Flood Tiles บังคับ scheme เป็น "xyz" เสมอ ไม่ให้แผ่นภาพกลับด้าน
    val overlayScheme = if (isFlood) "xyz" else (wmtsLayer?.tileScheme ?: "xyz")
    val overlayOpacity = when {
        wmtsLayer?.type == DisasterLayerType.Flood && wmtsLayer.timeRange == GistdaTimeRange.FloodFrequency -> 0.82
        wmtsLayer?.type == DisasterLayerType.Flood -> 0.76
        wmtsLayer?.type == DisasterLayerType.DroughtSmap -> 0.72
        else -> 0.62
    }

    // 0. Copernicus Sentinel-2 True Color / Cloudless Base Imagery WMTS (10m Resolution via EOX)
    val sentinel2Source = if (isFlood && showSentinel2TrueColor) {
        """,
    "sentinel2-overlay": {
      "type": "raster",
      "tiles": ["${com.dmind.app.network.api.GistdaEndpointPaths.SENTINEL2_CLOUDLESS_WMTS_URL}"],
      "tileSize": 256,
      "attribution": "Sentinel-2 cloudless by EOX"
    }"""
    } else ""

    val sentinel2Layer = if (isFlood && showSentinel2TrueColor) {
        """,
    {
      "id": "sentinel2-overlay",
      "type": "raster",
      "source": "sentinel2-overlay",
      "paint": { "raster-opacity": 0.88 }
    }"""
    } else ""

    // 0.1 Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) Water Backscatter / Hydrography Layer WMTS
    val sentinel1SarSource = if (isFlood && showSentinel1Sar) {
        """,
    "sentinel1-sar-overlay": {
      "type": "raster",
      "tiles": ["${com.dmind.app.network.api.GistdaEndpointPaths.SENTINEL1_SAR_HYDROGRAPHY_WMTS_URL}"],
      "tileSize": 256,
      "attribution": "Copernicus Sentinel-1 SAR Hydrography"
    }"""
    } else ""

    val sentinel1SarLayer = if (isFlood && showSentinel1Sar) {
        """,
    {
      "id": "sentinel1-sar-overlay",
      "type": "raster",
      "source": "sentinel1-sar-overlay",
      "paint": { "raster-opacity": 0.72 }
    }"""
    } else ""

    val overlaySource = if (overlayTile != null) {
        """,
    "gistda-overlay": {
      "type": "raster",
      "tiles": ["$overlayTile"],
      "tileSize": 256,
      "scheme": "$overlayScheme",
      "attribution": "GISTDA"
    }"""
    } else {
        ""
    }
    val overlayLayer = if (overlayTile != null) {
        """,
    {
      "id": "gistda-overlay",
      "type": "raster",
      "source": "gistda-overlay",
      "paint": { "raster-opacity": $overlayOpacity }
    }"""
    } else {
        ""
    }

    val radarUrl = if (activeRadarPath != null) {
        "${radarHost}${activeRadarPath}/256/{z}/{x}/{y}/2/1_1.png"
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
    } else null

    val radarSource = if (showRadarOverlay && radarUrl != null) {
        """,
    "radar-overlay": {
      "type": "raster",
      "tiles": ["$radarUrl"],
      "tileSize": 256,
      "attribution": "RainViewer"
    }"""
    } else {
        ""
    }

    val radarLayer = if (showRadarOverlay && radarUrl != null) {
        """,
    {
      "id": "radar-overlay",
      "type": "raster",
      "source": "radar-overlay",
      "paint": { "raster-opacity": 0.75 }
    }"""
    } else {
        ""
    }

    return """
{
  "version": 8,
  "sources": {
    "base": {
      "type": "raster",
      "tiles": ["${style.tileUrl}"],
      "tileSize": 256,
      "attribution": "${style.attribution}"
    }$sentinel2Source$sentinel1SarSource$overlaySource$radarSource
  },
  "layers": [
    {
      "id": "base",
      "type": "raster",
      "source": "base"
    }$sentinel2Layer$sentinel1SarLayer$overlayLayer$radarLayer
  ]
}
    """.trimIndent()
}


// ─── Constants ──────────────────────────────────────────────

private const val CLUSTER_CELL = 0.48
private const val VIIRS_CLUSTER_CELL = 0.34
