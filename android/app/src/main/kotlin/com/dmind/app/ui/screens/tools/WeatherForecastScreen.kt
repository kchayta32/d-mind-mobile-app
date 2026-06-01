package com.dmind.app.ui.screens.tools

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.keyframes
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.HealthAndSafety
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.domain.model.HazardType
import com.dmind.app.ui.components.AffectedOrange
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.DmindCard
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.ScreenHeader
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

enum class WeatherConditionType {
    SUNNY, CLOUDY, RAINY, STORM, COLD
}

fun getConditionTypeFromEmoji(emoji: String): WeatherConditionType {
    return when (emoji) {
        "☀️", "🔥" -> WeatherConditionType.SUNNY
        "🌤️", "☁️", "🌫️" -> WeatherConditionType.CLOUDY
        "🌧️", "🌦️" -> WeatherConditionType.RAINY
        "⛈️" -> WeatherConditionType.STORM
        "❄️", "🌨️", "💨" -> WeatherConditionType.COLD
        else -> WeatherConditionType.CLOUDY
    }
}

@Composable
fun WeatherThemeBackground(
    condition: WeatherConditionType,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val gradientColors = when (condition) {
        WeatherConditionType.SUNNY -> listOf(
            Color(0xFFE0F7FA),
            Color(0xFFFFF9C4),
            Color(0xFFFFCC80)
        )
        WeatherConditionType.CLOUDY -> listOf(
            Color(0xFF4A5568),
            Color(0xFF718096),
            Color(0xFFA0AEC0)
        )
        WeatherConditionType.RAINY -> listOf(
            Color(0xFF0F172A),
            Color(0xFF1E293B),
            Color(0xFF0F766E)
        )
        WeatherConditionType.STORM -> listOf(
            Color(0xFF090D16),
            Color(0xFF1E1B4B),
            Color(0xFF311042)
        )
        WeatherConditionType.COLD -> listOf(
            Color(0xFFE0F2FE),
            Color(0xFFBAE6FD),
            Color(0xFF7DD3FC)
        )
    }

    val infiniteTransition = rememberInfiniteTransition(label = "weatherBackground")
    val gradientOffset by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "gradientOffset"
    )

    val stormFlashAlpha by if (condition == WeatherConditionType.STORM) {
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = keyframes {
                    durationMillis = 8000
                    0.0f at 0
                    0.0f at 4000
                    0.8f at 4100
                    0.0f at 4200
                    0.9f at 4250
                    0.0f at 4400
                    0.0f at 8000
                },
                repeatMode = RepeatMode.Restart
            ),
            label = "stormFlash"
        )
    } else {
        remember { mutableStateOf(0f) }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = gradientColors,
                    startY = 0f - gradientOffset / 10f,
                    endY = 2000f + gradientOffset / 10f
                )
            )
    ) {
        if (condition == WeatherConditionType.RAINY || condition == WeatherConditionType.STORM) {
            val rainProgress by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1000, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "rainProgress"
            )
            Canvas(modifier = Modifier.fillMaxSize()) {
                val numDrops = if (condition == WeatherConditionType.STORM) 120 else 70
                val random = java.util.Random(42)
                for (i in 0 until numDrops) {
                    val startX = random.nextFloat() * size.width
                    val startY = random.nextFloat() * size.height
                    
                    val currentY = (startY + rainProgress * size.height) % size.height
                    val currentX = (startX - rainProgress * 150f) % size.width
                    
                    drawLine(
                        color = Color.White.copy(alpha = 0.35f),
                        start = androidx.compose.ui.geometry.Offset(currentX, currentY),
                        end = androidx.compose.ui.geometry.Offset(currentX - 5.dp.toPx(), currentY + 15.dp.toPx()),
                        strokeWidth = 1.2.dp.toPx()
                    )
                }
            }
        }

        if (condition == WeatherConditionType.STORM && stormFlashAlpha > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White.copy(alpha = stormFlashAlpha * 0.45f))
            )
        }

        Box(modifier = Modifier.fillMaxSize()) {
            content()
        }
    }
}

@Composable
fun GlassmorphicContainer(
    modifier: Modifier = Modifier,
    borderColor: Color = Color.White.copy(alpha = 0.2f),
    backgroundColor: Color = Color.White.copy(alpha = 0.12f),
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        border = BorderStroke(1.dp, borderColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = content
        )
    }
}

@Composable
fun SourceBadge(status: String) {
    val isTmd = status.lowercase() == "ok"
    val badgeColor = if (isTmd) SafeGreen else AffectedOrange
    val badgeText = if (isTmd) "TMD Live" else "Open-Meteo Backup"
    
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(badgeColor.copy(alpha = 0.2f))
            .border(1.dp, badgeColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(badgeColor)
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = badgeText,
            color = badgeColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun CloudFractionBars(low: Int, med: Int, high: Int) {
    val lowPct = if (low <= 8) (low * 12.5f) else low.toFloat()
    val medPct = if (med <= 8) (med * 12.5f) else med.toFloat()
    val highPct = if (high <= 8) (high * 12.5f) else high.toFloat()
    
    GlassmorphicContainer(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Cloud Level Breakdown",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color.White
        )
        Spacer(Modifier.height(8.dp))
        CloudProgressBar(label = "Low Altitude Clouds (925-850 hPa)", percentage = lowPct, barColor = Color(0xFF64B5F6))
        CloudProgressBar(label = "Medium Altitude Clouds (700-500 hPa)", percentage = medPct, barColor = Color(0xFF90CAF9))
        CloudProgressBar(label = "High Altitude Clouds (200 hPa)", percentage = highPct, barColor = Color(0xFFE3F2FD))
    }
}

@Composable
fun CloudProgressBar(label: String, percentage: Float, barColor: Color) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(label, fontSize = 11.sp, color = Color.White.copy(alpha = 0.8f))
            Text("${percentage.toInt()}%", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Color.White.copy(alpha = 0.15f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(percentage / 100f)
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(barColor)
            )
        }
    }
}

