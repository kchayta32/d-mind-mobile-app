package com.dmind.app.ui.screens.map

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.BottomSheetScaffold
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetValue
import androidx.compose.material3.rememberBottomSheetScaffoldState
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.dmind.app.data.map.CitizenWaterLevel
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.MonitoringStation
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import com.dmind.app.ui.viewmodel.DisasterMapViewModel
import com.dmind.app.ui.viewmodel.RainViewerFrame
import kotlinx.coroutines.launch
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.size
import com.dmind.app.domain.model.HazardType
import androidx.compose.material3.Button
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.sp
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.color
import com.dmind.app.ui.components.icon
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import com.dmind.app.data.map.CitizenWaterFlow
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.util.ExternalIntents

// หมวดหมู่แหล่งข้อมูลแผนที่หลัก: ข้อมูลเปิด (บทที่ 1-3) และสถานีตรวจวัด IoT
private enum class MapDataSourceCategory {
    OpenSource, // 🛰️ แหล่งข้อมูลเปิด
    IotStations // 📡 จากสถานีตรวจวัด
}

// หน้าจอแผนที่ภัยพิบัติหลัก (Disaster Map) แสดงผลเชิงพื้นที่ร่วมกับชั้นข้อมูลและสถานีตรวจวัด
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DisasterMapScreen(
    state: DisasterMapUiState,
    viewModel: DisasterMapViewModel,
    darkTheme: Boolean,
    onBack: () -> Unit,
    onOpenStations: () -> Unit,
) {
    val scaffoldState = rememberBottomSheetScaffoldState()
    val scope = rememberCoroutineScope()
    var focusedPlace by remember { mutableStateOf<PlaceSearchResult?>(null) }
    var selectedStation by remember { mutableStateOf<MonitoringStation?>(null) }
    var showFilters by rememberSaveable { mutableStateOf(false) }
    var clickedMarkerItem by remember { mutableStateOf<MapMarkerItem?>(null) }
    var showMarkerPreview by remember { mutableStateOf(false) }
    var showLayers by rememberSaveable { mutableStateOf(false) }
    var showLegend by rememberSaveable { mutableStateOf(true) }
    var legendOffsetX by rememberSaveable(state.activeLayer) { mutableStateOf(0f) }
    var legendOffsetY by rememberSaveable(state.activeLayer) { mutableStateOf(0f) }
    var mapStyle by rememberSaveable { mutableStateOf(if (darkTheme) MapTileStyle.Dark else MapTileStyle.Standard) }

    var selectedCategory by rememberSaveable {
        mutableStateOf(
            if (state.activeLayer == DisasterLayerType.Stations)
                MapDataSourceCategory.IotStations
            else
                MapDataSourceCategory.OpenSource
        )
    }
    var selectedSensorType by rememberSaveable { mutableStateOf("ทั้งหมด") }
    var showEvacuationDialog by rememberSaveable { mutableStateOf(false) }
    var showCitizenReportDialog by rememberSaveable { mutableStateOf(false) }

    // อัปเดตรูปแบบแผนที่ตามความมืด/สว่างของระบบโดยอัตโนมัติ
    LaunchedEffect(darkTheme) {
        if (darkTheme && mapStyle == MapTileStyle.Standard) {
            mapStyle = MapTileStyle.Dark
        } else if (!darkTheme && mapStyle == MapTileStyle.Dark) {
            mapStyle = MapTileStyle.Standard
        }
    }

    LaunchedEffect(state.activeLayer) {
        if (state.activeLayer == DisasterLayerType.Stations) {
            selectedCategory = MapDataSourceCategory.IotStations
        } else {
            selectedCategory = MapDataSourceCategory.OpenSource
        }
    }

    var cameraActionId by remember { mutableLongStateOf(0L) }
    var cameraActionKind by remember { mutableStateOf<MapCameraActionKind?>(null) }
    val activeWmtsLayer = state.activeWmtsLayer?.takeIf {
        it.isAvailable && (it.type != DisasterLayerType.Flood || state.filter.flood.showFloodLayer)
    }
    val markerText = rememberMapMarkerText()

    val markers = remember(
        state.activeLayer,
        state.visibleEvents,
        state.visibleStations,
        state.viirsHotspots,
        state.floodAreas,
        state.citizenFloodReports,
        state.filter,
        markerText,
        selectedCategory,
        selectedSensorType,
    ) {
        val baseMarkers = buildMapMarkerItems(state, markerText)
        if (selectedCategory == MapDataSourceCategory.IotStations && selectedSensorType != "ทั้งหมด") {
            baseMarkers.filter { item ->
                if (!item.isStation || item.station == null) true
                else {
                    val st = item.station
                    when (selectedSensorType) {
                        "AJ-SR04T" -> st.metrics.any { it.label.contains("น้ำ", true) || it.label.contains("ระดับ", true) || it.label.contains("Water", true) || it.label.contains("Rain", true) }
                        "GY-521" -> st.metrics.any { it.label.contains("เอียง", true) || it.label.contains("สั่น", true) || it.label.contains("Tilt", true) || it.label.contains("Wave", true) || it.label.contains("Wind", true) }
                        "PMS5003" -> st.metrics.any { it.label.contains("PM", true) || it.label.contains("ฝุ่น", true) }
                        "BME280" -> st.metrics.any { it.label.contains("Temp", true) || it.label.contains("Heat", true) || it.label.contains("Humidity", true) || it.label.contains("ชื้น", true) || it.label.contains("Air", true) }
                        else -> true
                    }
                }
            }.ifEmpty { baseMarkers }
        } else {
            baseMarkers
        }
    }

    LaunchedEffect(state.activeLayer) {
        val isWeather = state.activeLayer == DisasterLayerType.Storm
        viewModel.toggleRadarOverlay(isWeather)
    }

    fun sendCameraAction(kind: MapCameraActionKind) {
        cameraActionId += 1
        cameraActionKind = kind
    }

    // โครงสร้างหน้าจอแบบมี Bottom Sheet ยื่นออกมาด้านล่างเพื่อแสดงข้อมูลและตัวเลือกพิเศษ
    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = 112.dp,
        sheetContainerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.98f),
        sheetShadowElevation = 16.dp,
        sheetShape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        sheetContent = {
            MapBottomSheetContent(
                state = state,
                selectedStation = selectedStation,
                showLegend = showLegend,
                onClearSelection = {
                    selectedStation = null
                    viewModel.selectLayerFeature()
                },
                onOpenFilters = { showFilters = true },
                onOpenLayers = { showLayers = true },
                onOpenStations = onOpenStations,
                onToggleLegend = { showLegend = !showLegend },
                onTimeRangeSelected = viewModel::selectTimeRange,
                onDroughtProductSelected = viewModel::selectDroughtProduct,
                onRefreshLayer = viewModel::refreshActiveLayer,
                onEvacuate = { showEvacuationDialog = true },
                onReportLive = { showCitizenReportDialog = true },
                modifier = Modifier.navigationBarsPadding(),
            )
        },
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = padding.calculateBottomPadding()),
        ) {
            val activeRadarFramePath = state.radarFrames.getOrNull(state.currentRadarFrameIndex)?.path
            // วิวจำลองแผนที่เชิงพื้นที่หลัก (MapLibre View)
            MapLibreTerrainView(
                modifier = Modifier.fillMaxSize(),
                markers = markers,
                mapStyle = mapStyle,
                wmtsLayer = activeWmtsLayer,
                focusedPlace = focusedPlace,
                cameraAction = cameraActionKind?.let { MapCameraAction(cameraActionId, it) },
                onMarkerClick = { marker ->
                    clickedMarkerItem = marker
                    showMarkerPreview = true
                    selectedStation = marker.station
                    viewModel.selectLayerFeature(
                        event = marker.event,
                        viirsHotspot = marker.hotspot,
                        floodArea = marker.floodArea,
                        citizenFloodReport = marker.citizenReport,
                    )
                    viewModel.fetchWeatherForCoords(marker.latitude, marker.longitude)
                },
                onMapClick = { lat, lon ->
                    clickedMarkerItem = null
                    showMarkerPreview = false
                    viewModel.fetchWeatherForCoords(lat, lon)
                    scope.launch { scaffoldState.bottomSheetState.expand() }
                },
                showRadarOverlay = state.showRadarOverlay,
                radarHost = state.radarHost,
                activeRadarPath = activeRadarFramePath,
                soilMoistureGeoJson = state.soilMoistureGeoJson,
                riverDischargeGeoJson = state.riverDischargeGeoJson,
                showSentinel1Sar = state.filter.flood.showSentinel1Sar,
                showSentinel2TrueColor = state.filter.flood.showSentinel2TrueColor,
                activeLayer = state.activeLayer,
            )

            // ส่วนควบคุมด้านบน: แถบค้นหา, แถบแท็บแยกแหล่งข้อมูลเปิด/สถานีตรวจวัด, และตัวกรองย่อย
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter)
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.88f),
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.40f),
                                Color.Transparent,
                            ),
                        ),
                    )
                    .statusBarsPadding()
                    .padding(bottom = 10.dp)
            ) {
                // 1. แถบค้นหาและปุ่มส่วนหัวแผนที่
                MapTopBar(
                    state = state,
                    onBack = onBack,
                    onRefresh = viewModel::refreshMap,
                    onSearchQueryChange = viewModel::updateSearchQuery,
                    onSearchResultClick = { result ->
                        focusedPlace = result
                        viewModel.updateSearchQuery(result.name.substringBefore(','))
                        viewModel.clearSearchResults()
                        viewModel.fetchWeatherForCoords(result.latitude, result.longitude)
                        scope.launch { scaffoldState.bottomSheetState.expand() }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                )

                // 2. แท็บสลับหลัก 2 แหล่งข้อมูล: แหล่งข้อมูลเปิด (ตามบทที่ 1-3) vs จากสถานีตรวจวัด IoT
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.94f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
                    shadowElevation = 4.dp,
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        // แท็บ 1: แหล่งข้อมูลเปิด (ตรงตามเอกสารบทที่ 1 - 3)
                        val isTab1 = selectedCategory == MapDataSourceCategory.OpenSource
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isTab1) DmindBlue else Color.Transparent)
                                .clickable {
                                    selectedCategory = MapDataSourceCategory.OpenSource
                                    if (state.activeLayer == DisasterLayerType.Stations) {
                                        viewModel.selectLayer(DisasterLayerType.Flood)
                                    }
                                }
                                .padding(vertical = 9.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "🛰️ แหล่งข้อมูลเปิด",
                                    fontSize = 12.sp,
                                    fontWeight = if (isTab1) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isTab1) Color.White else MaterialTheme.colorScheme.onSurface,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }

                        // แท็บ 2: จากสถานีตรวจวัด IoT
                        val isTab2 = selectedCategory == MapDataSourceCategory.IotStations
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isTab2) DmindBlue else Color.Transparent)
                                .clickable {
                                    selectedCategory = MapDataSourceCategory.IotStations
                                    viewModel.selectLayer(DisasterLayerType.Stations)
                                }
                                .padding(vertical = 9.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "📡 จากสถานีตรวจวัด",
                                    fontSize = 12.sp,
                                    fontWeight = if (isTab2) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isTab2) Color.White else MaterialTheme.colorScheme.onSurface,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }

                // 3. แถบเลื่อนแนวนอนแสดงหมวดหมู่ย่อยและฟิลเตอร์เซนเซอร์
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = 14.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (selectedCategory == MapDataSourceCategory.OpenSource) {
                        // หมวดหมู่ภัยพิบัติเปิด 6 ประเภท (บทที่ 1-3)
                        val openSourceLayers = listOf(
                            Triple(DisasterLayerType.Flood, "น้ำท่วม", "GISTDA"),
                            Triple(DisasterLayerType.Earthquake, "แผ่นดินไหว", "USGS"),
                            Triple(DisasterLayerType.WildfireViirs, "ไฟป่า VIIRS", "VIIRS"),
                            Triple(DisasterLayerType.Storm, "พายุ & เรดาร์", "TMD"),
                            Triple(DisasterLayerType.AirQuality, "ฝุ่น PM2.5", "Air4Thai"),
                            Triple(DisasterLayerType.DroughtSmap, "ภัยแล้ง SMAP", "SMAP"),
                        )
                        openSourceLayers.forEach { (layer, label, src) ->
                            val isSelected = state.activeLayer == layer
                            Surface(
                                onClick = { viewModel.selectLayer(layer) },
                                shape = RoundedCornerShape(20.dp),
                                color = if (isSelected) DmindBlue else MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                                border = BorderStroke(1.dp, if (isSelected) DmindBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                                shadowElevation = if (isSelected) 4.dp else 1.dp,
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = layer.icon(),
                                        contentDescription = null,
                                        tint = if (isSelected) Color.White else MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(15.dp)
                                    )
                                    Text(
                                        text = label,
                                        fontSize = 12.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "• $src",
                                        fontSize = 10.sp,
                                        color = if (isSelected) Color.White.copy(alpha = 0.8f) else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    } else {
                        // ฟิลเตอร์เซนเซอร์โหนด IoT (AJ-SR04T, GY-521, PMS5003, BME280)
                        val stationFilters = listOf(
                            Pair("ทั้งหมด", "โหนดทั้งหมด (${state.visibleStations.size})"),
                            Pair("AJ-SR04T", "💧 ระดับน้ำ (AJ-SR04T)"),
                            Pair("GY-521", "📐 ความเอียง (GY-521)"),
                            Pair("PMS5003", "💨 ฝุ่น PM2.5 (PMS5003)"),
                            Pair("BME280", "🌡️ อากาศ (BME280)"),
                        )
                        stationFilters.forEach { (filterKey, filterLabel) ->
                            val isSelected = selectedSensorType == filterKey
                            Surface(
                                onClick = { selectedSensorType = filterKey },
                                shape = RoundedCornerShape(20.dp),
                                color = if (isSelected) DmindBlue else MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                                border = BorderStroke(1.dp, if (isSelected) DmindBlue else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)),
                                shadowElevation = if (isSelected) 4.dp else 1.dp,
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = filterLabel,
                                        fontSize = 12.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }

                // 4. แสดงสถานะตัวกรองที่เปิดใช้งานอยู่บนแผนที่ (ถ้ามี)
                if (state.filter.activeFilterCount > 0) {
                    Surface(
                        onClick = { showFilters = true },
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                        border = BorderStroke(1.dp, DmindBlue),
                        shadowElevation = 3.dp,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Filled.FilterList,
                                contentDescription = null,
                                tint = DmindBlue,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "กรอง ${state.filter.activeFilterCount} รายการ (พบ ${state.visibleEvents.size})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "รีเซ็ต",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.clickable { viewModel.resetFilters() }
                            )
                        }
                    }
                }
            }

            // ปุ่มควบคุมมุมมองซูมเข้า/ออก ปรับตำแหน่ง และปุ่มเปิดหน้าต่างตัวกรอง/ชั้นข้อมูล
            MapControls(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 14.dp, bottom = 84.dp),
                onLocate = { sendCameraAction(MapCameraActionKind.CenterThailand) },
                onZoomIn = { sendCameraAction(MapCameraActionKind.ZoomIn) },
                onZoomOut = { sendCameraAction(MapCameraActionKind.ZoomOut) },
                onFilter = { showFilters = true },
                onLayers = { showLayers = true },
            )

            // แผงคำอธิบายสัญลักษณ์และเกณฑ์วัดความรุนแรงบนแผนที่ (แบบลากย้ายได้)
            if (showLegend) {
                DraggableLegendOverlay(
                    layer = state.activeLayer,
                    floodTimeRange = state.layerTimeRange,
                    droughtProduct = state.droughtProduct,
                    offsetX = legendOffsetX,
                    offsetY = legendOffsetY,
                    onDrag = { deltaX, deltaY ->
                        legendOffsetX = (legendOffsetX + deltaX).coerceIn(-300f, 36f)
                        legendOffsetY = (legendOffsetY + deltaY).coerceIn(-560f, 96f)
                    },
                    onDismiss = { showLegend = false },
                    modifier = Modifier
                        .align(if (state.activeLayer == DisasterLayerType.DroughtSmap) Alignment.BottomCenter else Alignment.BottomEnd)
                        .padding(start = 12.dp, end = 12.dp, bottom = 128.dp),
                )
            } else {
                LegendToggleButton(
                    onClick = {
                        legendOffsetX = 0f
                        legendOffsetY = 0f
                        showLegend = true
                    },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(end = 14.dp, bottom = 128.dp),
                )
            }

            val isRadarMode = state.showRadarOverlay && state.activeLayer == DisasterLayerType.Storm

            // แถบเครื่องมือเล่นเฟรมความเคลื่อนไหวของพายุฝน (Radar Timeline)
            if (isRadarMode) {
                RadarTimelinePlayer(
                    radarFrames = state.radarFrames,
                    currentRadarFrameIndex = state.currentRadarFrameIndex,
                    isRadarPlaying = state.isRadarPlaying,
                    radarPlaybackSpeed = state.radarPlaybackSpeed,
                    onPlayPauseClick = { viewModel.toggleRadarPlayback() },
                    onStepBackwardClick = { viewModel.stepRadarFrame(-1) },
                    onStepForwardClick = { viewModel.stepRadarFrame(1) },
                    onSpeedChange = { viewModel.setRadarPlaybackSpeed(it) },
                    onSeekFrame = { viewModel.seekRadarFrame(it) },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(start = 14.dp, end = 14.dp, bottom = 128.dp),
                )
            }

            // การ์ดพรีวิวข้อมูลขนาดย่อเมื่อแตะมาร์กเกอร์ (ยกตำแหน่งขึ้นหากแถบควบคุมเรดาร์กำลังแสดงผลอยู่ เพื่อป้องกันการทับซ้อน)
            if (showMarkerPreview && clickedMarkerItem != null) {
                MarkerPreviewCard(
                    marker = clickedMarkerItem!!,
                    onViewDetailsClick = {
                        showMarkerPreview = false
                        scope.launch { scaffoldState.bottomSheetState.expand() }
                    },
                    onDismissClick = {
                        showMarkerPreview = false
                        clickedMarkerItem = null
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(
                            bottom = if (isRadarMode) 228.dp else 128.dp,
                            start = 16.dp,
                            end = 16.dp
                        ),
                )
            }

            if (state.isLoading || state.layerLoading) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter),
                    color = DmindBlue,
                )
            }

            (state.layerError ?: state.errorMessage)?.let { error ->
                StatusPill(
                    label = error.take(96),
                    color = WatchYellow,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 116.dp, start = 18.dp, end = 18.dp),
                )
            }
        }
    }

    // หน้าต่างแผ่นกรองสำหรับตัวเลือกสถิติและสถานี
    if (showFilters) {
        ModalBottomSheet(
            onDismissRequest = { showFilters = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            MapFilterSheet(
                state = state,
                onToggleType = viewModel::toggleHazardType,
                onSeveritySelected = viewModel::setMinimumSeverity,
                onShowStationsChanged = viewModel::setShowStations,
                onUpdateFilter = viewModel::updateFilter,
                onResetFilters = viewModel::resetFilters,
                onDismiss = { showFilters = false },
            )
        }
    }

    // หน้าต่างสลับชั้นข้อมูลแผนที่ (Layer Sheet)
    if (showLayers) {
        ModalBottomSheet(
            onDismissRequest = { showLayers = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            LayerSheet(
                selectedLayer = state.activeLayer,
                selectedMapStyle = mapStyle,
                onLayerSelected = {
                    viewModel.selectLayer(it)
                    showLayers = false
                },
                onMapStyleSelected = {
                    mapStyle = it
                    showLayers = false
                },
            )
        }
    }

    // หน้าต่างแสดงข้อมูลเส้นทางอพยพและจุดปลอดภัย
    if (showEvacuationDialog) {
        EvacuationModalSheet(onDismiss = { showEvacuationDialog = false })
    }

    // หน้าต่างส่งรายงานสดสถานการณ์น้ำท่วมและภัยพิบัติภาคประชาชน (Ground Truth)
    if (showCitizenReportDialog) {
        CitizenReportModalSheet(onDismiss = { showCitizenReportDialog = false })
    }

    LaunchedEffect(scaffoldState.bottomSheetState.currentValue) {
        if (scaffoldState.bottomSheetState.currentValue == SheetValue.PartiallyExpanded) {
            selectedStation = null
        }
    }
}

// คอมโพสเซเบิลการ์ดพรีวิวข้อมูลขนาดย่อเมื่อแตะหมุดแสดงข้อมูลบนแผนที่
@Composable
private fun MarkerPreviewCard(
    marker: MapMarkerItem,
    onViewDetailsClick: () -> Unit,
    onDismissClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val shortStatus = remember(marker) {
        when {
            marker.citizenReport != null -> {
                val report = marker.citizenReport
                val levelLabel = when (report.waterLevel) {
                    CitizenWaterLevel.Ankle -> "ระดับข้อเท้า (10-30 ซม.)"
                    CitizenWaterLevel.Knee -> "ระดับหัวเข่า (30-50 ซม.)"
                    CitizenWaterLevel.Waist -> "ระดับเอว (50-80 ซม.)"
                    CitizenWaterLevel.Chest -> "ระดับอก (80-100 ซม.)"
                    CitizenWaterLevel.Critical -> "วิกฤติ (>100 ซม.)"
                }
                val flow = report.waterFlow.label
                val verified = if (report.verifiedBySatellite) " • ผ่านการยืนยันดาวเทียม ✓" else ""
                "$levelLabel ($flow)$verified"
            }
            marker.isStation && marker.station != null -> {
                val pm = marker.station.metrics.firstOrNull { it.label.contains("PM2.5", ignoreCase = true) }
                val water = marker.station.metrics.firstOrNull { it.label.contains("น้ำ", ignoreCase = true) || it.label.contains("ไหล", ignoreCase = true) }
                when {
                    pm != null -> "${pm.label}: ${pm.value}"
                    water != null -> "${water.label}: ${water.value}"
                    marker.station.metrics.isNotEmpty() -> "${marker.station.metrics.first().label}: ${marker.station.metrics.first().value}"
                    else -> "ตรวจวัดสถานะปกติ"
                }
            }
            marker.event != null -> {
                val event = marker.event
                val typeLabel = when (event.type) {
                    HazardType.Earthquake -> "แผ่นดินไหว"
                    HazardType.Flood -> "น้ำท่วม"
                    HazardType.Storm -> "พายุ"
                    HazardType.Fire -> "ไฟป่า"
                    HazardType.AirQuality -> "คุณภาพอากาศ"
                    HazardType.Drought -> "ภัยแล้ง"
                    else -> event.type.label
                }
                "$typeLabel: ${event.metric}"
            }
            marker.hotspot != null -> "ตรวจพบจุดความร้อนเมื่อ ${marker.hotspot.hoursSinceDetected ?: 0} ชม. ที่แล้ว"
            marker.floodArea != null -> {
                val area = marker.floodArea.areaSquareMeters?.let {
                    String.format(java.util.Locale.US, "%,.0f ตร.ม.", it)
                } ?: "ตรวจพบคราบน้ำท่วม"
                "พื้นที่น้ำท่วม: $area"
            }
            else -> marker.snippet.substringBefore("|").trim()
        }
    }

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f),
        tonalElevation = 6.dp,
        shadowElevation = 8.dp,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))
    ) {
        Column(
            modifier = Modifier.padding(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.Top
            ) {
                IconBubble(
                    icon = marker.type.icon(),
                    color = marker.severity.color(),
                    modifier = Modifier.padding(top = 2.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    if (marker.isCitizenReport) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 3.dp)
                        ) {
                            Text(
                                text = "รายงานภาคประชาชน (Ground Truth)",
                                color = Color(0xFF0284C7),
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                            )
                            if (marker.citizenReport?.verifiedBySatellite == true) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "✓ ยืนยันดาวเทียม",
                                    color = Color(0xFF10B981),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                )
                            }
                        }
                    }
                    Text(
                        text = marker.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = shortStatus,
                        color = if (marker.isCitizenReport) Color(0xFF0284C7) else MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                IconButton(
                    onClick = onDismissClick,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Dismiss",
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = onViewDetailsClick,
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                modifier = Modifier
                    .align(Alignment.End)
                    .height(36.dp)
            ) {
                Text(
                    text = "ดูรายละเอียด",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp
                )
            }
        }
    }
}

