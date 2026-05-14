package com.dmind.app.data.map

import com.dmind.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.max

class DisasterMapRepository {
    suspend fun fetchSnapshot(): MapDataSnapshot = coroutineScope {
        val startedAt = System.currentTimeMillis()
        val tasks = listOf(
            async { fetchTmdWeather() },
            async { fetchUsgsEarthquakes() },
            async { fetchGistdaWildfires() },
            async { fetchGistdaFloods() },
            async { fetchGistdaFloodFrequency() },
            async { fetchGistdaWaterHyacinths() },
            async {
                fetchGistdaWmsLayer(
                    name = "GISTDA flood 1day WMS",
                    path = "maps/flood/1day/wms",
                    expectedLayerName = "676e3c965e01949dda35fa23",
                    detail = "พื้นที่น้ำท่วม 1 วันย้อนหลัง",
                )
            },
            async {
                fetchGistdaWmsLayer(
                    name = "GISTDA flood frequency WMS",
                    path = "maps/flood-freq/wms",
                    expectedLayerName = "6799ab8c6f832362f99030e6",
                    detail = "พื้นที่น้ำท่วมซ้ำซาก",
                )
            },
            async {
                fetchGistdaWmsLayer(
                    name = "GISTDA DRIPlus WMS",
                    path = "maps/dri/7days/wms",
                    expectedLayerName = "6799acce8d739fff9dacee2f",
                    detail = "พื้นที่เสี่ยงภัยแล้ง DRIPlus ราย 7 วันล่าสุด",
                )
            },
            async {
                fetchGistdaWmsLayer(
                    name = "GISTDA NDWI WMS",
                    path = "maps/ndwi/7days/wms",
                    expectedLayerName = "6799acf27966ebcdded074a8",
                    detail = "ความชื้นพืชพรรณ NDWI ราย 7 วันล่าสุด",
                )
            },
            async {
                fetchGistdaWmsLayer(
                    name = "GISTDA SMAP WMS",
                    path = "maps/smap/7days/wms",
                    expectedLayerName = "6799ace4582fb798d9a87895",
                    detail = "ความชื้นในดิน SMAP ราย 7 วันล่าสุด",
                )
            },
        )

        val droughts = generateDroughtProvinceRiskPoints()
        val results = tasks.awaitAll()
        val weather = results[0].weather
        val earthquakes = results[1].points
        val wildfires = results[2].points
        val floods = results[3].points
        val floodFrequency = results[4].points
        val waterHyacinths = results[5].points
        val statuses = results.map { it.status } + MapExternalSourceStatus(
            name = "GISTDA DRI/NDWI/SMAP",
            agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
            ok = true,
            count = droughts.size,
            detail = "ใช้จุดอ้างอิงภัยแล้งจากเว็บแอพประกอบกับ WMS DRIPlus/NDWI/SMAP",
        ) + MapExternalSourceStatus(
            name = "OpenStreetMap",
            agency = "OpenStreetMap contributors",
            ok = true,
            count = 1,
            detail = "ใช้ OSM raster tiles และ Nominatim search",
        )

        MapDataSnapshot(
            weather = weather,
            earthquakes = earthquakes,
            wildfires = wildfires,
            floods = floods,
            floodFrequency = floodFrequency,
            waterHyacinths = waterHyacinths,
            droughts = droughts,
            statuses = statuses,
            updatedAtMillis = startedAt,
            errorMessage = statuses.firstOrNull { !it.ok }?.detail,
        )
    }

    private fun gistdaApiKey(): String = BuildConfig.GISTDA_API_KEY
        .ifBlank { BuildConfig.GISTDA_WMS_API_KEY }
        .ifBlank { BuildConfig.GISTDA_DISASTER_API_KEY }
        .ifBlank { BuildConfig.GISTDA_FIRE_API_KEY }