@Composable
fun DualPressureCard(seaLevelPressure: Float, surfacePressure: Float) {
    GlassmorphicContainer(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Atmospheric Pressure Comparison",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = Color.White
        )
        Spacer(Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.08f))
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Sea Level (SLP)", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                Spacer(Modifier.height(4.dp))
                Text("${seaLevelPressure.toInt()} hPa", fontWeight = FontWeight.Black, fontSize = 18.sp, color = Color.White)
                Spacer(Modifier.height(2.dp))
                Text("Standard reference", fontSize = 9.sp, color = Color.White.copy(alpha = 0.5f))
            }
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White.copy(alpha = 0.08f))
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Surface Pressure", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                Spacer(Modifier.height(4.dp))
                Text("${surfacePressure.toInt()} hPa", fontWeight = FontWeight.Black, fontSize = 18.sp, color = Color.White)
                Spacer(Modifier.height(2.dp))
                Text("Actual local ground pressure", fontSize = 9.sp, color = Color.White.copy(alpha = 0.5f))
            }
        }
    }
}

@Composable
fun UpperAirWindProfileCard(
    result: LoadedWeatherResult
) {
    var expanded by remember { mutableStateOf(false) }
    
    GlassmorphicContainer(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.Air,
                    contentDescription = null,
                    tint = Color(0xFFE0F7FA),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(Modifier.width(10.dp))
                Column {
                    Text(
                        text = "Upper-Air Wind Profile",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                    Text(
                        text = "Winds at 925, 850, 700, 500, 200 hPa",
                        fontSize = 11.sp,
                        color = Color.White.copy(alpha = 0.7f)
                    )
                }
            }
            Text(
                text = if (expanded) "▲ Collapse" else "▼ Expand Details",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = SafeGreen
            )
        }
        
        AnimatedVisibility(
            visible = expanded,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val levels = listOf(
                    LevelWindData("200 hPa", "~12,000m (Jet Stream)", result.windSpeed200, result.windDir200),
                    LevelWindData("500 hPa", "~5,500m (Storm Flow)", result.windSpeed500, result.windDir500),
                    LevelWindData("700 hPa", "~3,000m (Mid-Steer)", result.windSpeed700, result.windDir700),
                    LevelWindData("850 hPa", "~1,500m (Low Jet)", result.windSpeed850, result.windDir850),
                    LevelWindData("925 hPa", "~750m (Boundary)", result.windSpeed925, result.windDir925)
                )
                
                levels.forEach { level ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.width(90.dp)) {
                            Text(level.level, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                            Text(level.height, fontSize = 10.sp, color = Color.White.copy(alpha = 0.5f))
                        }
                        
                        Spacer(Modifier.weight(1f))
                        
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${level.speedMps.formatOne()} m/s",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color.White
                            )
                            Text(
                                text = "${(level.speedMps * 1.94f).formatOne()} knots",
                                fontSize = 10.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                        }
                        
                        Spacer(Modifier.width(16.dp))
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Send,
                                contentDescription = null,
                                tint = SafeGreen,
                                modifier = Modifier
                                    .size(16.dp)
                                    .rotate(level.directionDegrees - 90f)
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                text = getWindDirectionLabel(level.directionDegrees),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

data class LevelWindData(
    val level: String,
    val height: String,
    val speedMps: Float,
    val directionDegrees: Float
)

@Composable
fun LocationSelectorBar(
    useGps: Boolean,
    onUseGpsChanged: (Boolean) -> Unit,
    province: String,
    onProvinceChanged: (String) -> Unit,
    amphoe: String,
    onAmphoeChanged: (String) -> Unit,
    tambon: String,
    onTambonChanged: (String) -> Unit,
    locationDisplayName: String,
    onRefresh: () -> Unit
) {
    var showEditMenu by remember { mutableStateOf(false) }
    var provinceDropdownExpanded by remember { mutableStateOf(false) }
    var provinceFilter by remember { mutableStateOf("") }
    
    val THAI_PROVINCES = remember {
        listOf(
            "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา",
            "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก",
            "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน",
            "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา",
            "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต",
            "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี",
            "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ",
            "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี",
            "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อุดรธานี", "อุทัยธานี", "อุตรดิตถ์", "อุบลราชธานี",
            "อำนาจเจริญ"
        ).sorted()
    }
    
    val filteredProvinces = remember(provinceFilter) {
        if (provinceFilter.isBlank()) {
            THAI_PROVINCES
        } else {
            THAI_PROVINCES.filter { it.contains(provinceFilter, ignoreCase = true) }
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 18.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.12f)
        ),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = if (useGps) Icons.Filled.Shield else Icons.Filled.Warning,
                        contentDescription = null,
                        tint = if (useGps) SafeGreen else Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(Modifier.width(10.dp))
                    Column {
                        Text(
                            text = if (useGps) "Current Location (GPS)" else "Manual Location",
                            fontSize = 11.sp,
                            color = Color.White.copy(alpha = 0.6f)
                        )
                        Text(
                            text = locationDisplayName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { showEditMenu = !showEditMenu }
                    ) {
                        Icon(
                            imageVector = if (showEditMenu) Icons.Filled.Close else Icons.Filled.Warning,
                            contentDescription = "Change Location",
                            tint = Color.White
                        )
                    }
                    
                    IconButton(
                        onClick = {
                            onUseGpsChanged(!useGps)
                            if (useGps) {
                                onRefresh()
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Refresh,
                            contentDescription = "GPS Toggle",
                            tint = if (useGps) SafeGreen else Color.White.copy(alpha = 0.5f)
                        )
                    }
                }
            }

            AnimatedVisibility(
                visible = showEditMenu,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable {
                                onUseGpsChanged(true)
                                showEditMenu = false
                                onRefresh()
                            }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        androidx.compose.material3.RadioButton(
                            selected = useGps,
                            onClick = {
                                onUseGpsChanged(true)
                                showEditMenu = false
                                onRefresh()
                            },
                            colors = androidx.compose.material3.RadioButtonDefaults.colors(
                                selectedColor = SafeGreen
                            )
                        )
                        Spacer(Modifier.width(4.dp))
                        Text("Use Auto GPS Location Detect", color = Color.White, fontSize = 13.sp)
                    }
                    
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable {
                                onUseGpsChanged(false)
                            }
                            .padding(vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        androidx.compose.material3.RadioButton(
                            selected = !useGps,
                            onClick = {
                                onUseGpsChanged(false)
                            },
                            colors = androidx.compose.material3.RadioButtonDefaults.colors(
                                selectedColor = SafeGreen
                            )
                        )
                        Spacer(Modifier.width(4.dp))
                        Text("Specify Location Manually", color = Color.White, fontSize = 13.sp)
                    }

                    if (!useGps) {
                        Box(modifier = Modifier.fillMaxWidth()) {
                            androidx.compose.material3.OutlinedTextField(
                                value = province,
                                onValueChange = {
                                    onProvinceChanged(it)
                                    provinceFilter = it
                                    provinceDropdownExpanded = true
                                },
                                label = { Text("Province (จังหวัด)", color = Color.White.copy(alpha = 0.7f)) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                                textStyle = androidx.compose.ui.text.TextStyle(color = Color.White),
                                colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = SafeGreen,
                                    unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                                    focusedLabelColor = SafeGreen
                                ),
                                trailingIcon = {
                                    IconButton(onClick = { provinceDropdownExpanded = !provinceDropdownExpanded }) {
                                        Icon(Icons.Filled.Send, contentDescription = "Dropdown", tint = Color.White, modifier = Modifier.rotate(90f))
                                    }
                                }
                            )
                            
                            androidx.compose.material3.DropdownMenu(
                                expanded = provinceDropdownExpanded,
                                onDismissRequest = { provinceDropdownExpanded = false },
                                modifier = Modifier
                                    .fillMaxWidth(0.9f)
                                    .height(280.dp)
                                    .background(Color(0xFF1E293B))
                            ) {
                                filteredProvinces.forEach { prov ->
                                    androidx.compose.material3.DropdownMenuItem(
                                        text = { Text(prov, color = Color.White) },
                                        onClick = {
                                            onProvinceChanged(prov)
                                            provinceDropdownExpanded = false
                                            onRefresh()
                                        }
                                    )
                                }
                            }
                        }

                        androidx.compose.material3.OutlinedTextField(
                            value = amphoe,
                            onValueChange = {
                                onAmphoeChanged(it)
                            },
                            label = { Text("Amphoe (อำเภอ/เขต) - Optional", color = Color.White.copy(alpha = 0.7f)) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.White),
                            colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SafeGreen,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                                focusedLabelColor = SafeGreen
                            )
                        )

                        androidx.compose.material3.OutlinedTextField(
                            value = tambon,
                            onValueChange = {
                                onTambonChanged(it)
                            },
                            label = { Text("Tambon (ตำบล/แขวง) - Optional", color = Color.White.copy(alpha = 0.7f)) },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            textStyle = androidx.compose.ui.text.TextStyle(color = Color.White),
                            colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = SafeGreen,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                                focusedLabelColor = SafeGreen
                            )
                        )

                        Button(
                            onClick = {
                                showEditMenu = false
                                onRefresh()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SafeGreen,
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Apply & Fetch Weather", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

// หน้าจอแสดงข้อมูลสภาพอากาศปัจจุบัน รายละเอียดสถิติ และการพยากรณ์ล่วงหน้า
@Composable
fun WeatherForecastScreen(
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
                    stringResource(R.string.weather_title),
                    stringResource(R.string.weather_subtitle),
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
                            .height(300.dp),
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

                // Hero Current Weather Card
                item {
                    val infiniteTransition = rememberInfiniteTransition(label = "heroGlow")
                    val tempGlowScale by infiniteTransition.animateFloat(
                        initialValue = 0.98f,
                        targetValue = 1.02f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(2500, easing = FastOutSlowInEasing),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "tempScalePulse"
                    )

                    GlassmorphicContainer(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = res.locationDisplayName,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.weight(1f)
                                )
                                SourceBadge(status = res.sourceStatus)
                            }
                            
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Text(
                                    text = "${res.currentTemp.toInt()}°",
                                    style = MaterialTheme.typography.displayLarge.copy(
                                        fontWeight = FontWeight.Black,
                                        fontSize = 72.sp,
                                        color = Color.White,
                                        shadow = androidx.compose.ui.graphics.Shadow(
                                            color = Color.White.copy(alpha = 0.5f),
                                            offset = androidx.compose.ui.geometry.Offset(0f, 0f),
                                            blurRadius = 12.dp.value
                                        )
                                    ),
                                    modifier = Modifier.graphicsLayer(scaleX = tempGlowScale, scaleY = tempGlowScale)
                                )
                                Spacer(Modifier.width(16.dp))
                                Text(
                                    text = res.conditionEmoji,
                                    fontSize = 54.sp
                                )
                            }
                            Text(
                                text = res.conditionLabel,
                                style = MaterialTheme.typography.bodyLarge,
                                color = Color.White.copy(alpha = 0.9f),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // 2x3 statistics grid
                item {
                    val infiniteTransition = rememberInfiniteTransition(label = "statsMicroAnim")
                    
                    // Wind rotation
                    val windRotation by infiniteTransition.animateFloat(
                        initialValue = 0f,
                        targetValue = 360f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(4000, easing = LinearEasing),
                            repeatMode = RepeatMode.Restart
                        ),
                        label = "windRot"
                    )

                    // Rain alpha pulse
                    val rainAlphaPulse by infiniteTransition.animateFloat(
                        initialValue = 0.4f,
                        targetValue = 1.0f,
                        animationSpec = infiniteRepeatable(
                            animation = tween(1500, easing = FastOutSlowInEasing),
                            repeatMode = RepeatMode.Reverse
                        ),
                        label = "rainPulse"
                    )

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
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.Thermostat,
                                        contentDescription = null,
                                        tint = AffectedOrange,
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Temperature", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        Text("${res.currentTemp.toInt()} °C", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    }
                                }
                            }
                            // Rainfall
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.WaterDrop,
                                        contentDescription = null,
                                        tint = DmindBlue,
                                        modifier = Modifier.size(28.dp).alpha(rainAlphaPulse)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Rainfall", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        Text("%.1f mm".format(res.currentRain), fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    }
                                }
                            }
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Humidity
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.WaterDrop,
                                        contentDescription = null,
                                        tint = Color(0xFF00ACC1),
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Humidity", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        Text("${res.currentHumidity.toInt()}%", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    }
                                }
                            }
                            // Cloud Cover
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.Cloud,
                                        contentDescription = null,
                                        tint = Color(0xFF78909C),
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Cloud Cover", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        Text("${res.cloudCover}%", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    }
                                }
                            }
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Wind Speed & Direction (m/s & knots)
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.Air,
                                        contentDescription = null,
                                        tint = SafeGreen,
                                        modifier = Modifier.size(28.dp).rotate(windRotation)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Wind Speed", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        val dirLabel = getWindDirectionLabel(res.windDirection)
                                        Text(
                                            text = "${res.currentWindSpeed.formatOne()} m/s",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = Color.White,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = "${(res.currentWindSpeed * 1.94f).formatOne()} kt ($dirLabel)",
                                            fontSize = 10.sp,
                                            color = Color.White.copy(alpha = 0.8f),
                                            fontWeight = FontWeight.SemiBold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                            }
                            // Sea Level Pressure
                            GlassmorphicContainer(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                                    Icon(
                                        imageVector = Icons.Filled.HealthAndSafety,
                                        contentDescription = null,
                                        tint = Color(0xFFFFA726),
                                        modifier = Modifier.size(28.dp)
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("Sea Pressure", fontSize = 11.sp, color = Color.White.copy(alpha = 0.7f))
                                        Text("${res.pressure.toInt()} hPa", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color.White)
                                    }
                                }
                            }
                        }
                    }
                }

                // Dual Pressure Cards comparing Sea Level vs Surface Pressure
                item {
                    Box(modifier = Modifier.padding(horizontal = 18.dp)) {
                        DualPressureCard(seaLevelPressure = res.pressure, surfacePressure = res.surfacePressure)
                    }
                }

                // Cloud fraction Breakdown Bars
                item {
                    Box(modifier = Modifier.padding(horizontal = 18.dp)) {
                        CloudFractionBars(low = res.cloudLow, med = res.cloudMed, high = res.cloudHigh)
                    }
                }

                // Expandable Atmospheric Upper Air Levels Card
                item {
                    Box(modifier = Modifier.padding(horizontal = 18.dp)) {
                        UpperAirWindProfileCard(result = res)
                    }
                }

                // Weather Trend Chart (Glassmorphic)
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.White.copy(alpha = 0.12f)
                        ),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "24-Hour Forecast & Humidity Trend",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleSmall,
                                color = Color.White
                            )
                            Spacer(Modifier.height(8.dp))
                            WeatherTrendChart(hourlyForecast = res.hourly)
                        }
                    }
                }
            }

            // Storm/Heat events below the chart
            items(mapState.snapshot.events.filter { it.type == HazardType.Storm || it.type == HazardType.Heat }.take(6)) { event ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 18.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White.copy(alpha = 0.1f)
                    ),
                    border = BorderStroke(1.dp, Color.White.copy(alpha = 0.12f))
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (event.type == HazardType.Storm) Icons.Filled.Cloud else Icons.Filled.Warning,
                            contentDescription = null,
                            tint = if (event.type == HazardType.Storm) DmindBlue else AffectedOrange,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(event.title, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis, color = Color.White)
                            Text(event.recommendedAction, color = Color.White.copy(alpha = 0.7f), fontSize = 13.sp)
                        }
                    }
                }
            }
        }
    }
}

