package com.dmind.app.ui

import android.Manifest
import android.app.Activity
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.dmind.app.di.AppContainer
import com.dmind.app.domain.ReliabilityStatus
import com.dmind.app.domain.usecase.GetDisasterSnapshotUseCase
import com.dmind.app.domain.usecase.GetFloodFeaturesUseCase
import com.dmind.app.domain.usecase.GetGistdaWmtsLayerUseCase
import com.dmind.app.domain.usecase.GetViirsHotspotsUseCase
import com.dmind.app.domain.usecase.SearchPlacesUseCase
import com.dmind.app.domain.usecase.FetchWeatherForCoordsUseCase
import com.dmind.app.ui.navigation.AppRoute
import com.dmind.app.ui.screens.alert.AlertsScreen
import com.dmind.app.ui.screens.chatbot.ChatbotScreen
import com.dmind.app.ui.screens.dashboard.DashboardScreen
import com.dmind.app.ui.screens.map.DisasterMapScreen
import com.dmind.app.ui.screens.report.ReportScreen
import com.dmind.app.ui.screens.settings.SettingsScreen
import com.dmind.app.ui.screens.station.StationScreen
import com.dmind.app.ui.screens.tools.DamageAssessmentScreen
import com.dmind.app.ui.screens.tools.EmergencyContactsScreen
import com.dmind.app.ui.screens.tools.EmergencyManualScreen
import com.dmind.app.ui.screens.tools.WeatherOverviewScreen
import com.dmind.app.ui.screens.tools.WeeklyForecastScreen
import com.dmind.app.ui.screens.victim.VictimReportsScreen
import com.dmind.app.ui.screens.survey.SatisfactionSurveyScreen
import com.dmind.app.ui.screens.analytics.AnalyticsDashboardScreen
import com.dmind.app.ui.theme.DMindTheme
import com.dmind.app.ui.viewmodel.AlertsViewModel
import com.dmind.app.ui.viewmodel.AnalyticsDashboardViewModel
import com.dmind.app.data.repository.AnalyticsRepository
import com.dmind.app.ui.viewmodel.ChatbotViewModel
import com.dmind.app.ui.viewmodel.DisasterMapViewModel
import com.dmind.app.ui.viewmodel.ReportViewModel
import com.dmind.app.ui.viewmodel.DamageAssessmentViewModel
import com.dmind.app.ui.viewmodel.VictimReportsViewModel
import com.dmind.app.ui.viewmodel.SatisfactionSurveyViewModel
import com.dmind.app.ui.viewmodel.viewModelFactory
import com.dmind.app.util.LocalLanguage
import com.dmind.app.util.LocaleManager
import com.dmind.app.util.LocaleProvider

