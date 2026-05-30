package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.data.supabase.IncidentReportDraft
import com.dmind.app.data.supabase.IncidentReportRecord
import com.dmind.app.data.supabase.NotificationRecord
import com.dmind.app.data.supabase.RealtimeAlertRecord
import com.dmind.app.data.supabase.SupabaseRepository
import com.dmind.app.data.supabase.DamageAssessmentDraft
import com.dmind.app.data.supabase.DamageAssessmentRecord
import com.dmind.app.data.supabase.VictimReportDraft
import com.dmind.app.data.supabase.VictimReportRecord
import com.dmind.app.data.supabase.SatisfactionSurveyDraft
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
import org.json.JSONArray

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

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับรายการการแจ้งเตือน
data class AlertsUiState(
    val alerts: List<RealtimeAlertRecord> = emptyList(),
    val notifications: List<NotificationRecord> = emptyList(),
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
)

// คลาส ViewModel สำหรับจัดการการแจ้งเตือนภัยพิบัติเรียลไทม์และประวัติการแจ้งเตือน
class AlertsViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(AlertsUiState())
    val state: StateFlow<AlertsUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    // สั่งรีเฟรช ดึงข้อมูลประวัติภัยพิบัติเรียลไทม์ และประวัติการแจ้งเตือนใหม่จากเซิร์ฟเวอร์
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            val alerts = repository.fetchRealtimeAlerts().getOrElse { emptyList() }
            val notificationsResult = repository.fetchNotificationHistory()
            _state.update {
                it.copy(
                    alerts = alerts,
                    notifications = notificationsResult.getOrElse { emptyList() },
                    isLoading = false,
                    errorMessage = notificationsResult.exceptionOrNull()?.message,
                )
            }
        }
    }
}

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับการรายงานอุบัติการณ์หรือเหตุภัยพิบัติใหม่
data class ReportUiState(
    val recentReports: List<IncidentReportRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val message: ReportMessage? = null,
    val errorMessage: String? = null,
)

// ตัวระบุประเภทข้อความการรายงาน (ความสำเร็จ ข้อผิดพลาด ความถูกต้องของข้อมูล)
enum class ReportMessage {
    ValidationError,
    Submitted,
    SubmitError,
}

// คลาส ViewModel สำหรับจัดการและส่งข้อมูลการรายงานเหตุภัยพิบัติของผู้ใช้งาน
class ReportViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ReportUiState())
    val state: StateFlow<ReportUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    // รีเฟรชและดึงข้อมูลรายการรายงานอุบัติการณ์ล่าสุดทั้งหมด
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            val reports = repository.fetchIncidentReports().getOrElse { emptyList() }
            _state.update { it.copy(recentReports = reports, isLoading = false) }
        }
    }

    // ส่งรายงานเหตุภัยพิบัติใหม่พร้อมการอัปโหลดไฟล์รูปภาพแนบ
    fun submitReport(
        type: String,
        title: String,
        description: String,
        location: String?,
        severityLevel: Int,
        imageBytes: ByteArray? = null,
        imageFileName: String? = null,
        imageContentType: String? = null,
    ) {
        if (title.isBlank() || description.isBlank()) {
            _state.update { it.copy(message = ReportMessage.ValidationError, errorMessage = null) }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, message = null, errorMessage = null) }
            
            val imageUrls = mutableListOf<String>()
            if (imageBytes != null && imageFileName != null && imageContentType != null) {
                repository.uploadIncidentImage(imageFileName, imageContentType, imageBytes)
                    .onSuccess { url ->
                        imageUrls.add(url)
                    }
                    .onFailure { error ->
                        _state.update {
                            it.copy(
                                isSubmitting = false,
                                message = ReportMessage.SubmitError,
                                errorMessage = "อัปโหลดภาพล้มเหลว: ${error.message}",
                            )
                        }
                        return@launch
                    }
            }

            repository.submitIncidentReport(
                IncidentReportDraft(
                    type = type,
                    title = title.trim(),
                    description = description.trim(),
                    location = location?.trim()?.takeIf { it.isNotBlank() },
                    severityLevel = severityLevel,
                    imageUrls = imageUrls,
                ),
            ).onSuccess {
                _state.update { state ->
                    state.copy(
                        isSubmitting = false,
                        message = ReportMessage.Submitted,
                        errorMessage = null,
                    )
                }
                refresh()
            }.onFailure { error ->
                _state.update {
                    it.copy(
                        isSubmitting = false,
                        message = ReportMessage.SubmitError,
                        errorMessage = error.message,
                    )
                }
            }
        }
    }
}

// คลาสเก็บสถานะ UI (UI State) สำหรับการประเมินวิเคราะห์ความเสียหาย
data class DamageAssessmentUiState(
    val assessments: List<DamageAssessmentRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isUploading: Boolean = false,
    val isDeleting: Boolean = false,
    val errorMessage: String? = null,
)

