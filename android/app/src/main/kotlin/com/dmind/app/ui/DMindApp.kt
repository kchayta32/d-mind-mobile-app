package com.dmind.app.ui

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Article
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Air
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.Done
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Public
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.dmind.app.BuildConfig
import com.dmind.app.data.NativeStatusRepository
import com.dmind.app.data.map.DisasterDataType
import com.dmind.app.data.map.DisasterMapRepository
import com.dmind.app.data.map.DisasterPoint
import com.dmind.app.data.map.DisasterSeverity
import com.dmind.app.data.map.MAP_REFRESH_INTERVAL_MS
import com.dmind.app.data.map.MapDataSnapshot
import com.dmind.app.data.map.PlaceSearchResult
import com.dmind.app.data.map.formatOne
import com.dmind.app.data.supabase.IncidentReportDraft
import com.dmind.app.data.supabase.IncidentReportRecord
import com.dmind.app.data.supabase.NotificationRecord
import com.dmind.app.data.supabase.RealtimeAlertRecord
import com.dmind.app.data.supabase.SupabaseRepository
import com.dmind.app.domain.ReliabilityStatus
import com.dmind.app.network.BackendConfig
import com.dmind.app.network.BackendRestClient
import com.dmind.app.network.InstallationIdProvider
import com.dmind.app.network.SupabaseConfig
import com.dmind.app.ui.theme.DMindTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.maplibre.android.annotations.MarkerOptions
import org.maplibre.android.MapLibre
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapLibreMap
import org.maplibre.android.maps.MapView
import org.maplibre.android.maps.Style

private val DmindBlue = Color(0xFF2563EB)
private val DmindIndigo = Color(0xFF4F46E5)
private val SkyBlue = Color(0xFF0EA5E9)
private val AlertRed = Color(0xFFEF4444)
private val WarmOrange = Color(0xFFF97316)
private val SuccessGreen = Color(0xFF22C55E)
private val Slate900 = Color(0xFF0F172A)
private val Slate800 = Color(0xFF1E293B)
private val Slate100 = Color(0xFFF1F5F9)
private val Slate50 = Color(0xFFF8FAFC)

private enum class AppRoute(
    val path: String,
    val label: String,
    val fullScreen: Boolean = false,
) {
    Home("/", "หน้าแรก"),
    Assistant("/assistant", "เอไอแชทบอท"),
    Manual("/manual", "คู่มือ"),
    Contacts("/contacts", "ฉุกเฉิน"),
    IncidentReports("/incident-reports", "รายงานเหตุการณ์"),
    DamageAssessment("/damage-assessment", "ประเมินความเสียหาย"),
    WeatherForecast("/weather-forecast", "พยากรณ์รายชั่วโมง"),
    DailyWeatherForecast("/daily-weather-forecast", "พยากรณ์ 7 วัน"),
    Notifications("/notifications", "ตั้งค่า"),
    AppGuide("/app-guide", "คู่มือแอป"),
    DisasterMap("/disaster-map", "แผนที่ภัยพิบัติ", fullScreen = true),
    RiskZones("/risk-zones", "แผนที่พื้นที่เสี่ยง", fullScreen = true),
}

private data class BottomNavItem(
    val route: AppRoute,
    val label: String,
    val icon: ImageVector,
)

private val bottomNavItems = listOf(
    BottomNavItem(AppRoute.Home, "หน้าแรก", Icons.Filled.Home),
    BottomNavItem(AppRoute.DisasterMap, "แผนที่", Icons.Filled.LocationOn),
    BottomNavItem(AppRoute.Contacts, "ฉุกเฉิน", Icons.Filled.Phone),
    BottomNavItem(AppRoute.Manual, "คู่มือ", Icons.Filled.Book),
    BottomNavItem(AppRoute.Notifications, "ตั้งค่า", Icons.Filled.Settings),
)

@Composable
fun DMindApp() {
    val context = LocalContext.current
    val activity = context as? Activity
    val repository = remember(context) { NativeStatusRepository(context) }
    val mapRepository = remember { DisasterMapRepository() }
    val supabaseRepository = remember(context) {
        SupabaseRepository(
            backendClient = BackendRestClient(installationId = InstallationIdProvider.get(context)),
        )
    }
    val systemDark = isSystemInDarkTheme()

    var darkTheme by rememberSaveable { mutableStateOf(systemDark) }
    var currentRouteName by rememberSaveable { mutableStateOf(AppRoute.Home.name) }
    var backStack by rememberSaveable { mutableStateOf(emptyList<String>()) }
    var nativeStatus by remember { mutableStateOf(repository.refreshStatus()) }
    var mapSnapshot by remember { mutableStateOf(MapDataSnapshot.Empty.copy(isLoading = true)) }
    var banner by remember { mutableStateOf("พร้อมรับมือทุกสถานการณ์") }
    var showLocationDisclosure by rememberSaveable { mutableStateOf(false) }

    val currentRoute = AppRoute.valueOf(currentRouteName)

    fun refreshStatus() {
        nativeStatus = repository.refreshStatus()
    }

    fun navigateTo(route: AppRoute) {
        if (route.name == currentRouteName) return
        backStack = backStack + currentRouteName
        currentRouteName = route.name
    }

    fun navigateBack() {
        if (backStack.isNotEmpty()) {
            currentRouteName = backStack.last()
            backStack = backStack.dropLast(1)
        } else if (currentRoute != AppRoute.Home) {
            currentRouteName = AppRoute.Home.name
        }
    }

    BackHandler(enabled = backStack.isNotEmpty() || currentRoute != AppRoute.Home) {
        navigateBack()
    }

    val foregroundPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) {
        refreshStatus()
    }
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) {
        refreshStatus()
    }

    LaunchedEffect(Unit) {
        refreshStatus()
    }

    LaunchedEffect(mapRepository) {
        while (isActive) {
            mapSnapshot = mapSnapshot.copy(isLoading = true, errorMessage = null)
            mapSnapshot = runCatching { mapRepository.fetchSnapshot() }
                .getOrElse { error ->
                    mapSnapshot.copy(
                        isLoading = false,
                        errorMessage = error.message ?: "ไม่สามารถอัปเดตข้อมูลแผนที่ได้",
                        updatedAtMillis = System.currentTimeMillis(),
                    )
                }
            delay(MAP_REFRESH_INTERVAL_MS)
        }
    }

    DMindTheme(darkTheme = darkTheme) {
        if (currentRoute.fullScreen) {
            FullScreenMapRoute(
                route = currentRoute,
                snapshot = mapSnapshot,
                repository = mapRepository,
                onBack = ::navigateBack,
                onSwitchRoute = { route -> currentRouteName = route.name },
            )
            return@DMindTheme
        }

        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                AppBottomNavigation(
                    currentRoute = currentRoute,
                    onNavigate = ::navigateTo,
                )
            },
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = padding.calculateBottomPadding())
                    .background(MaterialTheme.colorScheme.background),
            ) {
                when (currentRoute) {
                    AppRoute.Home -> HomeScreen(
                        darkTheme = darkTheme,
                        banner = banner,
                        mapSnapshot = mapSnapshot,
                        onToggleTheme = { darkTheme = !darkTheme },
                        onNavigate = ::navigateTo,
                    )

                    AppRoute.Assistant -> AssistantScreen(
                        supabaseRepository = supabaseRepository,
                        onBack = ::navigateBack,
                    )
                    AppRoute.Manual -> ManualScreen(onBack = ::navigateBack, onNavigate = ::navigateTo)
                    AppRoute.Contacts -> ContactsScreen(onBack = ::navigateBack)
                    AppRoute.IncidentReports -> IncidentReportsScreen(
                        supabaseRepository = supabaseRepository,
                        onBack = ::navigateBack,
                    )
                    AppRoute.DamageAssessment -> DamageAssessmentScreen(
                        supabaseRepository = supabaseRepository,
                        onBack = ::navigateBack,
                    )
                    AppRoute.WeatherForecast -> WeatherForecastScreen(onBack = ::navigateBack)
                    AppRoute.DailyWeatherForecast -> DailyWeatherForecastScreen(onBack = ::navigateBack)
                    AppRoute.Notifications -> NotificationSettingsScreen(
                        status = nativeStatus,
                        darkTheme = darkTheme,
                        backend = BackendConfig.baseUrl,
                        supabaseRepository = supabaseRepository,
                        onBack = ::navigateBack,
                        onToggleTheme = { darkTheme = !darkTheme },
                        onRequestLocation = {
                            showLocationDisclosure = true
                        },
                        onRequestNotifications = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            } else {
                                banner = "Android รุ่นนี้ไม่ต้องขอสิทธิ์แจ้งเตือนแยก"
                            }
                        },
                        onOpenBatterySettings = {
                            if (activity != null) repository.openBatterySettings(activity)
                            refreshStatus()
                        },
                        onOpenDndSettings = {
                            if (activity != null) repository.openDndSettings(activity)
                            refreshStatus()
                        },
                        onOpenAppSettings = {
                            if (activity != null) repository.openAppSettings(activity)
                            refreshStatus()
                        },
                        onRefreshFcm = {
                            repository.refreshFcmToken { ok ->
                                banner = if (ok) "อัปเดต FCM token แล้ว" else "ยังไม่พบ FCM token"
                                refreshStatus()
                            }
                        },
                        onTriggerAlert = {
                            repository.triggerDemoAlert()
                            banner = "ส่งแจ้งเตือนทดสอบแล้ว"
                            refreshStatus()
                        },
                    )

                    AppRoute.AppGuide -> AppGuideScreen(onBack = ::navigateBack, onNavigate = ::navigateTo)
                    AppRoute.DisasterMap,
                    AppRoute.RiskZones,
                    -> Unit
                }
            }
        }

        if (showLocationDisclosure) {
            AlertDialog(
                onDismissRequest = { showLocationDisclosure = false },
                title = { Text("การใช้ตำแหน่งเพื่อแจ้งเตือนภัย") },
                text = {
                    Text(
                        "D-MIND ใช้ตำแหน่งของอุปกรณ์เพื่อค้นหาภัยใกล้ตัว ส่ง SOS และแจ้งเตือนพื้นที่เสี่ยง แม้แอปทำงานอยู่เบื้องหลังเมื่อคุณเปิดโหมดเฝ้าระวัง คุณปิดสิทธิ์นี้ได้จากการตั้งค่า Android",
                    )
                },
                confirmButton = {
                    Button(
                        onClick = {
                            showLocationDisclosure = false
                            foregroundPermissionLauncher.launch(
                                arrayOf(
                                    Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_COARSE_LOCATION,
                                ),
                            )
                        },
                    ) {
                        Text("ยอมรับและขอสิทธิ์")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showLocationDisclosure = false }) {
                        Text("ยกเลิก")
                    }
                },
            )
        }
    }
}

@Composable
private fun AppBottomNavigation(
    currentRoute: AppRoute,
    onNavigate: (AppRoute) -> Unit,
) {
    val container = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .shadow(12.dp, RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp)),
        color = container,
        tonalElevation = 8.dp,
        shape = RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(66.dp)
                .padding(horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            bottomNavItems.forEach { item ->
                val selected = currentRoute == item.route
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { onNavigate(item.route) },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    Box(
                        modifier = Modifier
                            .size(if (selected) 34.dp else 30.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(if (selected) DmindBlue else Color.Transparent),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.label,
                            tint = if (selected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(19.dp),
                        )
                    }
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = item.label,
                        color = if (selected) DmindBlue else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        maxLines = 1,
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(
    darkTheme: Boolean,
    banner: String,
    mapSnapshot: MapDataSnapshot,
    onToggleTheme: () -> Unit,
    onNavigate: (AppRoute) -> Unit,
) {
    val isDark = MaterialTheme.colorScheme.background == Color(0xFF0B1220)
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(if (isDark) Color(0xFF020617) else Slate50),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .background(
                    Brush.verticalGradient(
                        listOf(
                            DmindBlue.copy(alpha = if (isDark) 0.55f else 0.18f),
                            Color.Transparent,
                        ),
                    ),
                ),
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .padding(bottom = 18.dp),
        ) {
            HomeTopBar(
                darkTheme = darkTheme,
                onToggleTheme = onToggleTheme,
            )

            Column(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = "สวัสดี, ผู้ใช้งาน",
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onBackground,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "พร้อมรับมือทุกสถานการณ์",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    StatusPill(text = banner, color = SuccessGreen)
                }

                FeatureHeroCard(
                    title = "Dr.Mind AI",
                    subtitle = "ผู้ช่วยอัจฉริยะ ปรึกษาได้ตลอด 24 ชม.",
                    badge = "New",
                    icon = Icons.Filled.SmartToy,
                    gradient = listOf(DmindIndigo, Color(0xFF9333EA)),
                    onClick = { onNavigate(AppRoute.Assistant) },
                )

                HomeActionCard(
                    title = "แผนที่ภัยพิบัติ",
                    subtitle = "ติดตามสถานการณ์แบบเรียลไทม์",
                    icon = Icons.Filled.LocationOn,
                    iconColor = DmindBlue,
                    trailingIcon = Icons.Filled.Public,
                    onClick = { onNavigate(AppRoute.DisasterMap) },
                )

                LatestStatsCard(mapSnapshot)

                GradientActionCard(
                    title = "พยากรณ์อากาศรายชั่วโมง",
                    subtitle = "ข้อมูลจากกรมอุตุนิยมวิทยา (TMD)",
                    icon = Icons.Filled.Cloud,
                    gradient = listOf(SkyBlue, DmindBlue),
                    onClick = { onNavigate(AppRoute.WeatherForecast) },
                )

                GradientActionCard(
                    title = "พยากรณ์อากาศ 7 วัน",
                    subtitle = "อุณหภูมิสูงสุด-ต่ำสุด รายวัน",
                    icon = Icons.Filled.CalendarMonth,
                    gradient = listOf(WarmOrange, Color(0xFFF59E0B)),
                    onClick = { onNavigate(AppRoute.DailyWeatherForecast) },
                )

                Text(
                    text = "เครื่องมือช่วยเหลือ",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                    modifier = Modifier.padding(top = 2.dp, start = 4.dp),
                )

                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "เบอร์ฉุกเฉิน",
                        icon = Icons.Filled.Phone,
                        iconColor = AlertRed,
                        onClick = { onNavigate(AppRoute.Contacts) },
                    )
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "รายงานเหตุการณ์",
                        icon = Icons.Filled.Report,
                        iconColor = WarmOrange,
                        onClick = { onNavigate(AppRoute.IncidentReports) },
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "คู่มือ/วิจัย",
                        icon = Icons.Filled.Book,
                        iconColor = SuccessGreen,
                        onClick = { onNavigate(AppRoute.Manual) },
                    )
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "คู่มือแอป",
                        icon = Icons.Filled.Info,
                        iconColor = Color(0xFF8B5CF6),
                        onClick = { onNavigate(AppRoute.AppGuide) },
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "ประเมินความเสียหาย",
                        icon = Icons.Filled.CameraAlt,
                        iconColor = Color(0xFF0F766E),
                        onClick = { onNavigate(AppRoute.DamageAssessment) },
                    )
                    ToolCard(
                        modifier = Modifier.weight(1f),
                        title = "พื้นที่เสี่ยง",
                        icon = Icons.Filled.Layers,
                        iconColor = DmindBlue,
                        onClick = { onNavigate(AppRoute.RiskZones) },
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeTopBar(
    darkTheme: Boolean,
    onToggleTheme: () -> Unit,
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 4.dp,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            DmindLogo(Modifier.size(36.dp))
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = "D-MIND",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 19.sp,
                )
                Text(
                    text = "Disaster Monitor",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp,
                )
            }
            IconButton(onClick = onToggleTheme) {
                Icon(
                    imageVector = if (darkTheme) Icons.Filled.LightMode else Icons.Filled.DarkMode,
                    contentDescription = "Toggle theme",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            TextButton(onClick = {}) {
                Icon(
                    imageVector = Icons.Filled.Language,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(15.dp),
                )
                Spacer(Modifier.width(4.dp))
                Text("TH", fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun DmindLogo(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF0EA5E9), Color(0xFF2563EB))))
            .border(1.dp, Color.White.copy(alpha = 0.45f), RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            imageVector = Icons.Filled.Warning,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(20.dp),
        )
    }
}

