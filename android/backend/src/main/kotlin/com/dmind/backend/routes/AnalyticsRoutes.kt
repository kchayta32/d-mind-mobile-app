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

fun Route.analyticsRoutes(cacheService: CacheService, aggregator: DataAggregatorService) {
    route("/api/analytics") {
        get("/summary") {
            val summary = cacheService.getOrFetch<AnalyticsSummaryResponse>("analytics:summary") {
                aggregator.getAnalyticsSummary()
            }
            call.respond(summary)
        }

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

        get("/environmental") {
            val data = cacheService.getOrFetch<EnvironmentalResponse>("analytics:environmental") {
                aggregator.getEnvironmentalData()
            }
            call.respond(data)
        }
    }
}
