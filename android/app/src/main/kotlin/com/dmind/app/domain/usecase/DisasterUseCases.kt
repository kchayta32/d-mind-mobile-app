package com.dmind.app.domain.usecase

import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterSnapshot
import com.dmind.app.domain.repository.DisasterRepository

// คลาส Use Case สำหรับดึงข้อมูลสถิติภาพรวมภัยพิบัติและสภาพแวดล้อมล่าสุด (Snapshot)
class GetDisasterSnapshotUseCase(
    private val repository: DisasterRepository,
) {
    // ทำการเรียกฟังก์ชันดึงค่าจาก Repository เพื่อรับออบเจกต์ DisasterSnapshot
    suspend operator fun invoke(): DisasterSnapshot = repository.fetchSnapshot()
}

// คลาส Use Case สำหรับการสืบค้นหาข้อมูลสถานที่ (Geocoding / Place Search)
class SearchPlacesUseCase(
    private val repository: DisasterRepository,
) {
    // ค้นหารายชื่อสถานที่และพิกัดที่พบตามข้อความค้นหาที่ระบุ
    suspend operator fun invoke(query: String): List<PlaceSearchResult> = repository.searchPlaces(query)
}

// คลาส Use Case สำหรับรับข้อมูลรายละเอียดสภาพอากาศ ณ พิกัดเป้าหมาย (Weather Query)
class FetchWeatherForCoordsUseCase(
    private val repository: DisasterRepository,
) {
    // คืนค่าข้อมูลสภาพอากาศปัจจุบันและพยากรณ์อากาศล่วงหน้าของพิกัดดังกล่าว
    suspend operator fun invoke(lat: Double, lon: Double) = repository.fetchWeatherForCoords(lat, lon)
}