@Composable
private fun StatusPill(
    text: String,
    color: Color,
) {
    Surface(
        color = color,
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 4.dp,
    ) {
        Text(
            text = text,
            color = Color.White,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun FeatureHeroCard(
    title: String,
    subtitle: String,
    badge: String,
    icon: ImageVector,
    gradient: List<Color>,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(116.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Brush.horizontalGradient(gradient))
            .clickable(onClick = onClick),
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.White.copy(alpha = 0.2f),
            modifier = Modifier
                .size(98.dp)
                .align(Alignment.CenterEnd)
                .padding(end = 18.dp),
        )
        Column(
            modifier = Modifier
                .align(Alignment.CenterStart)
                .padding(horizontal = 22.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color.White.copy(alpha = 0.18f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(19.dp))
                }
                Spacer(Modifier.width(8.dp))
                Surface(color = Color.White.copy(alpha = 0.16f), shape = RoundedCornerShape(999.dp)) {
                    Text(
                        text = badge,
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(title, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = Color.White.copy(alpha = 0.82f), fontSize = 12.sp)
        }
    }
}

@Composable
private fun HomeActionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    trailingIcon: ImageVector,
    onClick: () -> Unit,
) {
    ElevatedPanel(
        modifier = Modifier.clickable(onClick = onClick),
        contentPadding = PaddingValues(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(icon = icon, color = iconColor)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                Text(subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            Icon(trailingIcon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun LatestStatsCard(snapshot: MapDataSnapshot) {
    val weatherRain = snapshot.weather?.rainMillimeters ?: 0.0
    ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Text("สถิติ 24 ชม. ล่าสุด", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(Modifier.weight(1f))
            Text("Last 24h", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 10.sp)
        }
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(
                StatItem("แผ่นดินไหว", snapshot.earthquakes.size.toString(), Color(0xFFEAB308), Color(0xFFFEF3C7)),
                StatItem("น้ำท่วม", snapshot.floods.size.toString(), DmindBlue, Color(0xFFDBEAFE)),
                StatItem("ไฟป่า", snapshot.wildfires.size.toString(), AlertRed, Color(0xFFFEE2E2)),
                StatItem("ฝน", weatherRain.formatOne(), Color(0xFF64748B), Slate100),
            ).forEach { item ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
            .background(
                if (MaterialTheme.colorScheme.background == Color(0xFF0B1220)) {
                    Slate800
                } else {
                    item.background
                },
            )
                        .padding(vertical = 10.dp, horizontal = 4.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = item.value,
                            color = item.color,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = item.label,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 10.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

private data class StatItem(
    val label: String,
    val value: String,
    val color: Color,
    val background: Color,
)

@Composable
private fun GradientActionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    gradient: List<Color>,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Brush.horizontalGradient(gradient))
            .clickable(onClick = onClick)
            .padding(15.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color.White.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(subtitle, color = Color.White.copy(alpha = 0.82f), fontSize = 12.sp)
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = Color.White.copy(alpha = 0.75f),
        )
    }
}

@Composable
private fun ToolCard(
    modifier: Modifier = Modifier,
    title: String,
    icon: ImageVector,
    iconColor: Color,
    onClick: () -> Unit,
) {
    ElevatedPanel(
        modifier = modifier
            .height(112.dp)
            .clickable(onClick = onClick),
        contentPadding = PaddingValues(12.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            IconBubble(icon = icon, color = iconColor)
            Spacer(Modifier.height(8.dp))
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurface,
            )
        }
    }
}

@Composable
private fun IconBubble(
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .size(42.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(color.copy(alpha = if (isSystemInDarkTheme()) 0.22f else 0.12f)),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(23.dp))
    }
}

@Composable
private fun ElevatedPanel(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(contentPadding),
            content = content,
        )
    }
}

@Composable
private fun FullScreenMapRoute(
    route: AppRoute,
    snapshot: MapDataSnapshot,
    repository: DisasterMapRepository,
    onBack: () -> Unit,
    onSwitchRoute: (AppRoute) -> Unit,
) {
    val isStationMap = route == AppRoute.RiskZones
    var expanded by rememberSaveable(route.name) { mutableStateOf(true) }
    var selectedLayer by rememberSaveable(route.name) {
        mutableStateOf(if (isStationMap) "สถานี D-MIND" else "ทั้งหมด")
    }
    var searchQuery by rememberSaveable { mutableStateOf("") }
    var isSearching by remember { mutableStateOf(false) }
    var searchResults by remember { mutableStateOf(emptyList<PlaceSearchResult>()) }
    var focusedPlace by remember { mutableStateOf<PlaceSearchResult?>(null) }
    var mapAction by remember { mutableStateOf<MapCameraAction?>(null) }
    val visiblePoints = remember(snapshot, selectedLayer, route) {
        mapLayerPoints(snapshot, selectedLayer, isStationMap)
    }

    fun sendMapAction(kind: MapCameraActionKind) {
        mapAction = MapCameraAction(System.nanoTime(), kind)
    }

    LaunchedEffect(searchQuery) {
        val query = searchQuery.trim()
        if (query.length < 2) {
            searchResults = emptyList()
            isSearching = false
            return@LaunchedEffect
        }
        delay(350)
        isSearching = true
        searchResults = repository.searchPlaces(query)
        isSearching = false
    }

    Box(Modifier.fillMaxSize()) {
        MapLibreNativeView(
            modifier = Modifier.fillMaxSize(),
            markers = visiblePoints,
            focus = focusedPlace,
            selectedLayer = if (isStationMap) "สถานี D-MIND" else selectedLayer,
            cameraAction = mapAction,
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .align(Alignment.TopCenter)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.White.copy(alpha = 0.64f), Color.White.copy(alpha = 0.18f), Color.Transparent),
                    ),
                ),
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 18.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                MapCircleButton(icon = Icons.Filled.Menu, onClick = onBack, size = 52.dp)
                MapTitleSearchPill(
                    value = searchQuery,
                    isSearching = isSearching,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.weight(1f),
                )
                MapCircleButton(
                    icon = Icons.Filled.Map,
                    onClick = { sendMapAction(MapCameraActionKind.CenterThailand) },
                    size = 52.dp,
                    tint = DmindBlue,
                )
            }

            MapModeFilterPill(
                stationSelected = isStationMap,
                onStationsClick = { onSwitchRoute(AppRoute.RiskZones) },
                onDisastersClick = { onSwitchRoute(AppRoute.DisasterMap) },
            )

            if (isStationMap) {
                StationQuickFilterRow(
                    selectedLayer = selectedLayer,
                    onLayerSelected = { selectedLayer = it },
                )
                StationLegend()
            } else {
                DisasterQuickFilterRow(
                    selectedLayer = selectedLayer,
                    snapshot = snapshot,
                    onLayerSelected = { selectedLayer = it },
                )
                SeverityLegend()
            }

            if (searchResults.isNotEmpty()) {
                MapSearchResultsPanel(
                    results = searchResults,
                    onResultClick = { result ->
                        focusedPlace = result
                        searchQuery = result.name.substringBefore(',')
                        searchResults = emptyList()
                    },
                )
            }
        }

        MapRightControls(
            modifier = Modifier
                .align(Alignment.CenterEnd)
                .padding(end = 18.dp, bottom = 30.dp),
            onLocate = { sendMapAction(MapCameraActionKind.CenterThailand) },
            onZoomIn = { sendMapAction(MapCameraActionKind.ZoomIn) },
            onZoomOut = { sendMapAction(MapCameraActionKind.ZoomOut) },
        )

        MapLeftControls(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(
                    start = 18.dp,
                    bottom = if (expanded) 316.dp else 154.dp,
                ),
            onLocate = { sendMapAction(MapCameraActionKind.CenterThailand) },
            onLayers = { expanded = true },
        )

        MapBottomPanel(
            modifier = Modifier.align(Alignment.BottomCenter),
            route = route,
            snapshot = snapshot,
            selectedLayer = selectedLayer,
            expanded = expanded,
            onLayerSelected = { selectedLayer = it },
            onToggleExpanded = { expanded = !expanded },
            onReportClick = { onSwitchRoute(AppRoute.IncidentReports) },
        )
    }
}

private data class MapCameraAction(
    val id: Long,
    val kind: MapCameraActionKind,
)

private enum class MapCameraActionKind {
    CenterThailand,
    ZoomIn,
    ZoomOut,
}