// คลาส ViewModel สำหรับจัดการการส่งภาพวิเคราะห์ความเสียหายและบันทึกประวัติการประเมินภัยพิบัติ
class DamageAssessmentViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(DamageAssessmentUiState())
    val state: StateFlow<DamageAssessmentUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    // รีเฟรชข้อมูลรายการประเมินความเสียหายล่าสุดของแอปพลิเคชัน
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            repository.fetchDamageAssessments()
                .onSuccess { list ->
                    _state.update { it.copy(assessments = list, isLoading = false) }
                }
                .onFailure { error ->
                    _state.update { it.copy(isLoading = false, errorMessage = error.message) }
                }
        }
    }

    // อัปโหลดไฟล์รูปภาพเหตุการณ์และสั่งให้ระบบวิเคราะห์ประเมินระดับความเสียหาย
    fun uploadAndAnalyze(
        fileName: String,
        contentType: String,
        bytes: ByteArray,
        incidentId: String? = null,
    ) {
        viewModelScope.launch {
            _state.update { it.copy(isUploading = true, errorMessage = null) }
            repository.uploadDamageAssessmentImage(fileName, contentType, bytes)
                .onSuccess { publicUrl ->
                    val draft = DamageAssessmentDraft(
                        imageUrl = publicUrl,
                        originalFilename = fileName,
                        incidentId = incidentId,
                    )
                    repository.invokeDamageAssessment(draft)
                        .onSuccess {
                            _state.update { it.copy(isUploading = false) }
                            refresh()
                        }
                        .onFailure { error ->
                            _state.update { it.copy(isUploading = false, errorMessage = "วิเคราะห์ความเสียหายล้มเหลว: ${error.message}") }
                            refresh()
                        }
                }
                .onFailure { error ->
                    _state.update { it.copy(isUploading = false, errorMessage = "อัปโหลดรูปล้มเหลว: ${error.message}") }
                }
        }
    }

    // ลบรายการข้อมูลประเมินความเสียหายในประวัติ
    fun deleteAssessment(id: String) {
        viewModelScope.launch {
            _state.update { it.copy(isDeleting = true, errorMessage = null) }
            repository.deleteDamageAssessment(id)
                .onSuccess {
                    _state.update { it.copy(isDeleting = false) }
                    refresh()
                }
                .onFailure { error ->
                    _state.update { it.copy(isDeleting = false, errorMessage = "ลบข้อมูลล้มเหลว: ${error.message}") }
                }
        }
    }
}

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับประวัติและการแจ้งผู้ประสบภัย
data class VictimReportsUiState(
    val reports: List<VictimReportRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val isSuccess: Boolean = false,
)

// คลาส ViewModel สำหรับจัดการข้อมูลประวัติและการแจ้งขอความช่วยเหลือผู้ประสบภัย
class VictimReportsViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(VictimReportsUiState())
    val state: StateFlow<VictimReportsUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    // รีเฟรชและดึงข้อมูลรายการส่งแจ้งขอความช่วยเหลือผู้ประสบภัยล่าสุด
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            repository.fetchVictimReports()
                .onSuccess { list ->
                    _state.update { it.copy(reports = list, isLoading = false) }
                }
                .onFailure { error ->
                    _state.update { it.copy(isLoading = false, errorMessage = error.message) }
                }
        }
    }

    // ส่งรายงานคำร้องขอความช่วยเหลือผู้ประสบภัยใหม่ระบุพิกัดสถานที่ ชื่อ รายละเอียดติดต่อ
    fun submitReport(
        name: String,
        contact: String?,
        description: String?,
        latitude: Double,
        longitude: Double,
    ) {
        if (name.isBlank()) {
            _state.update { it.copy(errorMessage = "กรุณากรอกชื่อผู้ประสบภัย") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, errorMessage = null, isSuccess = false) }
            val draft = VictimReportDraft(
                name = name.trim(),
                contact = contact?.trim()?.takeIf { it.isNotBlank() },
                description = description?.trim()?.takeIf { it.isNotBlank() },
                latitude = latitude,
                longitude = longitude,
            )
            repository.submitVictimReport(draft)
                .onSuccess {
                    _state.update { it.copy(isSubmitting = false, isSuccess = true) }
                    refresh()
                }
                .onFailure { error ->
                    _state.update { it.copy(isSubmitting = false, errorMessage = error.message) }
                }
        }
    }

    // ล้างสถานะแจ้งเตือนความสำเร็จและล้างข้อความข้อผิดพลาดเดิม
    fun clearSuccessState() {
        _state.update { it.copy(isSuccess = false, errorMessage = null) }
    }
}

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับการส่งแบบประเมินความพึงพอใจ
data class SatisfactionSurveyUiState(
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null,
)

