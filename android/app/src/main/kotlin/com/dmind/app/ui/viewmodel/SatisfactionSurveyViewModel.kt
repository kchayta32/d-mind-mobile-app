package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.SatisfactionSurveyDraft
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

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
