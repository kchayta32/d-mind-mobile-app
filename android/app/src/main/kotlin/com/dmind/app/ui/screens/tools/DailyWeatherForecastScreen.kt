package com.dmind.app.ui.screens.tools

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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// หน้าจอแสดงการพยากรณ์สภาพอากาศรายสัปดาห์ (7 วัน) พร้อมแถบแสดงช่วงอุณหภูมิ
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
    var weatherResult by remember { mutableStateOf<LoadedWeatherResult?>(null) }
    var forecastLoading by remember { mutableStateOf(false) }
    var weatherLoaded by remember { mutableStateOf(false) }
    var refreshTrigger by remember { mutableStateOf(0) }

    LaunchedEffect(refreshTrigger, useGps) {
        forecastLoading = true
        withContext(Dispatchers.IO) {
            try {
                val result = fetchAndParseWeather(
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

    val currentCondition = weatherResult?.let { getConditionTypeFromEmoji(it.conditionEmoji) } ?: WeatherConditionType.CLOUDY

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
                    Icons.Filled.Cloud,
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
            } else if (!weatherLoaded || weatherResult == null) {
                item {
                    DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                        Text("ไม่สามารถโหลดข้อมูลสภาพอากาศได้", fontWeight = FontWeight.Bold)
                        Text("โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการตั้งค่าตำแหน่งของคุณ", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                val res = weatherResult!!
                val minTempWeekly = res.daily.map { it.minTemp }.minOrNull() ?: 15f
                val maxTempWeekly = res.daily.map { it.maxTemp }.maxOrNull() ?: 40f

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
                                text = "7-Day Forecast for $locationName",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White
                            )
                            SourceBadge(status = res.sourceStatus)
                        }
                        Spacer(Modifier.height(8.dp))
                        
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            res.daily.forEach { dayData ->
                                val dayOfWeek = getDayName(dayData.date)
                                val weatherInfo = getTmdEmojiAndLabel(dayData.weatherCode)

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = dayOfWeek,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier.width(90.dp),
                                        fontSize = 14.sp,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        color = Color.White
                                    )

                                    Text(
                                        text = weatherInfo.first,
                                        fontSize = 20.sp,
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
                            }
                        }
                    }
                }
            }
        }
    }
}
