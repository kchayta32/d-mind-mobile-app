package com.dmind.app.ui.screens.tools

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.data.supabase.DamageAssessmentRecord
import com.dmind.app.domain.model.HazardType
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.EmptyState
import com.dmind.app.ui.components.IconBubble
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.components.StatusPill
import com.dmind.app.ui.viewmodel.DamageAssessmentUiState
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import androidx.compose.runtime.rememberCoroutineScope
import com.dmind.app.network.BackendRestClient
import com.dmind.app.data.map.DisasterMapRepository
import com.dmind.app.data.map.PlaceInfo
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

// หน้าจอแสดงเบอร์โทรศัพท์ฉุกเฉินและการโทรติดต่อหน่วยงานต่างๆ
@Composable
fun EmergencyContactsScreen() {
    val context = LocalContext.current
    val contacts = listOf(
        EmergencyContact(stringResource(R.string.contact_police), "191", stringResource(R.string.contact_police_desc)),
        EmergencyContact(stringResource(R.string.contact_medical), "1669", stringResource(R.string.contact_medical_desc)),
        EmergencyContact(stringResource(R.string.contact_disaster), "1784", stringResource(R.string.contact_disaster_desc)),
        EmergencyContact(stringResource(R.string.contact_fire), "199", stringResource(R.string.contact_fire_desc)),
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.emergency_contacts_title),
                stringResource(R.string.emergency_contacts_subtitle),
                Icons.Filled.Phone,
            )
        }
        items(contacts) { contact ->
            DmindCard(
                modifier = Modifier
                    .padding(horizontal = 18.dp)
                    .clickable {
                        context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${contact.phone}")))
                    },
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Filled.Phone, CriticalRed)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(contact.name, fontWeight = FontWeight.Bold)
                        Text(contact.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    StatusPill(contact.phone, CriticalRed)
                }
            }
        }
    }
}

