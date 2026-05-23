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
import com.dmind.app.domain.usecase.GetDisasterSnapshotUseCase
import com.dmind.app.domain.usecase.GetFloodFeaturesUseCase
import com.dmind.app.domain.usecase.GetGistdaWmtsLayerUseCase
import com.dmind.app.domain.usecase.GetViirsHotspotsUseCase
import com.dmind.app.domain.usecase.SearchPlacesUseCase
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

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
) {
    val visibleEvents: List<DisasterEvent>
        get() = snapshot.events.filter { event -> filter.accepts(event) }

    val visibleStations: List<com.dmind.app.domain.model.MonitoringStation>
        get() = if (filter.showStations) snapshot.stations else emptyList()
}

class DisasterMapViewModel(
    private val getSnapshot: GetDisasterSnapshotUseCase,
    private val searchPlaces: SearchPlacesUseCase,
    private val getViirsHotspots: GetViirsHotspotsUseCase,
    private val getFloodFeatures: GetFloodFeaturesUseCase,
    private val getGistdaWmtsLayer: GetGistdaWmtsLayerUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow(DisasterMapUiState())
    val state: StateFlow<DisasterMapUiState> = _state.asStateFlow()
    private var searchJob: Job? = null

    init {
        refresh()
        refreshActiveLayer()
    }

    fun refreshMap() {
        refresh()
        refreshActiveLayer()
    }

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

    fun setMinimumSeverity(severity: Severity) {
        _state.update { it.copy(filter = it.filter.copy(minimumSeverity = severity)) }
    }

    fun setShowStations(showStations: Boolean) {
        _state.update { it.copy(filter = it.filter.copy(showStations = showStations)) }
    }

    fun selectEvent(event: DisasterEvent?) {
        _state.update {
            it.copy(
                selectedEvent = event,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
            )
        }
    }

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
            )
        }
    }

    fun selectLayer(layer: DisasterLayerType) {
        val nextRange = validRangeForLayer(layer, _state.value.layerTimeRange)
        _state.update {
            it.copy(
                activeLayer = layer,
                layerTimeRange = nextRange,
                selectedEvent = null,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                layerError = null,
            )
        }
        refreshActiveLayer()
    }

    fun selectTimeRange(timeRange: GistdaTimeRange) {
        val layer = _state.value.activeLayer
        val nextRange = validRangeForLayer(layer, timeRange)
        _state.update {
            it.copy(
                layerTimeRange = nextRange,
                selectedEvent = null,
                selectedViirsHotspot = null,
                selectedFloodArea = null,
                layerError = null,
            )
        }
        refreshActiveLayer()
    }

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

    fun refreshActiveLayer() {
        val layer = _state.value.activeLayer
        val timeRange = validRangeForLayer(layer, _state.value.layerTimeRange)
        when (layer) {
            DisasterLayerType.WildfireViirs -> loadViirsLayer(timeRange)
            DisasterLayerType.Flood -> loadFloodLayer(timeRange)
            DisasterLayerType.DroughtSmap -> loadDroughtLayer()
            else -> {
                _state.update {
                    it.copy(
                        layerLoading = false,
                        layerError = null,
                        activeWmtsLayer = null,
                        viirsHotspots = emptyList(),
                        floodAreas = emptyList(),
                    )
                }
            }
        }
    }

    private fun loadViirsLayer(timeRange: GistdaTimeRange) {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    layerLoading = true,
                    layerError = null,
                    activeWmtsLayer = getGistdaWmtsLayer(DisasterLayerType.WildfireViirs, timeRange),
                    floodAreas = emptyList(),
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

    private fun loadFloodLayer(timeRange: GistdaTimeRange) {
        viewModelScope.launch {
            _state.update {
                it.copy(
                    layerLoading = true,
                    layerError = null,
                    activeWmtsLayer = getGistdaWmtsLayer(DisasterLayerType.Flood, timeRange),
                    viirsHotspots = emptyList(),
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
            )
        }
    }

    private fun validRangeForLayer(
        layer: DisasterLayerType,
        requested: GistdaTimeRange,
    ): GistdaTimeRange = when {
        layer == DisasterLayerType.WildfireViirs && requested == GistdaTimeRange.FloodFrequency -> GistdaTimeRange.OneDay
        layer == DisasterLayerType.DroughtSmap -> GistdaTimeRange.SevenDays
        else -> requested
    }

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

    fun clearSearchResults() {
        _state.update { it.copy(searchResults = emptyList()) }
    }
}

data class AlertsUiState(
    val alerts: List<RealtimeAlertRecord> = emptyList(),
    val notifications: List<NotificationRecord> = emptyList(),
    val isLoading: Boolean = true,
    val errorMessage: String? = null,
)

class AlertsViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(AlertsUiState())
    val state: StateFlow<AlertsUiState> = _state.asStateFlow()

    init {
        refresh()
    }

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

data class ReportUiState(
    val recentReports: List<IncidentReportRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val message: ReportMessage? = null,
    val errorMessage: String? = null,
)

enum class ReportMessage {
    ValidationError,
    Submitted,
    SubmitError,
}

class ReportViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ReportUiState())
    val state: StateFlow<ReportUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            val reports = repository.fetchIncidentReports().getOrElse { emptyList() }
            _state.update { it.copy(recentReports = reports, isLoading = false) }
        }
    }

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

data class DamageAssessmentUiState(
    val assessments: List<DamageAssessmentRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isUploading: Boolean = false,
    val isDeleting: Boolean = false,
    val errorMessage: String? = null,
)

class DamageAssessmentViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(DamageAssessmentUiState())
    val state: StateFlow<DamageAssessmentUiState> = _state.asStateFlow()

    init {
        refresh()
    }

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

data class VictimReportsUiState(
    val reports: List<VictimReportRecord> = emptyList(),
    val isLoading: Boolean = true,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val isSuccess: Boolean = false,
)

class VictimReportsViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(VictimReportsUiState())
    val state: StateFlow<VictimReportsUiState> = _state.asStateFlow()

    init {
        refresh()
    }

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

    fun clearSuccessState() {
        _state.update { it.copy(isSuccess = false, errorMessage = null) }
    }
}

data class SatisfactionSurveyUiState(
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null,
)

class SatisfactionSurveyViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(SatisfactionSurveyUiState())
    val state: StateFlow<SatisfactionSurveyUiState> = _state.asStateFlow()

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

    fun clearSuccessState() {
        _state.update { it.copy(isSuccess = false, errorMessage = null) }
    }
}

data class ChatMessage(
    val fromUser: Boolean,
    val text: String,
)

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
)

class ChatbotViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ChatUiState())
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    fun send(message: String, fallbackError: String) {
        val clean = message.trim()
        if (clean.isBlank() || _state.value.isLoading) return
        val history = _state.value.messages.map { (if (it.fromUser) "user" else "assistant") to it.text }
        _state.update { it.copy(messages = it.messages + ChatMessage(true, clean), isLoading = true) }
        viewModelScope.launch {
            val reply = repository.invokeAiChat(clean, history).getOrElse {
                fallbackError
            }
            _state.update { it.copy(messages = it.messages + ChatMessage(false, reply), isLoading = false) }
        }
    }
}

fun <T : ViewModel> viewModelFactory(create: () -> T): ViewModelProvider.Factory {
    return object : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <VM : ViewModel> create(modelClass: Class<VM>): VM = create() as VM
    }
}