@Composable
private fun MapTitleSearchPill(
    value: String,
    isSearching: Boolean,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .height(52.dp)
            .shadow(10.dp, RoundedCornerShape(999.dp), clip = false),
        placeholder = {
            Text(
                "แผนที่ D-MIND",
                color = Slate900,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        },
        singleLine = true,
        leadingIcon = {
            Icon(Icons.Filled.Warning, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(28.dp))
        },
        trailingIcon = {
            if (isSearching) {
                Text("...", color = DmindBlue, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            } else {
                Icon(Icons.Filled.Search, contentDescription = null, tint = Slate900, modifier = Modifier.size(28.dp))
            }
        },
        shape = RoundedCornerShape(999.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = Color.White.copy(alpha = 0.96f),
            unfocusedContainerColor = Color.White.copy(alpha = 0.96f),
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            cursorColor = DmindBlue,
        ),
    )
}

@Composable
private fun MapModeFilterPill(
    stationSelected: Boolean,
    onStationsClick: () -> Unit,
    onDisastersClick: () -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Color.White.copy(alpha = 0.96f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 9.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.72f)),
    ) {
        Row(
            modifier = Modifier
                .height(58.dp)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            MapFilterSegment(
                label = "สถานี D-MIND",
                icon = Icons.Filled.LocationOn,
                selected = stationSelected,
                onClick = onStationsClick,
                modifier = Modifier.weight(1f),
            )
            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(30.dp)
                    .background(Color(0xFFE2E8F0)),
            )
            MapFilterSegment(
                label = "ภัยต่างๆ",
                icon = Icons.Filled.Security,
                selected = !stationSelected,
                onClick = onDisastersClick,
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun MapFilterSegment(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Row(
        modifier = modifier
            .fillMaxHeight()
            .clip(RoundedCornerShape(999.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        Icon(icon, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(26.dp))
        Spacer(Modifier.width(10.dp))
        Text(
            label,
            color = Slate900,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.SemiBold,
            fontSize = 15.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.width(8.dp))
        Icon(Icons.Filled.ExpandMore, contentDescription = null, tint = Slate900, modifier = Modifier.size(22.dp))
    }
}

@Composable
private fun DisasterQuickFilterRow(
    selectedLayer: String,
    snapshot: MapDataSnapshot,
    onLayerSelected: (String) -> Unit,
) {
    val layers = listOf("ทั้งหมด", "ไฟป่า", "น้ำท่วม", "ดินถล่ม", "พายุ", "แผ่นดินไหว", "ภัยแล้ง")
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        layers.forEach { layer ->
            MapFilterChip(
                label = layer,
                selected = layer == selectedLayer,
                iconText = disasterEmoji(layer),
                count = mapLayerPoints(snapshot, layer, stationMode = false).size,
                onClick = { onLayerSelected(layer) },
            )
        }
    }
}

@Composable
private fun StationQuickFilterRow(
    selectedLayer: String,
    onLayerSelected: (String) -> Unit,
) {
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        listOf("สถานี D-MIND", "ออนไลน์", "แจ้งเตือน", "ออฟไลน์").forEach { layer ->
            MapFilterChip(
                label = layer,
                selected = layer == selectedLayer,
                iconText = disasterEmoji(layer),
                count = dMindStationPointsForLayer(layer).size,
                onClick = { onLayerSelected(layer) },
            )
        }
    }
}

@Composable
private fun MapFilterChip(
    label: String,
    selected: Boolean,
    iconText: String,
    count: Int,
    onClick: () -> Unit,
) {
    val accent = layerAccentColor(label)
    Surface(
        modifier = Modifier.clickable(onClick = onClick),
        color = if (selected) DmindBlue else Color.White.copy(alpha = 0.96f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 6.dp,
        border = BorderStroke(1.dp, if (selected) DmindBlue else Color.White.copy(alpha = 0.7f)),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                iconText,
                color = if (selected) Color.White else accent,
                fontWeight = FontWeight.Bold,
                fontSize = if (label == "ทั้งหมด") 18.sp else 17.sp,
                maxLines = 1,
            )
            Spacer(Modifier.width(8.dp))
            Text(
                label,
                color = if (selected) Color.White else Slate800,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                maxLines = 1,
            )
            if (count > 0 && label != "ทั้งหมด") {
                Spacer(Modifier.width(7.dp))
                Text(
                    count.coerceAtMost(99).toString(),
                    color = if (selected) Color.White.copy(alpha = 0.86f) else Color(0xFF64748B),
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                )
            }
        }
    }
}

@Composable
private fun MapSearchResultsPanel(
    results: List<PlaceSearchResult>,
    onResultClick: (PlaceSearchResult) -> Unit,
) {
    Surface(
        color = Color.White.copy(alpha = 0.98f),
        shape = RoundedCornerShape(18.dp),
        shadowElevation = 7.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.72f)),
    ) {
        Column(Modifier.fillMaxWidth().padding(6.dp)) {
            results.forEach { result ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { onResultClick(result) }
                        .padding(horizontal = 10.dp, vertical = 9.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Filled.LocationOn, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(9.dp))
                    Column(Modifier.weight(1f)) {
                        Text(result.name.substringBefore(','), color = Slate800, fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                        Text(result.name, color = Color(0xFF64748B), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                }
            }
        }
    }
}

@Composable
private fun MapRightControls(
    modifier: Modifier = Modifier,
    onLocate: () -> Unit,
    onZoomIn: () -> Unit,
    onZoomOut: () -> Unit,
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        MapCircleButton(icon = Icons.Filled.MyLocation, onClick = onLocate, size = 52.dp, tint = Slate900)
        Surface(
            color = Color.White.copy(alpha = 0.96f),
            shape = RoundedCornerShape(18.dp),
            shadowElevation = 7.dp,
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.75f)),
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                IconButton(onClick = onZoomIn, modifier = Modifier.size(52.dp)) {
                    Icon(Icons.Filled.Add, contentDescription = "Zoom in", tint = Slate900, modifier = Modifier.size(26.dp))
                }
                Box(
                    modifier = Modifier
                        .width(52.dp)
                        .height(1.dp)
                        .background(Color(0xFFE2E8F0)),
                )
                IconButton(onClick = onZoomOut, modifier = Modifier.size(52.dp)) {
                    Icon(Icons.Filled.Remove, contentDescription = "Zoom out", tint = Slate900, modifier = Modifier.size(26.dp))
                }
            }
        }
    }
}

@Composable
private fun MapLeftControls(
    modifier: Modifier = Modifier,
    onLocate: () -> Unit,
    onLayers: () -> Unit,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        MapFloatingPill(
            icon = Icons.Filled.MyLocation,
            label = "ตำแหน่งของฉัน",
            tint = DmindBlue,
            onClick = onLocate,
        )
        MapFloatingPill(
            icon = Icons.Filled.Layers,
            label = "ชั้นข้อมูล",
            tint = Slate900,
            trailing = { Icon(Icons.Filled.ExpandMore, contentDescription = null, tint = Slate900, modifier = Modifier.size(20.dp)) },
            onClick = onLayers,
        )
    }
}

@Composable
private fun MapFloatingPill(
    icon: ImageVector,
    label: String,
    tint: Color,
    trailing: @Composable (() -> Unit)? = null,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier.clickable(onClick = onClick),
        color = Color.White.copy(alpha = 0.96f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 7.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.72f)),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(22.dp))
            Spacer(Modifier.width(10.dp))
            Text(label, color = if (tint == DmindBlue) DmindBlue else Slate900, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            if (trailing != null) {
                Spacer(Modifier.width(10.dp))
                trailing()
            }
        }
    }
}

@Composable
private fun MapTopButton(
    onClick: () -> Unit,
    content: @Composable RowScope.() -> Unit,
) {
    Surface(
        modifier = Modifier.clickable(onClick = onClick),
        color = Color.White.copy(alpha = 0.96f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 7.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.7f)),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 11.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            content = content,
        )
    }
}

@Composable
private fun MapCircleButton(
    icon: ImageVector,
    onClick: () -> Unit,
    size: Dp = 40.dp,
    tint: Color = Slate800,
) {
    Surface(
        modifier = Modifier
            .size(size)
            .clickable(onClick = onClick),
        color = Color.White.copy(alpha = 0.96f),
        shape = CircleShape,
        shadowElevation = 7.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.7f)),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(size * 0.52f))
        }
    }
}

@Composable
private fun SegmentedMapButton(
    selected: Boolean,
    label: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    accent: Color = DmindBlue,
    onClick: () -> Unit,
) {
    Row(
        modifier = modifier
            .fillMaxHeight()
            .clip(RoundedCornerShape(12.dp))
            .background(if (selected) accent else Color.Transparent)
            .clickable(onClick = onClick),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = if (selected) Color.White else Color(0xFF64748B),
            modifier = Modifier.size(14.dp),
        )
        Spacer(Modifier.width(6.dp))
        Text(
            label,
            color = if (selected) Color.White else Slate800,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun MapGlassPanel(content: @Composable ColumnScope.() -> Unit) {
    Surface(
        color = Color.White.copy(alpha = 0.92f),
        shape = RoundedCornerShape(18.dp),
        shadowElevation = 8.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.65f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(6.dp),
            content = content,
        )
    }
}

@Composable
private fun MapSearchField(
    value: String,
    isSearching: Boolean,
    placeholder: String,
    onValueChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .fillMaxWidth()
            .height(44.dp),
        placeholder = {
            Text(
                text = placeholder,
                fontSize = 12.sp,
                color = Color(0xFF94A3B8),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        },
        singleLine = true,
        leadingIcon = {
            Icon(Icons.Filled.Search, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(18.dp))
        },
        trailingIcon = {
            if (isSearching) {
                Text("...", color = DmindBlue, fontWeight = FontWeight.Bold)
            } else {
                Icon(Icons.Filled.Tune, contentDescription = null, tint = Slate800, modifier = Modifier.size(18.dp))
            }
        },
        shape = RoundedCornerShape(14.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = Slate50,
            unfocusedContainerColor = Slate50,
            focusedIndicatorColor = DmindBlue.copy(alpha = 0.35f),
            unfocusedIndicatorColor = Color.Transparent,
            cursorColor = DmindBlue,
        ),
    )
}

@Composable
private fun MapSpotlightCallout(
    point: DisasterPoint,
    selectedLayer: String,
    stationMode: Boolean,
    modifier: Modifier = Modifier,
) {
    val accent = if (stationMode) SuccessGreen else layerAccentColor(selectedLayer)
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color.White.copy(alpha = 0.96f),
            shape = RoundedCornerShape(18.dp),
            shadowElevation = 9.dp,
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.72f)),
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(accent.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = if (stationMode) "◎" else disasterEmoji(selectedLayer),
                        fontSize = if (stationMode) 28.sp else 22.sp,
                        color = accent,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = if (stationMode) point.title.removePrefix("สถานี D-MIND ") else point.title,
                        color = Slate900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        lineHeight = 17.sp,
                    )
                    Spacer(Modifier.height(3.dp))
                    Text(
                        text = "${point.metric} • ${severityLabel(point.severity)}",
                        color = Color(0xFF64748B),
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
        Box(
            modifier = Modifier
                .size(18.dp)
                .rotate(45f)
                .offset(y = (-9).dp)
                .background(Color.White.copy(alpha = 0.96f)),
        )
    }
}

@Composable
private fun SeverityLegend() {
    Surface(
        color = Color.White.copy(alpha = 0.94f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 7.dp,
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.7f)),
    ) {
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            listOf(
                "ดี" to SuccessGreen,
                "ปานกลาง" to Color(0xFFFACC15),
                "เริ่มมีผลกระทบ" to WarmOrange,
                "มีผลกระทบ" to AlertRed,
                "มีผลกระทบมาก" to Color(0xFFC026D3),
            ).forEach { (label, color) ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(color),
                    )
                    Spacer(Modifier.width(7.dp))
                    Text(label, fontSize = 12.sp, color = Slate800, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@Composable
private fun StationLegend() {
    Surface(
        color = Color.White.copy(alpha = 0.9f),
        shape = RoundedCornerShape(999.dp),
        shadowElevation = 2.dp,
    ) {
        Row(
            modifier = Modifier
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 10.dp, vertical = 7.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            listOf(
                "ออนไลน์" to SuccessGreen,
                "แจ้งเตือน" to AlertRed,
                "ออฟไลน์" to Color(0xFF64748B),
            ).forEach { (label, color) ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(color),
                    )
                    Spacer(Modifier.width(5.dp))
                    Text(label, fontSize = 11.sp, color = Slate800)
                }
            }
        }
    }
}

@Composable
private fun MapBottomPanel(
    modifier: Modifier = Modifier,
    route: AppRoute,
    snapshot: MapDataSnapshot,
    selectedLayer: String,
    expanded: Boolean,
    onLayerSelected: (String) -> Unit,
    onToggleExpanded: () -> Unit,
    onReportClick: () -> Unit,
) {
    val context = LocalContext.current
    val isStationMap = route == AppRoute.RiskZones
    val selectedPoints = mapLayerPoints(snapshot, selectedLayer, isStationMap)
    val headlinePoint = selectedPoints.maxByOrNull { severityWeight(it.severity) }
    val accent = if (isStationMap) SuccessGreen else layerAccentColor(selectedLayer)
    val highRiskCount = selectedPoints.count {
        it.severity == DisasterSeverity.High || it.severity == DisasterSeverity.VeryHigh
    }
    val readySources = if (isStationMap) dMindStationPoints().count { it.metric == "ออนไลน์" } else snapshot.statuses.count { it.ok }
    val coveragePercent = if (selectedPoints.isEmpty()) 0 else ((highRiskCount.toFloat() / selectedPoints.size.toFloat()) * 100).toInt()
    val sourceLayers = if (isStationMap) 4 else snapshot.statuses.count { it.name.startsWith("GISTDA") }.coerceAtLeast(1)
    val sheetTitle = mapSheetTitle(selectedLayer, headlinePoint, isStationMap)
    val primaryMetricLabel = if (!isStationMap && selectedLayer == "ทั้งหมด" && headlinePoint?.type == DisasterDataType.Wildfire) {
        "จุดความร้อน"
    } else if (isStationMap) {
        "สถานี"
    } else {
        selectedLayer
    }
    val shareText = "$sheetTitle\n${if (isStationMap) stationStatusText(selectedLayer) else mapStatusText(snapshot, selectedLayer)}"

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = Color.White.copy(alpha = 0.96f),
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        shadowElevation = 14.dp,
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 18.dp, vertical = 9.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center,
            ) {
                Box(
                    modifier = Modifier
                        .width(42.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(999.dp))
                        .background(Color(0xFFCBD5E1)),
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(accent.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(disasterEmoji(selectedLayer), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = accent)
                }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = sheetTitle,
                        color = Slate900,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = if (isStationMap) "อัปเดตล่าสุดจากสถานีจำลอง" else "อัปเดตล่าสุด ${latestMapUpdateLabel(snapshot)}",
                        color = Color(0xFF64748B),
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                IconButton(
                    onClick = onToggleExpanded,
                    modifier = Modifier
                        .size(50.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFF8FAFC))
                        .border(1.dp, Color(0xFFE2E8F0), CircleShape),
                ) {
                    Icon(
                        imageVector = if (expanded) Icons.Filled.ExpandMore else Icons.Filled.ExpandLess,
                        contentDescription = null,
                        tint = Slate900,
                        modifier = Modifier.size(28.dp),
                    )
                }
            }

            if (expanded) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    MapSheetMetricCard(
                        value = selectedPoints.size.toString(),
                        label = primaryMetricLabel,
                        caption = if (isStationMap) "${highRiskCount} แจ้งเตือน" else "↑ $highRiskCount ระดับสูง",
                        color = AlertRed,
                        background = Color(0xFFFFF1F2),
                        modifier = Modifier.weight(1f),
                    )
                    MapSheetMetricCard(
                        value = sourceLayers.toString(),
                        label = if (isStationMap) "กลุ่มสถานี" else "ชั้น GISTDA",
                        caption = if (isStationMap) "สถานะพร้อมใช้" else "High Confidence",
                        color = SuccessGreen,
                        background = Color(0xFFECFDF5),
                        modifier = Modifier.weight(1f),
                    )
                    MapSheetMetricCard(
                        value = "$coveragePercent%",
                        label = if (isStationMap) "เฝ้าระวัง" else "ระดับสูงมาก",
                        caption = "ครอบคลุมพื้นที่เสี่ยง",
                        color = WarmOrange,
                        background = Color(0xFFFFFBEB),
                        modifier = Modifier.weight(1f),
                    )
                    MapSheetMetricCard(
                        value = readySources.toString(),
                        label = if (isStationMap) "ออนไลน์" else "API พร้อมใช้งาน",
                        caption = if (isStationMap) "รอ endpoint จริง" else "สำหรับนักพัฒนา",
                        color = DmindBlue,
                        background = Color(0xFFEFF6FF),
                        modifier = Modifier.weight(1f),
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Button(
                        onClick = onToggleExpanded,
                        modifier = Modifier
                            .weight(1.15f)
                            .height(58.dp),
                        shape = RoundedCornerShape(999.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DmindBlue, contentColor = Color.White),
                    ) {
                        Icon(Icons.Filled.Visibility, contentDescription = null, modifier = Modifier.size(22.dp))
                        Spacer(Modifier.width(10.dp))
                        Text("ดูรายละเอียด", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                    OutlinedButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, shareText)
                            }
                            context.startActivity(Intent.createChooser(intent, "แชร์ข้อมูลแผนที่"))
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(58.dp),
                        shape = RoundedCornerShape(999.dp),
                        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                    ) {
                        Icon(Icons.Filled.Share, contentDescription = null, tint = Slate800, modifier = Modifier.size(22.dp))
                        Spacer(Modifier.width(10.dp))
                        Text("แชร์", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            } else {
                Text(
                    text = if (isStationMap) stationStatusText(selectedLayer) else mapStatusText(snapshot, selectedLayer),
                    color = Color(0xFF64748B),
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }

            MapSheetTabs(
                mapSelected = true,
                onMapClick = { onLayerSelected(selectedLayer) },
                onReportClick = onReportClick,
            )
        }
    }
}