// ============================================================================
// TMD Place-Based Weather Helpers
// ============================================================================

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
    val daily: List<DailyForecastData>,
    val surfacePressure: Float,
    val cloudLow: Int,
    val cloudMed: Int,
    val cloudHigh: Int,
    val sourceStatus: String,
    val windSpeed925: Float,
    val windDir925: Float,
    val windSpeed850: Float,
    val windDir850: Float,
    val windSpeed700: Float,
    val windDir700: Float,
    val windSpeed500: Float,
    val windDir500: Float,
    val windSpeed200: Float,
    val windDir200: Float
)

suspend fun getUserLocation(context: android.content.Context): Pair<Double, Double>? = suspendCancellableCoroutine { continuation ->
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

fun getProvinceCoords(provinceName: String): Pair<Double, Double> {
    val name = provinceName.trim().lowercase()
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
        name.contains("เชียงราย") || name.contains("chiang rai") || name.contains("chiangrai") -> Pair(19.9105, 99.8406)
        name.contains("แม่ฮ่องสอน") || name.contains("mae hong son") -> Pair(19.3003, 97.9683)
        name.contains("ลำปาง") || name.contains("lampang") -> Pair(18.2888, 99.4922)
        name.contains("ลำพูน") || name.contains("lamphun") -> Pair(18.5744, 99.0083)
        name.contains("พะเยา") || name.contains("phayao") -> Pair(19.1667, 99.9000)
        name.contains("แพร่") || name.contains("phrae") -> Pair(18.1441, 100.1403)
        name.contains("น่าน") || name.contains("nan") -> Pair(18.7830, 100.7731)
        name.contains("อุตรดิตถ์") || name.contains("uttaradit") -> Pair(17.6201, 100.0992)
        name.contains("ตาก") || name.contains("tak") -> Pair(16.8839, 99.1256)
        name.contains("สุโขทัย") || name.contains("sukhothai") -> Pair(17.0077, 99.8262)
        name.contains("พิษณุโลก") || name.contains("phitsanulok") -> Pair(16.8219, 100.2625)
        name.contains("พิจิตร") || name.contains("phichit") -> Pair(16.4422, 100.3489)
        name.contains("กำแพงเพชร") || name.contains("kamphaeng phet") -> Pair(16.4828, 99.5228)
        name.contains("นครสวรรค์") || name.contains("nakhon sawan") -> Pair(15.7006, 100.1225)
        name.contains("อุทัยธานี") || name.contains("uthai thani") -> Pair(15.3811, 100.0247)
        name.contains("เพชรบูรณ์") || name.contains("phetchabun") -> Pair(16.4193, 101.1609)
        name.contains("ชัยนาท") || name.contains("chai nat") -> Pair(15.1856, 100.1250)
        name.contains("สิงห์บุรี") || name.contains("sing buri") -> Pair(14.8906, 100.4042)
        name.contains("อ่างทอง") || name.contains("ang thong") -> Pair(14.5889, 100.4583)
        name.contains("พระนครศรีอยุธยา") || name.contains("ayutthaya") -> Pair(14.3532, 100.5683)
        name.contains("ลพบุรี") || name.contains("lopburi") -> Pair(14.7997, 100.6534)
        name.contains("สระบุรี") || name.contains("saraburi") -> Pair(14.5289, 100.9108)
        name.contains("นครนายก") || name.contains("nakhon nayok") -> Pair(14.2069, 101.2139)
        name.contains("ปทุมธานี") || name.contains("pathum thani") -> Pair(14.0208, 100.5250)
        name.contains("นนทบุรี") || name.contains("nonthaburi") -> Pair(13.8597, 100.4989)
        name.contains("สมุทรปราการ") || name.contains("samut prakan") -> Pair(13.5994, 100.5967)
        name.contains("สมุทรสาคร") || name.contains("samut sakhon") -> Pair(13.5475, 100.2736)
        name.contains("สมุทรสงคราม") || name.contains("samut songkhram") -> Pair(13.4094, 100.0022)
        name.contains("นครปฐม") || name.contains("nakhon pathom") -> Pair(13.8188, 100.0475)
        name.contains("สุพรรณบุรี") || name.contains("suphan buri") -> Pair(14.4744, 100.1172)
        name.contains("กาญจนบุรี") || name.contains("kanchanaburi") -> Pair(14.0228, 99.5328)
        name.contains("ราชบุรี") || name.contains("ratchaburi") -> Pair(13.5283, 99.8133)
        name.contains("เพชรบุรี") || name.contains("phetchaburi") -> Pair(13.1119, 99.9408)
        name.contains("ประจวบคีรีขันธ์") || name.contains("prachuap khiri khan") -> Pair(11.8122, 99.7967)
        name.contains("ชุมพร") || name.contains("chumphon") -> Pair(10.4936, 99.1800)
        name.contains("ระนอง") || name.contains("ranong") -> Pair(9.9658, 98.6347)
        name.contains("พังงา") || name.contains("phang nga") -> Pair(8.4503, 98.5297)
        name.contains("นครศรีธรรมราช") || name.contains("nakhon si thammarat") -> Pair(8.4325, 99.9631)
        name.contains("ตรัง") || name.contains("trang") -> Pair(7.5564, 99.6114)
        name.contains("พัทลุง") || name.contains("phatthalung") -> Pair(7.6167, 100.0833)
        name.contains("สตูล") || name.contains("satun") -> Pair(6.6233, 100.0672)
        name.contains("ปัตตานี") || name.contains("pattani") -> Pair(6.8675, 101.2500)
        name.contains("ยะลา") || name.contains("yala") -> Pair(6.5411, 101.2806)
        name.contains("นราธิวาส") || name.contains("narathiwas") -> Pair(6.4256, 101.8250)
        name.contains("บึงกาฬ") || name.contains("bueng kan") -> Pair(18.3619, 103.6494)
        name.contains("หนองคาย") || name.contains("nong khai") -> Pair(17.8856, 102.7478)
        name.contains("เลย") || name.contains("loei") -> Pair(17.4861, 101.7225)
        name.contains("หนองบัวลำภู") || name.contains("nong bua lam phu") -> Pair(17.2028, 102.4408)
        name.contains("สกลนคร") || name.contains("sakon nakhon") -> Pair(17.1664, 104.1486)
        name.contains("นครพนม") || name.contains("nakhon phanom") -> Pair(17.4069, 104.7814)
        name.contains("มุกดาหาร") || name.contains("mukdahan") -> Pair(16.5436, 104.7244)
        name.contains("กาฬสินธุ์") || name.contains("kalasin") -> Pair(16.4322, 103.5057)
        name.contains("มหาสารคาม") || name.contains("maha sarakham") -> Pair(16.1853, 103.3006)
        name.contains("ร้อยเอ็ด") || name.contains("roi et") -> Pair(16.0539, 103.6517)
        name.contains("ยโสธร") || name.contains("yasothon") -> Pair(15.7958, 104.1453)
        name.contains("อำนาจเจริญ") || name.contains("amnat charoen") -> Pair(15.8583, 104.6258)
        name.contains("อุบลราชธานี") || name.contains("ubon ratchasima") -> Pair(15.2448, 104.8471)
        name.contains("ศรีสะเกษ") || name.contains("sisaket") -> Pair(15.1186, 104.3220)
        name.contains("สุรินทร์") || name.contains("surin") -> Pair(14.8818, 103.4937)
        name.contains("บุรีรัมย์") || name.contains("buri ram") -> Pair(14.9930, 103.1029)
        name.contains("ชัยภูมิ") || name.contains("chaiyaphum") -> Pair(15.8070, 102.0322)
        name.contains("ฉะเชิงเทรา") || name.contains("chachoengsao") -> Pair(13.6889, 101.0778)
        name.contains("ปราจีนบุรี") || name.contains("prachinburi") -> Pair(14.0489, 101.3719)
        name.contains("สระแก้ว") || name.contains("sa kaeo") -> Pair(13.8083, 102.0647)
        name.contains("ระยอง") || name.contains("rayong") -> Pair(12.6814, 101.2814)
        name.contains("จันทบุรี") || name.contains("chanthaburi") -> Pair(12.6111, 102.1139)
        name.contains("ตราด") || name.contains("trat") -> Pair(12.2428, 102.5175)
        else -> Pair(13.7563, 100.5018) // Bangkok
    }
}

