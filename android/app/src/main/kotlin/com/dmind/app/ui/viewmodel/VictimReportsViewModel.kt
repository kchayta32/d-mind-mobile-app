package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.VictimReportDraft
import com.dmind.app.data.supabase.VictimReportRecord
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

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