@Composable
private fun MapSheetMetricCard(
    value: String,
    label: String,
    caption: String,
    color: Color,
    background: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.height(88.dp),
        color = background,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, color.copy(alpha = 0.15f)),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 9.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(
                value,
                color = color,
                fontWeight = FontWeight.Bold,
                fontSize = 24.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(3.dp))
            Text(
                label,
                color = Slate900,
                fontWeight = FontWeight.Bold,
                fontSize = 10.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center,
            )
            Text(
                caption,
                color = Color(0xFF64748B),
                fontSize = 9.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun MapSheetTabs(
    mapSelected: Boolean,
    onMapClick: () -> Unit,
    onReportClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(58.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        MapSheetTab(
            icon = Icons.Filled.Map,
            label = "แผนที่",
            selected = mapSelected,
            onClick = onMapClick,
            modifier = Modifier.weight(1f),
        )
        MapSheetTab(
            icon = Icons.Filled.Report,
            label = "รายงาน",
            selected = !mapSelected,
            onClick = onReportClick,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun MapSheetTab(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = if (selected) DmindBlue else Color(0xFF94A3B8), modifier = Modifier.size(24.dp))
            Spacer(Modifier.width(8.dp))
            Text(
                label,
                color = if (selected) DmindBlue else Color(0xFF64748B),
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
            )
        }
        Spacer(Modifier.height(7.dp))
        Box(
            modifier = Modifier
                .width(58.dp)
                .height(4.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(if (selected) DmindBlue else Color.Transparent),
        )
    }
}

private fun mapSheetTitle(
    selectedLayer: String,
    headlinePoint: DisasterPoint?,
    stationMode: Boolean,
): String {
    if (stationMode) return headlinePoint?.title ?: "สถานี D-MIND"
    return when {
        headlinePoint != null -> headlinePoint.title
        selectedLayer == "ทั้งหมด" -> "แผนที่ D-MIND"
        selectedLayer == "ไฟป่า" -> "จุดความร้อน GISTDA VIIRS"
        else -> selectedLayer
    }
}

private fun latestMapUpdateLabel(snapshot: MapDataSnapshot): String {
    if (snapshot.updatedAtMillis == 0L) return "กำลังอัปเดต"
    val minutes = ((System.currentTimeMillis() - snapshot.updatedAtMillis) / 60_000).coerceAtLeast(0)
    return if (minutes == 0L) "เมื่อสักครู่" else "$minutes นาทีที่แล้ว"
}

@Composable
private fun MapDashboardSummary(
    snapshot: MapDataSnapshot,
    selectedLayer: String,
    stationMode: Boolean,
) {
    val selectedCount = mapLayerPoints(snapshot, selectedLayer, stationMode).size
    val allPoints = if (stationMode) dMindStationPoints() else snapshot.allPoints
    val highRiskCount = allPoints.count {
        it.severity == DisasterSeverity.High || it.severity == DisasterSeverity.VeryHigh
    }
    val layerCount = if (stationMode) 4 else snapshot.statuses.count {
        it.ok && it.name.startsWith("GISTDA")
    }
    val readySources = if (stationMode) 0 else snapshot.statuses.count { it.ok }
    val selectedLabel = when {
        selectedLayer == "ซ่อน" -> "รายการบนแผนที่"
        stationMode -> "สถานี"
        else -> selectedLayer
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        DashboardMetricTile(
            value = selectedCount.toString(),
            label = selectedLabel,
            color = layerAccentColor(selectedLayer),
            modifier = Modifier.weight(1f),
        )
        DashboardMetricTile(
            value = highRiskCount.toString(),
            label = if (stationMode) "แจ้งเตือน" else "ระดับสูง",
            color = AlertRed,
            modifier = Modifier.weight(1f),
        )
        DashboardMetricTile(
            value = layerCount.toString(),
            label = if (stationMode) "กลุ่มข้อมูล" else "ชั้น GISTDA",
            color = SuccessGreen,
            modifier = Modifier.weight(1f),
        )
        DashboardMetricTile(
            value = if (stationMode) "รอ" else readySources.toString(),
            label = if (stationMode) "รอ API" else "API พร้อม",
            color = DmindBlue,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun DashboardMetricTile(
    value: String,
    label: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.height(92.dp),
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, color.copy(alpha = 0.18f)),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 9.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                value,
                color = color,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                label,
                color = Slate800,
                fontSize = 10.sp,
                textAlign = TextAlign.Center,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

private fun mapLayerPoints(
    snapshot: MapDataSnapshot,
    layer: String,
    stationMode: Boolean,
): List<DisasterPoint> {
    return if (stationMode) {
        dMindStationPointsForLayer(layer)
    } else {
        when (layer) {
            "ทั้งหมด" -> snapshot.allPoints
            "ดินถล่ม",
            "พายุ",
            "PM2.5",
            -> emptyList()
            else -> snapshot.pointsForLayer(layer)
        }
    }
}

private fun stationStatusText(layer: String): String {
    val count = dMindStationPointsForLayer(layer).size
    return "D-MIND • $count สถานี • รอ endpoint สถานีจริง"
}

private fun dMindStationPointsForLayer(layer: String): List<DisasterPoint> {
    val points = dMindStationPoints()
    return when (layer) {
        "ออนไลน์" -> points.filter { it.metric == "ออนไลน์" }
        "แจ้งเตือน" -> points.filter { it.severity == DisasterSeverity.High || it.severity == DisasterSeverity.VeryHigh }
        "ออฟไลน์" -> points.filter { it.metric == "ออฟไลน์" }
        else -> points
    }
}

private fun dMindStationPoints(): List<DisasterPoint> = listOf(
    stationPoint("dmind-bkk", "สถานี D-MIND กรุงเทพมหานคร", "PM2.5 24 µg/m³ • ฝน 0.0 มม.", 13.7563, 100.5018, DisasterSeverity.Low, "ออนไลน์"),
    stationPoint("dmind-chiangmai", "สถานี D-MIND เชียงใหม่", "PM2.5 41 µg/m³ • อุณหภูมิ 34°C", 18.7883, 98.9853, DisasterSeverity.Medium, "ออนไลน์"),
    stationPoint("dmind-chiangrai", "สถานี D-MIND เชียงราย", "PM2.5 52 µg/m³ • ลมอ่อน", 19.9105, 99.8406, DisasterSeverity.High, "แจ้งเตือน"),
    stationPoint("dmind-phayao", "สถานี D-MIND พะเยา", "ความชื้น 43% • อากาศแห้ง", 19.1665, 99.9019, DisasterSeverity.Medium, "ออนไลน์"),
    stationPoint("dmind-phitsanulok", "สถานี D-MIND พิษณุโลก", "ฝนสะสม 0.0 มม. • ดัชนีแห้ง", 16.8211, 100.2659, DisasterSeverity.High, "แจ้งเตือน"),
    stationPoint("dmind-udon", "สถานี D-MIND อุดรธานี", "PM2.5 29 µg/m³ • ลม 2.1 m/s", 17.4138, 102.7877, DisasterSeverity.Low, "ออนไลน์"),
    stationPoint("dmind-khonkaen", "สถานี D-MIND ขอนแก่น", "ความชื้น 38% • เฝ้าระวัง", 16.4419, 102.8359, DisasterSeverity.High, "แจ้งเตือน"),
    stationPoint("dmind-korat", "สถานี D-MIND นครราชสีมา", "อุณหภูมิ 36°C • ความชื้นต่ำ", 14.9799, 102.0977, DisasterSeverity.High, "แจ้งเตือน"),
    stationPoint("dmind-ubon", "สถานี D-MIND อุบลราชธานี", "PM2.5 18 µg/m³ • ฝน 0.0 มม.", 15.2448, 104.8471, DisasterSeverity.Low, "ออนไลน์"),
    stationPoint("dmind-rayong", "สถานี D-MIND ระยอง", "ลม 4.3 m/s • คุณภาพอากาศดี", 12.6814, 101.2816, DisasterSeverity.Low, "ออนไลน์"),
    stationPoint("dmind-surat", "สถานี D-MIND สุราษฎร์ธานี", "ฝนสะสม 2.4 มม. • ออนไลน์", 9.1382, 99.3215, DisasterSeverity.Low, "ออนไลน์"),
    stationPoint("dmind-songkhla", "สถานี D-MIND สงขลา", "รอสัญญาณจากสถานี", 7.1898, 100.5951, DisasterSeverity.Medium, "ออฟไลน์"),
)

private fun stationPoint(
    id: String,
    title: String,
    subtitle: String,
    latitude: Double,
    longitude: Double,
    severity: DisasterSeverity,
    metric: String,
): DisasterPoint = DisasterPoint(
    id = id,
    type = DisasterDataType.Place,
    title = title,
    subtitle = subtitle,
    latitude = latitude,
    longitude = longitude,
    severity = severity,
    metric = metric,
    source = "D-MIND Station",
    updatedAt = "Mock data • รอ endpoint",
)

private fun severityWeight(severity: DisasterSeverity): Int = when (severity) {
    DisasterSeverity.Low -> 1
    DisasterSeverity.Medium -> 2
    DisasterSeverity.High -> 3
    DisasterSeverity.VeryHigh -> 4
}

@Composable
private fun MapLayerChip(
    label: String,
    selected: Boolean,
    count: Int,
    onClick: () -> Unit,
) {
    val accent = layerAccentColor(label)
    Surface(
        modifier = Modifier.clickable(onClick = onClick),
        color = if (selected) accent.copy(alpha = 0.14f) else Color.White,
        shape = RoundedCornerShape(999.dp),
        border = BorderStroke(1.dp, if (selected) accent else Color(0xFFE2E8F0)),
        shadowElevation = if (selected) 3.dp else 0.dp,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(disasterEmoji(label), fontSize = 14.sp)
            Spacer(Modifier.width(6.dp))
            Text(
                label,
                color = if (selected) accent else Slate800,
                fontSize = 12.sp,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.SemiBold,
            )
            if (count > 0) {
                Spacer(Modifier.width(6.dp))
                Surface(color = if (selected) accent else Color(0xFFE2E8F0), shape = CircleShape) {
                    Text(
                        count.coerceAtMost(99).toString(),
                        color = if (selected) Color.White else Color(0xFF475569),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                    )
                }
            }
        }
    }
}

private fun layerAccentColor(layer: String): Color = when (layer) {
    "ทั้งหมด" -> DmindBlue
    "สถานี D-MIND" -> SuccessGreen
    "ออนไลน์" -> SuccessGreen
    "แจ้งเตือน" -> AlertRed
    "ออฟไลน์" -> Color(0xFF64748B)
    "แผ่นดินไหว" -> AlertRed
    "ฝนตกหนัก" -> SkyBlue
    "ไฟป่า" -> WarmOrange
    "PM2.5" -> Color(0xFF64748B)
    "ภัยแล้ง" -> Color(0xFF65A30D)
    "DRIPlus" -> Color(0xFF84CC16)
    "NDWI" -> Color(0xFF0891B2)
    "SMAP" -> Color(0xFF92400E)
    "น้ำท่วม" -> Color(0xFFF59E0B)
    "น้ำท่วมซ้ำซาก" -> Color(0xFF0EA5E9)
    "ผักตบชวา" -> Color(0xFF14B8A6)
    "ดินถล่ม" -> Color(0xFF92400E)
    "พายุ" -> Color(0xFF475569)
    "พื้นที่เสี่ยง" -> DmindBlue
    "ความเสี่ยงสูง" -> AlertRed
    else -> DmindBlue
}

private fun disasterEmoji(layer: String): String = when (layer) {
    "ทั้งหมด" -> "••"
    "สถานี D-MIND" -> "◎"
    "ออนไลน์" -> "●"
    "แจ้งเตือน" -> "!"
    "ออฟไลน์" -> "○"
    "แผ่นดินไหว" -> "🌏"
    "ฝนตกหนัก" -> "🌧"
    "ไฟป่า" -> "🔥"
    "PM2.5" -> "💨"
    "ภัยแล้ง" -> "🌵"
    "DRIPlus" -> "DR"
    "NDWI" -> "ND"
    "SMAP" -> "SM"
    "น้ำท่วม" -> "🌊"
    "น้ำท่วมซ้ำซาก" -> "ซ้ำ"
    "ผักตบชวา" -> "ผัก"
    "ดินถล่ม" -> "▲"
    "พายุ" -> "🌪"
    "พื้นที่เสี่ยง" -> "⚠"
    "ความเสี่ยงสูง" -> "7"
    else -> "10"
}

private fun mapStatusText(
    snapshot: MapDataSnapshot,
    selectedLayer: String,
): String {
    if (snapshot.isLoading && snapshot.updatedAtMillis == 0L) return "กำลังดึงข้อมูลจาก API ภายนอก..."
    val count = mapLayerPoints(snapshot, selectedLayer, stationMode = false).size
    val source = when (selectedLayer) {
        "ทั้งหมด" -> "D-MIND"
        "แผ่นดินไหว" -> "USGS"
        "ฝนตกหนัก" -> "TMD"
        "ไฟป่า",
        "ภัยแล้ง",
        "DRIPlus",
        "NDWI",
        "SMAP",
        "น้ำท่วม",
        "น้ำท่วมซ้ำซาก",
        "ผักตบชวา",
        "พื้นที่เสี่ยง",
        "ความเสี่ยงสูง",
        -> "GISTDA"
        "ดินถล่ม",
        "พายุ",
        -> "รอข้อมูล"
        else -> "OSM/API"
    }
    return "$source • $count รายการ • รีเฟรชทุก 5 นาที"
}

private fun severityColor(severity: DisasterSeverity): Color = when (severity) {
    DisasterSeverity.Low -> SuccessGreen
    DisasterSeverity.Medium -> Color(0xFFFACC15)
    DisasterSeverity.High -> WarmOrange
    DisasterSeverity.VeryHigh -> AlertRed
}

private fun severityLabel(severity: DisasterSeverity): String = when (severity) {
    DisasterSeverity.Low -> "ดี"
    DisasterSeverity.Medium -> "ปานกลาง"
    DisasterSeverity.High -> "เริ่มมีผลกระทบ"
    DisasterSeverity.VeryHigh -> "มีผลกระทบ"
}

@Composable
private fun CompactSourceStatus(snapshot: MapDataSnapshot) {
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        snapshot.statuses.forEach { status ->
            val color = if (status.ok) SuccessGreen else AlertRed
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(999.dp),
                border = BorderStroke(1.dp, color.copy(alpha = 0.28f)),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(color),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        "${sourceShortName(status.name)} ${status.count}",
                        color = Slate800,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
        }
    }
}

private fun sourceShortName(name: String): String = when {
    name.contains("hyacinth", ignoreCase = true) -> "Hyacinth"
    name.contains("frequency", ignoreCase = true) -> "FloodFreq"
    name.contains("DRIPlus", ignoreCase = true) -> "DRI+"
    name.contains("NDWI", ignoreCase = true) -> "NDWI"
    name.contains("SMAP", ignoreCase = true) -> "SMAP"
    name.contains("VIIRS", ignoreCase = true) -> "VIIRS"
    name.contains("flood", ignoreCase = true) -> "Flood"
    name.contains("USGS", ignoreCase = true) -> "USGS"
    name.contains("TMD", ignoreCase = true) -> "TMD"
    name.contains("DRI", ignoreCase = true) -> "DRI"
    else -> name.substringBefore(' ')
}

@Composable
private fun RiskZoneDetails(snapshot: MapDataSnapshot) {
    val highRiskCount = (snapshot.floods + snapshot.droughts + snapshot.wildfires)
        .count { it.severity == DisasterSeverity.High || it.severity == DisasterSeverity.VeryHigh }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            RiskMetric(snapshot.pointsForLayer("พื้นที่เสี่ยง").size.toString(), "พื้นที่เสี่ยง", Color(0xFFDBEAFE), DmindBlue, Modifier.weight(1f))
            RiskMetric(highRiskCount.toString(), "ความเสี่ยงสูง", Color(0xFFFFEDD5), WarmOrange, Modifier.weight(1f))
            RiskMetric(snapshot.statuses.count { it.ok }.toString(), "แหล่งข้อมูลพร้อม", Color(0xFFF3E8FF), Color(0xFF8B5CF6), Modifier.weight(1f))
        }
        ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
            Text("ตัวกรองข้อมูล", color = Slate800, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(Modifier.height(8.dp))
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("น้ำท่วม", "แผ่นดินไหว", "ไฟป่า", "ดินถล่ม", "พายุ").forEach {
                    Surface(color = DmindBlue, shape = RoundedCornerShape(999.dp)) {
                        Text(it, color = Color.White, modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp), fontSize = 12.sp)
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
            Text("ระดับความเสี่ยงขั้นต่ำ: 3", color = Slate800, fontSize = 12.sp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(Color(0xFFE2E8F0)),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.55f)
                        .height(4.dp)
                        .background(DmindBlue),
                )
            }
        }
    }
}

