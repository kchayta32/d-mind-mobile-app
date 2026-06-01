package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.DamageAssessmentDraft
import com.dmind.app.data.supabase.DamageAssessmentRecord
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// คลาสเก็บสถานะ UI (UI State) สำหรับการส่งแบบประเมินวิเคราะห์ความเสียหาย
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
