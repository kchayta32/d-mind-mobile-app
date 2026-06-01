package com.dmind.app.ui.screens.tools

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import com.dmind.app.data.map.PlaceInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

data class DailyForecastDetailData(
    val date: String,
    val maxTemp: Float,
    val minTemp: Float,
    val humidity: Float,
    val windSpeed: Float,
    val windDirection: Float,
    val rain: Float,
    val weatherCode: Int
)

data class LoadedDailyWeatherResult(
    val locationDisplayName: String,
    val sourceStatus: String,
    val forecasts: List<DailyForecastDetailData>
)

// หน้าจอแสดงการพยากรณ์สภาพอากาศรายสัปดาห์ (7 วัน) พร้อมแถบแสดงช่วงอุณหภูมิและข้อมูลละเอียดจาก TMD
@Composable
fun DailyWeatherForecastScreen(
    mapState: DisasterMapUiState,
) {
    val context = LocalContext.current
    var useGps by remember { mutableStateOf(true) }
    var manualProvince by remember { mutableStateOf("กรุงเทพมหานคร") }
    var manualAmphoe by remember { mutableStateOf("") }
    var manualTambon by remember { mutableStateOf("") }

    var locationName by remember { mutableStateOf("กรุงเทพมหานคร") }
    var weatherResult by remember { mutableStateOf<LoadedDailyWeatherResult?>(null) }
    var forecastLoading by remember { mutableStateOf(false) }
    var weatherLoaded by remember { mutableStateOf(false) }
    var refreshTrigger by remember { mutableStateOf(0) }

    LaunchedEffect(refreshTrigger, useGps) {
        forecastLoading = true
        withContext(Dispatchers.IO) {
            try {
                val result = fetchAndParseDailyWeather(
                    context = context,
                    province = manualProvince,
                    amphoe = manualAmphoe,
                    tambon = manualTambon,
                    useGps = useGps
                )
                withContext(Dispatchers.Main) {
                    locationName = result.locationDisplayName
                    weatherResult = result
                    weatherLoaded = true
                    forecastLoading = false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    forecastLoading = false
                }
            }
        }
    }

    val currentCondition = weatherResult?.forecasts?.firstOrNull()?.let { getTmdConditionType(it.weatherCode) } ?: WeatherConditionType.CLOUDY

    WeatherThemeBackground(condition = currentCondition) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding(),
            contentPadding = PaddingValues(bottom = 92.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ScreenHeader(
                    stringResource(R.string.weather_weekly_title),
                    stringResource(R.string.weather_weekly_subtitle),
                    Icons.Filled.CalendarMonth,
                )
            }

            // Location Search and Selector Bar
            item {
                LocationSelectorBar(
                    useGps = useGps,
                    onUseGpsChanged = { useGps = it },
                    province = manualProvince,
                    onProvinceChanged = { manualProvince = it },
                    amphoe = manualAmphoe,
                    onAmphoeChanged = { manualAmphoe = it },
                    tambon = manualTambon,
                    onTambonChanged = { manualTambon = it },
                    locationDisplayName = locationName,
                    onRefresh = { refreshTrigger++ }
                )
            }

            if (forecastLoading && !weatherLoaded) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Color.White)
                    }
                }
            } else if (!weatherLoaded || weatherResult == null || weatherResult!!.forecasts.isEmpty()) {
                item {
                    DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                        Text("ไม่สามารถโหลดข้อมูลสภาพอากาศได้", fontWeight = FontWeight.Bold)
                        Text("โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการตั้งค่าตำแหน่งของคุณ", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                val res = weatherResult!!
                val todayForecast = res.forecasts.firstOrNull()
                val minTempWeekly = res.forecasts.map { it.minTemp }.minOrNull() ?: 15f
                val maxTempWeekly = res.forecasts.map { it.maxTemp }.maxOrNull() ?: 40f

                // 1. Today Highlight Card
                if (todayForecast != null) {
                    val weatherInfo = getTmdEmojiAndLabel(todayForecast.weatherCode)
                    item {
                        GlassmorphicContainer(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 18.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "สภาพอากาศวันนี้",
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White.copy(alpha = 0.9f),
                                    fontSize = 12.sp
                                )
                                SourceBadge(status = res.sourceStatus)
                            }
                            Spacer(Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Row(verticalAlignment = Alignment.Bottom) {
                                        Text(
                                            text = "${todayForecast.maxTemp.toInt()}",
                                            fontSize = 56.sp,
                                            fontWeight = FontWeight.Black,
                                            color = Color.White
                                        )
                                        Text(
                                            text = "°C",
                                            fontSize = 24.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFFFB74D),
                                            modifier = Modifier.padding(bottom = 8.dp, start = 2.dp)
                                        )
                                        Text(
                                            text = "/ ${todayForecast.minTemp.toInt()}°C",
                                            fontSize = 16.sp,
                                            color = Color.White.copy(alpha = 0.6f),
                                            modifier = Modifier.padding(bottom = 8.dp, start = 8.dp)
                                        )
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = weatherInfo.first,
                                            fontSize = 32.sp
                                        )
                                        Spacer(Modifier.width(8.dp))
                                        Text(
                                            text = weatherInfo.second,
                                            color = Color.White,
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 18.sp
                                        )
                                    }
                                }
                            }

                            Spacer(Modifier.height(16.dp))

                            // Grid of weather details matching React today details
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        color = Color.Black.copy(alpha = 0.15f),
                                        shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp)
                                    )
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DetailCell(
                                        label = "ความชื้นสูงสุด",
                                        value = "${todayForecast.humidity.toInt()}%",
                                        icon = Icons.Filled.WaterDrop,
                                        tintColor = Color(0xFF26C6DA)
                                    )
                                    DetailCell(
                                        label = "ทิศทางลมหลัก",
                                        value = "${getWindDirectionLabel(todayForecast.windDirection)} (${todayForecast.windDirection.toInt()}°)",
                                        icon = Icons.Filled.Send,
                                        tintColor = Color(0xFFFFB74D),
                                        rotation = todayForecast.windDirection - 90f
                                    )
                                }
                                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    DetailCell(
                                        label = "ความเร็วลมสูงสุด",
                                        value = "${todayForecast.windSpeed.formatOne()} m/s",
                                        icon = Icons.Filled.Air,
                                        tintColor = Color(0xFF26A69A)
                                    )
                                    DetailCell(
                                        label = "น้ำฝนสะสม 24 ชม.",
                                        value = "${todayForecast.rain.formatOne()} มม.",
                                        icon = Icons.Filled.Cloud,
                                        tintColor = Color(0xFF42A5F5)
                                    )
                                }
                            }
                        }
                    }
                }

                // 2. Remaining 6 Days list
                item {
                    Text(
                        text = "แนวโน้มสภาพอากาศรายวันล่วงหน้า",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 4.dp)
                    )
                }

                val remainingDays = res.forecasts.drop(1)
                items(remainingDays) { dayData ->
                    val dayOfWeek = getDayName(dayData.date)
                    val weatherInfo = getTmdEmojiAndLabel(dayData.weatherCode)

                    GlassmorphicContainer(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.width(90.dp)) {
                                Text(
                                    text = dayOfWeek,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = formatSimpleThaiDate(dayData.date),
                                    fontSize = 10.sp,
                                    color = Color.White.copy(alpha = 0.5f)
                                )
                            }

                            Text(
                                text = weatherInfo.first,
                                fontSize = 24.sp,
                                modifier = Modifier.width(36.dp)
                            )

                            Text(
                                text = "${dayData.minTemp.toInt()}°",
                                fontSize = 13.sp,
                                color = Color.White.copy(alpha = 0.7f),
                                modifier = Modifier.width(28.dp),
                                fontWeight = FontWeight.Medium
                            )

                            TempRangeTrack(
                                minTemp = dayData.minTemp,
                                maxTemp = dayData.maxTemp,
                                minTempWeekly = minTempWeekly,
                                maxTempWeekly = maxTempWeekly,
                                modifier = Modifier
                                    .weight(1f)
                                    .height(24.dp)
                                    .padding(horizontal = 8.dp)
                            )

                            Text(
                                text = "${dayData.maxTemp.toInt()}°",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.width(28.dp),
                                color = Color.White
                            )
                        }

                        // Detailed inline stats for other days matching TS other days grid
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text(
                                text = "💧 ชื้น: ${dayData.humidity.toInt()}%",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                            Text(
                                text = "💨 ลม: ${dayData.windSpeed.formatOne()} m/s",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                            if (dayData.rain > 0f) {
                                Text(
                                    text = "🌧️ ฝน: ${dayData.rain.formatOne()} มม.",
                                    fontSize = 11.sp,
                                    color = Color(0xFF64B5F6),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailCell(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    tintColor: Color,
    rotation: Float = 0f
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(28.dp)
                .background(tintColor.copy(alpha = 0.15f), shape = androidx.compose.foundation.shape.CircleShape),
            contentAlignment = Alignment.Center
        ) {
            androidx.compose.material3.Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tintColor,
                modifier = Modifier
                    .size(16.dp)
                    .rotate(rotation)
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(label, fontSize = 9.sp, color = Color.White.copy(alpha = 0.5f))
            Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}

fun formatSimpleThaiDate(dateStr: String): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val d = sdf.parse(dateStr)
        val outSdf = SimpleDateFormat("d MMM", Locale("th", "TH"))
        if (d != null) outSdf.format(d) else dateStr
    } catch (e: Exception) {
        dateStr
    }
}

fun getTmdConditionType(code: Int): WeatherConditionType {
    return when (code) {
        1 -> WeatherConditionType.SUNNY
        2, 3, 4 -> WeatherConditionType.CLOUDY
        5 -> WeatherConditionType.RAINY
        6, 7 -> WeatherConditionType.RAINY
        8 -> WeatherConditionType.STORM
        9, 10, 11 -> WeatherConditionType.COLD
        12 -> WeatherConditionType.SUNNY
        else -> WeatherConditionType.CLOUDY
    }
}

suspend fun fetchAndParseDailyWeather(
    context: android.content.Context,
    province: String? = null,
    amphoe: String? = null,
    tambon: String? = null,
    useGps: Boolean = true
): LoadedDailyWeatherResult {
    val coords = if (useGps) {
        withTimeoutOrNull(2500) { getUserLocation(context) } ?: Pair(13.7563, 100.5018)
    } else {
        getProvinceCoords(province ?: "กรุงเทพมหานคร")
    }

    val resolvedProvince: String
    val resolvedAmphoe: String?
    val resolvedTambon: String?

    if (useGps) {
        val placeInfo = runCatching {
            val repo = com.dmind.app.data.map.DisasterMapRepository(context)
            repo.getPlaceInfoForCoords(coords.first, coords.second)
        }.getOrElse {
            PlaceInfo(province = "กรุงเทพมหานคร", amphoe = "เขตปทุมวัน", tambon = "ลุมพินี")
        }
        resolvedProvince = placeInfo.province
        resolvedAmphoe = placeInfo.amphoe
        resolvedTambon = placeInfo.tambon
    } else {
        resolvedProvince = province ?: "กรุงเทพมหานคร"
        resolvedAmphoe = amphoe
        resolvedTambon = tambon
    }

    val responseTextResult = runCatching {
        val client = com.dmind.app.network.BackendRestClient()
        client.fetchWeatherByPlace(
            province = resolvedProvince,
            amphoe = resolvedAmphoe,
            tambon = resolvedTambon,
            latitude = coords.first,
            longitude = coords.second,
            duration = 7,
            daily = true
        )
    }

    if (responseTextResult.isSuccess) {
        val responseText = responseTextResult.getOrThrow()
        try {
            val responseJson = JSONObject(responseText)
            if (responseJson.optString("status") != "error") {
                val sourceStatusVal = responseJson.optString("status", "ok")
                val dataObj = responseJson.optJSONObject("data") ?: responseJson
                val rootForecast = dataObj.optJSONArray("WeatherForecasts")?.optJSONObject(0)
                val forecasts = rootForecast?.optJSONArray("forecasts") ?: JSONArray()

                if (forecasts.length() > 0) {
                    val dailyList = mutableListOf<DailyForecastDetailData>()
                    for (i in 0 until forecasts.length()) {
                        val item = forecasts.optJSONObject(i) ?: continue
                        val timeStr = item.optString("time")
                        val dateStr = timeStr.substringBefore("T")
                        val data = item.optJSONObject("data") ?: continue

                        val maxT = data.optDouble("tc_max", 30.0).toFloat()
                        val minT = data.optDouble("tc_min", 25.0).toFloat()
                        val rh = data.optDouble("rh", 60.0).toFloat()
                        val rain = data.optDouble("rain", 0.0).toFloat()
                        val ws = data.optDouble("ws10m", 0.0).toFloat()
                        val wd = data.optDouble("wd10m", 0.0).toFloat()
                        val cond = data.optInt("cond", 1)

                        dailyList.add(
                            DailyForecastDetailData(
                                date = dateStr,
                                maxTemp = maxT,
                                minTemp = minT,
                                humidity = rh,
                                windSpeed = ws,
                                windDirection = wd,
                                rain = rain,
                                weatherCode = cond
                            )
                        )
                    }

                    val locObj = rootForecast?.optJSONObject("location")
                    val finalProvince = locObj?.optString("province")?.takeIf { it.isNotBlank() } ?: resolvedProvince
                    val finalAmphoe = locObj?.optString("amphoe")?.takeIf { it.isNotBlank() } ?: resolvedAmphoe
                    val finalTambon = locObj?.optString("tambon")?.takeIf { it.isNotBlank() } ?: resolvedTambon

                    val dispName = listOfNotNull(finalTambon, finalAmphoe, finalProvince)
                        .filter { it.isNotBlank() }
                        .joinToString(", ")

                    return LoadedDailyWeatherResult(
                        locationDisplayName = dispName,
                        sourceStatus = sourceStatusVal,
                        forecasts = dailyList
                    )
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Fallback: fetch Open-Meteo daily
    return runCatching {
        fetchDailyFromOpenMeteoFallback(coords.first, coords.second, resolvedProvince, resolvedAmphoe, resolvedTambon)
    }.getOrElse { err ->
        err.printStackTrace()
        val dispName = listOfNotNull(resolvedTambon, resolvedAmphoe, resolvedProvince)
            .filter { it.isNotBlank() }
            .joinToString(", ")
        LoadedDailyWeatherResult(
            locationDisplayName = "$dispName (ไม่มีข้อมูลการเชื่อมต่อ)",
            sourceStatus = "fallback",
            forecasts = emptyList()
        )
    }
}

private fun fetchDailyFromOpenMeteoFallback(
    lat: Double,
    lon: Double,
    province: String,
    amphoe: String?,
    tambon: String?
): LoadedDailyWeatherResult {
    val urlStr = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m&forecast_days=7&timezone=Asia%2FBangkok"
    val connection = (URL(urlStr).openConnection() as HttpURLConnection).apply {
        requestMethod = "GET"
        connectTimeout = 15_000
        readTimeout = 30_000
        setRequestProperty("Accept", "application/json")
    }

    val responseText = try {
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val res = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
        if (code !in 200..299) {
            throw IllegalStateException("Open-Meteo HTTP $code: $res")
        }
        res
    } finally {
        connection.disconnect()
    }

    val responseJson = JSONObject(responseText)
    val hourly = responseJson.getJSONObject("hourly")
    val timesJson = hourly.getJSONArray("time")
    val temp2m = hourly.getJSONArray("temperature_2m")
    val rh2m = hourly.getJSONArray("relative_humidity_2m")
    val wmoCodes = hourly.getJSONArray("weather_code")
    val precipitation = hourly.getJSONArray("precipitation")
    val windSpeed10m = hourly.getJSONArray("wind_speed_10m")
    val windDirection10m = hourly.getJSONArray("wind_direction_10m")

    val dailyMap = mutableMapOf<String, MutableList<Int>>()
    for (i in 0 until timesJson.length()) {
        val tStr = timesJson.optString(i)
        val dateStr = tStr.substringBefore("T")
        if (dateStr.isBlank()) continue
        dailyMap.getOrPut(dateStr) { mutableListOf() }.add(i)
    }

    val dailyList = dailyMap.map { (date, indices) ->
        val temps = indices.map { temp2m.optDouble(it, 0.0).toFloat() }
        val minT = temps.minOrNull() ?: 25f
        val maxT = temps.maxOrNull() ?: 35f

        val rhs = indices.map { rh2m.optDouble(it, 0.0).toFloat() }
        val rh = if (rhs.isNotEmpty()) rhs.average().toFloat() else 60f

        val rains = indices.map { precipitation.optDouble(it, 0.0).toFloat() }
        val rain = rains.sum()

        val windSpeeds = indices.map { (windSpeed10m.optDouble(it, 0.0) / 3.6).toFloat() }
        val windS = if (windSpeeds.isNotEmpty()) windSpeeds.maxOrNull() ?: 0f else 0f

        val windDirections = indices.map { windDirection10m.optDouble(it, 0.0).toFloat() }
        val windD = if (windDirections.isNotEmpty()) windDirections.average().toFloat() else 0f

        val codes = indices.map { wmoCodes.optInt(it, 0) }
        val mostCommonCode = codes.groupBy { it }.maxByOrNull { it.value.size }?.key ?: 0
        val cond = mapWmoToTmdCode(mostCommonCode)

        DailyForecastDetailData(
            date = date,
            maxTemp = maxT,
            minTemp = minT,
            humidity = rh,
            windSpeed = windS,
            windDirection = windD,
            rain = rain,
            weatherCode = cond
        )
    }.sortedBy { it.date }

    val dispName = listOfNotNull(tambon, amphoe, province)
        .filter { it.isNotBlank() }
        .joinToString(", ")

    return LoadedDailyWeatherResult(
        locationDisplayName = dispName,
        sourceStatus = "fallback",
        forecasts = dailyList
    )
}

private fun Float.formatOne(): String = String.format(Locale.US, "%.1f", this)