// คอมโพสเซเบิลหลักที่เป็นจุดเริ่มต้นของแอปพลิเคชัน จัดการ Navigation และ ViewModel ต่างๆ
@Composable
fun DMindApp() {
    val context = LocalContext.current
    val activity = context as? Activity
    val container = remember(context.applicationContext) {
        AppContainer(context.applicationContext)
    }

    // กำหนดและเริ่มต้นใช้งาน DisasterMapViewModel ด้วย Factory
    val disasterViewModel: DisasterMapViewModel = viewModel(
        factory = viewModelFactory {
            DisasterMapViewModel(
                getSnapshot = GetDisasterSnapshotUseCase(container.disasterRepository),
                searchPlaces = SearchPlacesUseCase(container.disasterRepository),
                fetchWeatherForCoordsUseCase = FetchWeatherForCoordsUseCase(container.disasterRepository),
                getViirsHotspots = GetViirsHotspotsUseCase(container.gistdaDisasterRepository),
                getFloodFeatures = GetFloodFeaturesUseCase(container.gistdaDisasterRepository),
                getGistdaWmtsLayer = GetGistdaWmtsLayerUseCase(container.gistdaDisasterRepository),
                disasterRepository = container.disasterRepository,
            )
        },
    )
    // กำหนดและเริ่มต้นใช้งาน AlertsViewModel
    val alertsViewModel: AlertsViewModel = viewModel(
        factory = viewModelFactory { AlertsViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน ReportViewModel
    val reportViewModel: ReportViewModel = viewModel(
        factory = viewModelFactory { ReportViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน ChatbotViewModel
    val chatbotViewModel: ChatbotViewModel = viewModel(
        factory = viewModelFactory { ChatbotViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน DamageAssessmentViewModel
    val damageViewModel: DamageAssessmentViewModel = viewModel(
        factory = viewModelFactory { DamageAssessmentViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน VictimReportsViewModel
    val victimViewModel: VictimReportsViewModel = viewModel(
        factory = viewModelFactory { VictimReportsViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน SatisfactionSurveyViewModel
    val surveyViewModel: SatisfactionSurveyViewModel = viewModel(
        factory = viewModelFactory { SatisfactionSurveyViewModel(container.supabaseRepository) },
    )
    // กำหนดและเริ่มต้นใช้งาน AnalyticsDashboardViewModel
    val analyticsViewModel: AnalyticsDashboardViewModel = viewModel(
        factory = viewModelFactory { AnalyticsDashboardViewModel(AnalyticsRepository()) },
    )

    // ดึงค่าสถานะ (State) จาก ViewModels ต่างๆ
    val mapState by disasterViewModel.state.collectAsStateWithLifecycle()
    val alertsState by alertsViewModel.state.collectAsStateWithLifecycle()
    val reportState by reportViewModel.state.collectAsStateWithLifecycle()
    val chatState by chatbotViewModel.state.collectAsStateWithLifecycle()
    val damageState by damageViewModel.state.collectAsStateWithLifecycle()
    val victimState by victimViewModel.state.collectAsStateWithLifecycle()
    val surveyState by surveyViewModel.state.collectAsStateWithLifecycle()
    val analyticsState by analyticsViewModel.state.collectAsStateWithLifecycle()

    // ตั้งค่าสถานะสำหรับ Theme และการนำทาง (Navigation)
    val systemDarkTheme = isSystemInDarkTheme()
    var currentRouteName by rememberSaveable { mutableStateOf(AppRoute.Dashboard.name) }
    var backStack by rememberSaveable { mutableStateOf(emptyList<String>()) }
    var darkTheme by rememberSaveable { mutableStateOf(systemDarkTheme) }
    var reliabilityStatus by remember { mutableStateOf(container.nativeStatusRepository.refreshStatus()) }

    fun currentRoute(): AppRoute = AppRoute.valueOf(currentRouteName)

    // ฟังก์ชันสำหรับรีเฟรชสถานะความน่าเชื่อถือและการขอสิทธิ์จากระบบปฏิบัติการ
    fun refreshNativeStatus() {
        reliabilityStatus = container.nativeStatusRepository.refreshStatus()
    }

    // ฟังก์ชันนำทางไปยังหน้าจอต่าง ๆ
    fun navigateTo(route: AppRoute) {
        if (route.name == currentRouteName) return
        backStack = backStack + currentRouteName
        currentRouteName = route.name
    }

    // ฟังก์ชันนำทางย้อนกลับ
    fun navigateBack() {
        if (backStack.isNotEmpty()) {
            currentRouteName = backStack.last()
            backStack = backStack.dropLast(1)
        } else if (currentRoute() != AppRoute.Dashboard) {
            currentRouteName = AppRoute.Dashboard.name
        }
    }

    BackHandler(enabled = currentRoute() != AppRoute.Dashboard || backStack.isNotEmpty()) {
        navigateBack()
    }

    // ตัวจัดการการขอสิทธิ์พิกัดตำแหน่งของผู้ใช้
    val locationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) {
        refreshNativeStatus()
    }
    // ตัวจัดการการขอสิทธิ์การแจ้งเตือน
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) {
        refreshNativeStatus()
    }

    LaunchedEffect(Unit) {
        refreshNativeStatus()
    }

    // ให้บริการข้อมูลภาษาปัจจุบันแก่ UI
    LocaleProvider {
        val currentLanguage = LocalLanguage.current

        // กำหนดรูปแบบธีมของแอป
        DMindTheme(darkTheme = darkTheme) {
        val route = currentRoute()

        // แยกการแสดงผลสำหรับหน้าจอแผนที่ภัยพิบัติ
        if (route == AppRoute.Map) {
            DisasterMapScreen(
                state = mapState,
                viewModel = disasterViewModel,
                darkTheme = darkTheme,
                onBack = ::navigateBack,
                onOpenStations = { navigateTo(AppRoute.Stations) },
            )
            return@DMindTheme
        }

        // โครงสร้างหน้าจอหลักพร้อมแถบนำทางด้านล่าง
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                DmindBottomNavigation(
                    currentRoute = route,
                    onNavigate = ::navigateTo,
                )
            },
        ) { padding ->
            androidx.compose.foundation.layout.Box(
                modifier = androidx.compose.ui.Modifier
                    .padding(bottom = padding.calculateBottomPadding()),
            ) {
                // แสดงผลหน้าจอตามเส้นทางนำทางปัจจุบัน
                when (route) {
                    AppRoute.Dashboard -> DashboardScreen(
                        mapState = mapState,
                        darkTheme = darkTheme,
                        currentLanguage = currentLanguage,
                        onToggleDarkTheme = { darkTheme = !darkTheme },
                        onToggleLanguage = {
                            if (activity != null) {
                                val nextLang = if (currentLanguage == LocaleManager.THAI) {
                                    LocaleManager.ENGLISH
                                } else {
                                    LocaleManager.THAI
                                }
                                LocaleManager.setLanguage(activity, nextLang)
                            }
                        },
                        onNavigate = ::navigateTo,
                    )

                    AppRoute.Alerts -> AlertsScreen(
                        state = alertsState,
                        onRefresh = alertsViewModel::refresh,
                    )

                    AppRoute.Report -> ReportScreen(
                        state = reportState,
                        onSubmit = reportViewModel::submitReport,
                    )

                    AppRoute.Stations -> StationScreen(mapState = mapState)

                    AppRoute.Chatbot -> ChatbotScreen(
                        state = chatState,
                        onSend = chatbotViewModel::send,
                        viewModel = chatbotViewModel,
                    )

                    AppRoute.Contacts -> EmergencyContactsScreen()

                    AppRoute.Manual -> EmergencyManualScreen()

                    AppRoute.Weather -> WeatherOverviewScreen(mapState = mapState)

                    AppRoute.WeeklyWeather -> WeeklyForecastScreen(mapState = mapState)

                    AppRoute.Damage -> DamageAssessmentScreen(
                        state = damageState,
                        onUpload = damageViewModel::uploadAndAnalyze,
                        onDelete = damageViewModel::deleteAssessment,
                        onRefresh = damageViewModel::refresh,
                    )

                    AppRoute.VictimReports -> VictimReportsScreen(
                        state = victimState,
                        onSubmit = victimViewModel::submitReport,
                        onRefresh = victimViewModel::refresh,
                        onClearSuccess = victimViewModel::clearSuccessState,
                    )

                    AppRoute.SatisfactionSurvey -> SatisfactionSurveyScreen(
                        state = surveyState,
                        onSubmit = { rating, comments, userType ->
                            surveyViewModel.submitSurvey(
                                overallRating = rating,
                                userInterfaceRating = null,
                                mapVisualizationRating = null,
                                alertSystemRating = null,
                                emergencyInfoRating = null,
                                aiAssistantRating = null,
                                mostUsefulFeature = "User Role: $userType",
                                suggestions = comments,
                                wouldRecommend = null
                            )
                        },
                        onClearSuccess = surveyViewModel::clearSuccessState,
                    )

                    AppRoute.Settings -> SettingsScreen(
                        status = reliabilityStatus,
                        darkTheme = darkTheme,
                        currentLanguage = currentLanguage,
                        onToggleDarkTheme = { darkTheme = !darkTheme },
                        onChangeLanguage = { langCode ->
                            if (activity != null) {
                                LocaleManager.setLanguage(activity, langCode)
                            }
                        },
                        onRequestLocation = {
                            locationPermissionLauncher.launch(
                                arrayOf(
                                    Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_COARSE_LOCATION,
                                ),
                            )
                        },
                        onRequestNotifications = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            } else {
                                refreshNativeStatus()
                            }
                        },
                        onOpenBatterySettings = {
                            if (activity != null) {
                                container.nativeStatusRepository.openBatterySettings(activity)
                            }
                            refreshNativeStatus()
                        },
                        onOpenDndSettings = {
                            if (activity != null) {
                                container.nativeStatusRepository.openDndSettings(activity)
                            }
                            refreshNativeStatus()
                        },
                        onRefreshFcm = {
                            container.nativeStatusRepository.refreshFcmToken {
                                refreshNativeStatus()
                            }
                        },
                        onOpenSatisfactionSurvey = { navigateTo(AppRoute.SatisfactionSurvey) },
                    )

                    AppRoute.Analytics -> AnalyticsDashboardScreen(
                        state = analyticsState,
                        onRefresh = analyticsViewModel::refresh,
                        onSelectPeriod = analyticsViewModel::selectPeriod,
                        onBack = ::navigateBack,
                    )

                    AppRoute.Map -> Unit
                }
            }
        }
    }
    }
}

// คอมโพสเซเบิลสำหรับแถบเมนูนำทางด้านล่าง
@Composable
private fun DmindBottomNavigation(
    currentRoute: AppRoute,
    onNavigate: (AppRoute) -> Unit,
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface,
    ) {
        bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = { Icon(item.icon, contentDescription = stringResource(item.labelResId)) },
                label = { Text(stringResource(item.labelResId)) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                ),
            )
        }
    }
}

// คลาสข้อมูลสำหรับไอเทมแถบนำทาง
private data class BottomNavItem(
    val route: AppRoute,
    val labelResId: Int,
    val icon: ImageVector,
)

// รายการเมนูบนแถบนำทางด้านล่าง
private val bottomNavItems = listOf(
    BottomNavItem(AppRoute.Dashboard, AppRoute.Dashboard.labelResId, Icons.Filled.Home),
    BottomNavItem(AppRoute.Map, AppRoute.Map.labelResId, Icons.Filled.Map),
    BottomNavItem(AppRoute.Contacts, AppRoute.Contacts.labelResId, Icons.Filled.Phone),
    BottomNavItem(AppRoute.Manual, AppRoute.Manual.labelResId, Icons.Filled.MenuBook),
    BottomNavItem(AppRoute.Settings, AppRoute.Settings.labelResId, Icons.Filled.Settings),
)