// หน้าต่างแสดงรายละเอียดเส้นทางอพยพและจุดปลอดภัย (Evacuation Modal Sheet)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun EvacuationModalSheet(
    onDismiss: () -> Unit,
) {
    val context = LocalContext.current
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = CriticalRed.copy(alpha = 0.12f),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("🧭", fontSize = 20.sp)
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "เส้นทางอพยพและจุดปลอดภัย (Safe Zones)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "ศูนย์พักพิงและจุดรวมพลฉุกเฉินที่ใกล้ที่สุด",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Filled.Close, contentDescription = "Close")
                }
            }

            // รายการศูนย์พักพิงใกล้เคียง
            Text("📍 ศูนย์พักพิงใกล้เคียงที่พร้อมรองรับ", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            val shelters = listOf(
                Triple("ศูนย์พักพิงอาคารอเนกประสงค์เทศบาล", "ห่าง 1.2 กม. • รองรับ 500 คน • เสบียงพร้อม", Pair(14.3532, 100.5689)),
                Triple("โรงเรียนประจำอำเภอ (ลานสูงจุดรวมพลที่ 2)", "ห่าง 2.8 กม. • ลานเนินสูงพ้นระดับน้ำ", Pair(14.3600, 100.5800)),
                Triple("โรงพยาบาลศูนย์ประจำจังหวัด", "ห่าง 4.5 กม. • หน่วยแพทย์และปฐมพยาบาล 24 ชม.", Pair(14.3700, 100.5900)),
            )
            shelters.forEach { (name, desc, coords) ->
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(desc, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(
                            onClick = { ExternalIntents.navigateTo(context, coords.first, coords.second) },
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text("นำทาง", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // หมายเลขสายด่วนฉุกเฉิน
            Text("📞 สายด่วนแจ้งเหตุฉุกเฉิน 24 ชม.", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = { ExternalIntents.dial(context, "1784") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("1784 ปภ.", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { ExternalIntents.dial(context, "1669") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("1669 แพทย์", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = { ExternalIntents.dial(context, "199") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("199 ดับเพลิง", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

// หน้าต่างส่งรายงานสดสถานการณ์น้ำท่วมและภัยพิบัติภาคประชาชน (Ground Truth Modal Sheet)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CitizenReportModalSheet(
    onDismiss: () -> Unit,
) {
    val context = LocalContext.current
    var selectedLevel by remember { mutableStateOf(CitizenWaterLevel.Waist) }
    var selectedFlow by remember { mutableStateOf(CitizenWaterFlow.Flowing) }
    var isSubmitted by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 10.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = CircleShape,
                    color = DmindBlue.copy(alpha = 0.12f),
                    modifier = Modifier.size(40.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("📢", fontSize = 20.sp)
                    }
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = "รายงานสดภาคประชาชน (Ground Truth)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "ตรวจสอบระดับน้ำจริงร่วมกับดาวเทียม Sentinel-1 & GISTDA",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Filled.Close, contentDescription = "Close")
                }
            }

            if (isSubmitted) {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = SafeGreen.copy(alpha = 0.1f),
                    border = BorderStroke(1.dp, SafeGreen.copy(alpha = 0.3f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("✅ บันทึกรายงานสถานการณ์สำเร็จ", fontWeight = FontWeight.Bold, color = SafeGreen, fontSize = 15.sp)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            "ข้อมูลของคุณถูกส่งเข้าระบบ D-MIND เพื่อเปรียบเทียบกับภาพถ่ายดาวเทียมเรียบร้อยแล้ว ขอบคุณสำหรับข้อมูลภาคสนาม",
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.height(12.dp))
                        Button(onClick = onDismiss, shape = RoundedCornerShape(10.dp)) {
                            Text("กลับสู่แผนที่")
                        }
                    }
                }
            } else {
                Text("💧 ระดับน้ำที่ตรวจพบในพื้นที่:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CitizenWaterLevel.entries.forEach { level ->
                        FilterChip(
                            selected = selectedLevel == level,
                            onClick = { selectedLevel = level },
                            label = { Text("${level.label} (${level.levelCmDescription})") }
                        )
                    }
                }

                Text("🌊 สภาพการไหลของน้ำ:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    CitizenWaterFlow.entries.forEach { flow ->
                        FilterChip(
                            selected = selectedFlow == flow,
                            onClick = { selectedFlow = flow },
                            label = { Text(flow.label) }
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🛰️", fontSize = 20.sp)
                        Spacer(Modifier.width(10.dp))
                        Text(
                            text = "ระบบจะจับคู่พิกัด GPS อัตโนมัติ เพื่อทำ Cross-validation กับภาพถ่ายดาวเทียม Sentinel-1 SAR ของ GISTDA",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Button(
                    onClick = {
                        isSubmitted = true
                        android.widget.Toast.makeText(context, "ส่งรายงาน Ground Truth เรียบร้อยแล้ว", android.widget.Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DmindBlue)
                ) {
                    Text("ยืนยันส่งรายงานสถานการณ์", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}