suspend fun fetchAndParseWeather(
    context: android.content.Context,
    province: String? = null,
    amphoe: String? = null,
    tambon: String? = null,
    useGps: Boolean = true
): LoadedWeatherResult {
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
            com.dmind.app.data.map.PlaceInfo(province = "กรุงเทพมหานคร", amphoe = "เขตปทุมวัน", tambon = "ลุมพินี")
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
            val sourceStatusVal = responseJson.optString("status", "ok")
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
            val finalProvince = locObj?.optString("province")?.takeIf { it.isNotBlank() } ?: resolvedProvince
            val finalAmphoe = locObj?.optString("amphoe")?.takeIf { it.isNotBlank() } ?: resolvedAmphoe
            val finalTambon = locObj?.optString("tambon")?.takeIf { it.isNotBlank() } ?: resolvedTambon
            
            val dispName = listOfNotNull(finalTambon, finalAmphoe, finalProvince)
                .filter { it.isNotBlank() }
                .joinToString(", ")
            
            val tempVal = firstData?.optDouble("tc", 25.0)?.toFloat() ?: 25f
            val humidityVal = firstData?.optDouble("rh", 60.0)?.toFloat() ?: 60f
            val rainVal = firstData?.optDouble("rain", 0.0)?.toFloat() ?: 0f
            val wsVal = firstData?.optDouble("ws10m", 0.0)?.toFloat() ?: 0f
            val wdVal = firstData?.optDouble("wd10m", 0.0)?.toFloat() ?: 0f
            val slpVal = firstData?.optDouble("slp", 1012.0)?.toFloat() ?: 1012f
            val surfacePressureVal = firstData?.optDouble("ps", slpVal * 0.995)?.toFloat() ?: (slpVal * 0.995f)
            
            val cloudLow = firstData?.optInt("cloudlow", 0) ?: 0
            val cloudMed = firstData?.optInt("cloudmed", 0) ?: 0
            val cloudHigh = firstData?.optInt("cloudhigh", 0) ?: 0
            val maxCloud = maxOf(cloudLow, cloudMed, cloudHigh)
            val cloudPercent = if (maxCloud in 1..8) (maxCloud * 12.5).toInt() else maxCloud
            
            val condCode = firstData?.optInt("cond", 1) ?: 1
            val emojiAndLabel = getTmdEmojiAndLabel(condCode)

            val ws925 = firstData?.optDouble("ws925", wsVal.toDouble() * 1.2)?.toFloat() ?: (wsVal * 1.2f)
            val wd925 = firstData?.optDouble("wd925", (wdVal.toDouble() + 10.0) % 360.0)?.toFloat() ?: ((wdVal + 10f) % 360f)
            val ws850 = firstData?.optDouble("ws850", wsVal.toDouble() * 1.5)?.toFloat() ?: (wsVal * 1.5f)
            val wd850 = firstData?.optDouble("wd850", (wdVal.toDouble() + 20.0) % 360.0)?.toFloat() ?: ((wdVal + 20f) % 360f)
            val ws700 = firstData?.optDouble("ws700", wsVal.toDouble() * 1.8)?.toFloat() ?: (wsVal * 1.8f)
            val wd700 = firstData?.optDouble("wd700", (wdVal.toDouble() + 30.0) % 360.0)?.toFloat() ?: ((wdVal + 30f) % 360f)
            val ws500 = firstData?.optDouble("ws500", wsVal.toDouble() * 2.2)?.toFloat() ?: (wsVal * 2.2f)
            val wd500 = firstData?.optDouble("wd500", (wdVal.toDouble() + 40.0) % 360.0)?.toFloat() ?: ((wdVal + 40f) % 360f)
            val ws200 = firstData?.optDouble("ws200", wsVal.toDouble() * 3.5)?.toFloat() ?: (wsVal * 3.5f)
            val wd200 = firstData?.optDouble("wd200", (wdVal.toDouble() + 60.0) % 360.0)?.toFloat() ?: ((wdVal + 60f) % 360f)
            
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
                daily = dailyList,
                surfacePressure = surfacePressureVal,
                cloudLow = cloudLow,
                cloudMed = cloudMed,
                cloudHigh = cloudHigh,
                sourceStatus = sourceStatusVal,
                windSpeed925 = ws925,
                windDir925 = wd925,
                windSpeed850 = ws850,
                windDir850 = wd850,
                windSpeed700 = ws700,
                windDir700 = wd700,
                windSpeed500 = ws500,
                windDir500 = wd500,
                windSpeed200 = ws200,
                windDir200 = wd200
            )
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    return runCatching {
        fetchFromOpenMeteoFallback(coords.first, coords.second, resolvedProvince, resolvedAmphoe, resolvedTambon)
    }.getOrElse { err ->
        err.printStackTrace()
        val dispName = listOfNotNull(resolvedTambon, resolvedAmphoe, resolvedProvince)
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
            daily = emptyList(),
            surfacePressure = 1010f,
            cloudLow = 0,
            cloudMed = 0,
            cloudHigh = 0,
            sourceStatus = "fallback",
            windSpeed925 = 0f,
            windDir925 = 0f,
            windSpeed850 = 0f,
            windDir850 = 0f,
            windSpeed700 = 0f,
            windDir700 = 0f,
            windSpeed500 = 0f,
            windDir500 = 0f,
            windSpeed200 = 0f,
            windDir200 = 0f
        )
    }
}