@Composable
private fun RiskMetric(
    value: String,
    label: String,
    background: Color,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(background)
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            Text(label, color = Slate800, fontSize = 11.sp, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun LayerStatsChart(
    title: String,
    entries: List<Pair<String, Int>>,
    accent: Color,
) {
    val maxValue = (entries.maxOfOrNull { it.second } ?: 0).coerceAtLeast(1)
    Surface(
        color = accent.copy(alpha = 0.07f),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, accent.copy(alpha = 0.16f)),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, color = Slate800, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Spacer(Modifier.weight(1f))
                Text("${entries.sumOf { it.second }} รายการ", color = accent, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(74.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                entries.forEach { (label, value) ->
                    val ratio = value.toFloat() / maxValue.toFloat()
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            value.coerceAtMost(999).toString(),
                            color = accent,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                        )
                        Spacer(Modifier.height(3.dp))
                        Box(
                            modifier = Modifier
                                .width(18.dp)
                                .height((10 + 42 * ratio).dp)
                                .clip(RoundedCornerShape(topStart = 5.dp, topEnd = 5.dp))
                                .background(
                                    Brush.verticalGradient(
                                        listOf(accent, accent.copy(alpha = 0.45f)),
                                    ),
                                ),
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            label,
                            color = Color(0xFF64748B),
                            fontSize = 9.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

private fun layerChartEntries(
    snapshot: MapDataSnapshot,
    selectedLayer: String,
): List<Pair<String, Int>> {
    return when (selectedLayer) {
        "น้ำท่วม" -> listOf(
            "1วัน" to snapshot.floods.size,
            "ซ้ำซาก" to snapshot.floodFrequency.size,
            "ผักตบ" to snapshot.waterHyacinths.size,
            "WMS" to snapshot.statuses.count { it.name.contains("flood", ignoreCase = true) && it.ok },
        )
        "น้ำท่วมซ้ำซาก" -> severityChartEntries(snapshot.floodFrequency)
        "ผักตบชวา" -> severityChartEntries(snapshot.waterHyacinths)
        else -> severityChartEntries(snapshot.pointsForLayer(selectedLayer))
    }
}

private fun stationChartEntries(): List<Pair<String, Int>> {
    val points = dMindStationPoints()
    return listOf(
        "ออนไลน์" to points.count { it.metric == "ออนไลน์" },
        "เตือน" to points.count { it.metric == "แจ้งเตือน" },
        "ออฟไลน์" to points.count { it.metric == "ออฟไลน์" },
        "รวม" to points.size,
    )
}

private fun severityChartEntries(points: List<DisasterPoint>): List<Pair<String, Int>> = listOf(
    "ต่ำ" to points.count { it.severity == DisasterSeverity.Low },
    "กลาง" to points.count { it.severity == DisasterSeverity.Medium },
    "สูง" to points.count { it.severity == DisasterSeverity.High },
    "สูงมาก" to points.count { it.severity == DisasterSeverity.VeryHigh },
)

@Composable
private fun StationLayerDetails(
    selectedLayer: String,
    points: List<DisasterPoint>,
) {
    val topPoint = points.maxByOrNull { severityWeight(it.severity) }
    ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
        Text(
            text = "สถานีตรวจวัด D-MIND",
            color = Slate800,
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
        )
        Spacer(Modifier.height(6.dp))
        Text(
            text = when (selectedLayer) {
                "ออนไลน์" -> "แสดงสถานีที่พร้อมส่งข้อมูลทันที เมื่อ endpoint พร้อมจะเชื่อมกับข้อมูลจริง"
                "แจ้งเตือน" -> "แสดงสถานีที่มีค่าตรวจวัดอยู่ในระดับเฝ้าระวังหรือสูง"
                "ออฟไลน์" -> "แสดงสถานีที่ยังรอสัญญาณหรือรอการเชื่อมต่อข้อมูล"
                else -> "หน้าใหม่นี้เตรียมไว้สำหรับสถานีตรวจวัดของ D-MIND โดย API และ endpoint จะเพิ่มภายหลัง"
            },
            color = Color(0xFF475569),
            fontSize = 12.sp,
            lineHeight = 17.sp,
        )
        Spacer(Modifier.height(12.dp))
        LayerStatsChart(
            title = "สถิติสถานี",
            entries = stationChartEntries(),
            accent = SuccessGreen,
        )
        if (topPoint != null) {
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(severityColor(topPoint.severity)),
                )
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text(topPoint.title, color = Slate800, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text(topPoint.subtitle, color = Color(0xFF64748B), fontSize = 11.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
                Text(topPoint.metric, color = severityColor(topPoint.severity), fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun MapRefreshFooter(stationMode: Boolean) {
    Surface(
        color = Color.White,
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Filled.Refresh,
                contentDescription = null,
                tint = if (stationMode) SuccessGreen else DmindBlue,
                modifier = Modifier.size(18.dp),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                if (stationMode) "รอ endpoint สถานีตรวจวัด" else "รีเฟรชล่าสุด 5 นาทีที่แล้ว",
                color = Color(0xFF64748B),
                fontSize = 12.sp,
                modifier = Modifier.weight(1f),
            )
            Box(
                modifier = Modifier
                    .size(9.dp)
                    .clip(CircleShape)
                    .background(if (stationMode) Color(0xFFEAB308) else SuccessGreen),
            )
            Spacer(Modifier.width(6.dp))
            Text(
                if (stationMode) "Mock data" else "ข้อมูลอัปเดต",
                color = Slate800,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun DisasterLayerDetails(
    selectedLayer: String,
    snapshot: MapDataSnapshot,
) {
    val points = snapshot.pointsForLayer(selectedLayer)
    val topPoint = points.maxByOrNull {
        when (it.severity) {
            DisasterSeverity.VeryHigh -> 4
            DisasterSeverity.High -> 3
            DisasterSeverity.Medium -> 2
            DisasterSeverity.Low -> 1
        }
    }
    ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
        Text("รายละเอียดชั้นข้อมูล", color = Slate800, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Spacer(Modifier.height(6.dp))
        Text(
            text = when (selectedLayer) {
                "แผ่นดินไหว" -> "USGS all_week.geojson: ${points.size} เหตุการณ์ล่าสุดพร้อมขนาด ความลึก และเวลาที่ตรวจพบ"
                "ไฟป่า" -> "GISTDA VIIRS 1day: ${points.size} จุดความร้อนจากข้อมูลดาวเทียม"
                "น้ำท่วม" -> "GISTDA flood 1day: ${points.size} พื้นที่น้ำท่วม และ overlay WMS พื้นที่น้ำท่วมย้อนหลัง 1 วัน"
                "น้ำท่วมซ้ำซาก" -> "GISTDA flood-freq: ${points.size} จุดตัวอย่างจากพื้นที่น้ำท่วมซ้ำซาก พร้อม overlay WMS flood-freq"
                "ผักตบชวา" -> "GISTDA water_hyacinth: ${points.size} พื้นที่สิ่งกีดขวางทางน้ำจากผักตบชวา"
                "ภัยแล้ง" -> "GISTDA DRIPlus/NDWI/SMAP 7 วัน: ${points.size} จุดอ้างอิงพื้นที่เฝ้าระวังภัยแล้ง"
                "DRIPlus" -> "GISTDA DRIPlus WMS 7 วัน: overlay พื้นที่เสี่ยงภัยแล้งล่าสุด พร้อมจุดอ้างอิง ${points.size} จุด"
                "NDWI" -> "GISTDA NDWI WMS 7 วัน: overlay ความชื้นพืชพรรณล่าสุด พร้อมจุดอ้างอิง ${points.size} จุด"
                "SMAP" -> "GISTDA SMAP WMS 7 วัน: overlay ความชื้นในดินจากดาวเทียม NASA SMAP พร้อมจุดอ้างอิง ${points.size} จุด"
                else -> "แสดงข้อมูลภัยพิบัติพร้อมสถานะอัปเดตล่าสุดทุก 5 นาที"
            },
            color = Color(0xFF475569),
            fontSize = 12.sp,
        )
        Spacer(Modifier.height(12.dp))
        LayerStatsChart(
            title = "สถิติชั้นข้อมูล",
            entries = layerChartEntries(snapshot, selectedLayer),
            accent = layerAccentColor(selectedLayer),
        )
        if (topPoint != null) {
            Spacer(Modifier.height(10.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(severityColor(topPoint.severity)),
                )
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text(topPoint.title, color = Slate800, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text(topPoint.subtitle, color = Color(0xFF64748B), fontSize = 11.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
                Text(topPoint.metric, color = severityColor(topPoint.severity), fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

private data class GistdaWmsOverlay(
    val sourceId: String,
    val layerId: String,
    val path: String,
    val wmsLayerName: String,
    val opacity: Float,
)

private fun gistdaWmsOverlayForLayer(layer: String): GistdaWmsOverlay? = when (layer) {
    "ภัยแล้ง",
    "DRIPlus",
    -> GistdaWmsOverlay(
        sourceId = "gistda-dri-source",
        layerId = "gistda-dri-overlay",
        path = "maps/dri/7days/wms",
        wmsLayerName = "6799acce8d739fff9dacee2f",
        opacity = 0.55f,
    )
    "NDWI" -> GistdaWmsOverlay(
        sourceId = "gistda-ndwi-source",
        layerId = "gistda-ndwi-overlay",
        path = "maps/ndwi/7days/wms",
        wmsLayerName = "6799acf27966ebcdded074a8",
        opacity = 0.5f,
    )
    "SMAP" -> GistdaWmsOverlay(
        sourceId = "gistda-smap-source",
        layerId = "gistda-smap-overlay",
        path = "maps/smap/7days/wms",
        wmsLayerName = "6799ace4582fb798d9a87895",
        opacity = 0.5f,
    )
    "น้ำท่วม" -> GistdaWmsOverlay(
        sourceId = "gistda-flood-source",
        layerId = "gistda-flood-overlay",
        path = "maps/flood/1day/wms",
        wmsLayerName = "676e3c965e01949dda35fa23",
        opacity = 0.55f,
    )
    "น้ำท่วมซ้ำซาก" -> GistdaWmsOverlay(
        sourceId = "gistda-flood-freq-source",
        layerId = "gistda-flood-freq-overlay",
        path = "maps/flood-freq/wms",
        wmsLayerName = "6799ab8c6f832362f99030e6",
        opacity = 0.5f,
    )
    else -> null
}

private fun buildMapStyleJson(overlay: GistdaWmsOverlay?): String {
    val overlaySource = overlay?.let {
        """,
        "${it.sourceId}": {
          "type": "raster",
          "tiles": ["${it.tileUrl().jsonEscaped()}"],
          "tileSize": 256
        }"""
    }.orEmpty()
    val overlayLayer = overlay?.let {
        """,
    {
      "id": "${it.layerId}",
      "type": "raster",
      "source": "${it.sourceId}",
      "paint": {
        "raster-opacity": ${it.opacity}
      }
    }"""
    }.orEmpty()

    return """
{
  "version": 8,
    "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
      "tileSize": 256,
      "attribution": "© OpenStreetMap Contributors, SRTM | OpenTopoMap"
    }$overlaySource
  },
  "layers": [
    {
      "id": "osm",
      "type": "raster",
      "source": "osm"
    }$overlayLayer
  ]
}
    """.trimIndent()
}

private fun GistdaWmsOverlay.tileUrl(): String {
    val apiKey = gistdaMapApiKey()
    val keyParam = if (apiKey.isBlank()) "" else "&api_key=$apiKey"
    return "https://api-gateway.gistda.or.th/api/2.0/resources/$path" +
        "?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1" +
        "&LAYERS=$wmsLayerName&STYLES=&FORMAT=image/png&TRANSPARENT=true" +
        "&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}$keyParam"
}

private fun gistdaMapApiKey(): String = BuildConfig.GISTDA_API_KEY
    .ifBlank { BuildConfig.GISTDA_WMS_API_KEY }
    .ifBlank { BuildConfig.GISTDA_DISASTER_API_KEY }
    .ifBlank { BuildConfig.GISTDA_FIRE_API_KEY }

private fun String.jsonEscaped(): String = replace("\\", "\\\\").replace("\"", "\\\"")

@Composable
private fun MapLibreNativeView(
    modifier: Modifier = Modifier,
    markers: List<DisasterPoint> = emptyList(),
    focus: PlaceSearchResult? = null,
    selectedLayer: String,
    cameraAction: MapCameraAction? = null,
) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    var mapLibreMap by remember { mutableStateOf<MapLibreMap?>(null) }
    val overlay = remember(selectedLayer) { gistdaWmsOverlayForLayer(selectedLayer) }
    val mapView = remember {
        MapLibre.getInstance(context)
        MapView(context).apply {
            onCreate(null)
            getMapAsync { map ->
                mapLibreMap = map
                map.setStyle(Style.Builder().fromJson(buildMapStyleJson(overlay)))
                map.cameraPosition = CameraPosition.Builder()
                    .target(LatLng(15.8700, 100.9925))
                    .zoom(5.35)
                    .build()
            }
        }
    }

    LaunchedEffect(mapLibreMap, overlay) {
        val map = mapLibreMap ?: return@LaunchedEffect
        map.setStyle(Style.Builder().fromJson(buildMapStyleJson(overlay)))
    }

    LaunchedEffect(mapLibreMap, markers, overlay) {
        val map = mapLibreMap ?: return@LaunchedEffect
        map.clear()
        markers.take(250).forEach { point ->
            map.addMarker(
                MarkerOptions()
                    .position(LatLng(point.latitude, point.longitude))
                    .title("${point.title} (${point.source})")
                    .snippet("${point.metric} • ${severityLabel(point.severity)}"),
            )
        }
    }

    LaunchedEffect(mapLibreMap, focus) {
        val map = mapLibreMap ?: return@LaunchedEffect
        val place = focus ?: return@LaunchedEffect
        map.cameraPosition = CameraPosition.Builder()
            .target(LatLng(place.latitude, place.longitude))
            .zoom(9.5)
            .build()
    }

    LaunchedEffect(mapLibreMap, cameraAction) {
        val map = mapLibreMap ?: return@LaunchedEffect
        val action = cameraAction ?: return@LaunchedEffect
        val current = map.cameraPosition
        map.cameraPosition = when (action.kind) {
            MapCameraActionKind.CenterThailand -> CameraPosition.Builder()
                .target(LatLng(15.8700, 100.9925))
                .zoom(5.35)
                .build()
            MapCameraActionKind.ZoomIn -> CameraPosition.Builder()
                .target(current.target)
                .zoom((current.zoom + 1.0).coerceAtMost(16.0))
                .build()
            MapCameraActionKind.ZoomOut -> CameraPosition.Builder()
                .target(current.target)
                .zoom((current.zoom - 1.0).coerceAtLeast(3.5))
                .build()
        }
    }

    DisposableEffect(lifecycle, mapView) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_START -> mapView.onStart()
                Lifecycle.Event.ON_RESUME -> mapView.onResume()
                Lifecycle.Event.ON_PAUSE -> mapView.onPause()
                Lifecycle.Event.ON_STOP -> mapView.onStop()
                Lifecycle.Event.ON_DESTROY -> mapView.onDestroy()
                else -> Unit
            }
        }
        lifecycle.addObserver(observer)
        onDispose {
            lifecycle.removeObserver(observer)
            mapView.onDestroy()
        }
    }

    AndroidView(factory = { mapView }, modifier = modifier)
}

@Composable
private fun AssistantScreen(
    supabaseRepository: SupabaseRepository,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var input by rememberSaveable { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(false, "สวัสดีครับ ผมคือ Dr.Mind ผู้ช่วยด้านภัยพิบัติและเหตุฉุกเฉินครับ 😊"),
                ChatMessage(true, "เมื่อเกิดแผ่นดินไหวควรทำอย่างไร?"),
                ChatMessage(false, "เบื้องต้นให้หมอบ ป้องกัน และยึดจับ หลีกเลี่ยงกระจกหรือของที่อาจตกหล่น และรอจนแรงสั่นสะเทือนหยุดก่อนอพยพครับ"),
            ),
        )
    }

    fun sendMessage() {
        val question = input.trim()
        if (question.isBlank() || isLoading) return
        val history = messages.map { message ->
            (if (message.fromUser) "user" else "assistant") to message.text
        }
        messages = messages + ChatMessage(true, question)
        input = ""
        isLoading = true
        scope.launch {
            val reply = supabaseRepository.invokeAiChat(question, history)
                .getOrElse {
                    "ขออภัยครับ ตอนนี้เชื่อมต่อ Dr.Mind AI ไม่สำเร็จ เบื้องต้นให้ประเมินความปลอดภัยของตัวเองก่อน และโทร 191 หรือ 1669 เมื่อมีผู้บาดเจ็บ"
                }
            messages = messages + ChatMessage(false, reply)
            isLoading = false
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFFEFF6FF), Color.White)))
            .statusBarsPadding(),
    ) {
        CompactHeader(
            title = "Dr.Mind - ผู้เชี่ยวชาญฉุกเฉิน",
            subtitle = "ภัยธรรมชาติ & แพทย์ฉุกเฉิน",
            icon = Icons.Filled.SmartToy,
            tint = DmindBlue,
            onBack = onBack,
            trailing = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(7.dp).clip(CircleShape).background(SuccessGreen))
                    Spacer(Modifier.width(5.dp))
                    Text("ออนไลน์", color = Color(0xFF475569), fontSize = 10.sp)
                }
            },
        )

        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(messages.size) { index ->
                ChatBubble(messages[index])
            }
            if (isLoading) {
                item {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White,
                            shadowElevation = 2.dp,
                        ) {
                            Row(Modifier.padding(horizontal = 12.dp, vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                                DmindLogo(Modifier.size(22.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("กำลังถาม Supabase Edge Function...", color = Color(0xFF64748B), fontSize = 12.sp)
                                Spacer(Modifier.width(4.dp))
                                Text("•••", color = DmindBlue, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        Surface(
            color = Color.White,
            shadowElevation = 8.dp,
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("ถามคำถามเกี่ยวกับภัยพิบัติ...", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(999.dp),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { sendMessage() }),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Slate50,
                        unfocusedContainerColor = Slate50,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                    ),
                )
                Spacer(Modifier.width(8.dp))
                IconButton(
                    onClick = ::sendMessage,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(DmindBlue),
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Color.White)
                }
            }
        }
    }
}

private data class ChatMessage(
    val fromUser: Boolean,
    val text: String,
)

@Composable
private fun ChatBubble(message: ChatMessage) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (message.fromUser) Arrangement.End else Arrangement.Start,
    ) {
        if (!message.fromUser) {
            DmindLogo(Modifier.size(24.dp))
            Spacer(Modifier.width(8.dp))
        }
        Surface(
            modifier = Modifier.fillMaxWidth(0.78f),
            color = if (message.fromUser) DmindBlue else Color.White,
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (message.fromUser) 16.dp else 4.dp,
                bottomEnd = if (message.fromUser) 4.dp else 16.dp,
            ),
            shadowElevation = if (message.fromUser) 0.dp else 2.dp,
        ) {
            Text(
                text = message.text,
                color = if (message.fromUser) Color.White else Slate800,
                fontSize = 14.sp,
                modifier = Modifier.padding(13.dp),
                lineHeight = 20.sp,
            )
        }
    }
}

@Composable
private fun ContactsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val contacts = listOf(
        EmergencyContact("เบอร์ฉุกเฉิน 191", "แจ้งเหตุด่วนเหตุร้าย", "191", Icons.Filled.Warning, AlertRed),
        EmergencyContact("แจ้งเหตุเพลิงไหม้", "สถานีดับเพลิง", "199", Icons.Filled.LocalFireDepartment, WarmOrange),
        EmergencyContact("หน่วยแพทย์ฉุกเฉิน", "ศูนย์นเรนทร", "1669", Icons.Filled.Favorite, Color(0xFFEC4899)),
        EmergencyContact("กรมป้องกันสาธารณภัย", "แจ้งเหตุสาธารณภัย", "1784", Icons.Filled.Security, DmindBlue),
        EmergencyContact("มูลนิธิร่วมกตัญญู", "หน่วยกู้ภัย", "1418", Icons.Filled.Report, Color(0xFFEAB308)),
        EmergencyContact("ศูนย์เอราวัณ กทม.", "สำนักการแพทย์ กรุงเทพฯ", "1646", Icons.Filled.Business, DmindIndigo),
        EmergencyContact("ศูนย์พิษวิทยา", "รามาธิบดี", "1367", Icons.Filled.Warning, Color(0xFF8B5CF6)),
        EmergencyContact("สายด่วนสุขภาพจิต", "กรมสุขภาพจิต", "1323", Icons.Filled.Psychology, Color(0xFF14B8A6)),
        EmergencyContact("กรมควบคุมโรค", "สายด่วนโรคติดต่อ", "1422", Icons.Filled.Favorite, SuccessGreen),
    )

    GradientScaffold(
        title = "เบอร์โทรฉุกเฉิน",
        subtitle = "โทรออกได้ทันที 24 ชม.",
        icon = Icons.Filled.Phone,
        gradient = listOf(AlertRed, Color(0xFFF43F5E), Color(0xFFEC4899)),
        onBack = onBack,
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            contacts.forEach { contact ->
                ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(contact.color),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(contact.icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(contact.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(contact.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                            Text(contact.phone, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                        }
                        IconButton(
                            onClick = {
                                context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${contact.phone}")))
                            },
                            modifier = Modifier
                                .size(46.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SuccessGreen),
                        ) {
                            Icon(Icons.Filled.Phone, contentDescription = "Call", tint = Color.White)
                        }
                    }
                }
            }
        }
    }
}

private data class EmergencyContact(
    val name: String,
    val description: String,
    val phone: String,
    val icon: ImageVector,
    val color: Color,
)

@Composable
private fun WeatherForecastScreen(onBack: () -> Unit) {
    val hourly = listOf(
        HourlyWeather("22:00", "☀️", "30.4°", "60.46%", "5.2", "-"),
        HourlyWeather("23:00", "☁️", "29.8°", "66.87%", "6.6", "-"),
        HourlyWeather("00:00", "🌥️", "29.8°", "67.6%", "4.0", "-"),
        HourlyWeather("01:00", "🌤️", "29.5°", "67.76%", "3.0", "-"),
        HourlyWeather("02:00", "☁️", "29.2°", "58.31%", "0.6", "-"),
    )

    GradientScaffold(
        title = "พยากรณ์อากาศ",
        subtitle = "รายชั่วโมง จากกรมอุตุฯ",
        icon = Icons.Filled.Cloud,
        gradient = listOf(SkyBlue, DmindBlue, DmindIndigo),
        onBack = onBack,
    ) {
        WeatherControls(accent = DmindBlue)
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            WeatherTable(date = "พฤ. 12 มี.ค.", rows = hourly.take(2), accent = DmindBlue)
            WeatherTable(date = "ศ. 13 มี.ค.", rows = hourly.drop(2), accent = DmindBlue)
            WeatherLegend(isDaily = false)
        }
    }
}

private data class HourlyWeather(
    val time: String,
    val icon: String,
    val temp: String,
    val humidity: String,
    val wind: String,
    val rain: String,
)

@Composable
private fun WeatherTable(
    date: String,
    rows: List<HourlyWeather>,
    accent: Color,
) {
    ElevatedPanel(contentPadding = PaddingValues(0.dp)) {
        Text(
            text = date,
            color = accent,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFEFF6FF))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            WeatherHeaderCell("เวลา", Modifier.weight(1.1f))
            WeatherHeaderCell("สภาพ", Modifier.weight(1f), TextAlign.Center)
            WeatherHeaderCell("°", Modifier.weight(1f), TextAlign.Center)
            WeatherHeaderCell("%", Modifier.weight(1.15f), TextAlign.Center)
            WeatherHeaderCell("ลม", Modifier.weight(1f), TextAlign.Center)
            WeatherHeaderCell("ฝน", Modifier.weight(0.8f), TextAlign.Center)
        }
        rows.forEach { row ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(row.time, Modifier.weight(1.1f), fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                Text(row.icon, Modifier.weight(1f), textAlign = TextAlign.Center, fontSize = 16.sp)
                Text(row.temp, Modifier.weight(1f), textAlign = TextAlign.Center, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text(row.humidity, Modifier.weight(1.15f), textAlign = TextAlign.Center, color = DmindBlue, fontSize = 13.sp)
                Text(row.wind, Modifier.weight(1f), textAlign = TextAlign.Center, color = Color(0xFF64748B), fontSize = 13.sp)
                Text(row.rain, Modifier.weight(0.8f), textAlign = TextAlign.Center, color = Color(0xFF64748B), fontSize = 13.sp)
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))
        }
    }
}

@Composable
private fun WeatherHeaderCell(
    text: String,
    modifier: Modifier = Modifier,
    textAlign: TextAlign = TextAlign.Start,
) {
    Text(
        text = text,
        modifier = modifier,
        color = Color(0xFF475569),
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        textAlign = textAlign,
    )
}

@Composable
private fun DailyWeatherForecastScreen(onBack: () -> Unit) {
    val days = listOf(
        DailyWeather("วันนี้", "ท้องฟ้าแจ่มใส", "☀️", "37°", "30°", "46.69%", ""),
        DailyWeather("ศ. 13 มี.ค.", "เมฆเป็นส่วนมาก", "⛅", "33°", "25°", "52.03%", "ฝน 22mm"),
        DailyWeather("ส. 14 มี.ค.", "ท้องฟ้าแจ่มใส", "☀️", "34°", "27°", "44.7%", ""),
        DailyWeather("อา. 15 มี.ค.", "ท้องฟ้าแจ่มใส", "☀️", "36°", "27°", "45.84%", "ฝน 4mm"),
        DailyWeather("จ. 16 มี.ค.", "ท้องฟ้าแจ่มใส", "☀️", "35°", "27°", "56.37%", "ฝน 1mm"),
    )

    GradientScaffold(
        title = "พยากรณ์อากาศ 7 วัน",
        subtitle = "รายวัน จากกรมอุตุฯ",
        icon = Icons.Filled.CalendarMonth,
        gradient = listOf(WarmOrange, Color(0xFFF59E0B), Color(0xFFEAB308)),
        onBack = onBack,
    ) {
        WeatherControls(accent = WarmOrange)
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            days.forEachIndexed { index, day ->
                DailyWeatherCard(day, highlighted = index == 0)
            }
            WeatherLegend(isDaily = true)
        }
    }
}

private data class DailyWeather(
    val day: String,
    val condition: String,
    val icon: String,
    val max: String,
    val min: String,
    val humidity: String,
    val rain: String,
)

@Composable
private fun DailyWeatherCard(
    weather: DailyWeather,
    highlighted: Boolean,
) {
    val background = if (highlighted) {
        Brush.horizontalGradient(listOf(WarmOrange, Color(0xFFF59E0B)))
    } else {
        Brush.horizontalGradient(listOf(MaterialTheme.colorScheme.surface, MaterialTheme.colorScheme.surface))
    }
    val mainColor = if (highlighted) Color.White else MaterialTheme.colorScheme.onSurface
    val muted = if (highlighted) Color.White.copy(alpha = 0.82f) else MaterialTheme.colorScheme.onSurfaceVariant

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(background)
            .border(
                1.dp,
                if (highlighted) Color.Transparent else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.45f),
                RoundedCornerShape(14.dp),
            )
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(weather.icon, fontSize = 32.sp)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Text(weather.day, color = mainColor, fontWeight = FontWeight.Bold)
            Text(weather.condition, color = muted, fontSize = 12.sp)
        }
        Column(horizontalAlignment = Alignment.End) {
            Row(verticalAlignment = Alignment.Bottom) {
                Text(weather.max, color = if (highlighted) Color.White else AlertRed, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Text(" / ${weather.min}", color = if (highlighted) Color.White.copy(alpha = 0.72f) else DmindBlue, fontSize = 18.sp)
            }
            Text(
                text = "💧 ${weather.humidity}  ${weather.rain}",
                color = muted,
                fontSize = 11.sp,
            )
        }
    }
}

