package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterEvent
import com.dmind.app.domain.model.DisasterFilter
import com.dmind.app.domain.model.DisasterLayerType
import com.dmind.app.domain.model.DisasterSnapshot
import com.dmind.app.domain.model.FloodArea
import com.dmind.app.domain.model.GistdaDroughtProduct
import com.dmind.app.domain.model.GistdaLayer
import com.dmind.app.domain.model.GistdaTimeRange
import com.dmind.app.domain.model.HazardType
import com.dmind.app.domain.model.Severity
import com.dmind.app.domain.model.ViirsHotspot
import com.dmind.app.domain.model.SelectedWeatherInfo
import com.dmind.app.domain.repository.DisasterRepository
import com.dmind.app.domain.usecase.GetDisasterSnapshotUseCase
import com.dmind.app.domain.usecase.GetFloodFeaturesUseCase
import com.dmind.app.domain.usecase.GetGistdaWmtsLayerUseCase
import com.dmind.app.domain.usecase.GetViirsHotspotsUseCase
import com.dmind.app.domain.usecase.SearchPlacesUseCase
import com.dmind.app.domain.usecase.FetchWeatherForCoordsUseCase
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import java.net.URL
import org.json.JSONObject

// โครงสร้างข้อมูลเฟรมสำหรับเล่นแอนิเมชันเรดาร์น้ำฝน (RainViewer)
data class RainViewerFrame(val time: Long, val path: String)

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับแผนที่แสดงภัยพิบัติ
data class DisasterMapUiState(
    val snapshot: DisasterSnapshot = DisasterSnapshot(),
    val filter: DisasterFilter = DisasterFilter(),
    val activeLayer: DisasterLayerType = DisasterLayerType.WildfireViirs,
    val layerTimeRange: GistdaTimeRange = GistdaTimeRange.OneDay,
    val droughtProduct: GistdaDroughtProduct = GistdaDroughtProduct.Smap,
    val layerLoading: Boolean = false,
    val layerError: String? = null,
    val layerLastUpdatedMillis: Long = 0L,
    val viirsHotspots: List<ViirsHotspot> = emptyList(),
    val floodAreas: List<FloodArea> = emptyList(),
    val activeWmtsLayer: GistdaLayer? = null,
    val smapConnected: Boolean = false,
    val selectedEvent: DisasterEvent? = null,
    val selectedViirsHotspot: ViirsHotspot? = null,
    val selectedFloodArea: FloodArea? = null,
    val searchQuery: String = "",
    val searchResults: List<PlaceSearchResult> = emptyList(),
    val isSearching: Boolean = false,
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
    val radarFrames: List<RainViewerFrame> = emptyList(),
    val radarHost: String = "",
    val currentRadarFrameIndex: Int = -1,
    val isRadarPlaying: Boolean = false,
    val radarPlaybackSpeed: Int = 1, // 1x, 2x, 4x
    val radarOverlayType: String = "radar", // "radar" or "satellite"
    val radarTimeType: String = "past", // "past" or "future"
    val showRadarOverlay: Boolean = false,
    val selectedWeatherInfo: SelectedWeatherInfo? = null,
    val isWeatherLoading: Boolean = false,
    val soilMoistureGeoJson: String? = null,
    val riverDischargeGeoJson: String? = null,
) {
    val visibleEvents: List<DisasterEvent>
        get() = snapshot.events.filter { event -> filter.accepts(event) }

    val visibleStations: List<com.dmind.app.domain.model.MonitoringStation>
        get() = if (filter.showStations) snapshot.stations else emptyList()
}

