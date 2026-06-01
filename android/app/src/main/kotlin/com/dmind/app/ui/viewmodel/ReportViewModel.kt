package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.IncidentReportDraft
import com.dmind.app.data.supabase.IncidentReportRecord
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

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
