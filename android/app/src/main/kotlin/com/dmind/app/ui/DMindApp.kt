package com.dmind.app.ui

import android.Manifest
import android.app.Activity
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.asPaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Report
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.dmind.app.data.NativeStatusRepository
import com.dmind.app.domain.ReliabilityStatus
import com.dmind.app.network.BackendConfig
import com.dmind.app.ui.theme.DMindTheme
import org.maplibre.android.MapLibre
import org.maplibre.android.camera.CameraPosition
import org.maplibre.android.geometry.LatLng
import org.maplibre.android.maps.MapView

private enum class Destination(
    val label: String,
    val icon: ImageVector,
) {
    Home("Home", Icons.Filled.Home),
    Map("Map", Icons.Filled.Map),
    Alerts("Alerts", Icons.Filled.Notifications),
    SOS("SOS", Icons.Filled.Warning),
    More("More", Icons.Filled.MoreVert),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DMindApp() {
    val context = LocalContext.current
    val activity = context as? Activity
    val repository = remember(context) { NativeStatusRepository(context) }
    var selected by remember { mutableStateOf(Destination.Home) }
    var status by remember { mutableStateOf(repository.refreshStatus()) }
    var banner by remember { mutableStateOf("Native Android workspace is active") }

    fun refreshStatus() {
        status = repository.refreshStatus()
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

    DMindTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text("D-MIND", fontWeight = FontWeight.Bold)
                            Text(
                                "Android-only native app",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = {
                            refreshStatus()
                            banner = "Status refreshed"
                        }) {
                            Icon(Icons.Filled.Refresh, contentDescription = "Refresh status")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                    ),
                )
            },
            bottomBar = {
                NavigationBar(
                    modifier = Modifier.padding(WindowInsets.navigationBars.asPaddingValues()),
                ) {
                    Destination.entries.forEach { destination ->
                        NavigationBarItem(
                            selected = selected == destination,
                            onClick = { selected = destination },
                            icon = { Icon(destination.icon, contentDescription = destination.label) },
                            label = { Text(destination.label) },
                        )
                    }
                }
            },
        ) { padding ->
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(padding),
                color = MaterialTheme.colorScheme.background,
            ) {
                when (selected) {
                    Destination.Home -> HomeScreen(
                        status = status,
                        banner = banner,
                        onRequestLocation = {
                            foregroundPermissionLauncher.launch(
                                arrayOf(
                                    Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_COARSE_LOCATION,
                                ),
                            )
                        },
                        onRequestNotifications = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                            }
                        },
                        onOpenBatterySettings = {
                            if (activity != null) repository.openBatterySettings(activity)
                        },
                        onOpenDndSettings = {
                            if (activity != null) repository.openDndSettings(activity)
                        },
                    )
                    Destination.Map -> MapScreen()
                    Destination.Alerts -> AlertsScreen(
                        status = status,
                        onTriggerAlert = {
                            repository.triggerDemoAlert()
                            banner = "Emergency test alert triggered"
                            refreshStatus()
                        },
                    )
                    Destination.SOS -> SOSScreen(
                        status = status,
                        onQueueSOS = {
                            val id = repository.queueDemoSOS()
                            banner = "SOS queued with id $id"
                            refreshStatus()
                        },
                        onStartMonitoring = {
                            banner = if (repository.startMonitoring()) {
                                "Background monitoring started"
                            } else {
                                "Location permission is required"
                            }
                            refreshStatus()
                        },
                        onStopMonitoring = {
                            repository.stopMonitoring()
                            banner = "Background monitoring stopped"
                            refreshStatus()
                        },
                    )
                    Destination.More -> MoreScreen(
                        status = status,
                        onOpenAppSettings = {
                            if (activity != null) repository.openAppSettings(activity)
                        },
                        onRefreshFcm = {
                            repository.refreshFcmToken { ok ->
                                banner = if (ok) "FCM token saved" else "FCM token unavailable"
                                refreshStatus()
                            }
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(
    status: ReliabilityStatus,
    banner: String,
    onRequestLocation: () -> Unit,
    onRequestNotifications: () -> Unit,
    onOpenBatterySettings: () -> Unit,
    onOpenDndSettings: () -> Unit,
) {
    ScreenColumn {
        StatusBanner(text = banner)
        Text("Readiness", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            "The app is now running from the Android workspace without React, Vite, or Capacitor.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
        StatusGrid(status)
        Spacer(Modifier.height(16.dp))
        Text("Permission onboarding", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        ActionRow("Location", "Required for danger zone monitoring", onRequestLocation)
        ActionRow("Notifications", "Required for emergency alerts", onRequestNotifications)
        ActionRow("Battery", "Keep monitoring alive in the background", onOpenBatterySettings)
        ActionRow("DND", "Allow critical alerts to break through silent mode", onOpenDndSettings)
    }
}

@Composable
private fun MapScreen() {
    Column(Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
        ) {
            MapLibreNativeView(Modifier.fillMaxSize())
            Surface(
                modifier = Modifier
                    .padding(16.dp)
                    .align(Alignment.TopStart),
                shape = MaterialTheme.shapes.medium,
                tonalElevation = 4.dp,
            ) {
                Text(
                    "Native MapLibre map",
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    style = MaterialTheme.typography.labelLarge,
                )
            }
        }
    }
}

@Composable
private fun AlertsScreen(
    status: ReliabilityStatus,
    onTriggerAlert: () -> Unit,
) {
    ScreenColumn {
        Text("Alerts", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            "Critical alerts now run through native notification channels and full-screen Android UI.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
        InfoCard(
            icon = Icons.Filled.Notifications,
            title = "Emergency channel",
            body = if (status.notificationGranted) "Notification permission is ready." else "Notification permission still needs approval.",
        )
        InfoCard(
            icon = Icons.Filled.Security,
            title = "DND bypass",
            body = if (status.dndGranted) "Policy access is available." else "Open DND settings before production testing.",
        )
        Button(onClick = onTriggerAlert, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.Warning, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Trigger native test alert")
        }
    }
}

@Composable
private fun SOSScreen(
    status: ReliabilityStatus,
    onQueueSOS: () -> Unit,
    onStartMonitoring: () -> Unit,
    onStopMonitoring: () -> Unit,
) {
    ScreenColumn {
        Text("SOS", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            "SOS requests are stored locally and flushed by WorkManager when the backend endpoint is reachable.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(12.dp))
        BigMetric(label = "Pending SOS", value = status.pendingSOSCount.toString())
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            Button(onClick = onQueueSOS, modifier = Modifier.weight(1f)) {
                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Queue SOS")
            }
            FilledTonalButton(
                onClick = if (status.monitoring) onStopMonitoring else onStartMonitoring,
                modifier = Modifier.weight(1f),
            ) {
                Text(if (status.monitoring) "Stop monitoring" else "Start monitoring")
            }
        }
    }
}

@Composable
private fun MoreScreen(
    status: ReliabilityStatus,
    onOpenAppSettings: () -> Unit,
    onRefreshFcm: () -> Unit,
) {
    ScreenColumn {
        Text("More", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text("Backend: ${BackendConfig.baseUrl}", color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        FeatureList()
        Spacer(Modifier.height(12.dp))
        InfoCard(
            icon = Icons.Filled.Notifications,
            title = "FCM token",
            body = when {
                status.fcmTokenAvailable && status.fcmTokenEndpointConfigured -> "Token is available and registration endpoint is configured."
                status.fcmTokenAvailable -> "Token is stored locally; configure backend registration when ready."
                else -> "Token has not been fetched yet."
            },
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            FilledTonalButton(onClick = onOpenAppSettings, modifier = Modifier.weight(1f)) {
                Icon(Icons.Filled.Settings, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Settings")
            }
            Button(onClick = onRefreshFcm, modifier = Modifier.weight(1f)) {
                Text("Refresh FCM")
            }
        }
    }
}

@Composable
private fun FeatureList() {
    val features = listOf(
        Icons.Filled.Cloud to "Weather proxy",
        Icons.Filled.Report to "Incident and victim reports",
        Icons.Filled.Security to "Damage assessment and AI",
        Icons.Filled.Map to "Shelters and manuals",
    )
    features.forEach { (icon, label) ->
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
            Spacer(Modifier.width(12.dp))
            Text(label, style = MaterialTheme.typography.bodyLarge)
        }
        HorizontalDivider()
    }
}

@Composable
private fun MapLibreNativeView(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    val mapView = remember {
        MapLibre.getInstance(context)
        MapView(context).apply {
            onCreate(null)
            getMapAsync { map ->
                map.setStyle("https://demotiles.maplibre.org/style.json")
                map.cameraPosition = CameraPosition.Builder()
                    .target(LatLng(13.7563, 100.5018))
                    .zoom(5.4)
                    .build()
            }
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
private fun ScreenColumn(content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(WindowInsets.statusBars.asPaddingValues())
            .verticalScroll(rememberScrollState())
            .padding(PaddingValues(16.dp)),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        content = content,
    )
}

@Composable
private fun StatusBanner(text: String) {
    Surface(
        shape = MaterialTheme.shapes.medium,
        color = MaterialTheme.colorScheme.primaryContainer,
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(14.dp),
            color = MaterialTheme.colorScheme.onPrimaryContainer,
            style = MaterialTheme.typography.bodyMedium,
        )
    }
}

@Composable
private fun StatusGrid(status: ReliabilityStatus) {
    val checks = listOf(
        "Location" to status.locationGranted,
        "Background" to status.backgroundLocationGranted,
        "Notifications" to status.notificationGranted,
        "Battery" to status.batteryIgnoring,
        "DND" to status.dndGranted,
        "Monitoring" to status.monitoring,
    )
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        checks.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                row.forEach { (label, ready) ->
                    AssistChip(
                        onClick = {},
                        label = { Text("$label: ${if (ready) "Ready" else "Needs setup"}") },
                        leadingIcon = {
                            Icon(
                                if (ready) Icons.Filled.Security else Icons.Filled.Warning,
                                contentDescription = null,
                            )
                        },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun ActionRow(title: String, subtitle: String, onClick: () -> Unit) {
    Surface(shape = MaterialTheme.shapes.medium, tonalElevation = 1.dp) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            FilledTonalButton(onClick = onClick) {
                Text("Open")
            }
        }
    }
}

@Composable
private fun InfoCard(icon: ImageVector, title: String, body: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = MaterialTheme.shapes.medium,
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.width(12.dp))
            Column {
                Text(title, fontWeight = FontWeight.SemiBold)
                Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun BigMetric(label: String, value: String) {
    Surface(shape = MaterialTheme.shapes.medium, color = MaterialTheme.colorScheme.secondaryContainer) {
        Column(Modifier.fillMaxWidth().padding(18.dp)) {
            Text(label, color = MaterialTheme.colorScheme.onSecondaryContainer)
            Text(
                value,
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
            )
        }
    }
}
