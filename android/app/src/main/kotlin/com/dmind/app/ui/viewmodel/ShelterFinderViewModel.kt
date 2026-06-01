package com.dmind.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dmind.app.data.supabase.ShelterRecord
import com.dmind.app.data.supabase.SupabaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

// คลาสเก็บข้อมูลสถานะ UI (UI State) สำหรับหน้าจอค้นหาศูนย์พักพิง
data class ShelterFinderUiState(
    val shelters: List<ShelterRecord> = emptyList(),
    val isLoading: Boolean = true,
    val userLocation: Pair<Double, Double>? = null, // Pair(latitude, longitude)
    val selectedProvince: String = "",
    val selectedType: String = "",
    val errorMessage: String? = null,
)

// คลาส ViewModel สำหรับจัดการข้อมูล ค้นหา และกรองศูนย์พักพิง (Shelter Finder)
class ShelterFinderViewModel(
    private val repository: SupabaseRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(ShelterFinderUiState())
    val state: StateFlow<ShelterFinderUiState> = _state.asStateFlow()

    init {
        // กำหนดตำแหน่งเริ่มต้นที่กรุงเทพมหานคร (เช่นเดียวกับ useShelterData.ts: { lat: 13.7563, lng: 100.5018 })
        setUserLocation(13.7563, 100.5018)
        refresh()
    }

    // โหลดข้อมูลศูนย์พักพิงใหม่จากเซิร์ฟเวอร์หรือดึงข้อมูลจำลอง
    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, errorMessage = null) }
            repository.fetchShelters()
                .onSuccess { list ->
                    _state.update { current ->
                        val updatedList = updateDistances(list, current.userLocation)
                        current.copy(
                            shelters = updatedList,
                            isLoading = false
                        )
                    }
                }
                .onFailure { error ->
                    _state.update { current ->
                        val fallback = updateDistances(repository.getMockShelters(), current.userLocation)
                        current.copy(
                            shelters = fallback,
                            isLoading = false,
                            errorMessage = error.message
                        )
                    }
                }
        }
    }

    // กำหนดหรืออัปเดตพิกัดตำแหน่งปัจจุบันของผู้ใช้
    fun setUserLocation(latitude: Double, longitude: Double) {
        _state.update { current ->
            val location = Pair(latitude, longitude)
            val updatedList = updateDistances(current.shelters, location)
            current.copy(
                userLocation = location,
                shelters = updatedList
            )
        }
    }

    // อัปเดตตัวกรองจังหวัดที่เลือก
    fun setSelectedProvince(province: String) {
        _state.update { it.copy(selectedProvince = province) }
    }

    // อัปเดตตัวกรองประเภทศูนย์พักพิงที่เลือก
    fun setSelectedType(type: String) {
        _state.update { it.copy(selectedType = type) }
    }

    // ดึงรายชื่อจังหวัดทั้งหมดที่มีศูนย์พักพิงแบบไม่ซ้ำและเรียงลำดับอักษร
    fun getProvinces(): List<String> {
        return _state.value.shelters
            .map { it.province }
            .distinct()
            .sorted()
    }

    // ค้นหาศูนย์พักพิงด้วย ID
    fun getShelterById(id: String): ShelterRecord? {
        return _state.value.shelters.find { it.id == id }
    }

    // ดึงข้อมูลศูนย์พักพิงทั้งหมดที่ผ่านการกรองจังหวัดและประเภท และเรียงลำดับระยะทาง
    fun getFilteredShelters(): List<ShelterRecord> {
        val current = _state.value
        var filtered = current.shelters

        if (current.selectedProvince.isNotEmpty()) {
            filtered = filtered.filter { it.province == current.selectedProvince }
        }

        if (current.selectedType.isNotEmpty()) {
            filtered = filtered.filter { it.type == current.selectedType }
        }

        // เรียงลำดับตามระยะทางจากน้อยไปมาก (กรณีที่มีข้อมูลระยะทาง)
        return filtered.sortedBy { it.distanceKm ?: Double.MAX_VALUE }
    }

    // ดึงข้อมูลศูนย์พักพิงใกล้เคียงภายในรัศมีกิโลเมตรที่กำหนด (เช่น 50 กม.)
    fun getNearbyShelters(radiusKm: Double = 50.0): List<ShelterRecord> {
        return _state.value.shelters
            .filter { it.distanceKm != null && it.distanceKm <= radiusKm }
            .sortedBy { it.distanceKm }
    }

    // อัปเดตคำนวณระยะทางของรายการศูนย์พักพิงเมื่อเทียบกับตำแหน่งพิกัดผู้ใช้
    private fun updateDistances(
        list: List<ShelterRecord>,
        userLocation: Pair<Double, Double>?
    ): List<ShelterRecord> {
        if (userLocation == null) return list
        return list.map { shelter ->
            val dist = calculateDistance(
                userLocation.first,
                userLocation.second,
                shelter.latitude,
                shelter.longitude
            )
            shelter.copy(distanceKm = dist)
        }
    }

    // คำนวณระยะทางระหว่างจุดพิกัดสองจุดด้วยสูตร Haversine (หน่วยเป็นกิโลเมตร)
    private fun calculateDistance(
        lat1: Double,
        lng1: Double,
        lat2: Double,
        lng2: Double
    ): Double {
        val r = 6371.0 // รัศมีของโลก (กิโลเมตร)
        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)
        val a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
        val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return r * c
    }
}
