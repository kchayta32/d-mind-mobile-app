package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.repository.AnalyticsRepository
import com.dmind.app.domain.model.AnalyticsSummary
import com.dmind.app.domain.model.EnvironmentalData
import com.dmind.app.domain.model.TrendDataPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AnalyticsDashboardUiState(
    val summary: AnalyticsSummary? = null,
    val trends: List<TrendDataPoint> = emptyList(),
    val environmental: EnvironmentalData? = null,
    val selectedPeriod: String = "7d",
    val isLoading: Boolean = false,
    val error: String? = null,
)

class AnalyticsDashboardViewModel(
    private val repository: AnalyticsRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(AnalyticsDashboardUiState())
    val state: StateFlow<AnalyticsDashboardUiState> = _state.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }

            val summaryResult = repository.fetchSummary()
            val trendsResult = repository.fetchTrends(_state.value.selectedPeriod)
            val envResult = repository.fetchEnvironmental()

            _state.update { current ->
                current.copy(
                    isLoading = false,
                    summary = summaryResult.getOrNull() ?: current.summary,
                    trends = trendsResult.getOrDefault(current.trends),
                    environmental = envResult.getOrNull() ?: current.environmental,
                    error = summaryResult.exceptionOrNull()?.message
                        ?: trendsResult.exceptionOrNull()?.message
                        ?: envResult.exceptionOrNull()?.message,
                )
            }
        }
    }

    fun selectPeriod(period: String) {
        if (period == _state.value.selectedPeriod) return
        _state.update { it.copy(selectedPeriod = period) }
        viewModelScope.launch {
            val result = repository.fetchTrends(period)
            _state.update { current ->
                current.copy(
                    trends = result.getOrDefault(current.trends),
                    error = result.exceptionOrNull()?.message,
                )
            }
        }
    }
}