// หน้าจอแสดงคู่มือการรับมือภัยพิบัติฉุกเฉินประเภทต่างๆ
@Composable
fun EmergencyManualScreen() {
    val guides = listOf(
        GuideCard(stringResource(R.string.manual_earthquake), Icons.Filled.Warning, stringResource(R.string.manual_earthquake_guide), CriticalRed),
        GuideCard(stringResource(R.string.manual_flood), Icons.Filled.WaterDrop, stringResource(R.string.manual_flood_guide), DmindBlue),
        GuideCard(stringResource(R.string.manual_storm), Icons.Filled.Cloud, stringResource(R.string.manual_storm_guide), AffectedOrange),
        GuideCard(stringResource(R.string.manual_fire), Icons.Filled.LocalFireDepartment, stringResource(R.string.manual_fire_guide), CriticalRed),
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.manual_title),
                stringResource(R.string.manual_subtitle),
                Icons.Filled.Shield,
            )
        }
        items(guides) { guide ->
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(guide.icon, guide.color)
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(guide.title, fontWeight = FontWeight.Bold)
                        Text(guide.body, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

// หน้าจอแสดงข้อมูลสภาพอากาศปัจจุบัน รายละเอียดสถิติ และการพยากรณ์ล่วงหน้า
@Composable
fun WeatherOverviewScreen(
    mapState: DisasterMapUiState,
) {
    val context = LocalContext.current
    var locationName by remember { mutableStateOf("กรุงเทพมหานคร") }
    var currentTemp by remember { mutableStateOf(0f) }
    var currentHumidity by remember { mutableStateOf(0f) }
    var currentRain by remember { mutableStateOf(0f) }
    var currentWindSpeed by remember { mutableStateOf(0f) }
    var currentWindDirection by remember { mutableStateOf(0f) }
    var currentCloudCover by remember { mutableStateOf(0) }
    var currentPressure by remember { mutableStateOf(1012f) }
    var conditionLabel by remember { mutableStateOf("") }
    var conditionEmoji by remember { mutableStateOf("☁️") }

    var hourlyForecast by remember { mutableStateOf<List<HourlyForecastData>>(emptyList()) }
    var dailyForecast by remember { mutableStateOf<List<DailyForecastData>>(emptyList()) }
    var forecastLoading by remember { mutableStateOf(false) }
    var weatherLoaded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        forecastLoading = true
        withContext(Dispatchers.IO) {
            try {
                val result = fetchAndParseWeather(context)
                withContext(Dispatchers.Main) {
                    locationName = result.locationDisplayName
                    currentTemp = result.currentTemp
                    currentHumidity = result.currentHumidity
                    currentRain = result.currentRain
                    currentWindSpeed = result.currentWindSpeed
                    currentWindDirection = result.windDirection
                    currentCloudCover = result.cloudCover
                    currentPressure = result.pressure
                    conditionLabel = result.conditionLabel
                    conditionEmoji = result.conditionEmoji
                    hourlyForecast = result.hourly
                    dailyForecast = result.daily
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

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.weather_title),
                stringResource(R.string.weather_subtitle),
                Icons.Filled.Cloud,
            )
        }

        if (forecastLoading && !weatherLoaded) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
        } else if (!weatherLoaded) {
            item {
                DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                    Text("ไม่สามารถโหลดข้อมูลสภาพอากาศได้", fontWeight = FontWeight.Bold)
                    Text("โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการตั้งค่าตำแหน่งของคุณ", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            // Hero Current Weather Card
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f)
                    ),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = locationName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "${currentTemp.toInt()}°",
                                style = MaterialTheme.typography.displayLarge.copy(
                                    fontWeight = FontWeight.Black,
                                    fontSize = 72.sp
                                )
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = conditionEmoji,
                                fontSize = 48.sp
                            )
                        }
                        Text(
                            text = conditionLabel,
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // 2x3 statistics grid
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Temperature
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.Thermostat,
                                    contentDescription = null,
                                    tint = AffectedOrange,
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Temperature", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${currentTemp.toInt()} °C", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                        // Rainfall
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.WaterDrop,
                                    contentDescription = null,
                                    tint = DmindBlue,
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Rainfall", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("%.1f mm".format(currentRain), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Humidity
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.WaterDrop,
                                    contentDescription = null,
                                    tint = Color(0xFF00ACC1),
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Humidity", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${currentHumidity.toInt()}%", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                        // Cloud Cover
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.Cloud,
                                    contentDescription = null,
                                    tint = Color(0xFF78909C),
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Cloud Cover", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${currentCloudCover}%", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Wind Speed & Direction
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.Air,
                                    contentDescription = null,
                                    tint = SafeGreen,
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Wind Speed", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    val dirLabel = getWindDirectionLabel(currentWindDirection)
                                    Text("${currentWindSpeed} m/s ($dirLabel)", fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                            }
                        }
                        // Pressure
                        GlassmorphicCard(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                Icon(
                                    imageVector = Icons.Filled.HealthAndSafety,
                                    contentDescription = null,
                                    tint = Color(0xFFFFA726),
                                    modifier = Modifier.size(28.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text("Pressure", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("${currentPressure.toInt()} hPa", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                }
            }

            // Weather Trend Chart
            item {
                DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                    Text(
                        text = "24-Hour Forecast & Humidity Trend",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleSmall
                    )
                    Spacer(Modifier.height(8.dp))
                    WeatherTrendChart(hourlyForecast = hourlyForecast)
                }
            }
        }

        // Storm/Heat events below the chart
        items(mapState.snapshot.events.filter { it.type == HazardType.Storm || it.type == HazardType.Heat }.take(6)) { event ->
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (event.type == HazardType.Storm) Icons.Filled.Cloud else Icons.Filled.Warning,
                        contentDescription = null,
                        tint = if (event.type == HazardType.Storm) DmindBlue else AffectedOrange,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(event.title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Text(event.recommendedAction, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

// หน้าจอแสดงการพยากรณ์สภาพอากาศรายสัปดาห์ (7 วัน) พร้อมแถบแสดงช่วงอุณหภูมิ
@Composable
fun WeeklyForecastScreen(
    mapState: DisasterMapUiState,
) {
    val context = LocalContext.current
    var locationName by remember { mutableStateOf("กรุงเทพมหานคร") }
    var hourlyForecast by remember { mutableStateOf<List<HourlyForecastData>>(emptyList()) }
    var dailyForecast by remember { mutableStateOf<List<DailyForecastData>>(emptyList()) }
    var forecastLoading by remember { mutableStateOf(false) }
    var weatherLoaded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        forecastLoading = true
        withContext(Dispatchers.IO) {
            try {
                val result = fetchAndParseWeather(context)
                withContext(Dispatchers.Main) {
                    locationName = result.locationDisplayName
                    hourlyForecast = result.hourly
                    dailyForecast = result.daily
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

    val minTempWeekly = dailyForecast.map { it.minTemp }.minOrNull() ?: 15f
    val maxTempWeekly = dailyForecast.map { it.maxTemp }.maxOrNull() ?: 40f

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.weather_weekly_title),
                stringResource(R.string.weather_weekly_subtitle),
                Icons.Filled.Cloud,
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
                    CircularProgressIndicator()
                }
            }
        } else if (!weatherLoaded) {
            item {
                DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                    Text("ไม่สามารถโหลดข้อมูลสภาพอากาศได้", fontWeight = FontWeight.Bold)
                    Text("โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือการตั้งค่าตำแหน่งของคุณ", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            item {
                DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                    Text(
                        text = "7-Day Forecast for $locationName",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(Modifier.height(8.dp))
                    
                    Column(
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        dailyForecast.forEach { dayData ->
                            val dayOfWeek = getDayName(dayData.date)
                            val weatherInfo = getTmdEmojiAndLabel(dayData.weatherCode)

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Day Name
                                Text(
                                    text = dayOfWeek,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.width(90.dp),
                                    fontSize = 14.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )

                                // Weather Emoji
                                Text(
                                    text = weatherInfo.first,
                                    fontSize = 20.sp,
                                    modifier = Modifier.width(36.dp)
                                )

                                // Min Temp label
                                Text(
                                    text = "${dayData.minTemp.toInt()}°",
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.width(28.dp),
                                    fontWeight = FontWeight.Medium
                                )

                                // Embed the custom TempRangeTrack
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

                                // Max Temp label
                                Text(
                                    text = "${dayData.maxTemp.toInt()}°",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.width(28.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// หน้าจอประเมินความเสียหายจากภาพถ่ายภัยพิบัติ พร้อมส่งวิเคราะห์และประวัติการประเมิน
@Composable
fun DamageAssessmentScreen(
    state: DamageAssessmentUiState,
    onUpload: (fileName: String, contentType: String, bytes: ByteArray) -> Unit,
    onDelete: (id: String) -> Unit,
    onRefresh: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var imageUri by remember { mutableStateOf<Uri?>(null) }
    var imageBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var selectedBitmap by remember { mutableStateOf<Bitmap?>(null) }

    LaunchedEffect(imageUri) {
        selectedBitmap = imageUri?.let { uri ->
            withContext(Dispatchers.IO) {
                loadBitmapFromUri(context, uri)
            }
        }
    }

    val pickMediaLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            imageUri = uri
            imageBitmap = null
        }
    }

    val takePhotoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap ->
        if (bitmap != null) {
            imageBitmap = bitmap
            imageUri = null
        }
    }

    LaunchedEffect(Unit) {
        onRefresh()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 92.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenHeader(
                stringResource(R.string.damage_title),
                stringResource(R.string.damage_subtitle),
                Icons.Filled.CameraAlt,
            )
        }

        // Action card to select photo and trigger analysis
        item {
            DmindCard(modifier = Modifier.padding(horizontal = 18.dp)) {
                Text(
                    text = stringResource(R.string.damage_workflow_title),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
                Text(
                    text = stringResource(R.string.damage_workflow_message),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )

                Spacer(Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            pickMediaLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                            )
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    ) {
                        Icon(Icons.Filled.PhotoLibrary, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.btn_gallery))
                    }
                    Button(
                        onClick = { takePhotoLauncher.launch(null) },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                        )
                    ) {
                        Icon(Icons.Filled.CameraAlt, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.btn_camera))
                    }
                }

                // Image Preview
                if (imageUri != null || imageBitmap != null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        if (imageUri != null) {
                            if (selectedBitmap != null) {
                                Image(
                                    bitmap = selectedBitmap!!.asImageBitmap(),
                                    contentDescription = "Selected Image",
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                CircularProgressIndicator()
                            }
                        } else if (imageBitmap != null) {
                            Image(
                                bitmap = imageBitmap!!.asImageBitmap(),
                                contentDescription = "Captured Image",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }

                        // Close button to remove image
                        IconButton(
                            onClick = {
                                imageUri = null
                                imageBitmap = null
                            },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(8.dp)
                                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        ) {
                            Icon(Icons.Filled.Close, contentDescription = "Remove Image", tint = Color.White)
                        }
                    }

                    Button(
                        onClick = {
                            scope.launch {
                                val bytes = try {
                                    withContext(Dispatchers.IO) {
                                        if (imageUri != null) {
                                            val originalBitmap = selectedBitmap ?: loadBitmapFromUri(context, imageUri!!)
                                            if (originalBitmap != null) {
                                                val resized = resizeBitmap(originalBitmap, 1024)
                                                bitmapToBytes(resized)
                                            } else null
                                        } else if (imageBitmap != null) {
                                            val resized = resizeBitmap(imageBitmap!!, 1024)
                                            bitmapToBytes(resized)
                                        } else null
                                    }
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                    null
                                }

                                if (bytes != null) {
                                    val fileName = "assessment_${System.currentTimeMillis()}.jpg"
                                    onUpload(fileName, "image/jpeg", bytes)
                                    imageUri = null
                                    imageBitmap = null
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !state.isUploading,
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        if (state.isUploading) {
                            CircularProgressIndicator(modifier = Modifier.padding(end = 10.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Filled.Send, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                        }
                        Text(stringResource(R.string.btn_analyze_damage))
                    }
                }

                if (!state.errorMessage.isNullOrBlank()) {
                    Text(
                        text = state.errorMessage,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Assessments Title
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = stringResource(R.string.damage_assessment_history),
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                IconButton(onClick = onRefresh, enabled = !state.isLoading) {
                    Icon(Icons.Filled.Refresh, contentDescription = "Refresh")
                }
            }
        }

        if (state.isLoading) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                }
            }
        } else if (state.assessments.isEmpty()) {
            item {
                EmptyState(
                    title = stringResource(R.string.no_assessments),
                    message = stringResource(R.string.no_assessments_message),
                    icon = Icons.Filled.CameraAlt
                )
            }
        } else {
            items(state.assessments, key = { it.id }) { record ->
                DamageAssessmentCard(
                    record = record,
                    onDelete = onDelete,
                    modifier = Modifier.padding(horizontal = 18.dp)
                )
            }
        }
    }
}

// ส่วนแสดงการ์ดรายการข้อมูลประเมินความเสียหายแต่ละรายการ
@Composable
private fun DamageAssessmentCard(
    record: DamageAssessmentRecord,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val levelColor = when (record.damageLevel?.lowercase()) {
        "high", "critical" -> CriticalRed
        "medium", "moderate" -> AffectedOrange
        "low", "minor" -> SafeGreen
        else -> DmindBlue
    }

    DmindCard(modifier = modifier, contentPadding = PaddingValues(12.dp)) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.Top) {
                NetworkImage(
                    url = record.imageUrl,
                    contentDescription = "Damage Image",
                    modifier = Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    val category = record.detectedCategories.joinToString(", ").ifBlank {
                        stringResource(R.string.damage_general)
                    }
                    Text(
                        text = category,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        record.damageLevel?.let {
                            StatusPill(it, levelColor)
                        }
                        record.confidenceScore?.let {
                            Text(
                                text = "%.0f%%".format(it * 100),
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    if (record.processingStatus == "processing") {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(modifier = Modifier.size(12.dp), strokeWidth = 1.dp)
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = stringResource(R.string.status_processing),
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        val resultText = record.assessmentResult ?: record.errorMessage ?: ""
                        if (resultText.isNotBlank()) {
                            Text(
                                text = resultText,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }

            IconButton(
                onClick = { onDelete(record.id) },
                modifier = Modifier.align(Alignment.TopEnd)
            ) {
                Icon(
                    imageVector = Icons.Filled.Delete,
                    contentDescription = "Delete",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

// แคชสำหรับเก็บรูปภาพเพื่อเพิ่มประสิทธิภาพในการโหลดซ้ำ
private val imageCache = java.util.concurrent.ConcurrentHashMap<String, Bitmap>()

// คอมโพสเซเบิลสำหรับโหลดและแสดงรูปภาพจากอินเทอร์เน็ต
@Composable
private fun NetworkImage(
    url: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    var bitmap by remember(url) { mutableStateOf<Bitmap?>(imageCache[url]) }
    var isLoading by remember(url) { mutableStateOf(bitmap == null) }

    LaunchedEffect(url) {
        if (bitmap != null) {
            isLoading = false
            return@LaunchedEffect
        }
        isLoading = true
        bitmap = try {
            withContext(Dispatchers.IO) {
                val connection = java.net.URL(url).openConnection() as java.net.HttpURLConnection
                connection.doInput = true
                connection.connect()
                val input = connection.inputStream
                val bmp = BitmapFactory.decodeStream(input)
                if (bmp != null) {
                    imageCache[url] = bmp
                }
                bmp
            }
        } catch (e: Exception) {
            null
        }
        isLoading = false
    }

    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        if (isLoading) {
            CircularProgressIndicator(modifier = Modifier.size(24.dp))
        } else {
            val bmp = bitmap
            if (bmp != null) {
                Image(
                    bitmap = bmp.asImageBitmap(),
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = contentScale
                )
            } else {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = "Failed to load image",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

// โหลดรูปภาพ Bitmap จาก Uri ของอุปกรณ์
private fun loadBitmapFromUri(context: android.content.Context, uri: android.net.Uri): android.graphics.Bitmap? {
    return try {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            val source = android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
            android.graphics.ImageDecoder.decodeBitmap(source)
        } else {
            @Suppress("DEPRECATION")
            android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
        }
    } catch (e: Exception) {
        null
    }
}

// ปรับขนาดรูปภาพ Bitmap เพื่อให้ไม่เกินขนาดที่กำหนดและประหยัดการใช้หน่วยความจำ
private fun resizeBitmap(bitmap: android.graphics.Bitmap, maxDimension: Int): android.graphics.Bitmap {
    val width = bitmap.width
    val height = bitmap.height
    val newWidth: Int
    val newHeight: Int
    if (width > height) {
        newWidth = maxDimension
        newHeight = (height * (maxDimension.toDouble() / width.toDouble())).toInt()
    } else {
        newHeight = maxDimension
        newWidth = (width * (maxDimension.toDouble() / height.toDouble())).toInt()
    }
    return android.graphics.Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true)
}

// แปลงรูปภาพ Bitmap เป็นอาเรย์ของไบต์ในรูปแบบ JPEG เพื่อส่งอัปโหลด
private fun bitmapToBytes(bitmap: android.graphics.Bitmap): ByteArray {
    val stream = java.io.ByteArrayOutputStream()
    bitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 90, stream)
    return stream.toByteArray()
}

// โครงสร้างข้อมูลสำหรับเบอร์ติดต่อฉุกเฉิน
private data class EmergencyContact(
    val name: String,
    val phone: String,
    val description: String,
)

// โครงสร้างข้อมูลสำหรับคู่มือภัยพิบัติ
private data class GuideCard(
    val title: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val body: String,
    val color: androidx.compose.ui.graphics.Color,
)

// โครงสร้างข้อมูลสภาพอากาศรายชั่วโมงและรายวัน
data class HourlyForecastData(val time: String, val temp: Float, val rainProbability: Int)
data class DailyForecastData(val date: String, val minTemp: Float, val maxTemp: Float, val weatherCode: Int)

// ฟังก์ชันช่วยหาพิกัดละติจูดและลองจิจูดจากชื่อจังหวัด
fun getCoordsForLocation(locationName: String): Pair<Double, Double> {
    val name = locationName.trim().lowercase()
    return when {
        name.contains("เชียงใหม่") || name.contains("chiang mai") || name.contains("chiangmai") -> Pair(18.7883, 98.9853)
        name.contains("ภูเก็ต") || name.contains("phuket") -> Pair(7.8804, 98.3922)
        name.contains("ชลบุรี") || name.contains("chonburi") || name.contains("chon buri") -> Pair(13.3611, 100.9847)
        name.contains("นครราชสีมา") || name.contains("nakhon ratchasima") || name.contains("korat") -> Pair(14.9738, 102.0836)
        name.contains("ขอนแก่น") || name.contains("khon kaen") || name.contains("khonkaen") -> Pair(16.4322, 102.8236)
        name.contains("สงขลา") || name.contains("songkhla") || name.contains("หาดใหญ่") || name.contains("hat yai") || name.contains("hatyai") -> Pair(7.1898, 100.5954)
        name.contains("สุราษฎร์ธานี") || name.contains("surat thani") || name.contains("suratthani") -> Pair(9.1382, 99.3278)
        name.contains("กระบี่") || name.contains("krabi") -> Pair(8.0857, 98.9067)
        name.contains("อุดรธานี") || name.contains("udon thani") || name.contains("udonthani") -> Pair(17.4138, 102.7855)
        else -> Pair(13.7563, 100.5018) // Bangkok
    }
}

// ฟังก์ชันแปลงรหัสสภาพอากาศ WMO เป็นสัญลักษณ์อีโมจิและข้อความคำอธิบายภาษาอังกฤษ
fun getWeatherInfoForCode(code: Int): Pair<String, String> {
    return when (code) {
        0 -> Pair("☀️", "Clear Sky")
        1, 2, 3 -> Pair("🌤️", "Partly Cloudy")
        45, 48 -> Pair("🌫️", "Fog")
        51, 53, 55 -> Pair("🌧️", "Drizzle")
        56, 57 -> Pair("🌧️", "Freezing Drizzle")
        61, 63, 65 -> Pair("🌧️", "Rain")
        66, 67 -> Pair("🌧️", "Freezing Rain")
        71, 73, 75 -> Pair("🌨️", "Snow")
        77 -> Pair("🌨️", "Snow Grains")
        80, 81, 82 -> Pair("🌦️", "Showers")
        85, 86 -> Pair("🌨️", "Snow Showers")
        95 -> Pair("⛈️", "Thunderstorm")
        96, 99 -> Pair("⛈️", "Thunderstorm Hail")
        else -> Pair("☁️", "Cloudy")
    }
}

// ฟังก์ชันแปลงองศาทิศทางลมเป็นทิศทางแบบตัวอักษรย่อภาษาอังกฤษ
fun getWindDirectionLabel(degrees: Float): String {
    val directions = listOf("N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW")
    val index = (((degrees + 11.25) / 22.5).toInt() % 16).let { if (it < 0) it + 16 else it }
    return directions[index]
}

// ฟังก์ชันจัดรูปแบบวันในรอบสัปดาห์จากสตริงวันที่ในรูปแบบไทย
fun getDayName(dateStr: String): String {
    return try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
        val d = sdf.parse(dateStr)
        val dayFormat = java.text.SimpleDateFormat("EEEE", java.util.Locale("th", "TH"))
        if (d != null) {
            val formatted = dayFormat.format(d)
            if (formatted.startsWith("วัน")) formatted.substring(3) else formatted
        } else {
            dateStr
        }
    } catch (ex: Exception) {
        dateStr
    }
}

// คอมโพสเซเบิลสำหรับตกแต่งการ์ดในรูปแบบกึ่งโปร่งใส (Glassmorphism)
@Composable
fun GlassmorphicCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
        ),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            content = content
        )
    }
}

// คอมโพสเซเบิลสำหรับวาดแถบกราฟิกแสดงช่วงอุณหภูมิต่ำสุด-สูงสุดของวัน
@Composable
fun TempRangeTrack(
    minTemp: Float,
    maxTemp: Float,
    minTempWeekly: Float,
    maxTempWeekly: Float,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val width = size.width
        val height = size.height
        val trackHeight = 6.dp.toPx()
        val centerY = height / 2f

        val rx = trackHeight / 2f
        val ry = trackHeight / 2f
        
        // Background track (gray)
        drawRoundRect(
            color = Color.LightGray.copy(alpha = 0.3f),
            topLeft = androidx.compose.ui.geometry.Offset(0f, centerY - trackHeight / 2f),
            size = androidx.compose.ui.geometry.Size(width, trackHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(rx, ry)
        )

        // Calculate positions relative to weekly min/max
        val totalRange = (maxTempWeekly - minTempWeekly).coerceAtLeast(1f)
        val startPct = ((minTemp - minTempWeekly) / totalRange).coerceIn(0f, 1f)
        val endPct = ((maxTemp - minTempWeekly) / totalRange).coerceIn(0f, 1f)

        val activeStart = startPct * width
        val activeEnd = endPct * width
        val activeWidth = (activeEnd - activeStart).coerceAtLeast(rx * 2)

        // Gradient for temperatures (cool blue to warm orange)
        val gradient = Brush.horizontalGradient(
            colors = listOf(
                Color(0xFF29B6F6),
                Color(0xFFFFA726)
            ),
            startX = activeStart,
            endX = activeEnd
        )

        drawRoundRect(
            brush = gradient,
            topLeft = androidx.compose.ui.geometry.Offset(activeStart, centerY - trackHeight / 2f),
            size = androidx.compose.ui.geometry.Size(activeWidth, trackHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(rx, ry)
        )
    }
}

// คอมโพสเซเบิลสำหรับวาดกราฟเส้นแสดงแนวโน้มอุณหภูมิและกราฟแท่งความน่าจะเป็นของฝนตกรายชั่วโมง
@Composable
fun WeatherTrendChart(
    hourlyForecast: List<HourlyForecastData>,
    modifier: Modifier = Modifier
) {
    if (hourlyForecast.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxWidth()
                .height(220.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("No trend data available", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        return
    }

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(220.dp)
    ) {
        val width = size.width
        val height = size.height

        val paddingLeft = 40.dp.toPx()
        val paddingRight = 16.dp.toPx()
        val paddingTop = 20.dp.toPx()
        val paddingBottom = 30.dp.toPx()

        val chartWidth = width - paddingLeft - paddingRight
        val chartHeight = height - paddingTop - paddingBottom

        // Min/Max for Scaling
        val temps = hourlyForecast.map { it.temp }
        val maxTemp = (temps.maxOrNull() ?: 40f).coerceAtLeast(35f)
        val minTemp = (temps.minOrNull() ?: 15f).coerceAtMost(20f)
        val tempRange = (maxTemp - minTemp).coerceAtLeast(1f)

        val barWidth = (chartWidth / hourlyForecast.size) * 0.6f
        val stepX = chartWidth / (hourlyForecast.size - 1).coerceAtLeast(1)

        // Dotted grid lines
        val gridLineCount = 4
        for (i in 0 until gridLineCount) {
            val ratio = i.toFloat() / (gridLineCount - 1)
            val y = paddingTop + chartHeight * (1 - ratio)
            
            drawLine(
                color = Color.LightGray.copy(alpha = 0.5f),
                start = androidx.compose.ui.geometry.Offset(paddingLeft, y),
                end = androidx.compose.ui.geometry.Offset(width - paddingRight, y),
                strokeWidth = 1.dp.toPx(),
                pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
            )

            // Y-axis temperature labels
            val tempLabelVal = minTemp + ratio * tempRange
            drawIntoCanvas { canvas ->
                val paint = android.graphics.Paint().apply {
                    color = android.graphics.Color.GRAY
                    textSize = 9.sp.toPx()
                    textAlign = android.graphics.Paint.Align.RIGHT
                    isAntiAlias = true
                }
                canvas.nativeCanvas.drawText(
                    "%.0f°C".format(tempLabelVal),
                    paddingLeft - 8.dp.toPx(),
                    y + 3.dp.toPx(),
                    paint
                )
            }
        }

        // Draw vertical rounded bars for rain probabilities in background
        hourlyForecast.forEachIndexed { index, data ->
            val x = paddingLeft + index * stepX
            val rainProb = data.rainProbability
            if (rainProb > 0) {
                val barHeight = chartHeight * (rainProb / 100f)
                val barTop = paddingTop + chartHeight - barHeight
                val barLeft = x - barWidth / 2
                val barRight = x + barWidth / 2
                
                val rect = androidx.compose.ui.geometry.RoundRect(
                    left = barLeft,
                    top = barTop,
                    right = barRight,
                    bottom = paddingTop + chartHeight,
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx(), 4.dp.toPx())
                )
                val path = Path().apply {
                    addRoundRect(rect)
                }
                drawPath(
                    path = path,
                    color = Color(0xFF2563EB).copy(alpha = 0.18f)
                )
            }

            // X-axis time labels (every 4 hours, or first & last)
            if (index % 4 == 0 || index == hourlyForecast.size - 1) {
                drawIntoCanvas { canvas ->
                    val paint = android.graphics.Paint().apply {
                        color = android.graphics.Color.GRAY
                        textSize = 8.sp.toPx()
                        textAlign = android.graphics.Paint.Align.CENTER
                        isAntiAlias = true
                    }
                    canvas.nativeCanvas.drawText(
                        data.time,
                        x,
                        height - 8.dp.toPx(),
                        paint
                    )
                }
            }
        }

        // Plot smooth cubic bezier temperature curves
        if (hourlyForecast.size > 1) {
            val points = hourlyForecast.mapIndexed { index, data ->
                val x = paddingLeft + index * stepX
                val y = paddingTop + chartHeight * (1 - (data.temp - minTemp) / tempRange)
                androidx.compose.ui.geometry.Offset(x, y)
            }

            val strokePath = Path()
            val fillPath = Path()

            strokePath.moveTo(points[0].x, points[0].y)
            fillPath.moveTo(points[0].x, paddingTop + chartHeight)
            fillPath.lineTo(points[0].x, points[0].y)

            for (i in 0 until points.size - 1) {
                val p0 = points[i]
                val p1 = points[i + 1]
                
                val controlX1 = p0.x + stepX / 2f
                val controlY1 = p0.y
                val controlX2 = p1.x - stepX / 2f
                val controlY2 = p1.y

                strokePath.cubicTo(controlX1, controlY1, controlX2, controlY2, p1.x, p1.y)
                fillPath.cubicTo(controlX1, controlY1, controlX2, controlY2, p1.x, p1.y)
            }

            fillPath.lineTo(points.last().x, paddingTop + chartHeight)
            fillPath.close()

            // Fill area with translucent neon-blue gradient
            val fillBrush = Brush.verticalGradient(
                colors = listOf(
                    Color(0xFF00E5FF).copy(alpha = 0.35f),
                    Color(0xFF00E5FF).copy(alpha = 0.0f)
                ),
                startY = points.map { it.y }.minOrNull() ?: paddingTop,
                endY = paddingTop + chartHeight
            )
            drawPath(
                path = fillPath,
                brush = fillBrush
            )

            // Draw Neon-Blue Stroke Curve
            drawPath(
                path = strokePath,
                color = Color(0xFF00E5FF),
                style = Stroke(width = 2.5.dp.toPx())
            )

            // Points indicator dots (every 2 hours to keep it clean)
            points.forEachIndexed { index, point ->
                if (index % 2 == 0) {
                    drawCircle(
                        color = Color.White,
                        radius = 3.dp.toPx(),
                        center = point
                    )
                    drawCircle(
                        color = Color(0xFF00E5FF),
                        radius = 3.dp.toPx(),
                        center = point,
                        style = Stroke(width = 1.dp.toPx())
                    )
                }
            }
        }
    }
}

// ============================================================================
// TMD Place-Based Weather Helpers
// ============================================================================

// โครงสร้างข้อมูลผลลัพธ์สภาพอากาศที่ดึงมาเรียบร้อยแล้ว
data class LoadedWeatherResult(
    val locationDisplayName: String,
    val currentTemp: Float,
    val currentHumidity: Float,
    val currentRain: Float,
    val currentWindSpeed: Float,
    val windDirection: Float,
    val cloudCover: Int,
    val pressure: Float,
    val conditionLabel: String,
    val conditionEmoji: String,
    val hourly: List<HourlyForecastData>,
    val daily: List<DailyForecastData>
)

// ฟังก์ชันตรวจสอบสิทธิ์และดึงตำแหน่งพิกัดปัจจุบันของผู้ใช้
suspend fun getUserLocation(context: android.content.Context): Pair<Double, Double>? = kotlinx.coroutines.suspendCancellableCoroutine { continuation ->
    var resumed = false
    fun resumeSafe(result: Pair<Double, Double>?) {
        if (!resumed) {
            resumed = true
            continuation.resume(result)
        }
    }

    if (androidx.core.content.ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED ||
        androidx.core.content.ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.ACCESS_COARSE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
    ) {
        try {
            val fusedLocationClient = com.google.android.gms.location.LocationServices.getFusedLocationProviderClient(context)
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    if (location != null) {
                        resumeSafe(Pair(location.latitude, location.longitude))
                    } else {
                        try {
                            val dao = com.dmind.app.database.AlertsCacheDAO(context)
                            val record = dao.latestLocation
                            dao.close()
                            if (record != null) {
                                resumeSafe(Pair(record.latitude, record.longitude))
                            } else {
                                resumeSafe(null)
                            }
                        } catch (e: Exception) {
                            resumeSafe(null)
                        }
                    }
                }
                .addOnFailureListener {
                    try {
                        val dao = com.dmind.app.database.AlertsCacheDAO(context)
                        val record = dao.latestLocation
                        dao.close()
                        if (record != null) {
                            resumeSafe(Pair(record.latitude, record.longitude))
                        } else {
                            resumeSafe(null)
                        }
                    } catch (e: Exception) {
                        resumeSafe(null)
                    }
                }
        } catch (e: Exception) {
            try {
                val dao = com.dmind.app.database.AlertsCacheDAO(context)
                val record = dao.latestLocation
                dao.close()
                if (record != null) {
                    resumeSafe(Pair(record.latitude, record.longitude))
                } else {
                    resumeSafe(null)
                }
            } catch (ex: Exception) {
                resumeSafe(null)
            }
        }
    } else {
        try {
            val dao = com.dmind.app.database.AlertsCacheDAO(context)
            val record = dao.latestLocation
            dao.close()
            if (record != null) {
                resumeSafe(Pair(record.latitude, record.longitude))
            } else {
                resumeSafe(null)
            }
        } catch (e: Exception) {
            resumeSafe(null)
        }
    }
}

// ฟังก์ชันแปลงรหัสสภาพอากาศของกรมอุตุนิยมวิทยาเป็นสัญลักษณ์อีโมจิและข้อความไทย
fun getTmdEmojiAndLabel(code: Int): Pair<String, String> {
    return when (code) {
        1 -> Pair("☀️", "ท้องฟ้าแจ่มใส")
        2 -> Pair("🌤️", "มีเมฆบางส่วน")
        3 -> Pair("☁️", "เมฆเป็นส่วนมาก")
        4 -> Pair("☁️", "มีเมฆมาก")
        5 -> Pair("🌦️", "ฝนตกเล็กน้อย")
        6 -> Pair("🌧️", "ฝนปานกลาง")
        7 -> Pair("🌧️", "ฝนหนัก")
        8 -> Pair("⛈️", "ฝนฟ้าคะนอง")
        9 -> Pair("❄️", "อากาศหนาวจัด")
        10 -> Pair("❄️", "อากาศหนาว")
        11 -> Pair("💨", "อากาศเย็น")
        12 -> Pair("🔥", "อากาศร้อนจัด")
        else -> Pair("☁️", "ไม่ทราบสภาพอากาศ")
    }
}

// ฟังก์ชันแปลงและสรุปข้อมูลพยากรณ์อากาศรายชั่วโมงของกรมอุตุฯ เป็นข้อมูลรายวัน
fun mapTmdHourlyToDaily(forecasts: org.json.JSONArray): List<DailyForecastData> {
    val dailyMap = mutableMapOf<String, MutableList<Pair<Float, Int>>>()
    for (i in 0 until forecasts.length()) {
        val item = forecasts.optJSONObject(i) ?: continue
        val timeStr = item.optString("time")
        val dateStr = timeStr.substringBefore("T")
        if (dateStr.isBlank()) continue
        
        val dataObj = item.optJSONObject("data") ?: continue
        val temp = dataObj.optDouble("tc", 0.0).toFloat()
        val code = dataObj.optInt("cond", 1)
        
        dailyMap.getOrPut(dateStr) { mutableListOf() }.add(Pair(temp, code))
    }
    
    return dailyMap.map { (date, tempsAndCodes) ->
        val temps = tempsAndCodes.map { it.first }
        val minTemp = temps.minOrNull() ?: 25f
        val maxTemp = temps.maxOrNull() ?: 35f
        val weatherCode = tempsAndCodes[tempsAndCodes.size / 2].second
        DailyForecastData(date, minTemp, maxTemp, weatherCode)
    }.sortedBy { it.date }
}

// ฟังก์ชันดึงและวิเคราะห์ข้อมูลสภาพอากาศจากหน่วยงานบริการข้อมูล
suspend fun fetchAndParseWeather(context: android.content.Context): LoadedWeatherResult {
    val coords = withTimeoutOrNull(2500) { getUserLocation(context) } ?: Pair(13.7563, 100.5018)
    
    val placeInfo = runCatching {
        val repo = com.dmind.app.data.map.DisasterMapRepository(context)
        repo.getPlaceInfoForCoords(coords.first, coords.second)
    }.getOrElse {
        com.dmind.app.data.map.PlaceInfo(province = "กรุงเทพมหานคร", amphoe = "เขตปทุมวัน", tambon = "ลุมพินี")
    }
    
    val province = placeInfo.province
    val amphoe = placeInfo.amphoe
    val tambon = placeInfo.tambon

    val responseTextResult = runCatching {
        val client = com.dmind.app.network.BackendRestClient()
        client.fetchWeatherByPlace(
            province = province,
            amphoe = amphoe,
            tambon = tambon,
            duration = 48
        )
    }

    if (responseTextResult.isSuccess) {
        val responseText = responseTextResult.getOrThrow()
        try {
            val responseJson = org.json.JSONObject(responseText)
            if (responseJson.optString("status") == "error") {
                throw IllegalStateException("Backend weather proxy returned error: ${responseJson.optString("message")}")
            }
            val dataObj = responseJson.optJSONObject("data") ?: responseJson
            val rootForecast = dataObj.optJSONArray("WeatherForecasts")?.optJSONObject(0)
            val forecasts = rootForecast?.optJSONArray("forecasts") ?: org.json.JSONArray()
            
            if (forecasts.length() == 0) {
                throw IllegalStateException("Empty forecasts array from backend weather proxy")
            }
            
            val hourlyList = mutableListOf<HourlyForecastData>()
            val hourlyCount = minOf(forecasts.length(), 24)
            for (i in 0 until hourlyCount) {
                val item = forecasts.optJSONObject(i) ?: continue
                val timeStr = item.optString("time")
                val formattedHour = if (timeStr.contains("T")) {
                    val timePart = timeStr.substringAfter("T")
                    if (timePart.length >= 5) timePart.substring(0, 5) else timePart
                } else {
                    timeStr
                }
                val data = item.optJSONObject("data") ?: continue
                val tempVal = data.optDouble("tc", 0.0).toFloat()
                val rhVal = data.optDouble("rh", 0.0).toInt()
                hourlyList.add(HourlyForecastData(formattedHour, tempVal, rhVal))
            }
            
            if (hourlyList.isEmpty()) {
                throw IllegalStateException("Parsed hourly forecast list is empty")
            }
            
            val dailyList = mapTmdHourlyToDaily(forecasts)
            
            val firstItem = forecasts.optJSONObject(0)
            val firstData = firstItem?.optJSONObject("data")
            val locObj = rootForecast?.optJSONObject("location")
            val resolvedProvince = locObj?.optString("province")?.takeIf { it.isNotBlank() } ?: province
            val resolvedAmphoe = locObj?.optString("amphoe")?.takeIf { it.isNotBlank() } ?: amphoe
            val resolvedTambon = locObj?.optString("tambon")?.takeIf { it.isNotBlank() } ?: tambon
            
            val dispName = listOfNotNull(resolvedTambon, resolvedAmphoe, resolvedProvince)
                .filter { it.isNotBlank() }
                .joinToString(", ")
            
            val tempVal = firstData?.optDouble("tc", 25.0)?.toFloat() ?: 25f
            val humidityVal = firstData?.optDouble("rh", 60.0)?.toFloat() ?: 60f
            val rainVal = firstData?.optDouble("rain", 0.0)?.toFloat() ?: 0f
            val wsVal = firstData?.optDouble("ws10m", 0.0)?.toFloat() ?: 0f
            val wdVal = firstData?.optDouble("wd10m", 0.0)?.toFloat() ?: 0f
            val slpVal = firstData?.optDouble("slp", 1012.0)?.toFloat() ?: 1012f
            
            val cloudLow = firstData?.optInt("cloudlow", 0) ?: 0
            val cloudMed = firstData?.optInt("cloudmed", 0) ?: 0
            val cloudHigh = firstData?.optInt("cloudhigh", 0) ?: 0
            val maxCloud = maxOf(cloudLow, cloudMed, cloudHigh)
            val cloudPercent = if (maxCloud in 1..8) (maxCloud * 12.5).toInt() else maxCloud
            
            val condCode = firstData?.optInt("cond", 1) ?: 1
            val emojiAndLabel = getTmdEmojiAndLabel(condCode)
            
            return LoadedWeatherResult(
                locationDisplayName = dispName,
                currentTemp = tempVal,
                currentHumidity = humidityVal,
                currentRain = rainVal,
                currentWindSpeed = wsVal,
                windDirection = wdVal,
                cloudCover = cloudPercent,
                pressure = slpVal,
                conditionLabel = emojiAndLabel.second,
                conditionEmoji = emojiAndLabel.first,
                hourly = hourlyList,
                daily = dailyList
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Fallback: Fetch directly from Open-Meteo using coordinates
    return runCatching {
        fetchFromOpenMeteoFallback(coords.first, coords.second, province, amphoe, tambon)
    }.getOrElse { err ->
        err.printStackTrace()
        // Final fallback if even Open-Meteo is down
        val dispName = listOfNotNull(tambon, amphoe, province)
            .filter { it.isNotBlank() }
            .joinToString(", ")
        LoadedWeatherResult(
            locationDisplayName = "$dispName (ไม่มีข้อมูลการเชื่อมต่อ)",
            currentTemp = 0f,
            currentHumidity = 0f,
            currentRain = 0f,
            currentWindSpeed = 0f,
            windDirection = 0f,
            cloudCover = 0,
            pressure = 1012f,
            conditionLabel = "ไม่ทราบสภาพอากาศ",
            conditionEmoji = "☁️",
            hourly = emptyList(),
            daily = emptyList()
        )
    }
}

// ฟังก์ชันแปลงรหัสสภาพอากาศ WMO ให้สอดคล้องกับรหัสสภาพอากาศของกรมอุตุนิยมวิทยาไทย
fun mapWmoToTmdCode(wmoCode: Int): Int {
    return when (wmoCode) {
        0 -> 1 // ท้องฟ้าแจ่มใส
        1, 2 -> 2 // มีเมฆบางส่วน
        3 -> 3 // เมฆเป็นส่วนมาก
        45, 48 -> 4 // มีเมฆมาก (หมอก)
        51, 53, 55, 56, 57, 61, 80 -> 5 // ฝนตกเล็กน้อย
        63, 66, 81 -> 6 // ฝนปานกลาง
        65, 67, 82 -> 7 // ฝนหนัก
        95, 96, 99 -> 8 // ฝนฟ้าคะนอง
        71, 73, 75, 77, 85, 86 -> 10 // อากาศหนาว (หิมะตก)
        else -> 3
    }
}

// ฟังก์ชันสำรองสำหรับดึงข้อมูลสภาพอากาศโดยตรงจาก Open-Meteo API เมื่อระบบหลักใช้งานไม่ได้
private fun fetchFromOpenMeteoFallback(
    lat: Double,
    lon: Double,
    province: String,
    amphoe: String?,
    tambon: String?
): LoadedWeatherResult {
    val urlStr = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover&timezone=Asia%2FBangkok"
    val connection = (java.net.URL(urlStr).openConnection() as java.net.HttpURLConnection).apply {
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

    val responseJson = org.json.JSONObject(responseText)
    val hourly = responseJson.getJSONObject("hourly")
    val timesJson = hourly.getJSONArray("time")
    val temp2m = hourly.getJSONArray("temperature_2m")
    val rh2m = hourly.getJSONArray("relative_humidity_2m")
    val wmoCodes = hourly.getJSONArray("weather_code")
    val precipitation = hourly.getJSONArray("precipitation")
    val windSpeed10m = hourly.getJSONArray("wind_speed_10m")
    val windDirection10m = hourly.getJSONArray("wind_direction_10m")
    val pressureMsl = hourly.getJSONArray("pressure_msl")
    val cloudCoverJson = hourly.getJSONArray("cloud_cover")

    // Find closest hour index in timesJson
    val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:00", java.util.Locale.US).apply {
        timeZone = java.util.TimeZone.getTimeZone("Asia/Bangkok")
    }
    val currentHourString = sdf.format(java.util.Date())
    var currentIndex = 0
    for (i in 0 until timesJson.length()) {
        val tStr = timesJson.optString(i)
        if (tStr.startsWith(currentHourString)) {
            currentIndex = i
            break
        }
    }

    val tempVal = temp2m.optDouble(currentIndex, 25.0).toFloat()
    val humidityVal = rh2m.optDouble(currentIndex, 60.0).toFloat()
    val rainVal = precipitation.optDouble(currentIndex, 0.0).toFloat()
    val wsVal = windSpeed10m.optDouble(currentIndex, 0.0).toFloat()
    val wdVal = windDirection10m.optDouble(currentIndex, 0.0).toFloat()
    val pressVal = pressureMsl.optDouble(currentIndex, 1012.0).toFloat()
    val cloudVal = cloudCoverJson.optInt(currentIndex, 0)
    val wmoCode = wmoCodes.optInt(currentIndex, 0)
    val condCode = mapWmoToTmdCode(wmoCode)
    val emojiAndLabel = getTmdEmojiAndLabel(condCode)

    // Build hourly forecast list (24 hours starting from current hour)
    val hourlyList = mutableListOf<HourlyForecastData>()
    val hourlyEnd = minOf(timesJson.length(), currentIndex + 24)
    for (i in currentIndex until hourlyEnd) {
        val tStr = timesJson.optString(i)
        val formattedHour = if (tStr.contains("T")) {
            val timePart = tStr.substringAfter("T")
            if (timePart.length >= 5) timePart.substring(0, 5) else timePart
        } else {
            tStr
        }
        val tVal = temp2m.optDouble(i, 0.0).toFloat()
        val rVal = rh2m.optDouble(i, 0.0).toInt()
        hourlyList.add(HourlyForecastData(formattedHour, tVal, rVal))
    }

    // Build daily forecast list
    val dailyMap = mutableMapOf<String, MutableList<Pair<Float, Int>>>()
    for (i in 0 until timesJson.length()) {
        val tStr = timesJson.optString(i)
        val dateStr = tStr.substringBefore("T")
        if (dateStr.isBlank()) continue
        
        val tVal = temp2m.optDouble(i, 0.0).toFloat()
        val wCode = wmoCodes.optInt(i, 0)
        val tmdC = mapWmoToTmdCode(wCode)
        dailyMap.getOrPut(dateStr) { mutableListOf() }.add(Pair(tVal, tmdC))
    }
    
    val dailyList = dailyMap.map { (date, tempsAndCodes) ->
        val temps = tempsAndCodes.map { it.first }
        val minTemp = temps.minOrNull() ?: 25f
        val maxTemp = temps.maxOrNull() ?: 35f
        val weatherCode = tempsAndCodes[tempsAndCodes.size / 2].second
        DailyForecastData(date, minTemp, maxTemp, weatherCode)
    }.sortedBy { it.date }

    val dispName = listOfNotNull(tambon, amphoe, province)
        .filter { it.isNotBlank() }
        .joinToString(", ")

    return LoadedWeatherResult(
        locationDisplayName = "$dispName (Open-Meteo)",
        currentTemp = tempVal,
        currentHumidity = humidityVal,
        currentRain = rainVal,
        currentWindSpeed = wsVal,
        windDirection = wdVal,
        cloudCover = cloudVal,
        pressure = pressVal,
        conditionLabel = emojiAndLabel.second,
        conditionEmoji = emojiAndLabel.first,
        hourly = hourlyList,
        daily = dailyList
    )
}
