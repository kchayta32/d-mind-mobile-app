package com.dmind.app.ui.screens.dashboard

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Assistant
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dmind.app.R
import com.dmind.app.ui.components.CriticalRed
import com.dmind.app.ui.components.DmindBlue
import com.dmind.app.ui.components.SafeGreen
import com.dmind.app.ui.components.WatchYellow
import com.dmind.app.ui.navigation.AppRoute
import com.dmind.app.ui.theme.DMindTheme
import com.dmind.app.ui.viewmodel.DisasterMapUiState
import com.dmind.app.util.LocaleManager
import java.util.Calendar

// หน้าจอแดชบอร์ดหลักของแอปพลิเคชัน แสดงปุ่มลัดและสถิติภาพรวม
@Composable
fun DashboardScreen(
    mapState: DisasterMapUiState,
    darkTheme: Boolean,
    currentLanguage: String,
    onToggleDarkTheme: () -> Unit,
    onToggleLanguage: () -> Unit,
    onNavigate: (AppRoute) -> Unit,
) {
    val counts = aggregateHomeHazardCounts(mapState.snapshot.events)
    val isDark = darkTheme
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(HomeColors.background(isDark))
            .statusBarsPadding(),
        contentPadding = PaddingValues(bottom = 84.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        // แถบด้านบนแสดงชื่อแอป ปุ่มสลับธีม และปุ่มเปลี่ยนภาษา
        item {
            HomeTopBar(
                darkTheme = darkTheme,
                currentLanguage = currentLanguage,
                onToggleDarkTheme = onToggleDarkTheme,
                onToggleLanguage = onToggleLanguage,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp),
            )
        }
        // ส่วนต้อนรับผู้ใช้งานตามช่วงเวลาของวัน
        item {
            GreetingHeader(
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ปุ่มทางลัดนำทางไปยังระบบผู้ช่วยอัจฉริยะ AI Chatbot
        item {
            AiAssistantCard(
                onClick = { onNavigate(AppRoute.Chatbot) },
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ปุ่มทางลัดนำทางไปยังแผนที่ภัยพิบัติ
        item {
            DisasterMapCard(
                onClick = { onNavigate(AppRoute.Map) },
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ส่วนสรุปสถิติจำนวนภัยพิบัติแต่ละประเภทในรอบ 24 ชั่วโมง
        item {
            StatSummaryCard(
                counts = counts,
                loading = mapState.isLoading,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ปุ่มทางลัดไปยังหน้าข้อมูลสภาพอากาศรายชั่วโมง
        item {
            WeatherShortcutCard(
                title = stringResource(R.string.weather_hourly_title),
                subtitle = stringResource(R.string.weather_hourly_subtitle),
                icon = Icons.Filled.Cloud,
                gradient = listOf(Color(0xFF38BDF8), Color(0xFF2563EB)),
                onClick = { onNavigate(AppRoute.Weather) },
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ปุ่มทางลัดไปยังข้อมูลพยากรณ์อากาศ 7 วันล่วงหน้า
        item {
            WeatherShortcutCard(
                title = stringResource(R.string.weather_7day_title),
                subtitle = stringResource(R.string.weather_7day_subtitle),
                icon = Icons.Filled.CalendarMonth,
                gradient = listOf(Color(0xFFFF8A1C), Color(0xFFF59E0B)),
                onClick = { onNavigate(AppRoute.WeeklyWeather) },
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        // ปุ่มทางลัดระบบรายงานตัวของผู้ประสบภัย
        item {
            WeatherShortcutCard(
                title = stringResource(R.string.nav_victim_reports),
                subtitle = stringResource(R.string.victim_reports_subtitle),
                icon = Icons.Filled.HealthAndSafety,
                gradient = listOf(Color(0xFFEF4444), Color(0xFFDC2626)),
                onClick = { onNavigate(AppRoute.VictimReports) },
                modifier = Modifier.padding(horizontal = 16.dp),
                enabled = false,
            )
        }
        // ปุ่มทางลัดระบบวิเคราะห์สถิติภัยพิบัติเชิงลึก
        item {
            WeatherShortcutCard(
                title = stringResource(R.string.analytics_dashboard_card_title),
                subtitle = stringResource(R.string.analytics_dashboard_card_subtitle),
                icon = Icons.Filled.Analytics,
                gradient = listOf(Color(0xFF8B5CF6), Color(0xFF6366F1)),
                onClick = { onNavigate(AppRoute.Analytics) },
                modifier = Modifier.padding(horizontal = 16.dp),
                enabled = false,
            )
        }
        // ปุ่มทางลัดการประเมินมูลค่าความเสียหายภัยพิบัติ
        item {
            WeatherShortcutCard(
                title = stringResource(R.string.nav_damage),
                subtitle = stringResource(R.string.damage_subtitle),
                icon = Icons.Filled.CameraAlt,
                gradient = listOf(Color(0xFF10B981), Color(0xFF059669)),
                onClick = { onNavigate(AppRoute.Damage) },
                modifier = Modifier.padding(horizontal = 16.dp),
                enabled = false,
            )
        }
    }
}

// คอมโพสเซเบิลแถบเครื่องมือด้านบนสุดบนหน้าจอแดชบอร์ด
@Composable
fun HomeTopBar(
    darkTheme: Boolean,
    currentLanguage: String,
    onToggleDarkTheme: () -> Unit,
    onToggleLanguage: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Brush.linearGradient(listOf(Color(0xFF38BDF8), Color(0xFF1D4ED8)))),
            contentAlignment = Alignment.Center,
        ) {
            Icon(Icons.Filled.Warning, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
        }
        Column(Modifier.weight(1f)) {
            Text(stringResource(R.string.app_name), fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, maxLines = 1)
            Text(
                stringResource(R.string.app_subtitle),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp,
                maxLines = 1,
            )
        }
        IconButton(onClick = onToggleDarkTheme, modifier = Modifier.size(40.dp)) {
            Icon(
                imageVector = if (darkTheme) Icons.Filled.WbSunny else Icons.Filled.DarkMode,
                contentDescription = stringResource(R.string.theme_toggle),
                modifier = Modifier.size(19.dp),
            )
        }
        Surface(
            modifier = Modifier.clickable(onClick = onToggleLanguage),
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.primaryContainer,
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            ) {
                Icon(
                    Icons.Filled.Language,
                    contentDescription = stringResource(R.string.language_toggle),
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.primary,
                )
                Text(
                    if (currentLanguage == LocaleManager.THAI) "TH" else "EN",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
    }
}

// คอมโพสเซเบิลส่วนหัวแสดงคำทักทายแบบไล่โทนสีตามช่วงเวลา
@Composable
fun GreetingHeader(
    modifier: Modifier = Modifier,
) {
    val greeting = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
        in 5..11 -> stringResource(R.string.greeting_morning)
        in 12..16 -> stringResource(R.string.greeting_afternoon)
        else -> stringResource(R.string.greeting_evening)
    }
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = Color.Transparent,
    ) {
        Box(
            modifier = Modifier
                .heightIn(min = 88.dp)
                .background(
                    Brush.linearGradient(listOf(Color(0xFF38BDF8), Color(0xFF1D4ED8))),
                    shape = RoundedCornerShape(16.dp),
                )
                .padding(horizontal = 18.dp, vertical = 14.dp),
        ) {
            Column(Modifier.align(Alignment.CenterStart)) {
                Text(greeting, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                Text(stringResource(R.string.greeting_subtitle), color = Color.White.copy(alpha = 0.82f), fontSize = 13.sp)
            }
            StatusMiniPill(
                label = stringResource(R.string.status_normal),
                color = SafeGreen,
                modifier = Modifier.align(Alignment.TopEnd),
            )
        }
    }
}

// คอมโพสเซเบิลการ์ดทางลัดสำหรับเข้าใช้งาน AI Chatbot
@Composable
fun AiAssistantCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    FeatureCard(
        modifier = modifier,
        gradient = listOf(Color(0xFF7C3AED), Color(0xFFA855F7)),
        onClick = onClick,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Surface(shape = CircleShape, color = Color.White.copy(alpha = 0.18f)) {
                        Icon(
                            Icons.Filled.Assistant,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.padding(6.dp).size(15.dp),
                        )
                    }
                    Surface(shape = RoundedCornerShape(999.dp), color = Color.White.copy(alpha = 0.18f)) {
                        Text(stringResource(R.string.ai_badge_new), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                    }
                }
                Text(stringResource(R.string.ai_assistant_title), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 19.sp)
                Text(
                    stringResource(R.string.ai_assistant_subtitle),
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            RobotLineIcon()
        }
    }
}

// คอมโพสเซเบิลการ์ดทางลัดสำหรับเข้าหน้าจอแผนที่ภัยพิบัติ
@Composable
fun DisasterMapCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ReferenceSurfaceCard(modifier = modifier.clickable(onClick = onClick), contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            HomeIconBox(Icons.Filled.LocationOn, DmindBlue)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(stringResource(R.string.disaster_map_title), fontWeight = FontWeight.ExtraBold, fontSize = 16.sp)
                Text(
                    stringResource(R.string.disaster_map_subtitle),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    maxLines = 1,
                )
            }
            Icon(Icons.Filled.Public, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
        }
    }
}

// คอมโพสเซเบิลการ์ดกลุ่มย่อยสรุปสถิติจำนวนภัยพิบัติ
@Composable
fun StatSummaryCard(
    counts: HomeHazardCounts,
    loading: Boolean,
    modifier: Modifier = Modifier,
) {
    ReferenceSurfaceCard(modifier = modifier, contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(stringResource(R.string.stat_24h_title), fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, modifier = Modifier.weight(1f))
            Text(stringResource(R.string.stat_24h_label), color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            StatMiniCard(if (loading) "0" else counts.earthquake.toString(), stringResource(R.string.stat_earthquake), WatchYellow, Modifier.weight(1f))
            StatMiniCard(if (loading) "0" else counts.flood.toString(), stringResource(R.string.stat_flood), DmindBlue, Modifier.weight(1f))
            StatMiniCard(if (loading) "0" else counts.wildfire.toString(), stringResource(R.string.stat_wildfire), CriticalRed, Modifier.weight(1f))
            StatMiniCard(if (loading) "0" else counts.storm.toString(), stringResource(R.string.stat_storm), Color(0xFF64748B), Modifier.weight(1f))
        }
    }
}

// คอมโพสเซเบิลการ์ดทางลัดอเนกประสงค์ มีตัวเลือกปิดการใช้งานชั่วคราว
@Composable
fun WeatherShortcutCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    gradient: List<Color>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val alpha = if (enabled) 1f else 0.65f
    val resolvedGradient = if (enabled) {
        gradient
    } else {
        listOf(Color(0xFF64748B), Color(0xFF475569))
    }
    
    FeatureCard(
        modifier = modifier,
        gradient = resolvedGradient,
        onClick = onClick,
        enabled = enabled,
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 13.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.alpha(alpha)
        ) {
            Surface(shape = RoundedCornerShape(12.dp), color = Color.White.copy(alpha = 0.18f)) {
                Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.padding(8.dp).size(18.dp))
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, maxLines = 1)
                Text(subtitle, color = Color.White.copy(alpha = 0.86f), fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            if (enabled) {
                Text("›", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Light)
            } else {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color.Black.copy(alpha = 0.35f),
                    modifier = Modifier.padding(start = 8.dp)
                ) {
                    Text(
                        text = stringResource(R.string.coming_soon),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

// คอมโพสเซเบิลการ์ดแบบกำหนดสีพื้นหลังไล่ระดับและรองรับการกดคลิก
@Composable
fun FeatureCard(
    gradient: List<Color>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(enabled = enabled, onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.linearGradient(gradient))
                .padding(contentPadding),
        ) {
            content()
        }
    }
}

// คอมโพสเซเบิลการ์ดกรอบมนพื้นสีสว่างเพื่อความคมชัดของข้อมูล
@Composable
private fun ReferenceSurfaceCard(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier.padding(contentPadding),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            content = content,
        )
    }
}

// คอมโพสเซเบิลย่อยสำหรับแสดงตัวเลขสถิติและประเภทเดี่ยว
@Composable
private fun StatMiniCard(
    value: String,
    label: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.height(62.dp),
        shape = RoundedCornerShape(12.dp),
        color = color.copy(alpha = 0.11f),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(value, color = color, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, maxLines = 1)
            Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

// คอมโพสเซเบิลรูปทรงสี่เหลี่ยมใส่ไอคอน
@Composable
private fun HomeIconBox(
    icon: ImageVector,
    color: Color,
) {
    Surface(shape = RoundedCornerShape(12.dp), color = color.copy(alpha = 0.13f)) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.padding(10.dp).size(20.dp))
    }
}

// คอมโพสเซเบิลเม็ดยาสถานะขนาดเล็ก
@Composable
private fun StatusMiniPill(
    label: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(999.dp),
        color = color,
    ) {
        Text(label, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 11.dp, vertical = 6.dp))
    }
}

// คอมโพสเซเบิลวาดไอคอนรูปหุ่นยนต์อย่างง่าย
@Composable
private fun RobotLineIcon() {
    Box(modifier = Modifier.size(width = 58.dp, height = 50.dp), contentAlignment = Alignment.Center) {
        Box(
            modifier = Modifier
                .size(width = 42.dp, height = 31.dp)
                .clip(RoundedCornerShape(9.dp))
                .background(Color.White.copy(alpha = 0.16f)),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Spacer(Modifier.size(7.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.42f)))
            Spacer(Modifier.size(7.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.42f)))
        }
        Spacer(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .width(3.dp)
                .height(10.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(Color.White.copy(alpha = 0.22f)),
        )
    }
}

// อ็อบเจกต์สีเฉพาะบนหน้าแดชบอร์ดหลัก
private object HomeColors {
    fun background(isDark: Boolean): Color = if (isDark) Color(0xFF080E1D) else Color(0xFFF8FAFC)
}

// ส่วนการแสดงพรีวิวหน้าจอแดชบอร์ด
@Preview(showBackground = true)
@Composable
private fun DashboardPreview() {
    DMindTheme {
        DashboardScreen(
            mapState = DisasterMapUiState(isLoading = false),
            darkTheme = false,
            currentLanguage = "th",
            onToggleDarkTheme = {},
            onToggleLanguage = {},
            onNavigate = {},
        )
    }
}
