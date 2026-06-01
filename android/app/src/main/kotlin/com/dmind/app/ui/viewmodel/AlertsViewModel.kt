package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.NotificationRecord
import com.dmind.app.data.supabase.RealtimeAlertRecord
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

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
