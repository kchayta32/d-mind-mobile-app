package com.dmind.backend.routes

import com.dmind.backend.models.AnalyticsSummaryResponse
import com.dmind.backend.models.EnvironmentalResponse
import com.dmind.backend.models.TrendDataResponse
import com.dmind.backend.service.CacheService
import com.dmind.backend.service.DataAggregatorService
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.route

// กำหนดเส้นทาง URL (Routing) ทั้งหมดที่ใช้จัดการงานประมวลผลและวิเคราะห์ข้อมูลสถิติ
fun Route.analyticsRoutes(cacheService: CacheService, aggregator: DataAggregatorService) {
    route("/api/analytics") {
        
        // ดึงข้อมูลภาพรวมสถิติภัยพิบัติล่าสุด (มีระบบดึงข้อมูลจากแคชเพื่อลดการทำงานของฐานข้อมูล)
        get("/summary") {
            val summary = cacheService.getOrFetch<AnalyticsSummaryResponse>("analytics:summary") {
                aggregator.getAnalyticsSummary()
            }
            call.respond(summary)
        }

        // ดึงข้อมูลแนวโน้มสถิติภัยพิบัติตามช่วงเวลาที่กำหนด เช่น 7 วัน, 30 วัน หรือ 1 ปี
        get("/trends") {
            val period = call.request.queryParameters["period"] ?: "7d"
            val validPeriod = when (period) {
                "7d", "30d", "1y" -> period
                else -> "7d"
            }
            val trends = cacheService.getOrFetch<TrendDataResponse>("analytics:trends:$validPeriod") {
                aggregator.getTrendData(validPeriod)
            }
            call.respond(trends)
        }

        // ดึงข้อมูลสถิติและสภาพสิ่งแวดล้อมรอบตัว (ฝุ่น PM2.5, ดัชนีคุณภาพอากาศ AQI, ข้อมูลแหล่งน้ำ)
        get("/environmental") {
            val lat = call.request.queryParameters["lat"]?.toDoubleOrNull()
            val lon = call.request.queryParameters["lon"]?.toDoubleOrNull()
            val cacheKey = if (lat != null && lon != null) {
                "analytics:environmental:$lat:$lon"
            } else {
                "analytics:environmental"
            }
            val data = cacheService.getOrFetch<EnvironmentalResponse>(cacheKey) {
                if (lat != null && lon != null) {
                    aggregator.getEnvironmentalData(lat, lon)
                } else {
                    aggregator.getEnvironmentalData()
                }
            }
            call.respond(data)
        }
    }
}