@Composable
private fun WeatherControls(accent: Color) {
    Column(
        modifier = Modifier.padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Button(
            onClick = {},
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = accent),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 5.dp),
            shape = RoundedCornerShape(999.dp),
        ) {
            Icon(Icons.Filled.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(8.dp))
            Text("อัปเดตข้อมูล", fontWeight = FontWeight.Bold)
        }
        Surface(
            color = Color.White,
            shape = RoundedCornerShape(10.dp),
            shadowElevation = 2.dp,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Filled.LocationOn, contentDescription = null, tint = accent, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(8.dp))
                Text("ตำแหน่งปัจจุบัน...", color = Slate800, fontSize = 13.sp, modifier = Modifier.weight(1f))
                Icon(Icons.Filled.ExpandMore, contentDescription = null, tint = Color(0xFF64748B), modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun WeatherLegend(isDaily: Boolean) {
    ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
        Text("คำอธิบาย", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            LegendItem(
                icon = if (isDaily) Icons.Filled.Thermostat else Icons.Filled.Thermostat,
                label = if (isDaily) "สูง/ต่ำ อุณหภูมิ" else "อุณหภูมิ (°C)",
                color = AlertRed,
                modifier = Modifier.weight(1f),
            )
            LegendItem(
                icon = Icons.Filled.WaterDrop,
                label = "ความชื้น (%)",
                color = DmindBlue,
                modifier = Modifier.weight(1f),
            )
        }
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            LegendItem(Icons.Filled.Air, "ลม (m/s)", Color(0xFF64748B), Modifier.weight(1f))
            LegendItem(Icons.Filled.Cloud, "ปริมาณฝน (mm)", SkyBlue, Modifier.weight(1f))
        }
    }
}