    suspend fun searchPlaces(query: String): List<PlaceSearchResult> = withContext(Dispatchers.IO) {
        if (query.isBlank()) return@withContext emptyList()
        val encoded = URLEncoder.encode(query, "UTF-8")
        val url = "https://nominatim.openstreetmap.org/search" +
            "?format=json&q=$encoded&limit=5&countrycodes=th&addressdetails=1"

        runCatching {
            val body = httpGet(url, headers = osmHeaders())
            val array = JSONArray(body)
            (0 until array.length()).mapNotNull { index ->
                val item = array.optJSONObject(index) ?: return@mapNotNull null
                val address = item.optJSONObject("address")
                val lat = item.optString("lat").toDoubleOrNull() ?: return@mapNotNull null
                val lon = item.optString("lon").toDoubleOrNull() ?: return@mapNotNull null
                PlaceSearchResult(
                    name = item.optString("display_name", "ไม่พบชื่อสถานที่"),
                    latitude = lat,
                    longitude = lon,
                    country = address?.optString("country", "Thailand") ?: "Thailand",
                    state = address?.optString("state")?.takeIf { it.isNotBlank() },
                )
            }
        }.getOrDefault(emptyList())
    }

    private suspend fun fetchTmdWeather(): SourceFetchResult = withContext(Dispatchers.IO) {
        val token = BuildConfig.TMD_API_TOKEN
        if (token.isBlank()) {
            return@withContext SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "TMD hourly forecast",
                    agency = "กรมอุตุนิยมวิทยา",
                    ok = false,
                    count = 0,
                    detail = "ยังไม่ได้ตั้งค่า VITE_TMD_API_TOKEN/DMIND_TMD_API_TOKEN",
                ),
            )
        }

        runCatching {
            val today = DateTimeFormatter.ISO_LOCAL_DATE
                .withZone(ZoneId.of("Asia/Bangkok"))
                .format(Instant.now())
            val fields = "tc,rh,slp,rain,ws10m,wd10m,cloudlow,cloudmed,cloudhigh,cond"
            val url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at" +
                "?lat=13.7563&lon=100.5018&date=$today&fields=$fields&duration=24"
            val body = httpGet(
                url,
                headers = mapOf(
                    "accept" to "application/json",
                    "authorization" to "Bearer $token",
                ),
            )
            val json = JSONObject(body)
            val rootForecast = json.optJSONArray("WeatherForecasts")?.optJSONObject(0)
            val forecasts = rootForecast?.optJSONArray("forecasts") ?: JSONArray()
            val first = forecasts.optJSONObject(0)
            val data = first?.optJSONObject("data")
            val location = rootForecast?.optJSONObject("location")
            val province = location?.optString("province", "กรุงเทพมหานคร") ?: "กรุงเทพมหานคร"
            val summary = if (first != null && data != null) {
                WeatherSummary(
                    locationName = province,
                    temperatureCelsius = data.optDouble("tc", 0.0),
                    humidityPercent = data.optDouble("rh", 0.0),
                    rainMillimeters = data.optDouble("rain", 0.0),
                    windSpeedMps = data.optDouble("ws10m", 0.0),
                    conditionCode = data.optInt("cond", 1),
                    conditionLabel = weatherConditionLabel(data.optInt("cond", 1)),
                    forecastTime = first.optString("time", ""),
                )
            } else {
                null
            }

            SourceFetchResult(
                weather = summary,
                status = MapExternalSourceStatus(
                    name = "TMD hourly forecast",
                    agency = "กรมอุตุนิยมวิทยา",
                    ok = summary != null,
                    count = forecasts.length(),
                    detail = "อัปเดตข้อมูลพยากรณ์รายชั่วโมงทุก 5 นาที",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "TMD hourly forecast",
                    agency = "กรมอุตุนิยมวิทยา",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล TMD ได้",
                ),
            )
        }
    }

    private suspend fun fetchUsgsEarthquakes(): SourceFetchResult = withContext(Dispatchers.IO) {
        runCatching {
            val body = httpGet("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
            val json = JSONObject(body)
            val features = json.optJSONArray("features") ?: JSONArray()
            val points = (0 until features.length()).mapNotNull { index ->
                val feature = features.optJSONObject(index) ?: return@mapNotNull null
                val properties = feature.optJSONObject("properties") ?: JSONObject()
                val coordinates = feature.optJSONObject("geometry")?.optJSONArray("coordinates") ?: JSONArray()
                val lon = coordinates.optDoubleOrNull(0) ?: return@mapNotNull null
                val lat = coordinates.optDoubleOrNull(1) ?: return@mapNotNull null
                val depth = coordinates.optDoubleOrNull(2) ?: 0.0
                val magnitude = properties.optDouble("mag", 0.0)
                DisasterPoint(
                    id = feature.optString("id", "usgs-$index"),
                    type = DisasterDataType.Earthquake,
                    title = "แผ่นดินไหว ${magnitude.formatOne()} Mw",
                    subtitle = properties.optString("place", "Unknown location"),
                    latitude = lat,
                    longitude = lon,
                    severity = earthquakeSeverity(magnitude),
                    metric = "${magnitude.formatOne()} Mw • ${depth.formatOne()} กม.",
                    source = "USGS",
                    updatedAt = formatEpoch(properties.optLong("time", 0L)),
                )
            }

            SourceFetchResult(
                points = points,
                status = MapExternalSourceStatus(
                    name = "USGS earthquake feed",
                    agency = "สำนักงานสำรวจธรณีวิทยาสหรัฐอเมริกา",
                    ok = true,
                    count = points.size,
                    detail = "ใช้ all_week.geojson และรีเฟรชทุก 5 นาที",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "USGS earthquake feed",
                    agency = "สำนักงานสำรวจธรณีวิทยาสหรัฐอเมริกา",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล USGS ได้",
                ),
            )
        }
    }

    private suspend fun fetchGistdaWildfires(): SourceFetchResult = withContext(Dispatchers.IO) {
        val apiKey = gistdaApiKey()
        val country = URLEncoder.encode("ราชอาณาจักรไทย", "UTF-8")
        val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/viirs/1day" +
            "?limit=1000&offset=0&ct_tn=$country"

        runCatching {
            val body = httpGet(
                url,
                headers = buildMap {
                    put("accept", "application/json")
                    if (apiKey.isNotBlank()) put("API-Key", apiKey)
                },
            )
            val json = JSONObject(body)
            val features = json.optJSONArray("features") ?: JSONArray()
            val points = (0 until features.length()).mapNotNull { index ->
                val feature = features.optJSONObject(index) ?: return@mapNotNull null
                val properties = feature.optJSONObject("properties") ?: JSONObject()
                val coordinates = feature.optJSONObject("geometry")?.optJSONArray("coordinates") ?: JSONArray()
                val lon = coordinates.optDoubleOrNull(0)
                    ?: properties.optDoubleOrNull("longitude")
                    ?: return@mapNotNull null
                val lat = coordinates.optDoubleOrNull(1)
                    ?: properties.optDoubleOrNull("latitude")
                    ?: return@mapNotNull null
                val confidence = confidenceScore(properties.opt("confidence"))
                val frp = properties.optDouble("frp", 0.0)
                val brightness = properties.optDouble("bright_ti4", properties.optDouble("BRIGHTNESS", 0.0))
                val risk = fireRiskSeverity(confidence, frp, brightness, properties.optInt("f_alarm", 0))
                val province = properties.optString("pv_tn", properties.optString("changwat", "ไม่ระบุจังหวัด"))
                DisasterPoint(
                    id = feature.optString("id", "gistda-viirs-$index"),
                    type = DisasterDataType.Wildfire,
                    title = "จุดความร้อน $province",
                    subtitle = "ความเชื่อมั่น $confidence% • FRP ${frp.formatOne()} MW",
                    latitude = lat,
                    longitude = lon,
                    severity = risk,
                    metric = "$confidence%",
                    source = "GISTDA VIIRS",
                    updatedAt = "${properties.optString("th_date", properties.optString("acq_date", ""))} ${properties.optString("th_time", "")}",
                )
            }

            SourceFetchResult(
                points = points,
                status = MapExternalSourceStatus(
                    name = "GISTDA VIIRS hotspots",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = true,
                    count = points.size,
                    detail = "ใช้ /resources/features/viirs/1day และรีเฟรชทุก 5 นาที",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "GISTDA VIIRS hotspots",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล GISTDA VIIRS ได้",
                ),
            )
        }
    }

    private suspend fun fetchGistdaFloods(): SourceFetchResult = withContext(Dispatchers.IO) {
        val apiKey = gistdaApiKey()
        val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/flood/1day" +
            "?limit=1000&offset=0"

        runCatching {
            val body = httpGet(
                url,
                headers = buildMap {
                    put("accept", "application/json")
                    if (apiKey.isNotBlank()) put("API-Key", apiKey)
                },
            )
            val json = JSONObject(body)
            val features = json.optJSONArray("features") ?: JSONArray()
            val points = (0 until features.length()).mapNotNull { index ->
                val feature = features.optJSONObject(index) ?: return@mapNotNull null
                val properties = feature.optJSONObject("properties") ?: JSONObject()
                val center = feature.optJSONObject("geometry")?.let { geometryCenter(it.optJSONArray("coordinates")) }
                    ?: return@mapNotNull null
                val area = properties.optDouble("f_area", properties.optDouble("shape_area", 0.0))
                val province = properties.optString("pv_tn", properties.optString("LabelTH", "พื้นที่น้ำท่วม"))
                DisasterPoint(
                    id = feature.optString("id", "gistda-flood-$index"),
                    type = DisasterDataType.Flood,
                    title = "พื้นที่น้ำท่วม $province",
                    subtitle = "${properties.optString("ap_tn", "")} ${properties.optString("tb_tn", "")}".trim(),
                    latitude = center.first,
                    longitude = center.second,
                    severity = floodSeverity(area),
                    metric = "${area.formatOne()} ตร.ม.",
                    source = "GISTDA Flood",
                    updatedAt = properties.optString("_updatedAt", properties.optString("_createdAt", "")),
                )
            }

            SourceFetchResult(
                points = points,
                status = MapExternalSourceStatus(
                    name = "GISTDA flood features",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = true,
                    count = points.size,
                    detail = "ใช้ /resources/features/flood/1day และรีเฟรชทุก 5 นาที",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "GISTDA flood features",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล GISTDA flood ได้",
                ),
            )
        }
    }

    private suspend fun fetchGistdaFloodFrequency(): SourceFetchResult = withContext(Dispatchers.IO) {
        val apiKey = gistdaApiKey()
        val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/flood-freq" +
            "?limit=300&offset=0"

        runCatching {
            val body = httpGet(
                url,
                headers = buildMap {
                    put("accept", "application/json")
                    if (apiKey.isNotBlank()) put("API-Key", apiKey)
                },
            )
            val json = JSONObject(body)
            val features = json.optJSONArray("features") ?: JSONArray()
            val points = (0 until features.length()).mapNotNull { index ->
                val feature = features.optJSONObject(index) ?: return@mapNotNull null
                val properties = feature.optJSONObject("properties") ?: JSONObject()
                val center = feature.optJSONObject("geometry")?.let { geometryCenter(it.optJSONArray("coordinates")) }
                    ?: return@mapNotNull null
                val freq = properties.optInt("freq", 0)
                val areaRai = properties.optDouble("area_rai", properties.optDouble("shape_area", 0.0) / 1600.0)
                val province = properties.optString("pv_tn", "พื้นที่น้ำท่วมซ้ำซาก")
                val district = properties.optString("ap_tn", "")
                DisasterPoint(
                    id = feature.optString("id", "gistda-flood-freq-$index"),
                    type = DisasterDataType.Flood,
                    title = "น้ำท่วมซ้ำซาก $province",
                    subtitle = "$district • เกิดซ้ำ $freq ครั้ง • ${areaRai.formatOne()} ไร่",
                    latitude = center.first,
                    longitude = center.second,
                    severity = floodFrequencySeverity(freq, areaRai),
                    metric = "$freq ครั้ง",
                    source = "GISTDA Flood Frequency",
                    updatedAt = properties.optString("_updatedAt", properties.optString("_createdAt", "")),
                )
            }

            SourceFetchResult(
                points = points,
                status = MapExternalSourceStatus(
                    name = "GISTDA flood frequency",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = true,
                    count = json.optInt("numberMatched", points.size),
                    detail = "ใช้ /resources/features/flood-freq สำหรับสรุปพื้นที่น้ำท่วมซ้ำซาก",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "GISTDA flood frequency",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล flood-freq ได้",
                ),
            )
        }
    }

    private suspend fun fetchGistdaWaterHyacinths(): SourceFetchResult = withContext(Dispatchers.IO) {
        val apiKey = gistdaApiKey()
        val url = "https://api-gateway.gistda.or.th/api/2.0/resources/features/water_hyacinth" +
            "?limit=300&offset=0&sort=asc"

        runCatching {
            val body = httpGet(
                url,
                headers = buildMap {
                    put("accept", "application/json")
                    if (apiKey.isNotBlank()) put("API-Key", apiKey)
                },
            )
            val json = JSONObject(body)
            val features = json.optJSONArray("features") ?: JSONArray()
            val points = (0 until features.length()).mapNotNull { index ->
                val feature = features.optJSONObject(index) ?: return@mapNotNull null
                val properties = feature.optJSONObject("properties") ?: JSONObject()
                val lat = properties.optDoubleOrNull("lat")
                val lon = properties.optDoubleOrNull("long")
                val center = if (lat != null && lon != null) {
                    lat to lon
                } else {
                    feature.optJSONObject("geometry")?.let { geometryCenter(it.optJSONArray("coordinates")) }
                } ?: return@mapNotNull null
                val area = properties.optDouble("shape_area", 0.0)
                val province = properties.optString("pv_tn", "พื้นที่สิ่งกีดขวางทางน้ำ")
                val waterway = properties.optString("namt", properties.optString("name", "ไม่ระบุลำน้ำ"))
                DisasterPoint(
                    id = feature.optString("id", "gistda-water-hyacinth-$index"),
                    type = DisasterDataType.Flood,
                    title = "ผักตบชวา $province",
                    subtitle = "$waterway • ${area.formatOne()} ตร.ม.",
                    latitude = center.first,
                    longitude = center.second,
                    severity = waterHyacinthSeverity(area),
                    metric = "${area.formatOne()} ตร.ม.",
                    source = "GISTDA Water Hyacinth",
                    updatedAt = properties.optString("_updatedAt", properties.optString("_createdAt", "")),
                )
            }

            SourceFetchResult(
                points = points,
                status = MapExternalSourceStatus(
                    name = "GISTDA water hyacinth",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = true,
                    count = json.optInt("numberMatched", points.size),
                    detail = "ใช้ /resources/features/water_hyacinth สำหรับสิ่งกีดขวางทางน้ำ",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = "GISTDA water hyacinth",
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึงข้อมูล water_hyacinth ได้",
                ),
            )
        }
    }

    private suspend fun fetchGistdaWmsLayer(
        name: String,
        path: String,
        expectedLayerName: String,
        detail: String,
    ): SourceFetchResult = withContext(Dispatchers.IO) {
        val apiKey = gistdaApiKey()
        val url = "https://api-gateway.gistda.or.th/api/2.0/resources/$path"

        runCatching {
            val body = httpGet(
                url,
                headers = buildMap {
                    put("accept", "application/xml")
                    if (apiKey.isNotBlank()) put("API-Key", apiKey)
                },
            )
            val hasGetMap = body.contains("<GetMap>", ignoreCase = true)
            val hasLayer = body.contains("<Name>$expectedLayerName</Name>", ignoreCase = true)
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = name,
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = hasGetMap && hasLayer,
                    count = if (hasLayer) 1 else 0,
                    detail = "$detail • /resources/$path",
                ),
            )
        }.getOrElse { error ->
            SourceFetchResult(
                status = MapExternalSourceStatus(
                    name = name,
                    agency = "สำนักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ",
                    ok = false,
                    count = 0,
                    detail = error.message ?: "ไม่สามารถดึง WMS capability ของ $name ได้",
                ),
            )
        }
    }

    private fun generateDroughtProvinceRiskPoints(): List<DisasterPoint> {
        return droughtProvinceSeeds.map { seed ->
            DisasterPoint(
                id = "drought-${seed.name}",
                type = DisasterDataType.Drought,
                title = "ภัยแล้ง ${seed.name}",
                subtitle = "พื้นที่ได้รับผลกระทบ ${seed.areaRai} ไร่ • ประชากร ${seed.population}",
                latitude = seed.latitude,
                longitude = seed.longitude,
                severity = droughtSeverity(seed.riskLevel),
                metric = "${seed.riskLevel}%",
                source = "GISTDA DRI",
                updatedAt = "7days",
            )
        }
    }

    private suspend fun httpGet(
        url: String,
        headers: Map<String, String> = emptyMap(),
    ): String = withContext(Dispatchers.IO) {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15_000
            readTimeout = 20_000
            setRequestProperty("User-Agent", "D-MIND Android native map/2.0")
            headers.forEach { (key, value) -> setRequestProperty(key, value) }
        }

        try {
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                throw IllegalStateException("HTTP $code: ${body.take(160)}")
            }
            body
        } finally {
            connection.disconnect()
        }
    }

    private fun osmHeaders(): Map<String, String> = mapOf(
        "accept" to "application/json",
        "User-Agent" to "D-MIND Android native map/2.0",
    )

    private data class SourceFetchResult(
        val points: List<DisasterPoint> = emptyList(),
        val weather: WeatherSummary? = null,
        val status: MapExternalSourceStatus,
    )

    private data class DroughtSeed(
        val name: String,
        val riskLevel: Int,
        val latitude: Double,
        val longitude: Double,
        val areaRai: Int,
        val population: Int,
    )

    private companion object {
        private val thaiFormatter = DateTimeFormatter
            .ofPattern("d MMM yyyy HH:mm", Locale("th", "TH"))
            .withZone(ZoneId.of("Asia/Bangkok"))

        private val droughtProvinceSeeds = listOf(
            DroughtSeed("เชียงใหม่", 65, 18.7883, 98.9853, 12000, 150000),
            DroughtSeed("เชียงราย", 70, 19.9105, 99.8406, 8500, 90000),
            DroughtSeed("ขอนแก่น", 55, 16.4419, 102.8359, 7800, 120000),
            DroughtSeed("อุดรธานี", 60, 17.4138, 102.7877, 6900, 85000),
            DroughtSeed("นครราชสีมา", 45, 14.9799, 102.0977, 9200, 110000),
            DroughtSeed("บุรีรัมย์", 75, 14.9930, 103.1029, 8100, 95000),
            DroughtSeed("สุรินทร์", 80, 14.8818, 103.4937, 7600, 88000),
            DroughtSeed("ศีสะเกษ", 85, 15.1186, 104.3220, 6800, 75000),
            DroughtSeed("อุบลราชธานี", 72, 15.2448, 104.8471, 8900, 102000),
            DroughtSeed("เพชรบูรณ์", 63, 16.4193, 101.1609, 7100, 82000),
            DroughtSeed("ชัยภูมิ", 67, 15.8070, 102.0322, 7800, 89000),
            DroughtSeed("กาฬสินธุ์", 73, 16.4322, 103.5057, 6900, 79000),
        )

        private fun weatherConditionLabel(code: Int): String = when (code) {
            1 -> "ท้องฟ้าแจ่มใส"
            2 -> "มีเมฆบางส่วน"
            3 -> "เมฆเป็นส่วนมาก"
            4 -> "มีเมฆมาก"
            5 -> "ฝนตกเล็กน้อย"
            6 -> "ฝนปานกลาง"
            7 -> "ฝนหนัก"
            8 -> "ฝนฟ้าคะนอง"
            9 -> "อากาศหนาวจัด"
            10 -> "อากาศหนาว"
            11 -> "อากาศเย็น"
            12 -> "อากาศร้อนจัด"
            else -> "ไม่ทราบสภาพอากาศ"
        }

        private fun earthquakeSeverity(magnitude: Double): DisasterSeverity = when {
            magnitude >= 6.0 -> DisasterSeverity.VeryHigh
            magnitude >= 5.0 -> DisasterSeverity.High
            magnitude >= 4.0 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun fireRiskSeverity(
            confidence: Int,
            frp: Double,
            brightness: Double,
            fireAlarm: Int,
        ): DisasterSeverity = when {
            fireAlarm == 1 || (confidence >= 80 && frp >= 50 && brightness >= 350) -> DisasterSeverity.VeryHigh
            confidence >= 70 && frp >= 30 && brightness >= 320 -> DisasterSeverity.High
            confidence >= 50 && frp >= 15 && brightness >= 300 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun floodSeverity(area: Double): DisasterSeverity = when {
            area >= 1_000_000 -> DisasterSeverity.VeryHigh
            area >= 250_000 -> DisasterSeverity.High
            area >= 50_000 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun floodFrequencySeverity(freq: Int, areaRai: Double): DisasterSeverity = when {
            freq >= 5 || areaRai >= 1_000 -> DisasterSeverity.VeryHigh
            freq >= 3 || areaRai >= 250 -> DisasterSeverity.High
            freq >= 1 || areaRai >= 50 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun waterHyacinthSeverity(area: Double): DisasterSeverity = when {
            area >= 100_000 -> DisasterSeverity.VeryHigh
            area >= 25_000 -> DisasterSeverity.High
            area >= 5_000 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun droughtSeverity(risk: Int): DisasterSeverity = when {
            risk >= 80 -> DisasterSeverity.VeryHigh
            risk >= 60 -> DisasterSeverity.High
            risk >= 40 -> DisasterSeverity.Medium
            else -> DisasterSeverity.Low
        }

        private fun confidenceScore(raw: Any?): Int = when (raw) {
            is Number -> raw.toInt()
            "nominal",
            "high",
            -> 85
            "low" -> 40
            else -> 50
        }

        private fun formatEpoch(epochMillis: Long): String {
            if (epochMillis <= 0L) return ""
            return thaiFormatter.format(Instant.ofEpochMilli(epochMillis))
        }

        private fun JSONArray.optDoubleOrNull(index: Int): Double? {
            if (index < 0 || index >= length()) return null
            return opt(index)?.let { value ->
                when (value) {
                    is Number -> value.toDouble()
                    is String -> value.toDoubleOrNull()
                    else -> null
                }
            }
        }

        private fun JSONObject.optDoubleOrNull(name: String): Double? {
            if (!has(name) || isNull(name)) return null
            return when (val value = opt(name)) {
                is Number -> value.toDouble()
                is String -> value.toDoubleOrNull()
                else -> null
            }
        }

        private fun geometryCenter(coordinates: JSONArray?): Pair<Double, Double>? {
            val points = mutableListOf<Pair<Double, Double>>()
            collectCoordinatePairs(coordinates, points)
            if (points.isEmpty()) return null
            val lat = points.map { it.first }.average()
            val lon = points.map { it.second }.average()
            return lat to lon
        }

        private fun collectCoordinatePairs(node: Any?, points: MutableList<Pair<Double, Double>>) {
            if (node !is JSONArray) return
            if (node.length() >= 2 && node.opt(0) is Number && node.opt(1) is Number) {
                val lon = node.optDouble(0)
                val lat = node.optDouble(1)
                if (lat in -90.0..90.0 && lon in -180.0..180.0) {
                    points += lat to lon
                }
                return
            }
            for (index in 0 until node.length()) {
                collectCoordinatePairs(node.opt(index), points)
            }
        }
    }
}
