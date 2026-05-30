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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton

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

    // อัปเดตรูปแบบแผนที่ตามความมืด/สว่างของระบบโดยอัตโนมัติ
    LaunchedEffect(darkTheme) {
        if (darkTheme && mapStyle == MapTileStyle.Standard) {
            mapStyle = MapTileStyle.Dark
        } else if (!darkTheme && mapStyle == MapTileStyle.Dark) {
            mapStyle = MapTileStyle.Standard
        }
    }
    var cameraActionId by remember { mutableLongStateOf(0L) }
    var cameraActionKind by remember { mutableStateOf<MapCameraActionKind?>(null) }
    val activeWmtsLayer = state.activeWmtsLayer?.takeIf { it.isAvailable }
    val markerText = rememberMapMarkerText()
    // ประกอบรายการมาร์กเกอร์ต่างๆ (เหตุการณ์, สถานี, จุดความร้อน) ที่จะวาดลงบนแผนที่
    val markers = remember(
        state.activeLayer,
        state.visibleEvents,
        state.visibleStations,
        state.viirsHotspots,
        state.floodAreas,
        markerText,
    ) {
        buildMapMarkerItems(state, markerText)
    }

    LaunchedEffect(state.activeLayer) {
        val isWeather = state.activeLayer == DisasterLayerType.Storm || state.activeLayer.name == "Weather"
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
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(148.dp)
                    .align(Alignment.TopCenter)
                    .background(
                        Brush.verticalGradient(
                            listOf(
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.82f),
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.25f),
                                Color.Transparent,
                            ),
                        ),
                    ),
            )

            // แถบค้นหาและปุ่มส่วนหัวแผนที่
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
                    .align(Alignment.TopCenter)
                    .statusBarsPadding()
                    .padding(14.dp),
            )

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

            // แถบเครื่องมือเล่นเฟรมความเคลื่อนไหวของพายุฝน (Radar Timeline)
            if (state.showRadarOverlay && (state.activeLayer == DisasterLayerType.Storm || state.activeLayer.name == "Weather")) {
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

            // การ์ดพรีวิวข้อมูลขนาดย่อเมื่อแตะมาร์กเกอร์
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
                        .padding(bottom = 128.dp, start = 16.dp, end = 16.dp),
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
                    HazardType.Heat -> "ความร้อน"
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
                        color = MaterialTheme.colorScheme.primary,
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