@Composable
private fun LegendItem(
    icon: ImageVector,
    label: String,
    color: Color,
    modifier: Modifier = Modifier,
) {
    Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(15.dp))
        Spacer(Modifier.width(6.dp))
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
    }
}

@Composable
private fun ManualScreen(
    onBack: () -> Unit,
    onNavigate: (AppRoute) -> Unit,
) {
    PlainScreen(
        title = "คู่มือต่าง ๆ",
        subtitle = "บทความและแนวทางรับมือภัยพิบัติ",
        icon = Icons.Filled.Book,
        onBack = onBack,
    ) {
        listOf(
            ManualItem("แผ่นดินไหว", "วิธีปฏิบัติตัวก่อน ระหว่าง และหลังแผ่นดินไหว", "8 ขั้นตอน", WarmOrange),
            ManualItem("น้ำท่วม", "เตรียมถุงยังชีพ ปิดระบบไฟฟ้า และอพยพอย่างปลอดภัย", "6 ขั้นตอน", DmindBlue),
            ManualItem("ไฟป่าและฝุ่น PM2.5", "ลดการสัมผัสควัน ตรวจค่าฝุ่น และเลือกหน้ากากที่เหมาะสม", "5 ขั้นตอน", AlertRed),
        ).forEach { item ->
            ElevatedPanel(
                modifier = Modifier.clickable { onNavigate(AppRoute.AppGuide) },
                contentPadding = PaddingValues(14.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.AutoMirrored.Filled.Article, item.color)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(item.title, fontWeight = FontWeight.Bold)
                        Text(item.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    Surface(color = item.color.copy(alpha = 0.12f), shape = RoundedCornerShape(999.dp)) {
                        Text(item.badge, color = item.color, fontWeight = FontWeight.Bold, fontSize = 11.sp, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp))
                    }
                }
            }
        }
    }
}

private data class ManualItem(
    val title: String,
    val description: String,
    val badge: String,
    val color: Color,
)