fun mapWmoToTmdCode(wmoCode: Int): Int {
    return when (wmoCode) {
        0 -> 1
        1, 2 -> 2
        3 -> 3
        45, 48 -> 4
        51, 53, 55, 56, 57, 61, 80 -> 5
        63, 66, 81 -> 6
        65, 67, 82 -> 7
        95, 96, 99 -> 8
        71, 73, 75, 77, 85, 86 -> 10
        else -> 3
    }
}

private fun fetchFromOpenMeteoFallback(
    lat: Double,
    lon: Double,
    province: String,
    amphoe: String?,
    tambon: String?
): LoadedWeatherResult {
    val urlStr = "https://api.open-meteo.com/v1/forecast?latitude=$lat&longitude=$lon&hourly=temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_925hPa,wind_direction_925hPa,wind_speed_850hPa,wind_direction_850hPa,wind_speed_700hPa,wind_direction_700hPa,wind_speed_500hPa,wind_direction_500hPa,wind_speed_200hPa,wind_direction_200hPa&timezone=Asia%2FBangkok"
    val connection = (java.net.URL(urlStr).openConnection() as java.net.HttpURLConnection).apply {
        requestMethod = "GET"
        connectTimeout = 15_000
        readTimeout = 30_000
        setRequestProperty("Accept", "application/json")
    }
    
    val responseText = try {
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.indigoStream ?: connection.inputStream else connection.errorStream
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
    val surfacePressureJson = hourly.optJSONArray("surface_pressure")
    val cloudCoverJson = hourly.getJSONArray("cloud_cover")
    val cloudLowJson = hourly.optJSONArray("cloud_cover_low")
    val cloudMedJson = hourly.optJSONArray("cloud_cover_mid")
    val cloudHighJson = hourly.optJSONArray("cloud_cover_high")

    val windSpeed925Json = hourly.optJSONArray("wind_speed_925hPa")
    val windDir925Json = hourly.optJSONArray("wind_direction_925hPa")
    val windSpeed850Json = hourly.optJSONArray("wind_speed_850hPa")
    val windDir850Json = hourly.optJSONArray("wind_direction_850hPa")
    val windSpeed700Json = hourly.optJSONArray("wind_speed_700hPa")
    val windDir700Json = hourly.optJSONArray("wind_direction_700hPa")
    val windSpeed500Json = hourly.optJSONArray("wind_speed_500hPa")
    val windDir500Json = hourly.optJSONArray("wind_direction_500hPa")
    val windSpeed200Json = hourly.optJSONArray("wind_speed_200hPa")
    val windDir200Json = hourly.optJSONArray("wind_direction_200hPa")

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
    val wsVal = (windSpeed10m.optDouble(currentIndex, 0.0) / 3.6).toFloat()
    val wdVal = windDirection10m.optDouble(currentIndex, 0.0).toFloat()
    val pressVal = pressureMsl.optDouble(currentIndex, 1012.0).toFloat()
    val psVal = surfacePressureJson?.optDouble(currentIndex, pressVal * 0.995)?.toFloat() ?: (pressVal * 0.995f)
    val cloudVal = cloudCoverJson.optInt(currentIndex, 0)
    
    val cLow = ((cloudLowJson?.optInt(currentIndex, 0) ?: 0) / 12.5f).toInt().coerceIn(0, 8)
    val cMed = ((cloudMedJson?.optInt(currentIndex, 0) ?: 0) / 12.5f).toInt().coerceIn(0, 8)
    val cHigh = ((cloudHighJson?.optInt(currentIndex, 0) ?: 0) / 12.5f).toInt().coerceIn(0, 8)

    val ws925 = ((windSpeed925Json?.optDouble(currentIndex, 0.0) ?: (wsVal.toDouble() * 1.2 * 3.6)) / 3.6).toFloat()
    val wd925 = windDir925Json?.optDouble(currentIndex, (wdVal.toDouble() + 10.0) % 360.0)?.toFloat() ?: ((wdVal + 10f) % 360f)
    val ws850 = ((windSpeed850Json?.optDouble(currentIndex, 0.0) ?: (wsVal.toDouble() * 1.5 * 3.6)) / 3.6).toFloat()
    val wd850 = windDir850Json?.optDouble(currentIndex, (wdVal.toDouble() + 20.0) % 360.0)?.toFloat() ?: ((wdVal + 20f) % 360f)
    val ws700 = ((windSpeed700Json?.optDouble(currentIndex, 0.0) ?: (wsVal.toDouble() * 1.8 * 3.6)) / 3.6).toFloat()
    val wd700 = windDir700Json?.optDouble(currentIndex, (wdVal.toDouble() + 30.0) % 360.0)?.toFloat() ?: ((wdVal + 30f) % 360f)
    val ws500 = ((windSpeed500Json?.optDouble(currentIndex, 0.0) ?: (wsVal.toDouble() * 2.2 * 3.6)) / 3.6).toFloat()
    val wd500 = windDir500Json?.optDouble(currentIndex, (wdVal.toDouble() + 40.0) % 360.0)?.toFloat() ?: ((wdVal + 40f) % 360f)
    val ws200 = ((windSpeed200Json?.optDouble(currentIndex, 0.0) ?: (wsVal.toDouble() * 3.5 * 3.6)) / 3.6).toFloat()
    val wd200 = windDir200Json?.optDouble(currentIndex, (wdVal.toDouble() + 60.0) % 360.0)?.toFloat() ?: ((wdVal + 60f) % 360f)

    val wmoCode = wmoCodes.optInt(currentIndex, 0)
    val condCode = mapWmoToTmdCode(wmoCode)
    val emojiAndLabel = getTmdEmojiAndLabel(condCode)

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
        locationDisplayName = "$dispName",
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
        daily = dailyList,
        surfacePressure = psVal,
        cloudLow = cLow,
        cloudMed = cMed,
        cloudHigh = cHigh,
        sourceStatus = "fallback",
        windSpeed925 = ws925,
        windDir925 = wd925,
        windSpeed850 = ws850,
        windDir850 = wd850,
        windSpeed700 = ws700,
        windDir700 = wd700,
        windSpeed500 = ws500,
        windDir500 = wd500,
        windSpeed200 = ws200,
        windDir200 = wd200
    )
}

