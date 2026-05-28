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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DisasterMapScreen(
    state: DisasterMapUiState,
    viewModel: DisasterMapViewModel,
    onBack: () -> Unit,
    onOpenStations: () -> Unit,
) {
    val scaffoldState = rememberBottomSheetScaffoldState()
    val scope = rememberCoroutineScope()
    var focusedPlace by remember { mutableStateOf<PlaceSearchResult?>(null) }
    var selectedStation by remember { mutableStateOf<MonitoringStation?>(null) }
    var showFilters by rememberSaveable { mutableStateOf(false) }
    var showLayers by rememberSaveable { mutableStateOf(false) }
    var showLegend by rememberSaveable { mutableStateOf(true) }
    var legendOffsetX by rememberSaveable(state.activeLayer) { mutableStateOf(0f) }
    var legendOffsetY by rememberSaveable(state.activeLayer) { mutableStateOf(0f) }
    var mapStyle by rememberSaveable { mutableStateOf(MapTileStyle.Standard) }
    var cameraActionId by remember { mutableLongStateOf(0L) }
    var cameraActionKind by remember { mutableStateOf<MapCameraActionKind?>(null) }
    val activeWmtsLayer = state.activeWmtsLayer?.takeIf { it.isAvailable }
    val markerText = rememberMapMarkerText()
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
            MapLibreTerrainView(
                modifier = Modifier.fillMaxSize(),
                markers = markers,
                mapStyle = mapStyle,
                wmtsLayer = activeWmtsLayer,
                focusedPlace = focusedPlace,
                cameraAction = cameraActionKind?.let { MapCameraAction(cameraActionId, it) },
                onMarkerClick = { marker ->
                    selectedStation = marker.station
                    viewModel.selectLayerFeature(
                        event = marker.event,
                        viirsHotspot = marker.hotspot,
                        floodArea = marker.floodArea,
                    )
                    viewModel.fetchWeatherForCoords(marker.latitude, marker.longitude)
                    scope.launch { scaffoldState.bottomSheetState.expand() }
                },
                onMapClick = { lat, lon ->
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