// คลาส ViewModel สำหรับควบคุมข้อมูล แผนที่ เลเยอร์ สภาพอากาศ และระบบเล่นแอนิเมชันเรดาร์
class DisasterMapViewModel(
    private val getSnapshot: GetDisasterSnapshotUseCase,
    private val searchPlaces: SearchPlacesUseCase,
    private val fetchWeatherForCoordsUseCase: FetchWeatherForCoordsUseCase,
    private val getViirsHotspots: GetViirsHotspotsUseCase,
    private val getFloodFeatures: GetFloodFeaturesUseCase,
    private val getGistdaWmtsLayer: GetGistdaWmtsLayerUseCase,
    private val disasterRepository: DisasterRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(DisasterMapUiState())
    val state: StateFlow<DisasterMapUiState> = _state.asStateFlow()
    private var searchJob: Job? = null
    private var cachedRainViewerJson: JSONObject? = null
    private var playbackJob: Job? = null

    init {
        refresh()
        refreshActiveLayer()
        loadRainViewerData()
    }

    // รีเฟรชข้อมูลแผนที่และเลเยอร์แผนที่ในปัจจุบัน
    fun refreshMap() {
        refresh()
        refreshActiveLayer()
    }

    // รีเฟรชเฉพาะข้อมูลหลักเหตุการณ์ภัยพิบัติ (Disaster Snapshot)
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching { getSnapshot() }
                .onSuccess { snapshot ->
                    _state.update {
                        it.copy(
                            snapshot = snapshot,
                            isLoading = false,
                            errorMessage = snapshot.errorMessage,
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Unable to refresh disaster data.",
                        )
                    }
                }
        }
    }

    // ดึงข้อมูลสภาพอากาศตามพิกัดละติจูดและลองจิจูด
    fun fetchWeatherForCoords(lat: Double, lon: Double) {
        viewModelScope.launch {
            _state.update { it.copy(isWeatherLoading = true, selectedWeatherInfo = null) }
            runCatching {
                fetchWeatherForCoordsUseCase(lat, lon)
            }.onSuccess { weatherInfo ->
                _state.update { it.copy(isWeatherLoading = false, selectedWeatherInfo = weatherInfo) }
            }.onFailure { error ->
                error.printStackTrace()
                _state.update { it.copy(isWeatherLoading = false, selectedWeatherInfo = null) }
            }
        }
    }

    // เปิดหรือปิดตัวกรองประเภทภัยพิบัติ (Hazard Type)
    fun toggleHazardType(type: HazardType) {
        _state.update { current ->
            val nextTypes = if (type in current.filter.selectedTypes) {
                current.filter.selectedTypes - type
            } else {
                current.filter.selectedTypes + type
            }.ifEmpty { DisasterFilter.defaultHazardTypes }
            current.copy(filter = current.filter.copy(selectedTypes = nextTypes))
        }
    }

    // กำหนดระดับความรุนแรงขั้นต่ำที่ต้องการกรองให้แสดงบนแผนที่
    fun setMinimumSeverity(severity: Severity) {
        _state.update { it.copy(filter = it.filter.copy(minimumSeverity = severity)) }
    }

    // กำหนดค่าว่าจะให้แสดงสถานีวัดปริมาณน้ำฝน/ระดับน้ำ หรือไม่
    fun setShowStations(showStations: Boolean) {
        _state.update { it.copy(filter = it.filter.copy(showStations = showStations)) }
    }

    // เลือกและอัปเดตเหตุการณ์ภัยพิบัติ (Disaster Event)
    fun selectEvent(event: DisasterEvent?) {
        _state.update {
            it.copy(
                selectedEvent = event,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                selectedWeatherInfo = null,
            )
        }
    }

    // เลือกและอัปเดตฟีเจอร์ของเลเยอร์เหตุการณ์เฉพาะ (VIIRS หรือพื้นที่น้ำท่วม)
    fun selectLayerFeature(
        event: DisasterEvent? = null,
        viirsHotspot: ViirsHotspot? = null,
        floodArea: FloodArea? = null,
    ) {
        _state.update {
            it.copy(
                selectedEvent = event,
                selectedViirsHotspot = viirsHotspot,
                selectedFloodArea = floodArea,
                selectedWeatherInfo = null,
            )
        }
    }

    // เลือกและเปลี่ยนเลเยอร์ข้อมูลแผนที่ปัจจุบัน (เช่น เลเยอร์ไฟป่า VIIRS เลเยอร์น้ำท่วม เลเยอร์ภัยแล้ง)
    fun selectLayer(layer: DisasterLayerType) {
        val nextRange = validRangeForLayer(layer, _state.value.layerTimeRange)
        _state.update {
            it.copy(
                activeLayer = layer,
                layerTimeRange = nextRange,
                selectedEvent = null,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                selectedWeatherInfo = null,
                layerError = null,
            )
        }
        refreshActiveLayer()
    }

    // เลือกและเปลี่ยนช่วงเวลาของเลเยอร์ GISTDA
    fun selectTimeRange(timeRange: GistdaTimeRange) {
        val layer = _state.value.activeLayer
        val nextRange = validRangeForLayer(layer, timeRange)
        _state.update {
            it.copy(
                layerTimeRange = nextRange,
                selectedEvent = null,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                selectedWeatherInfo = null,
                layerError = null,
            )
        }
        refreshActiveLayer()
    }

    // เลือกประเภทผลิตภัณฑ์ข้อมูลภัยแล้ง (เช่น Smap หรือ Lst)
    fun selectDroughtProduct(product: GistdaDroughtProduct) {
        _state.update {
            it.copy(
                droughtProduct = product,
                layerTimeRange = GistdaTimeRange.SevenDays,
                selectedEvent = null,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                layerError = null,
            )
        }
        if (_state.value.activeLayer == DisasterLayerType.DroughtSmap) {
            refreshActiveLayer()
        }
    }

    // สั่งโหลดข้อมูลเลเยอร์แผนที่ใหม่ตามเลเยอร์ที่เปิดใช้งานอยู่ปัจจุบัน
    fun refreshActiveLayer() {
        val layer = _state.value.activeLayer
        val timeRange = validRangeForLayer(layer, _state.value.layerTimeRange)
        when (layer) {
            DisasterLayerType.WildfireViirs -> {
                _state.update { it.copy(soilMoistureGeoJson = null, riverDischargeGeoJson = null) }
                loadViirsLayer(timeRange)
            }
            DisasterLayerType.Flood -> {
                _state.update { it.copy(soilMoistureGeoJson = null, riverDischargeGeoJson = null) }
                loadFloodLayer(timeRange)
            }
            DisasterLayerType.DroughtSmap -> {
                _state.update { it.copy(soilMoistureGeoJson = null, riverDischargeGeoJson = null) }
                loadDroughtLayer()
            }

            else -> {
                _state.update {
                    it.copy(
                        layerLoading = false,
                        layerError = null,
                        activeWmtsLayer = null,
                        viirsHotspots = emptyList(),
                        floodAreas = emptyList(),
                        soilMoistureGeoJson = null,
                        riverDischargeGeoJson = null,
                    )
                }
            }
        }
    }

    // โหลดข้อมูลจุดความร้อน VIIRS (ไฟป่า)
    private fun loadViirsLayer(timeRange: GistdaTimeRange) {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    layerLoading = true,
                    layerError = null,
                    activeWmtsLayer = getGistdaWmtsLayer(DisasterLayerType.WildfireViirs, timeRange),
                    floodAreas = emptyList(),
                    soilMoistureGeoJson = null,
                    riverDischargeGeoJson = null,
                )
            }
            getViirsHotspots(timeRange)
                .onSuccess { hotspots ->
                    _state.update {
                        it.copy(
                            viirsHotspots = hotspots,
                            layerLoading = false,
                            layerLastUpdatedMillis = System.currentTimeMillis(),
                            layerError = it.activeWmtsLayer?.message,
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            viirsHotspots = emptyList(),
                            layerLoading = false,
                            layerError = error.message ?: "ไม่สามารถโหลดข้อมูล VIIRS ได้",
                        )
                    }
                }
        }
    }

    // โหลดข้อมูลเลเยอร์พื้นที่น้ำท่วมจากภาพถ่ายดาวเทียม
    private fun loadFloodLayer(timeRange: GistdaTimeRange) {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    layerLoading = true,
                    layerError = null,
                    activeWmtsLayer = getGistdaWmtsLayer(DisasterLayerType.Flood, timeRange),
                    viirsHotspots = emptyList(),
                    soilMoistureGeoJson = null,
                    riverDischargeGeoJson = null,
                )
            }
            getFloodFeatures(timeRange)
                .onSuccess { areas ->
                    _state.update {
                        it.copy(
                            floodAreas = areas,
                            layerLoading = false,
                            layerLastUpdatedMillis = System.currentTimeMillis(),
                            layerError = it.activeWmtsLayer?.message,
                        )
                    }
                }
                .onFailure { error ->
                    _state.update {
                        it.copy(
                            floodAreas = emptyList(),
                            layerLoading = false,
                            layerError = error.message ?: "ไม่สามารถโหลดข้อมูลน้ำท่วมได้",
                        )
                    }
                }
        }
    }

    // โหลดเลเยอร์ข้อมูลภัยแล้ง (ดัชนีความชื้นของดินดาวเทียม SMAP)
    private fun loadDroughtLayer() {
        val product = _state.value.droughtProduct
        val layer = getGistdaWmtsLayer(
            DisasterLayerType.DroughtSmap,
            GistdaTimeRange.SevenDays,
            product,
        )
        _state.update {
            it.copy(
                layerTimeRange = GistdaTimeRange.SevenDays,
                activeWmtsLayer = layer,
                viirsHotspots = emptyList(),
                floodAreas = emptyList(),
                layerLoading = false,
                layerLastUpdatedMillis = System.currentTimeMillis(),
                layerError = layer.message?.takeIf { !layer.isAvailable },
                smapConnected = layer.isAvailable && product == GistdaDroughtProduct.Smap,
                soilMoistureGeoJson = null,
                riverDischargeGeoJson = null,
            )
        }
    }

    // ตรวจสอบและเลือกช่วงเวลาพยากรณ์ที่ถูกต้องเหมาะสมกับคุณสมบัติของเลเยอร์นั้นๆ
    private fun validRangeForLayer(
        layer: DisasterLayerType,
        requested: GistdaTimeRange,
    ): GistdaTimeRange = when {
        layer == DisasterLayerType.WildfireViirs && requested == GistdaTimeRange.FloodFrequency -> GistdaTimeRange.OneDay
        layer == DisasterLayerType.DroughtSmap -> GistdaTimeRange.SevenDays
        else -> requested
    }

    // อัปเดตและค้นหาสถานที่บนแผนที่ตามคำค้นหา (Search Query) ของผู้ใช้
    fun updateSearchQuery(query: String) {
        _state.update { it.copy(searchQuery = query) }
        searchJob?.cancel()
        if (query.trim().length < 2) {
            _state.update { it.copy(searchResults = emptyList(), isSearching = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(300)
            _state.update { it.copy(isSearching = true) }
            val results = runCatching { searchPlaces(query.trim()) }.getOrDefault(emptyList())
            _state.update { it.copy(searchResults = results, isSearching = false) }
        }
    }

    // ล้างรายการผลลัพธ์การค้นหาสถานที่
    fun clearSearchResults() {
        _state.update { it.copy(searchResults = emptyList()) }
    }

    // ดึงค่าแอนิเมชันเรดาร์ RainViewer จากแคชขึ้นมาแสดงผลตามการตั้งค่าประเภทและเวลา
    private fun updateRadarFramesFromCache() {
        val json = cachedRainViewerJson ?: return
        val overlayType = _state.value.radarOverlayType
        
        val host = json.optString("host", "")
        val overlayObj = json.optJSONObject(overlayType)
        
        val pastArray = overlayObj?.optJSONArray("past")
        val nowcastArray = overlayObj?.optJSONArray("nowcast")
        
        val frames = mutableListOf<RainViewerFrame>()
        var pastSize = 0
        if (pastArray != null) {
            for (i in 0 until pastArray.length()) {
                val frameObj = pastArray.optJSONObject(i)
                if (frameObj != null) {
                    val time = frameObj.optLong("time", 0L)
                    val path = frameObj.optString("path", "")
                    frames.add(RainViewerFrame(time, path))
                }
            }
            pastSize = frames.size
        }
        
        if (nowcastArray != null) {
            for (i in 0 until nowcastArray.length()) {
                val frameObj = nowcastArray.optJSONObject(i)
                if (frameObj != null) {
                    val time = frameObj.optLong("time", 0L)
                    val path = frameObj.optString("path", "")
                    frames.add(RainViewerFrame(time, path))
                }
            }
        }
        
        val lastPastIndex = if (pastSize > 0) pastSize - 1 else if (frames.isNotEmpty()) 0 else -1
        
        _state.update { current ->
            current.copy(
                radarFrames = frames,
                radarHost = host,
                currentRadarFrameIndex = lastPastIndex
            )
        }
    }

    // โหลดไฟล์ตั้งค่าและ API ข้อมูลเรดาร์สภาพอากาศจาก RainViewer (แบบ Asynchronous ใน Dispatchers.IO)
    fun loadRainViewerData() {
        viewModelScope.launch(Dispatchers.IO) {
            runCatching {
                val jsonText = URL("https://api.rainviewer.com/public/weather-maps.json").readText()
                JSONObject(jsonText)
            }.onSuccess { jsonObject ->
                cachedRainViewerJson = jsonObject
                updateRadarFramesFromCache()
            }.onFailure { error ->
                error.printStackTrace()
            }
        }
    }

    // เปิดหรือปิดแถบเล่นแอนิเมชันแผนที่เรดาร์
    fun toggleRadarOverlay(show: Boolean) {
        _state.update { it.copy(showRadarOverlay = show) }
    }

    // เลือกประเภทการซ้อนทับแผนที่ของ RainViewer (เช่น "radar" หรือ "satellite")
    fun setRadarOverlayType(type: String) {
        _state.update { it.copy(radarOverlayType = type) }
        updateRadarFramesFromCache()
    }

    // เลือกช่วงเวลาของเรดาร์ ("past" หรือ "future")
    fun setRadarTimeType(type: String) {
        _state.update { it.copy(radarTimeType = type) }
        updateRadarFramesFromCache()
    }

    // สั่งเปิดหรือหยุดเล่นแอนิเมชันเรดาร์ล่วงหน้า/ย้อนหลัง
    fun toggleRadarPlayback() {
        val nextPlaying = !_state.value.isRadarPlaying
        _state.update { it.copy(isRadarPlaying = nextPlaying) }
        if (nextPlaying) {
            startPlayback()
        } else {
            stopPlayback()
        }
    }

    // เริ่มการทำงาน Loop การเล่นเฟรมเรดาร์
    private fun startPlayback() {
        playbackJob?.cancel()
        playbackJob = viewModelScope.launch {
            while (isActive) {
                val speed = _state.value.radarPlaybackSpeed
                delay(1500L / speed)
                stepRadarFrame(1)
            }
        }
    }

    // หยุดและยกเลิกกระบวนการเล่นเฟรมเรดาร์
    private fun stopPlayback() {
        playbackJob?.cancel()
        playbackJob = null
    }

    // ปรับเปลี่ยนความเร็วของการเล่นแอนิเมชันเรดาร์น้ำฝน
    fun setRadarPlaybackSpeed(speed: Int) {
        _state.update { it.copy(radarPlaybackSpeed = speed) }
        if (_state.value.isRadarPlaying) {
            startPlayback()
        }
    }

    // ค้นหาเฟรมเรดาร์น้ำฝนที่เฟรมระบุโดยตรง (Seek Index)
    fun seekRadarFrame(index: Int) {
        val frames = _state.value.radarFrames
        if (frames.isEmpty()) {
            _state.update { it.copy(currentRadarFrameIndex = -1) }
            return
        }
        val safeIndex = index.coerceIn(0, frames.size - 1)
        _state.update { it.copy(currentRadarFrameIndex = safeIndex) }
    }

    // ขยับเฟรมเรดาร์น้ำฝนไปข้างหน้าหรือย้อนกลับทีละ 1 เฟรม
    fun stepRadarFrame(direction: Int) {
        val frames = _state.value.radarFrames
        if (frames.isEmpty()) {
            _state.update { it.copy(currentRadarFrameIndex = -1) }
            return
        }
        val currentIndex = _state.value.currentRadarFrameIndex
        val nextIndex = if (currentIndex == -1) {
            0
        } else {
            val calculated = (currentIndex + direction) % frames.size
            if (calculated < 0) calculated + frames.size else calculated
        }
        _state.update { it.copy(currentRadarFrameIndex = nextIndex) }
    }
}