private val java.net.HttpURLConnection.indigoStream: java.io.InputStream?
    get() = null

fun getWindDirectionLabel(degrees: Float): String {
    val directions = listOf("N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW")
    val index = (((degrees + 11.25) / 22.5).toInt() % 16).let { if (it < 0) it + 16 else it }
    return directions[index]
}

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
        
        drawRoundRect(
            color = Color.LightGray.copy(alpha = 0.3f),
            topLeft = androidx.compose.ui.geometry.Offset(0f, centerY - trackHeight / 2f),
            size = androidx.compose.ui.geometry.Size(width, trackHeight),
            cornerRadius = androidx.compose.ui.geometry.CornerRadius(rx, ry)
        )

        val totalRange = (maxTempWeekly - minTempWeekly).coerceAtLeast(1f)
        val startPct = ((minTemp - minTempWeekly) / totalRange).coerceIn(0f, 1f)
        val endPct = ((maxTemp - minTempWeekly) / totalRange).coerceIn(0f, 1f)

        val activeStart = startPct * width
        val activeEnd = endPct * width
        val activeWidth = (activeEnd - activeStart).coerceAtLeast(rx * 2)

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

        val temps = hourlyForecast.map { it.temp }
        val maxTemp = (temps.maxOrNull() ?: 40f).coerceAtLeast(35f)
        val minTemp = (temps.minOrNull() ?: 15f).coerceAtMost(20f)
        val tempRange = (maxTemp - minTemp).coerceAtLeast(1f)

        val barWidth = (chartWidth / hourlyForecast.size) * 0.6f
        val stepX = chartWidth / (hourlyForecast.size - 1).coerceAtLeast(1)

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

            drawPath(
                path = strokePath,
                color = Color(0xFF00E5FF),
                style = Stroke(width = 2.5.dp.toPx())
            )

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

data class HourlyForecastData(val time: String, val temp: Float, val rainProbability: Int)
data class DailyForecastData(val date: String, val minTemp: Float, val maxTemp: Float, val weatherCode: Int)

private fun Double.formatOne(): String = String.format(java.util.Locale.US, "%.1f", this)
private fun Float.formatOne(): String = String.format(java.util.Locale.US, "%.1f", this)