// คลาส ViewModel สำหรับจัดการการกรอกข้อมูลและส่งแบบประเมินความพึงพอใจการใช้งานแอปพลิเคชัน
class SatisfactionSurveyViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(SatisfactionSurveyUiState())
    val state: StateFlow<SatisfactionSurveyUiState> = _state.asStateFlow()

    // ส่งข้อมูลแบบสำรวจความพึงพอใจพร้อมเรตติ้งด้านต่างๆ และข้อเสนอแนะ
    fun submitSurvey(
        overallRating: Int,
        userInterfaceRating: Int?,
        mapVisualizationRating: Int?,
        alertSystemRating: Int?,
        emergencyInfoRating: Int?,
        aiAssistantRating: Int?,
        mostUsefulFeature: String?,
        suggestions: String?,
        wouldRecommend: Int?,
    ) {
        viewModelScope.launch {
            _state.update { it.copy(isSubmitting = true, errorMessage = null, isSuccess = false) }
            val draft = SatisfactionSurveyDraft(
                overallRating = overallRating,
                userInterfaceRating = userInterfaceRating,
                mapVisualizationRating = mapVisualizationRating,
                alertSystemRating = alertSystemRating,
                emergencyInfoRating = emergencyInfoRating,
                aiAssistantRating = aiAssistantRating,
                mostUsefulFeature = mostUsefulFeature?.trim()?.takeIf { it.isNotBlank() },
                suggestions = suggestions?.trim()?.takeIf { it.isNotBlank() },
                wouldRecommend = wouldRecommend,
            )
            repository.submitSatisfactionSurvey(draft)
                .onSuccess {
                    _state.update { it.copy(isSubmitting = false, isSuccess = true) }
                }
                .onFailure { error ->
                    _state.update { it.copy(isSubmitting = false, errorMessage = error.message) }
                }
        }
    }

    // ล้างสถานะการส่งแบบประเมินสำเร็จ
    fun clearSuccessState() {
        _state.update { it.copy(isSuccess = false, errorMessage = null) }
    }
}

// โครงสร้างของออบเจกต์เก็บข้อความแชทบอทสนทนา
data class ChatMessage(
    val fromUser: Boolean,
    val text: String,
)

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับหน้าจอผู้ช่วยอัจฉริยะแชทบอท
data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val isRecording: Boolean = false,
    val isTtsPlaying: Boolean = false,
    val transcriptionText: String = "",
    val volumeLevel: Float = 0f,
    val voiceError: String? = null,
    val textToSpeak: String? = null,
)

// คลาส ViewModel สำหรับการสนทนาโต้ตอบกับผู้ช่วย AI ปัญญาประดิษฐ์ (แชทบอท) ทั้งข้อความและเสียง
class ChatbotViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ChatUiState())
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    // ส่งข้อความสนทนาและประวัติแชทเพื่อให้ผู้ช่วย AI ประมวลผลตอบกลับ
    fun send(message: String, fallbackError: String) {
        val clean = message.trim()
        if (clean.isBlank() || _state.value.isLoading) return
        val history = _state.value.messages.map { (if (it.fromUser) "user" else "assistant") to it.text }
        _state.update { it.copy(messages = it.messages + ChatMessage(true, clean), isLoading = true) }
        viewModelScope.launch {
            val reply = repository.invokeAiChat(clean, history).getOrElse {
                fallbackError
            }
            _state.update {
                it.copy(
                    messages = it.messages + ChatMessage(false, reply),
                    isLoading = false,
                    textToSpeak = reply
                )
            }
        }
    }

    // กำหนดสถานะความพร้อมในการบันทึกเสียงผู้ใช้
    fun setRecording(recording: Boolean) {
        _state.update { it.copy(isRecording = recording) }
    }

    // กำหนดสถานะแสดงความพร้อมเมื่อ TTS (Text-to-Speech) กำลังเล่นเสียงพูดตอบกลับ
    fun setTtsPlaying(playing: Boolean) {
        _state.update { it.copy(isTtsPlaying = playing) }
    }

    // อัปเดตข้อความถอดเสียงถอดความ (Speech-to-Text) ล่าสุด
    fun updateTranscription(text: String) {
        _state.update { it.copy(transcriptionText = text) }
    }

    // อัปเดตระดับความดังหรือระดับคลื่นเสียงสัญญาณไมโครโฟน
    fun setVolumeLevel(level: Float) {
        _state.update { it.copy(volumeLevel = level) }
    }

    // ตั้งค่าข้อความแจ้งเตือนข้อผิดพลาดเกี่ยวกับการตรวจจับและถอดเสียงเสียง
    fun setVoiceError(error: String?) {
        _state.update { it.copy(voiceError = error) }
    }

    // ล้างข้อความเพื่อระงับการสั่งประมวลผลอ่านออกเสียงตอบกลับ
    fun clearTextToSpeak() {
        _state.update { it.copy(textToSpeak = null) }
    }

    // ล้างสถานะและรีเซ็ตค่าการรับข้อมูลเสียงทั้งหมด
    fun clearVoiceState() {
        _state.update {
            it.copy(
                isRecording = false,
                isTtsPlaying = false,
                transcriptionText = "",
                volumeLevel = 0f,
                voiceError = null
            )
        }
    }
}

// ฟังก์ชันอำนวยความสะดวกในการสร้าง ViewModel Factory สำหรับ ViewModel ทุกประเภทในแอปพลิเคชัน
fun <T : ViewModel> viewModelFactory(create: () -> T): ViewModelProvider.Factory {
    return object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <VM : ViewModel> create(modelClass: Class<VM>): VM = create() as VM
    }
}
