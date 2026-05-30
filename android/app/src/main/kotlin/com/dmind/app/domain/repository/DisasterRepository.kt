package com.dmind.app.domain.repository

import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.domain.model.DisasterSnapshot

// อินเตอร์เฟซข้อกำหนดการทำงาน (Repository) สำหรับจัดการข้อมูลหลักเรื่องภัยพิบัติและสิ่งแวดล้อม
interface DisasterRepository {
    // ดึงข้อมูลสรุปสถานการณ์ภัยพิบัติ สภาพอากาศ และหน่วยตรวจวัดทั้งหมด ณ ปัจจุบัน
    suspend fun fetchSnapshot(): DisasterSnapshot
    
    // ค้นหารายการสถานที่หรือจุดพิกัดต่างๆ ตามคำค้นหา (Query) ที่ผู้ใช้ป้อนเข้ามา
    suspend fun searchPlaces(query: String): List<PlaceSearchResult>
    
    // ค้นหารายละเอียดสภาพอากาศปัจจุบันและพยากรณ์อากาศล่วงหน้าอ้างอิงพิกัด Latitude และ Longitude
    suspend fun fetchWeatherForCoords(lat: Double, lon: Double): com.dmind.app.domain.model.SelectedWeatherInfo
}