@Composable
private fun IncidentReportsScreen(
    supabaseRepository: SupabaseRepository,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selectedType by rememberSaveable { mutableStateOf("flood") }
    var title by rememberSaveable { mutableStateOf("") }
    var description by rememberSaveable { mutableStateOf("") }
    var location by rememberSaveable { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var selectedImageName by remember { mutableStateOf<String?>(null) }
    var isSubmitting by remember { mutableStateOf(false) }
    var reports by remember { mutableStateOf<List<IncidentReportRecord>>(emptyList()) }
    var statusMessage by remember { mutableStateOf("เชื่อมต่อ backend gateway และ Supabase incident_reports") }
    val imagePickerLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedImageUri = uri
        selectedImageName = uri?.lastPathSegment?.substringAfterLast('/') ?: "incident-image"
    }

    fun refreshReports() {
        scope.launch {
            supabaseRepository.fetchIncidentReports()
                .onSuccess {
                    reports = it
                    statusMessage = "โหลดรายงานจาก Supabase แล้ว ${it.size} รายการ"
                }
                .onFailure {
                    statusMessage = "โหลด Supabase ไม่สำเร็จ: ${it.message ?: "ไม่ทราบสาเหตุ"}"
                }
        }
    }

    LaunchedEffect(supabaseRepository) {
        refreshReports()
    }

    PlainScreen(
        title = "รายงานเหตุการณ์",
        subtitle = "แจ้งเหตุและติดตามสถานการณ์ล่าสุด",
        icon = Icons.Filled.Report,
        onBack = onBack,
    ) {
        ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
            Text("รายงานใหม่", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ReportTypeChip("น้ำท่วม", DmindBlue, selected = selectedType == "flood") { selectedType = "flood" }
                ReportTypeChip("ไฟป่า", AlertRed, selected = selectedType == "wildfire") { selectedType = "wildfire" }
                ReportTypeChip("ดินถล่ม", WarmOrange, selected = selectedType == "landslide") { selectedType = "landslide" }
            }
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("หัวข้อรายงาน") },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("อธิบายเหตุการณ์ที่พบ...") },
                minLines = 4,
                shape = RoundedCornerShape(12.dp),
            )
            Spacer(Modifier.height(10.dp))
            OutlinedTextField(
                value = location,
                onValueChange = { location = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("สถานที่ เช่น เขต/อำเภอ/จังหวัด") },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
            )
            Spacer(Modifier.height(12.dp))
            OutlinedButton(
                onClick = { imagePickerLauncher.launch("image/*") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Filled.PhotoCamera, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(if (selectedImageUri == null) "แนบรูปเหตุการณ์" else "เปลี่ยนรูปที่แนบ")
            }
            selectedImageUri?.let {
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "แนบแล้ว: ${selectedImageName ?: "image"}",
                        modifier = Modifier.weight(1f),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    TextButton(onClick = {
                        selectedImageUri = null
                        selectedImageName = null
                    }) {
                        Text("ลบ")
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = {
                    if (title.isBlank() || description.isBlank() || isSubmitting) return@Button
                    isSubmitting = true
                    scope.launch {
                        val imageUrls = selectedImageUri?.let { uri ->
                            statusMessage = "กำลังอัปโหลดรูปผ่าน backend gateway..."
                            uploadSelectedIncidentImage(context, supabaseRepository, uri)
                                .getOrElse {
                                    statusMessage = "อัปโหลดรูปไม่สำเร็จ: ${it.message ?: "ไม่ทราบสาเหตุ"}"
                                    isSubmitting = false
                                    return@launch
                                }
                                .let { listOf(it) }
                        }.orEmpty()
                        supabaseRepository.submitIncidentReport(
                            IncidentReportDraft(
                                type = selectedType,
                                title = title.trim(),
                                description = description.trim(),
                                location = location.trim().ifBlank { null },
                                imageUrls = imageUrls,
                            ),
                        ).onSuccess {
                            statusMessage = "ส่งรายงานผ่าน backend gateway สำเร็จ"
                            title = ""
                            description = ""
                            location = ""
                            selectedImageUri = null
                            selectedImageName = null
                            refreshReports()
                        }.onFailure {
                            statusMessage = "ส่งรายงานไม่สำเร็จ: ${it.message ?: "ไม่ทราบสาเหตุ"}"
                        }
                        isSubmitting = false
                    }
                },
                enabled = !isSubmitting,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Filled.Report, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(if (isSubmitting) "กำลังส่ง..." else "ส่งรายงาน")
            }
            Spacer(Modifier.height(8.dp))
            Text(statusMessage, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }

        Text("ฟีดเหตุการณ์ล่าสุด", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
        val feed = reports.ifEmpty {
            listOf(
                IncidentReportRecord("local-1", "flood", "ถนนมีน้ำท่วมขัง เขตบางนา", "ข้อมูลตัวอย่างระหว่างรอ Supabase", "กรุงเทพฯ", 3, "pending", false, "local"),
                IncidentReportRecord("local-2", "wildfire", "พบควันไฟบริเวณพื้นที่โล่ง", "ข้อมูลตัวอย่างระหว่างรอ Supabase", "ไม่ระบุ", 2, "pending", false, "local"),
            )
        }
        feed.forEach { report ->
            ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconBubble(Icons.Filled.LocationOn, if (report.type == "wildfire") AlertRed else DmindBlue)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(report.title, fontWeight = FontWeight.SemiBold)
                        Text(
                            "ระดับ ${report.severityLevel} • ${report.status} • ${report.location ?: "ไม่ระบุสถานที่"}",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ReportTypeChip(
    label: String,
    color: Color,
    selected: Boolean = false,
    onClick: (() -> Unit)? = null,
) {
    Surface(
        modifier = if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier,
        color = if (selected) color else color.copy(alpha = 0.12f),
        shape = RoundedCornerShape(999.dp),
    ) {
        Text(label, color = if (selected) Color.White else color, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp))
    }
}

@Composable
private fun DamageAssessmentScreen(
    supabaseRepository: SupabaseRepository,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var selectedImageName by remember { mutableStateOf<String?>(null) }
    var isUploading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf("Production AI ยังไม่เปิดใช้งาน ระบบจะบันทึกภาพไว้ก่อนโดยไม่คืนผล mock") }
    val imagePickerLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        selectedImageUri = uri
        selectedImageName = uri?.lastPathSegment?.substringAfterLast('/') ?: "damage-image"
    }

    PlainScreen(
        title = "ประเมินความเสียหาย",
        subtitle = "ถ่ายภาพเพื่อบันทึกและประเมินเบื้องต้น",
        icon = Icons.Filled.PhotoCamera,
        onBack = onBack,
    ) {
        ElevatedPanel(contentPadding = PaddingValues(18.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Brush.verticalGradient(listOf(Color(0xFFE0F2FE), Color(0xFFEFF6FF)))),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Filled.CameraAlt, contentDescription = null, tint = DmindBlue, modifier = Modifier.size(44.dp))
                    Spacer(Modifier.height(8.dp))
                    Text(selectedImageName ?: "เพิ่มภาพความเสียหาย", color = Slate800, fontWeight = FontWeight.Bold)
                    Text("บันทึกภาพเพื่อรอประมวลผล production model", color = Color(0xFF64748B), fontSize = 12.sp)
                }
            }
            Spacer(Modifier.height(14.dp))
            OutlinedButton(
                onClick = { imagePickerLauncher.launch("image/*") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Filled.PhotoCamera, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("เลือกหรือถ่ายภาพ")
            }
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = {
                    val uri = selectedImageUri ?: return@Button
                    if (isUploading) return@Button
                    isUploading = true
                    scope.launch {
                        uploadSelectedDamageImage(context, supabaseRepository, uri)
                            .onSuccess {
                                statusMessage = "อัปโหลดภาพแล้ว: รอเชื่อมต่อ production damage-assessment model"
                                selectedImageUri = null
                                selectedImageName = null
                            }
                            .onFailure {
                                statusMessage = "อัปโหลดภาพไม่สำเร็จ: ${it.message ?: "ไม่ทราบสาเหตุ"}"
                            }
                        isUploading = false
                    }
                },
                enabled = selectedImageUri != null && !isUploading,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
            ) {
                Icon(Icons.Filled.Done, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(if (isUploading) "กำลังอัปโหลด..." else "บันทึกภาพ")
            }
            Spacer(Modifier.height(8.dp))
            Text(statusMessage, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
        }

        ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
            Text("สถานะระบบประเมิน", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            AssessmentRow("AI model", "not configured", WarmOrange)
            AssessmentRow("Mock result", "disabled", SuccessGreen)
            AssessmentRow("คำแนะนำ", "บันทึกภาพและรายงานเจ้าหน้าที่", DmindBlue)
        }
    }
}

private suspend fun uploadSelectedIncidentImage(
    context: Context,
    repository: SupabaseRepository,
    uri: Uri,
): Result<String> = runCatching {
    val contentType = context.contentResolver.getType(uri) ?: "image/jpeg"
    val fileName = "incident-${System.currentTimeMillis()}.${extensionForContentType(contentType)}"
    val bytes = readUriBytes(context, uri)
    repository.uploadIncidentImage(fileName, contentType, bytes).getOrThrow()
}

private suspend fun uploadSelectedDamageImage(
    context: Context,
    repository: SupabaseRepository,
    uri: Uri,
): Result<String> = runCatching {
    val contentType = context.contentResolver.getType(uri) ?: "image/jpeg"
    val fileName = "damage-${System.currentTimeMillis()}.${extensionForContentType(contentType)}"
    val bytes = readUriBytes(context, uri)
    repository.uploadDamageAssessmentImage(fileName, contentType, bytes).getOrThrow()
}

private suspend fun readUriBytes(context: Context, uri: Uri): ByteArray = withContext(Dispatchers.IO) {
    context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
        ?: error("ไม่สามารถอ่านไฟล์รูปภาพได้")
}

private fun extensionForContentType(contentType: String): String = when (contentType.lowercase()) {
    "image/png" -> "png"
    "image/webp" -> "webp"
    else -> "jpg"
}

@Composable
private fun AssessmentRow(
    label: String,
    value: String,
    color: Color,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
        Surface(color = color.copy(alpha = 0.12f), shape = RoundedCornerShape(999.dp)) {
            Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 12.sp, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp))
        }
    }
}

@Composable
private fun NotificationSettingsScreen(
    status: ReliabilityStatus,
    darkTheme: Boolean,
    backend: String,
    supabaseRepository: SupabaseRepository,
    onBack: () -> Unit,
    onToggleTheme: () -> Unit,
    onRequestLocation: () -> Unit,
    onRequestNotifications: () -> Unit,
    onOpenBatterySettings: () -> Unit,
    onOpenDndSettings: () -> Unit,
    onOpenAppSettings: () -> Unit,
    onRefreshFcm: () -> Unit,
    onTriggerAlert: () -> Unit,
) {
    var alerts by remember { mutableStateOf<List<RealtimeAlertRecord>>(emptyList()) }
    var notifications by remember { mutableStateOf<List<NotificationRecord>>(emptyList()) }
    var supabaseStatus by remember { mutableStateOf("Supabase: กำลังเชื่อมต่อ...") }

    LaunchedEffect(supabaseRepository) {
        supabaseRepository.fetchRealtimeAlerts()
            .onSuccess {
                alerts = it
                supabaseStatus = "Supabase พร้อม • realtime_alerts ${it.size} รายการ"
            }
            .onFailure {
                supabaseStatus = "Supabase ยังไม่พร้อม: ${it.message ?: "ไม่ทราบสาเหตุ"}"
            }
        supabaseRepository.fetchNotificationHistory()
            .onSuccess { notifications = it }
    }

    PlainScreen(
        title = "ตั้งค่าการแจ้งเตือน",
        subtitle = "สิทธิ์ ระบบเตือนภัย และการทำงานเบื้องหลัง",
        icon = Icons.Filled.Settings,
        onBack = onBack,
    ) {
        ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconBubble(if (darkTheme) Icons.Filled.DarkMode else Icons.Filled.LightMode, DmindBlue)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("โหมดสีของแอป", fontWeight = FontWeight.Bold)
                    Text(if (darkTheme) "โหมดมืด" else "โหมดสว่าง", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                }
                Switch(checked = darkTheme, onCheckedChange = { onToggleTheme() })
            }
        }

        Text("สถานะระบบ native", fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
        PermissionCard("ตำแหน่ง", status.locationGranted, "ใช้สำหรับเตือนภัยตามพื้นที่", Icons.Filled.LocationOn, onRequestLocation)
        PermissionCard("แจ้งเตือน", status.notificationGranted, "ใช้สำหรับแจ้งเตือนฉุกเฉิน", Icons.Filled.Notifications, onRequestNotifications)
        PermissionCard("ทำงานเบื้องหลัง", status.batteryIgnoring, "ช่วยให้ระบบเฝ้าระวังไม่ถูกปิด", Icons.Filled.Security, onOpenBatterySettings)
        PermissionCard("DND bypass", status.dndGranted, "ให้แจ้งเตือนสำคัญดังผ่านโหมดเงียบ", Icons.Filled.Warning, onOpenDndSettings)

        ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
            Text("การเชื่อมต่อ", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text("Backend: $backend", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            Text("Supabase: ${SupabaseConfig.projectId.ifBlank { "-" }}", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            Text(supabaseStatus, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            Text(
                "FCM: ${if (status.fcmTokenAvailable) "พร้อมใช้งาน" else "ยังไม่พร้อม"}",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 12.sp,
            )
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilledTonalButton(onClick = onOpenAppSettings, modifier = Modifier.weight(1f)) {
                    Text("ตั้งค่าแอป")
                }
                Button(onClick = onRefreshFcm, modifier = Modifier.weight(1f)) {
                    Text("Refresh FCM")
                }
            }
            Spacer(Modifier.height(10.dp))
            OutlinedButton(onClick = onTriggerAlert, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
                Icon(Icons.Filled.Notifications, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("ทดสอบแจ้งเตือน")
            }
        }

        ElevatedPanel(contentPadding = PaddingValues(14.dp)) {
            Text("ระบบจากเว็บแอพเดิม", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            AssessmentRow("Realtime alerts", "${alerts.size} รายการ", if (alerts.isNotEmpty()) SuccessGreen else WarmOrange)
            AssessmentRow("Notification history", "${notifications.size} รายการ", if (notifications.isNotEmpty()) SuccessGreen else WarmOrange)
            AssessmentRow("Edge Functions", "ai-chat / analyze-damage", DmindBlue)
            AssessmentRow("Storage buckets", "incident-images / damage-assessment-images", DmindBlue)
        }
    }
}

@Composable
private fun PermissionCard(
    title: String,
    ready: Boolean,
    description: String,
    icon: ImageVector,
    onClick: () -> Unit,
) {
    ElevatedPanel(contentPadding = PaddingValues(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconBubble(icon, if (ready) SuccessGreen else WarmOrange)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold)
                Text(description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
            }
            Button(
                onClick = onClick,
                shape = RoundedCornerShape(999.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (ready) SuccessGreen else DmindBlue,
                ),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
            ) {
                Icon(if (ready) Icons.Filled.Done else Icons.Filled.Settings, contentDescription = null, modifier = Modifier.size(15.dp))
                Spacer(Modifier.width(5.dp))
                Text(if (ready) "พร้อม" else "ตั้งค่า", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun AppGuideScreen(
    onBack: () -> Unit,
    onNavigate: (AppRoute) -> Unit,
) {
    PlainScreen(
        title = "คู่มือการใช้งานแอป",
        subtitle = "ภาพรวมเมนูและ workflow สำคัญ",
        icon = Icons.Filled.Info,
        onBack = onBack,
    ) {
        listOf(
            GuideStep("1", "หน้าแรก", "ดูภาพรวมสถานการณ์ กดเข้า Dr.Mind หรือพยากรณ์อากาศได้ทันที", AppRoute.Home),
            GuideStep("2", "แผนที่", "เปิดแผนที่ภัยพิบัติหรือพื้นที่เสี่ยงแบบเต็มจอ", AppRoute.DisasterMap),
            GuideStep("3", "ฉุกเฉิน", "โทรหาเบอร์สำคัญได้ภายในหนึ่งแตะ", AppRoute.Contacts),
            GuideStep("4", "ตั้งค่า", "เปิดสิทธิ์แจ้งเตือน ตำแหน่ง และทดสอบ native alert", AppRoute.Notifications),
        ).forEach { step ->
            ElevatedPanel(
                modifier = Modifier.clickable { onNavigate(step.route) },
                contentPadding = PaddingValues(14.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(color = DmindBlue, shape = CircleShape) {
                        Text(step.number, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp))
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(step.title, fontWeight = FontWeight.Bold)
                        Text(step.description, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                    }
                    Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

private data class GuideStep(
    val number: String,
    val title: String,
    val description: String,
    val route: AppRoute,
)

@Composable
private fun GradientScaffold(
    title: String,
    subtitle: String,
    icon: ImageVector,
    gradient: List<Color>,
    onBack: () -> Unit,
    content: @Composable () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                .background(Brush.horizontalGradient(gradient))
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 18.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.White.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(icon, contentDescription = null, tint = Color.White)
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    Text(subtitle, color = Color.White.copy(alpha = 0.78f), fontSize = 12.sp)
                }
            }
        }
        Box(Modifier.padding(top = 12.dp)) {
            content()
        }
    }
}

@Composable
private fun PlainScreen(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onBack: () -> Unit,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .statusBarsPadding(),
    ) {
        CompactHeader(
            title = title,
            subtitle = subtitle,
            icon = icon,
            tint = DmindBlue,
            onBack = onBack,
        )
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = content,
        )
    }
}

@Composable
private fun CompactHeader(
    title: String,
    subtitle: String,
    icon: ImageVector,
    tint: Color,
    onBack: () -> Unit,
    trailing: @Composable (() -> Unit)? = null,
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 4.dp,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 58.dp)
                .padding(horizontal = 10.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(38.dp)) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = tint)
            }
            IconBubble(icon = icon, color = tint, modifier = Modifier.size(34.dp))
            Spacer(Modifier.width(9.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    title,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 15.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    subtitle,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            if (trailing != null) {
                trailing()
            }
        }
    }
}
